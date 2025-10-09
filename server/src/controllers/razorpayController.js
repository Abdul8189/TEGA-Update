import razorpay, { verifyRazorpaySignature, verifyWebhookSignature } from '../config/razorpay.js';
import RazorpayPayment from '../models/RazorpayPayment.js';
import UserCourse from '../models/UserCourse.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import Offer from '../models/Offer.js';

// Helper: find institute offer price for a student (feature: Course)
const getOfferPriceForStudent = async (studentId) => {
  try {
    const student = await Student.findById(studentId);
    if (!student || !student.institute) {
      console.log('❌ Student not found or no institute:', studentId);
      return null;
    }

    const escapedInstitute = student.institute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    console.log('🎯 Offer lookup - student:', { id: student._id, institute: student.institute });

    // Exact match first
    let offer = await Offer.findOne({
      instituteName: { $regex: new RegExp(`^${escapedInstitute}$`, 'i') },
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });
    console.log('🎯 Offer exact match found:', !!offer, offer ? { instituteName: offer.instituteName, courseOffers: offer.courseOffers?.length || 0 } : 'none');

    if (!offer) {
      // Try partial match across active offers
      const allOffers = await Offer.find({ 
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });
      offer = allOffers.find(o =>
        o.instituteName.toLowerCase().includes(student.institute.toLowerCase()) ||
        student.institute.toLowerCase().includes(o.instituteName.toLowerCase())
      );
      console.log('🎯 Offer partial match found:', !!offer, offer ? { instituteName: offer.instituteName, courseOffers: offer.courseOffers?.length || 0 } : 'none');
    }

    if (offer && offer.courseOffers && offer.courseOffers.length > 0) {
      const firstCourseOffer = offer.courseOffers[0];
      console.log('🎯 Using first course offer price:', firstCourseOffer.offerPrice);
      return firstCourseOffer.offerPrice;
    }

    return null;
  } catch (e) {
    console.log('Offer lookup error:', e.message);
    return null;
  }
};

// Create Razorpay order
export const createOrder = async (req, res) => {
  try {
    console.log('🛒 Creating Razorpay order - Request body:', req.body);
    console.log('🛒 Student from JWT:', req.student);
    console.log('🛒 StudentId from middleware:', req.studentId);
    console.log('🛒 All req properties:', Object.keys(req));
    
    const { courseId, examId, examTitle, attemptNumber, isRetake, offerInfo } = req.body;
    const studentId = req.studentId; // From studentAuth middleware

    console.log('🛒 Creating Razorpay order:', { studentId, courseId, examId, examTitle, attemptNumber, isRetake, offerInfo });
    console.log('🛒 Payment type detection:', { 
      hasExamId: !!examId, 
      hasCourseId: !!courseId, 
      courseIdValue: courseId,
      examIdValue: examId 
    });

    // Check if Razorpay is configured
    if (!razorpay) {
      console.log('❌ Razorpay not configured');
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please contact administrator.',
        error: 'Razorpay API keys not configured'
      });
    }
    console.log('✅ Razorpay instance is available');

    // Handle TEGA exam payments vs course payments
    let course = null;
    let amountToCharge = 0;
    let courseName = '';
    let isTegaExam = false;

    if (examId && (!courseId || courseId === 'null' || courseId === '')) {
      // TEGA exam payment (standalone exam)
      console.log('🎯 Processing TEGA exam payment');
      isTegaExam = true;
      const Exam = (await import('../models/Exam.js')).default;
      console.log('🔍 Exam model imported successfully');
      const exam = await Exam.findById(examId);
      console.log('🔍 Exam found:', exam ? 'Yes' : 'No', exam ? { id: exam._id, title: exam.title, isTegaExam: exam.isTegaExam } : 'Not found');
      
      if (!exam) {
        console.log('❌ TEGA exam not found for ID:', examId);
        return res.status(404).json({
          success: false,
          message: 'TEGA exam not found'
        });
      }

      if (!exam.isTegaExam) {
        return res.status(400).json({
          success: false,
          message: 'This is not a TEGA exam'
        });
      }

      // Check if user already paid for this TEGA exam
      const existingPayment = await RazorpayPayment.checkExistingPayment(studentId, null, examId);
      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: 'You already have access to this TEGA exam',
          data: {
            paymentId: existingPayment._id,
            status: existingPayment.status,
            courseName: existingPayment.courseName
          }
        });
      }

      // Use the price set when creating the TEGA exam
      amountToCharge = exam.price || exam.effectivePrice || 1999;
      courseName = exam.title || 'TEGA Main Exam';
      
      console.log('🎯 TEGA exam payment:', {
        examId: exam._id,
        examTitle: exam.title,
        price: exam.price,
        effectivePrice: exam.effectivePrice,
        amountToCharge: amountToCharge
      });

    } else if (courseId && courseId !== 'null' && courseId !== '') {
      // Course payment (existing logic)
      console.log('📚 Processing course payment');
      const existingPayment = await RazorpayPayment.checkExistingPayment(studentId, courseId);
      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: 'You already have access to this course',
          data: {
            paymentId: existingPayment._id,
            status: existingPayment.status,
            courseName: existingPayment.courseName
          }
        });
    }

      course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

      if (!course.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Course is not available for purchase'
        });
      }

      courseName = course.courseName;
    } else if (!examId && !courseId) {
      return res.status(400).json({
        success: false,
        message: 'Either courseId or examId must be provided'
      });
    }

    // Determine amount based on payment type
    let offerDetails = null;

    if (isTegaExam) {
      // TEGA exam payment - check for institute-specific offers first
      console.log('🎯 TEGA exam payment - checking for offers...');
      
      try {
        // Check for TEGA exam-specific offers for this student's institute
        console.log('🔍 Checking TEGA exam offers for student:', studentId, 'exam:', examId);
        
        // Get student details first
        const Student = (await import('../models/Student.js')).default;
        const student = await Student.findById(studentId);
        
        if (!student) {
          console.log('❌ Student not found for offer check');
          return;
        }
        
        console.log('🔍 Student institute:', student.institute);
        
        // Check for active offers for this institute with TEGA exam offers
        const Offer = (await import('../models/Offer.js')).default;
        const escapedInstitute = student.institute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        let offer = await Offer.findOne({
          instituteName: { $regex: new RegExp(`^${escapedInstitute}$`, 'i') },
          isActive: true,
          validFrom: { $lte: new Date() },
          validUntil: { $gte: new Date() },
          $or: [
            { 'tegaExamOffers.examId': examId, 'tegaExamOffers.isActive': true },
            { 'tegaExamOffer.examId': examId, 'tegaExamOffer.isActive': true }
          ]
        });
        
        console.log('🔍 Exact offer match result:', offer ? 'Found' : 'Not found');
        
        // If no exact match, try partial matching
        if (!offer) {
          const allOffers = await Offer.find({
            isActive: true,
            validFrom: { $lte: new Date() },
            validUntil: { $gte: new Date() },
            $or: [
              { 'tegaExamOffers.examId': examId, 'tegaExamOffers.isActive': true },
              { 'tegaExamOffer.examId': examId, 'tegaExamOffer.isActive': true }
            ]
          });
          
          const partialMatch = allOffers.find(o => 
            o.instituteName.toLowerCase().includes(student.institute.toLowerCase()) ||
            student.institute.toLowerCase().includes(o.instituteName.toLowerCase())
          );
          
          if (partialMatch) {
            console.log('🔍 Found partial offer match:', partialMatch.instituteName);
            offer = partialMatch;
          }
        }
        
        if (offer) {
          console.log('🎯 Found TEGA exam offer for institute:', offer.instituteName);
          
          // Check for new structure (tegaExamOffers array)
          if (offer.tegaExamOffers && offer.tegaExamOffers.length > 0) {
            const tegaExamOffer = offer.tegaExamOffers.find(eo => eo.examId.toString() === examId);
            if (tegaExamOffer && tegaExamOffer.isActive) {
              amountToCharge = tegaExamOffer.offerPrice;
              offerDetails = {
                originalPrice: tegaExamOffer.originalPrice,
                offerPrice: tegaExamOffer.offerPrice,
                discountPercentage: tegaExamOffer.discountPercentage,
                instituteName: offer.instituteName
              };
              console.log('🎯 TEGA exam offer found (new structure) - using offer price:', amountToCharge);
              console.log('🎯 Offer details:', offerDetails);
            }
          }
          // Check for old structure (tegaExamOffer single object)
          else if (offer.tegaExamOffer && offer.tegaExamOffer.examId.toString() === examId && offer.tegaExamOffer.isActive) {
            amountToCharge = offer.tegaExamOffer.offerPrice;
            offerDetails = {
              originalPrice: offer.tegaExamOffer.originalPrice,
              offerPrice: offer.tegaExamOffer.offerPrice,
              discountPercentage: offer.tegaExamOffer.discountPercentage,
              instituteName: offer.instituteName
            };
            console.log('🎯 TEGA exam offer found (old structure) - using offer price:', amountToCharge);
            console.log('🎯 Offer details:', offerDetails);
          }
        } else {
          console.log('🎯 No TEGA exam offer found - using exam price:', amountToCharge);
        }
      } catch (error) {
        console.log('🎯 TEGA exam offer check failed:', error.message);
        console.log('🎯 Using exam price:', amountToCharge);
      }
    } else {
      // Course payment - apply offer logic
      amountToCharge = course.price;

    console.log('🔍 Course object from database:', {
      id: course._id,
      courseName: course.courseName,
      price: course.price,
      isActive: course.isActive,
      allFields: Object.keys(course.toObject())
    });

    // First, check if frontend sent offer info
    if (offerInfo && offerInfo.hasOffer && offerInfo.finalPrice) {
      amountToCharge = offerInfo.finalPrice;
      offerDetails = {
        originalPrice: offerInfo.originalPrice,
        offerPrice: offerInfo.offerPrice,
        discountPercentage: offerInfo.discountPercentage,
        instituteName: offerInfo.instituteName
      };
      console.log('🎯 Using frontend offer info for Razorpay order:', offerDetails);
      console.log('🎯 Final amount to charge:', amountToCharge);
    } else {
      // Fallback to backend offer lookup (old system)
      try {
        const offerPrice = await getOfferPriceForStudent(studentId);
        if (offerPrice !== null && offerPrice >= 0) {
          console.log('🎯 Applying backend institute offer price for Razorpay order:', offerPrice);
          amountToCharge = offerPrice;
        }
      } catch (error) {
        console.log('Backend offer lookup failed:', error.message);
        }
      }
    }

    // Create Razorpay order
    // Fetch student once for notes
    const studentDoc = await Student.findById(studentId);
    const orderOptions = {
      amount: amountToCharge * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: isTegaExam 
        ? `TEGA_EXAM_${Date.now().toString().slice(-8)}_${studentId.toString().slice(-8)}`
        : `TEGA_COURSE_${Date.now().toString().slice(-8)}_${studentId.toString().slice(-8)}`,
      notes: {
        studentId: studentId.toString(),
        courseId: isTegaExam ? null : courseId.toString(),
        courseName: courseName,
        studentEmail: studentDoc?.email,
        studentName: (studentDoc?.firstName && studentDoc?.lastName)
          ? `${studentDoc.firstName} ${studentDoc.lastName}`
          : (studentDoc?.studentName || studentDoc?.username),
        examId: examId || null,
        attemptNumber: attemptNumber || null,
        isRetake: isRetake || false,
        isTegaExam: isTegaExam
      }
    };

    let order;
    try {
      order = await razorpay.orders.create(orderOptions);
    console.log('🧾 Razorpay order created with amount (paise):', order.amount, 'chargedAmount (rupees):', amountToCharge);
    } catch (orderError) {
      console.error('❌ Error creating Razorpay order:', orderError);
      return res.status(500).json({
        success: false,
        message: 'Failed to create Razorpay order',
        error: orderError.message
      });
    }

    // Save payment record to database
    const payment = new RazorpayPayment({
      studentId,
      courseId: isTegaExam ? null : courseId,
      courseName: courseName,
      amount: amountToCharge,
      originalPrice: isTegaExam ? (offerDetails ? offerDetails.originalPrice : amountToCharge) : (offerDetails ? offerDetails.originalPrice : course.price),
      offerPrice: offerDetails ? offerDetails.offerPrice : null,
      currency: 'INR',
      razorpayOrderId: order.id,
      razorpayReceipt: order.receipt,
      razorpayNotes: order.notes,
      status: 'pending',
      description: isTegaExam 
        ? `Payment for TEGA exam: ${courseName}${offerDetails ? ` (Institute Offer: ${offerDetails.discountPercentage}% off)` : ''}`
        : `Payment for course: ${courseName}${offerDetails ? ` (Institute Offer: ${offerDetails.discountPercentage}% off)` : ''}`,
      examAccess: isTegaExam || !!examId,
      examId: examId || null,
      attemptNumber: attemptNumber || null,
      isRetake: isRetake || false,
      isTegaExam: isTegaExam
    });
    // Store user identity on pending record for easier reconciliation
    payment.metadata = {
      studentEmail: studentDoc?.email,
      studentName: (studentDoc?.firstName && studentDoc?.lastName)
        ? `${studentDoc.firstName} ${studentDoc.lastName}`
        : (studentDoc?.studentName || studentDoc?.username)
    };

    try {
    await payment.save();
      console.log('✅ Payment record saved successfully');
    } catch (saveError) {
      console.error('❌ Error saving payment record:', saveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save payment record',
        error: saveError.message
      });
    }

    console.log('✅ Razorpay order created:', order.id);

    res.json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        paymentId: payment._id,
        chargedAmount: amountToCharge
      }
    });

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message
    });
  }
};

// Verify payment
export const verifyPayment = async (req, res) => {
  try {
    console.log('🔍 verifyPayment called with body:', req.body);
    console.log('🔍 verifyPayment called with studentId:', req.studentId);
    
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const studentId = req.studentId;

    console.log('🔍 Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id, studentId });

    // Verify signature
    const isSignatureValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isSignatureValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find payment record
    console.log('🔍 Looking for payment with order ID:', razorpay_order_id);
    const payment = await RazorpayPayment.findByOrderId(razorpay_order_id);
    console.log('🔍 Found payment record:', payment);
    
    if (!payment) {
      console.log('❌ Payment record not found for order ID:', razorpay_order_id);
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    console.log('🔍 Payment authorization check:', {
      paymentStudentId: payment.studentId,
      paymentStudentIdString: payment.studentId.toString(),
      requestStudentId: studentId,
      requestStudentIdType: typeof studentId,
      areEqual: payment.studentId.toString() === studentId
    });

    if (payment.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to payment record'
      });
    }

    // Update payment record
    console.log('🔍 Updating payment record...');
    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.transactionId = razorpay_payment_id;
    payment.paymentDate = new Date();
    payment.examAccess = true;
    payment.validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year

    console.log('🔍 Saving updated payment record...');
    const savedPayment = await payment.save();
    console.log('✅ Payment record saved successfully:', savedPayment._id);

    // Create user course access (only for course payments, not TEGA exams)
    if (!payment.isTegaExam && payment.courseId) {
    console.log('🔍 Creating user course access...');
    const userCourse = new UserCourse({
      studentId: payment.studentId,
      courseId: payment.courseId,
      courseName: payment.courseName,
      paymentId: payment._id,
      accessExpiresAt: payment.validUntil
    });

    console.log('🔍 Saving user course access...');
    const savedUserCourse = await userCourse.save();
    console.log('✅ User course access saved successfully:', savedUserCourse._id);
    } else if (payment.isTegaExam) {
      console.log('🎯 TEGA exam payment verified - exam access granted');
    }

    // Send notifications
    await sendPaymentNotifications(payment);

    console.log('✅ Payment verified successfully:', razorpay_payment_id);

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        status: payment.status,
        courseName: payment.courseName,
        amount: payment.amount,
        transactionId: payment.transactionId,
        examAccess: payment.examAccess,
        validUntil: payment.validUntil
      }
    });

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

// Webhook handler
export const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const body = JSON.stringify(req.body);

    console.log('📨 Received Razorpay webhook:', req.body.event);

    // Verify webhook signature
    const isSignatureValid = verifyWebhookSignature(body, signature);
    if (!isSignatureValid) {
      console.log('❌ Invalid webhook signature');
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      await handlePaymentCaptured(payload.payment.entity);
    } else if (event === 'payment.failed') {
      await handlePaymentFailed(payload.payment.entity);
    }

    res.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
};

// Handle payment captured webhook
const handlePaymentCaptured = async (paymentEntity) => {
  try {
    const { id: razorpay_payment_id, order_id: razorpay_order_id } = paymentEntity;

    console.log('💰 Payment captured:', { razorpay_payment_id, razorpay_order_id });

    // Find payment record
    const payment = await RazorpayPayment.findByOrderId(razorpay_order_id);
    if (!payment) {
      console.log('❌ Payment record not found for order:', razorpay_order_id);
      return;
    }

    if (payment.status === 'completed') {
      console.log('✅ Payment already processed');
      return;
    }

    // Update payment record
    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.transactionId = razorpay_payment_id;
    payment.paymentDate = new Date();
    payment.examAccess = true;
    payment.validUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await payment.save();

    // Create user course access (only for course payments, not TEGA exams)
    if (!payment.isTegaExam && payment.courseId) {
    const existingUserCourse = await UserCourse.findOne({
      studentId: payment.studentId,
      courseId: payment.courseId
    });

    if (!existingUserCourse) {
      const userCourse = new UserCourse({
        studentId: payment.studentId,
        courseId: payment.courseId,
        courseName: payment.courseName,
        paymentId: payment._id,
        accessExpiresAt: payment.validUntil
      });

      await userCourse.save();
      }
    } else if (payment.isTegaExam) {
      console.log('🎯 TEGA exam payment processed via webhook - exam access granted');
    }

    // Send notifications
    await sendPaymentNotifications(payment);

    console.log('✅ Payment processed successfully via webhook');

  } catch (error) {
    console.error('❌ Error handling payment captured:', error);
  }
};

// Handle payment failed webhook
const handlePaymentFailed = async (paymentEntity) => {
  try {
    const { id: razorpay_payment_id, order_id: razorpay_order_id } = paymentEntity;

    console.log('❌ Payment failed:', { razorpay_payment_id, razorpay_order_id });

    // Find payment record
    const payment = await RazorpayPayment.findByOrderId(razorpay_order_id);
    if (!payment) {
      console.log('❌ Payment record not found for order:', razorpay_order_id);
      return;
    }

    // Update payment record
    payment.status = 'failed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.transactionId = razorpay_payment_id;
    payment.failureReason = 'Payment failed';
    payment.paymentDate = new Date();

    await payment.save();

    console.log('✅ Payment failure recorded');

  } catch (error) {
    console.error('❌ Error handling payment failed:', error);
  }
};

// Get payment status
export const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const studentId = req.studentId;

    const payment = await RazorpayPayment.findByOrderId(orderId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    res.json({
      success: true,
      data: {
        paymentId: payment._id,
        status: payment.status,
        courseName: payment.courseName,
        amount: payment.amount,
        transactionId: payment.transactionId,
        examAccess: payment.examAccess,
        validUntil: payment.validUntil,
        createdAt: payment.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Error getting payment status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

// Get user's payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const studentId = req.studentId;

    const payments = await RazorpayPayment.find({ studentId })
      .sort({ createdAt: -1 })
      .populate('courseId', 'name description price duration category');

    res.json({
      success: true,
      data: payments
    });

  } catch (error) {
    console.error('❌ Error getting payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment history',
      error: error.message
    });
  }
};

// Send payment notifications
const sendPaymentNotifications = async (payment) => {
  try {
    const student = await Student.findById(payment.studentId);

    // Student notification
    const studentNotification = new Notification({
      recipient: payment.studentId,
      recipientModel: 'Student',
      message: `Payment successful! You now have access to ${payment.courseName}`,
      type: 'payment_success',
      data: {
        paymentId: payment._id,
        courseName: payment.courseName,
        amount: payment.amount,
        transactionId: payment.transactionId
      }
    });

    await studentNotification.save();

    // Admin notification
    const adminNotification = new Notification({
      recipient: 'admin', // You might want to get actual admin ID
      recipientModel: 'Admin',
      message: `New payment received: ${student?.firstName} ${student?.lastName} paid ₹${payment.amount} for ${payment.courseName}`,
      type: 'payment_received',
      data: {
        studentId: payment.studentId,
        studentName: `${student?.firstName} ${student?.lastName}`,
        courseName: payment.courseName,
        amount: payment.amount,
        transactionId: payment.transactionId
      }
    });

    await adminNotification.save();

    console.log('✅ Payment notifications sent');

  } catch (error) {
    console.error('❌ Error sending payment notifications:', error);
  }
};
