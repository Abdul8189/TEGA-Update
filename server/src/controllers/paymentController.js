import mongoose from 'mongoose';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Notification from '../models/Notification.js';
import Admin from '../models/Admin.js'; // Import Admin model
import Razorpay from 'razorpay';
import crypto from 'crypto';
import UPISettings from '../models/UPISettings.js'; // Import UPISettings model
import Offer from '../models/Offer.js'; // Import Offer model

// Import in-memory storage from auth controller
import { inMemoryUsers, userPayments, userNotifications, userCourseAccess } from './authController.js';

// Check if MongoDB is connected
const isMongoConnected = () => {
  try {
    return Payment.db.readyState === 1;
  } catch (error) {
    return false;
  }
};

// Get offer price for a student's institute
const getOfferPriceForStudent = async (studentId, feature = 'Course') => {
  try {
    if (!isMongoConnected()) {
      return null;
    }

    // Get student's institute
    const student = await Student.findById(studentId);
    if (!student || !student.institute) {
      console.log(`❌ Student not found or no institute: ${studentId}`);
      return null;
    }

    console.log(`🔍 Looking for offers for student institute: "${student.institute}"`);

    // Escape special regex characters in the institute name
    const escapedInstitute = student.institute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Check for active offer for this institute (exact match first)
    let offer = await Offer.findOne({
      instituteName: { $regex: new RegExp(`^${escapedInstitute}$`, 'i') },
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() }
    });

    console.log(`🔍 Exact match result:`, offer ? `Found offer with ${offer.courseOffers?.length || 0} course offers` : 'No exact match');

    // If no exact match found, try partial matching
    if (!offer) {
      console.log(`🔍 No exact offer match for "${student.institute}", trying partial match...`);
      const allOffers = await Offer.find({
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() }
      });
      
      console.log(`🔍 Found ${allOffers.length} active offers in database`);
      
      // Try to find a partial match
      const partialMatch = allOffers.find(o => 
        o.instituteName.toLowerCase().includes(student.institute.toLowerCase()) ||
        student.institute.toLowerCase().includes(o.instituteName.toLowerCase())
      );
      
      if (partialMatch) {
        console.log(`🔍 Found partial offer match: "${partialMatch.instituteName}" for "${student.institute}"`);
        offer = partialMatch;
      }
    }

    if (offer) {
      console.log(`🎯 Found offer for "${student.institute}":`, {
        instituteName: offer.instituteName,
        courseOffers: offer.courseOffers?.length || 0,
        tegaExamOffers: offer.tegaExamOffers?.length || 0
      });
      
      // For course offers, we need to find the specific course offer
      // This function is called for general course pricing, so we return the first available course offer price
      if (offer.courseOffers && offer.courseOffers.length > 0) {
        const firstCourseOffer = offer.courseOffers[0];
        console.log(`🎯 Using first course offer price: ₹${firstCourseOffer.offerPrice}`);
        return firstCourseOffer.offerPrice;
      }
    }

    console.log(`❌ No offer found for institute: "${student.institute}"`);
    return null;
  } catch (error) {
    console.error('Error getting offer price:', error);
    return null;
  }
};

// Initialize Razorpay with fallback for development
let razorpay = null;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.log('⚠️  Razorpay credentials not found. Using dummy payment mode only.');
}

// Get all courses with pricing
export const getCourses = async (req, res) => {
  try {
    console.log('🔍 getCourses called - checking database connection...');
    console.log('🔍 Request headers:', req.headers);
    console.log('🔍 User info:', req.user || 'No user info');
    
    // Check MongoDB connection state
    const connectionState = mongoose.connection.readyState;
    console.log('MongoDB connection state:', connectionState, '(0=disconnected, 1=connected, 2=connecting, 3=disconnecting)');
    
    // Wait for connection if not ready
    if (connectionState !== 1) {
      console.log('⚠️ MongoDB not connected, waiting for connection...');
      await new Promise((resolve, reject) => {
        if (connectionState === 1) {
          resolve();
        } else {
          const timeout = setTimeout(() => {
            reject(new Error('MongoDB connection timeout'));
          }, 10000); // 10 second timeout
          
          mongoose.connection.once('connected', () => {
            clearTimeout(timeout);
            resolve();
          });
          
          mongoose.connection.once('error', (err) => {
            clearTimeout(timeout);
            reject(err);
          });
        }
      });
      console.log('✅ MongoDB connection established');
    }
    
    // First, let's check if we can find any courses at all
    const totalCourses = await Course.countDocuments({});
    console.log('Total courses in database:', totalCourses);
    
    // Check active courses
    const activeCoursesCount = await Course.countDocuments({ isActive: true });
    console.log('Active courses count:', activeCoursesCount);
    
    // Try to get all courses first
    const allCourses = await Course.find({});
    console.log('All courses found:', allCourses.length);
    
    // Log first course structure for debugging
    if (allCourses.length > 0) {
      console.log('📚 First course structure:', JSON.stringify(allCourses[0], null, 2));
    }
    
    // Get regular courses (excluding Tega Exam)
    const regularCourses = await Course.getActiveCourses();
    console.log('Regular courses from getActiveCourses:', regularCourses.length);
    
    // Get Tega Exam separately for payment page
    const tegaExam = await Course.findOne({ 
      courseName: 'Tega Exam',
      isActive: true 
    });
    
    // Combine regular courses with Tega Exam for payment page
    const courses = [...regularCourses];
    if (tegaExam) {
      courses.push(tegaExam);
      console.log('✅ Added Tega Exam to payment page with price:', tegaExam.price);
    }
    
    console.log('Total courses for payment page:', courses.length);
    console.log('Contains Tega Exam:', tegaExam ? '✅ YES (GOOD for payment)' : '❌ NO');
    
    if (courses.length === 0) {
      console.log('⚠️ No active courses found. This might be the issue.');
      // Let's return all courses instead of just active ones for debugging (including Tega Exam for payment)
      const fallbackCourses = await Course.find({ 
        isActive: true
      }).select('courseName description price duration category instructor level');
      console.log('Fallback courses:', fallbackCourses.length);
      
      res.json({
        success: true,
        data: fallbackCourses,
        debug: {
          totalCourses,
          activeCoursesCount,
          method: 'fallback',
          requestInfo: {
            hasUser: !!req.user,
            userRole: req.user?.role || 'none',
            headers: Object.keys(req.headers)
          }
        }
      });
    } else {
      res.json({
        success: true,
        data: courses,
        debug: {
          totalCourses,
          activeCoursesCount,
          method: 'getActiveCourses',
          requestInfo: {
            hasUser: !!req.user,
            userRole: req.user?.role || 'none',
            headers: Object.keys(req.headers)
          }
        }
      });
    }
  } catch (error) {
    console.error('❌ Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch courses',
      error: error.message
    });
  }
};

// Get course pricing
export const getCoursePricing = async (req, res) => {
  try {
    const pricing = await Course.getCoursePricing();
    res.json({
      success: true,
      data: pricing
    });
  } catch (error) {
    console.error('Error fetching course pricing:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch course pricing'
    });
  }
};

// Create payment order (for Razorpay)
export const createPaymentOrder = async (req, res) => {
  try {
    const { courseId, amount } = req.body;
    const userId = req.studentId; // Changed from req.user.id

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(400).json({
        success: false,
        message: 'Payment gateway not configured. Please use dummy payment for development.'
      });
    }

    // Validate course
    const course = await Course.findOne({ courseId, isActive: true });
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user already paid for this course
    const existingPayment = await Payment.hasUserPaidForCourse(userId, courseId);
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'You have already paid for this course'
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId: courseId,
        userId: userId.toString()
      }
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    const payment = new Payment({
      studentId: userId,
      courseId: courseId,
      courseName: course.name,
      amount: amount,
      status: 'pending',
      razorpayOrderId: order.id
    });

    await payment.save();

    res.json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        paymentId: payment._id
      }
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order'
    });
  }
};

// Process dummy payment (for development/testing)
export const processDummyPayment = async (req, res) => {
  try {
    const { courseId, paymentMethod, paymentDetails, offerInfo } = req.body;
    const userId = req.studentId; // Changed from req.user.id

    console.log('Processing dummy payment for user:', userId, 'course:', courseId);
    console.log('Offer info:', offerInfo);

    // Validate course (try MongoDB first, fallback to static data)
    let course = null;
    if (isMongoConnected()) {
      try {
        course = await Course.findOne({ courseId, isActive: true });
      } catch (error) {
        console.log('MongoDB course query failed, using static data');
      }
    }
    
    // Fallback to static course data
    if (!course) {
      const staticCourses = {
        'java-programming': { name: 'Java Programming', price: 799 },
        'python-data-science': { name: 'Python for Data Science', price: 799 },
        'react-development': { name: 'React.js Development', price: 799 },
        'aws-cloud': { name: 'AWS Cloud Practitioner', price: 799 },
        'tega-main-exam': { name: 'Tega Main Exam', price: 799 }
      };
      course = staticCourses[courseId];
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Determine final price - use offer info from frontend if available, otherwise check backend offers
    let finalPrice = course.price;
    let offerDetails = null;
    
    if (offerInfo && offerInfo.hasOffer) {
      finalPrice = offerInfo.offerPrice;
      offerDetails = {
        originalPrice: offerInfo.originalPrice,
        offerPrice: offerInfo.offerPrice,
        discountPercentage: offerInfo.discountPercentage,
        instituteName: offerInfo.instituteName
      };
      console.log(`💰 Using frontend offer info: Original ₹${offerInfo.originalPrice}, Offer ₹${offerInfo.offerPrice}, Final ₹${finalPrice}`);
    } else {
      // Fallback to backend offer checking
      const offerPrice = await getOfferPriceForStudent(userId, 'Course');
      if (offerPrice !== null) {
        finalPrice = offerPrice;
        offerDetails = {
          originalPrice: course.price,
          offerPrice: offerPrice,
          discountPercentage: Math.round(((course.price - offerPrice) / course.price) * 100)
        };
      }
      console.log(`💰 Payment pricing: Original price ₹${course.price}, Backend offer price ₹${offerPrice}, Final price ₹${finalPrice}`);
    }

    // Check if user already paid for this course
    let existingPayment = false;
    if (isMongoConnected()) {
      try {
        existingPayment = await Payment.hasUserPaidForCourse(userId, courseId);
      } catch (error) {
        console.log('MongoDB payment check failed, checking in-memory storage');
      }
    }
    
    // Check in-memory storage
    if (!existingPayment && userPayments.has(userId)) {
      const userPaymentHistory = userPayments.get(userId);
      existingPayment = userPaymentHistory.some(payment => 
        payment.courseId === courseId && payment.status === 'completed'
      );
    }

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'You have already paid for this course'
      });
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create payment record (try MongoDB first, fallback to in-memory)
    let payment = null;
    if (isMongoConnected()) {
      try {
        payment = new Payment({
          studentId: userId,
          courseId: courseId,
          courseName: course.name,
          amount: finalPrice,
          originalPrice: offerDetails ? offerDetails.originalPrice : course.price,
          offerPrice: offerDetails ? offerDetails.offerPrice : null,
          paymentMethod: paymentMethod,
          status: 'completed',
          description: `Payment for ${course.name}${offerDetails ? ` (Institute Offer: ${offerDetails.discountPercentage}% off)` : ''}`,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentDate: new Date()
        });
        console.log('Attempting to save payment to MongoDB:', payment);
        await payment.save();
        console.log('Payment saved to MongoDB for user:', userId, 'payment ID:', payment._id);
      } catch (error) {
        console.log('MongoDB payment save failed, using in-memory storage:', error.message);
        payment = null;
      }
    }
    
    // If MongoDB failed, use in-memory storage
    if (!payment) {
              payment = {
          _id: Date.now().toString(),
          studentId: userId,
          courseId: courseId,
          courseName: course.name,
          amount: finalPrice,
          originalPrice: offerDetails ? offerDetails.originalPrice : course.price,
          offerPrice: offerDetails ? offerDetails.offerPrice : null,
          paymentMethod: paymentMethod,
          status: 'completed',
          description: `Payment for ${course.name}${offerDetails ? ` (Institute Offer: ${offerDetails.discountPercentage}% off)` : ''}`,
          transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          paymentDate: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };
      
      // Store in user-specific payment history
      if (!userPayments.has(userId)) {
        userPayments.set(userId, []);
      }
      userPayments.get(userId).push(payment);
      
      // Update user course access
      if (!userCourseAccess.has(userId)) {
        userCourseAccess.set(userId, []);
      }
      userCourseAccess.get(userId).push(courseId);
      
      console.log(`Payment saved to in-memory storage for user ${userId}, payment ID: ${payment._id}`);
    }

    // Create payment success notification (try MongoDB first, fallback to in-memory)
    if (isMongoConnected()) {
      try {
        const notification = new Notification({
          recipient: userId,
          recipientModel: 'Student',
          message: `Payment successful! You have successfully paid ₹${finalPrice} for ${course.name}${offerPrice ? ` (Institute Offer: ₹${offerPrice} instead of ₹${course.price})` : ''}. You can now access the course content and exams.`,
          type: 'payment_success'
        });
        await notification.save();
        console.log('Payment notification saved to MongoDB for user:', userId);
      } catch (error) {
        console.log('MongoDB notification save failed, using in-memory storage');
      }
    }
    
    // Store notification in user-specific storage
    if (!userNotifications.has(userId)) {
      userNotifications.set(userId, []);
    }
    
    const notification = {
      _id: Date.now().toString(),
      recipient: userId,
      recipientModel: 'Student',
      message: `Payment successful! You have successfully paid ₹${finalPrice} for ${course.name}${offerPrice ? ` (Institute Offer: ₹${offerPrice} instead of ₹${course.price})` : ''}. You can now access the course content and exams.`,
      type: 'payment_success',
      isRead: false,
      createdAt: new Date()
    };
    
    userNotifications.get(userId).push(notification);

    // Create admin notification for new payment
    try {
      if (isMongoConnected()) {
        const admin = await Admin.findOne(); // Fetch an admin to send notification to
        if (admin) {
          // Fetch the user who made the payment
          const student = await Student.findById(userId);
          const adminNotification = new Notification({
            recipient: admin._id,
            recipientModel: 'Admin',
            message: `New payment received: ${student?.firstName || student?.email || userId} paid ₹${finalPrice} for ${course.name}${offerPrice ? ` (Institute Offer: ₹${offerPrice} instead of ₹${course.price})` : ''}`,
            type: 'payment_received',
            metadata: {
              paymentId: payment._id || payment.id,
              courseId: courseId,
              amount: finalPrice,
              originalPrice: course.price,
              offerPrice: offerPrice,
              userId: userId
            }
          });
          await adminNotification.save();
          console.log('Admin payment notification saved to MongoDB');
        }
      }
    } catch (error) {
      console.log('Failed to create admin notification:', error.message);
    }

    console.log('Payment processing completed successfully for user:', userId);

    res.json({
      success: true,
      message: 'Payment completed successfully',
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        courseId: courseId,
        courseName: course.name,
        amount: payment.amount,
        userId: userId
      }
    });
  } catch (error) {
    console.error('Error processing dummy payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process payment'
    });
  }
};

// Verify Razorpay payment
export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Check if Razorpay is configured
    if (!razorpay) {
      return res.status(400).json({
        success: false,
        message: 'Payment gateway not configured'
      });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Find and update payment
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Increment course enrollment
    const course = await Course.findOne({ courseId: payment.courseId });
    if (course) {
      await course.incrementEnrollment();
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        paymentId: payment._id,
        transactionId: payment.transactionId,
        courseId: payment.courseId,
        courseName: payment.courseName,
        amount: payment.amount
      }
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// UPI Payment Verification
export const verifyUPIPayment = async (req, res) => {
  try {
    const { transactionId, amount, courseId, studentId, upiId } = req.body;

    console.log('UPI Payment Verification Request:', {
      transactionId,
      amount,
      courseId,
      studentId,
      upiId
    });

    // Validation
    if (!transactionId || !amount || !courseId || !studentId || !upiId) {
      return res.status(400).json({
        success: false,
        message: 'Transaction ID, amount, course ID, student ID, and UPI ID are required'
      });
    }

    // Verify UPI ID matches configured UPI ID
    const upiSettings = await UPISettings.findOne({ isEnabled: true });
    if (!upiSettings || upiSettings.upiId !== upiId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid UPI ID'
      });
    }

    // Get course details
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check for institute offer price
    const offerPrice = await getOfferPriceForStudent(studentId, 'Course');
    const expectedPrice = offerPrice !== null ? offerPrice : course.price;
    
    console.log(`💰 UPI Payment pricing: Original price ₹${course.price}, Offer price ₹${offerPrice}, Expected price ₹${expectedPrice}, Received ₹${amount}`);

    // Verify amount matches expected price (either offer price or course price)
    if (expectedPrice !== amount) {
      return res.status(400).json({
        success: false,
        message: `Amount mismatch. Expected: ₹${expectedPrice}${offerPrice ? ` (Institute Offer)` : ''}, Received: ₹${amount}`
      });
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ 
      transactionId,
      studentId,
      courseId
    });

    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified'
      });
    }

    // Create payment record
    const payment = new Payment({
      studentId,
      courseId,
      courseName: course.courseName,
      amount,
      originalPrice: course.price,
      offerPrice: offerPrice,
      currency: 'INR',
      paymentMethod: 'UPI',
      status: 'completed',
      transactionId,
      description: `UPI payment for ${course.courseName}${offerPrice ? ` (Institute Offer: ₹${offerPrice})` : ''}`,
      paymentDate: new Date(),
      examAccess: true,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // Valid for 1 year
    });

    await payment.save();
    console.log('Payment record created successfully:', payment._id);

    // Increment course enrollment
    await course.incrementEnrollment();

    // Create notification for admin
    const admin = await Admin.findOne();
    if (admin) {
      console.log('Creating admin notification for payment:', {
        adminId: admin._id,
        amount,
        courseName: course.courseName,
        studentId
      });
      
      const notification = new Notification({
        recipient: admin._id,
        recipientModel: 'Admin',
        message: `💰 New UPI Payment Received!\n\nAmount: ₹${amount}\nCourse: ${course.courseName}\nStudent ID: ${studentId}\nTransaction ID: ${transactionId}\nDate: ${new Date().toLocaleString('en-IN')}`,
        type: 'info'
      });
      await notification.save();
      console.log('Admin notification created successfully:', notification._id);
    } else {
      console.log('No admin found to create notification for');
    }

    // Create notification for student
    const student = await Student.findById(studentId);
    if (student) {
      console.log('Creating student notification for payment:', {
        studentId: student._id,
        courseName: course.courseName
      });
      
      const studentNotification = new Notification({
        recipient: student._id,
        recipientModel: 'Student',
        message: `✅ Payment Successful!\n\nYou are now enrolled in ${course.courseName}\nAmount Paid: ₹${amount}\nTransaction ID: ${transactionId}\nAccess granted for 1 year\n\nYou can now access course content and exams!`,
        type: 'info'
      });
      await studentNotification.save();
      console.log('Student notification created successfully:', studentNotification._id);
    } else {
      console.log('Student not found for notification creation');
    }

    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        courseName: payment.courseName,
        status: payment.status,
        paymentDate: payment.paymentDate
      }
    });

  } catch (error) {
    console.error('UPI payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment'
    });
  }
};

// Get UPI Payment Status
export const getUPIPaymentStatus = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const payment = await Payment.findOne({ transactionId });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        courseName: payment.courseName,
        status: payment.status,
        paymentDate: payment.paymentDate,
        studentId: payment.studentId
      }
    });

  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment status'
    });
  }
};

// Get user's payment history
export const getPaymentHistory = async (req, res) => {
  try {
    const userId = req.studentId; // Changed from req.user.id
    
    console.log('📊 Fetching payment history for user:', userId);
    
    // Try MongoDB first, fallback to in-memory storage
    let oldPayments = [];
    let razorpayPayments = [];
    
    if (isMongoConnected()) {
      try {
        // Get payments from old Payment model
        oldPayments = await Payment.find({ studentId: userId })
          .sort({ createdAt: -1 })
          .populate('studentId', 'username email firstName lastName');
        
        console.log(`📊 Found ${oldPayments.length} old payments in MongoDB for user ${userId}`);
        
        // Get payments from new RazorpayPayment model
        const RazorpayPayment = (await import('../models/RazorpayPayment.js')).default;
        razorpayPayments = await RazorpayPayment.find({ studentId: userId })
          .sort({ createdAt: -1 })
          .populate('studentId', 'username email firstName lastName');
        
        console.log(`📊 Found ${razorpayPayments.length} Razorpay payments in MongoDB for user ${userId}`);
        
      } catch (error) {
        console.log('❌ MongoDB payment history query failed, using in-memory storage:', error.message);
      }
    }
    
    // Get from in-memory storage if MongoDB failed or not connected
    if (oldPayments.length === 0 && userPayments.has(userId)) {
      oldPayments = userPayments.get(userId);
      console.log(`📊 Retrieved ${oldPayments.length} payments from in-memory storage for user ${userId}`);
    }

    // Normalize both payment types to a common format
    const normalizedOldPayments = oldPayments.map(payment => ({
      _id: payment._id,
      studentId: payment.studentId,
      courseId: payment.courseId,
      courseName: payment.courseName,
      amount: payment.amount,
      currency: payment.currency || 'INR',
      paymentMethod: payment.paymentMethod,
      status: payment.status,
      transactionId: payment.transactionId,
      paymentDate: payment.paymentDate,
      description: payment.description,
      examAccess: payment.examAccess,
      validUntil: payment.validUntil,
      upiId: payment.upiId,
      upiReferenceId: payment.upiReferenceId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      source: 'old_payment'
    }));

    const normalizedRazorpayPayments = razorpayPayments.map(payment => ({
      _id: payment._id,
      studentId: payment.studentId,
      courseId: payment.courseId,
      courseName: payment.courseName,
      amount: payment.amount,
      currency: payment.currency || 'INR',
      paymentMethod: 'Razorpay',
      status: payment.status,
      transactionId: payment.transactionId || payment.razorpayPaymentId,
      paymentDate: payment.paymentDate,
      description: payment.description,
      examAccess: payment.examAccess,
      validUntil: payment.validUntil,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      source: 'razorpay_payment'
    }));

    // Combine and sort by creation date
    const allPayments = [...normalizedOldPayments, ...normalizedRazorpayPayments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log(`📊 Total combined payments: ${allPayments.length} (${normalizedOldPayments.length} old + ${normalizedRazorpayPayments.length} Razorpay)`);
    console.log('📊 Combined payments data being sent:', allPayments);

    res.json({
      success: true,
      data: allPayments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history'
    });
  }
};

// Check if user has paid for a course (unified check for both old and new payment systems)
export const checkCourseAccess = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.studentId;
    
    console.log('🔍 Checking course access for user:', userId, 'course:', courseId);
    console.log('🔍 User ID type:', typeof userId, 'Course ID type:', typeof courseId);
    console.log('🔍 User ID value:', userId, 'Course ID value:', courseId);
    console.log('🔍 Request headers:', req.headers);
    console.log('🔍 Request user from auth middleware:', req.user);
    
    // Convert string IDs to ObjectId if needed
    let userIdObj, courseIdObj;
    try {
      userIdObj = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
      courseIdObj = typeof courseId === 'string' ? new mongoose.Types.ObjectId(courseId) : courseId;
      console.log('🔍 Converted User ID:', userIdObj, 'Converted Course ID:', courseIdObj);
    } catch (error) {
      console.log('❌ Error converting IDs to ObjectId:', error.message);
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID or course ID format'
      });
    }

    let hasAccess = false;
    let accessSource = 'none';

    // Debug: Check what's actually in the database
    try {
      console.log('🔍 DEBUG: Checking database for any payments...');
      
      // Check all payments for this user
      const allUserPayments = await Payment.find({ studentId: userIdObj });
      console.log('🔍 DEBUG: All payments for user:', allUserPayments.length, allUserPayments.map(p => ({ id: p._id, courseId: p.courseId, status: p.status })));
      
      // Check all RazorpayPayments for this user
      const RazorpayPayment = (await import('../models/RazorpayPayment.js')).default;
      const allUserRazorpayPayments = await RazorpayPayment.find({ studentId: userIdObj });
      console.log('🔍 DEBUG: All RazorpayPayments for user:', allUserRazorpayPayments.length, allUserRazorpayPayments.map(p => ({ id: p._id, courseId: p.courseId, status: p.status })));
      
      // Check all UserCourses for this user
      const UserCourse = (await import('../models/UserCourse.js')).default;
      const allUserCourses = await UserCourse.find({ studentId: userIdObj });
      console.log('🔍 DEBUG: All UserCourses for user:', allUserCourses.length, allUserCourses.map(uc => ({ id: uc._id, courseId: uc.courseId, isActive: uc.isActive })));
      
    } catch (error) {
      console.log('❌ DEBUG: Error checking database:', error.message);
    }

    // Check old Payment system
    try {
      console.log('🔍 Checking old Payment system...');
      const hasPaidOld = await Payment.hasUserPaidForCourse(userIdObj, courseIdObj);
      console.log('🔍 Old Payment system result:', hasPaidOld);
      if (hasPaidOld) {
        hasAccess = true;
        accessSource = 'old_payment';
        console.log('✅ Access found via old Payment system');
      } else {
        console.log('❌ No access found via old Payment system');
      }
    } catch (error) {
      console.log('❌ Error checking old Payment system:', error.message);
    }

    // Check new Razorpay/UserCourse system
    if (!hasAccess) {
      try {
        console.log('🔍 Checking UserCourse system...');
        const UserCourse = (await import('../models/UserCourse.js')).default;
        const hasPaidNew = await UserCourse.hasAccess(userIdObj, courseIdObj);
        console.log('🔍 UserCourse system result:', hasPaidNew);
        if (hasPaidNew) {
          hasAccess = true;
          accessSource = 'razorpay_payment';
          console.log('✅ Access found via UserCourse system');
        } else {
          console.log('❌ No access found via UserCourse system');
        }
      } catch (error) {
        console.log('❌ Error checking UserCourse system:', error.message);
      }
    }

    // Check RazorpayPayment model directly as fallback
    if (!hasAccess) {
      try {
        console.log('🔍 Checking RazorpayPayment directly...');
        const RazorpayPayment = (await import('../models/RazorpayPayment.js')).default;
        const razorpayPayment = await RazorpayPayment.findOne({
          studentId: userIdObj,
          courseId: courseIdObj,
          status: 'completed'
        });
        console.log('🔍 RazorpayPayment direct result:', razorpayPayment ? 'Found' : 'Not found');
        if (razorpayPayment) {
          hasAccess = true;
          accessSource = 'razorpay_payment_direct';
          console.log('✅ Access found via direct RazorpayPayment check');
        } else {
          console.log('❌ No access found via direct RazorpayPayment check');
        }
      } catch (error) {
        console.log('❌ Error checking RazorpayPayment directly:', error.message);
      }
    }

    console.log('🔍 Final access result:', { hasAccess, accessSource });

    res.json({
      success: true,
      data: {
        courseId: courseId,
        hasAccess: hasAccess,
        accessSource: accessSource
      }
    });
  } catch (error) {
    console.error('❌ Error checking course access:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check course access'
    });
  }
};

// Get user's paid courses (unified from both Payment and RazorpayPayment models)
// Check if user has paid for Tega exam
// Utility function to check TEGA exam payment (can be called from other controllers)
export const checkTegaExamPaymentUtil = async (userId) => {
  try {
    console.log('🔍 Checking Tega exam payment for user:', userId);
    
    let hasPaidForTegaExam = false;
    let paymentSource = null;
    let paymentDetails = null;
    
    // Debug: Check all payments for this user to see what's in the database
    const RazorpayPayment = (await import('../models/RazorpayPayment.js')).default;
    const allPayments = await RazorpayPayment.find({ studentId: userId });
    console.log(`🔍 Found ${allPayments.length} total payments for user`);
    allPayments.forEach((payment, index) => {
      console.log(`🔍 Payment ${index + 1}: Amount=₹${payment.amount}, Status=${payment.status}, ExamAccess=${payment.examAccess}, Date=${payment.paymentDate}`);
    });
    
    if (isMongoConnected()) {
      try {
        // Check Payment model for Tega exam payments (where examAccess is true and courseId is null)
        const tegaPayment = await Payment.findOne({
          studentId: userId,
          examAccess: true,
          courseId: null, // Tega exam has no courseId
          status: 'completed'
        });
        
        if (tegaPayment) {
          hasPaidForTegaExam = true;
          paymentSource = 'payment';
          paymentDetails = {
            paymentId: tegaPayment._id,
            amount: tegaPayment.amount,
            paymentDate: tegaPayment.paymentDate,
            validUntil: tegaPayment.validUntil
          };
          console.log('✅ Found Tega exam payment in Payment model');
        }
        
        // Also check RazorpayPayment model for Tega exam payments
        if (!hasPaidForTegaExam) {
          const RazorpayPayment = (await import('../models/RazorpayPayment.js')).default;
          
          // First, check for explicit Tega exam payments using isTegaExam flag
          const tegaRazorpayPayment = await RazorpayPayment.findOne({
            studentId: userId,
            isTegaExam: true,
            status: 'completed'
          });
          
          console.log('🔍 Checking for isTegaExam=true payments:', tegaRazorpayPayment ? 'Found' : 'Not found');
          
          // Also check for any completed payments that might be TEGA exam payments
          const anyCompletedPayment = await RazorpayPayment.findOne({
            studentId: userId,
            status: 'completed'
          });
          
          console.log('🔍 Checking for any completed payments:', anyCompletedPayment ? 'Found' : 'Not found');
          if (anyCompletedPayment) {
            console.log('🔍 Any completed payment details:', {
              courseId: anyCompletedPayment.courseId,
              courseName: anyCompletedPayment.courseName,
              examAccess: anyCompletedPayment.examAccess,
              isTegaExam: anyCompletedPayment.isTegaExam,
              amount: anyCompletedPayment.amount,
              examId: anyCompletedPayment.examId
            });
          }
          
          if (tegaRazorpayPayment) {
            hasPaidForTegaExam = true;
            paymentSource = 'razorpay';
            paymentDetails = {
              paymentId: tegaRazorpayPayment._id,
              amount: tegaRazorpayPayment.amount,
              paymentDate: tegaRazorpayPayment.paymentDate,
              validUntil: tegaRazorpayPayment.validUntil
            };
            console.log('✅ Found Tega exam payment in RazorpayPayment model');
            console.log('🔍 Payment amount:', tegaRazorpayPayment.amount);
            console.log('🔍 Payment date:', tegaRazorpayPayment.paymentDate);
          } else {
            console.log('❌ No Tega exam payment found in RazorpayPayment model with isTegaExam=true');
            
            // Fallback: Check for payments with examAccess=true and no courseId (legacy TEGA exam payments)
            const legacyTegaPayment = await RazorpayPayment.findOne({
              studentId: userId,
              examAccess: true,
              courseId: null,
              status: 'completed'
            });
            
            console.log('🔍 Checking for legacy TEGA payments (examAccess=true, courseId=null):', legacyTegaPayment ? 'Found' : 'Not found');
            
            if (legacyTegaPayment) {
              hasPaidForTegaExam = true;
              paymentSource = 'razorpay_legacy';
              paymentDetails = {
                paymentId: legacyTegaPayment._id,
                amount: legacyTegaPayment.amount,
                paymentDate: legacyTegaPayment.paymentDate,
                validUntil: legacyTegaPayment.validUntil
              };
              console.log('✅ Found legacy Tega exam payment (examAccess=true, courseId=null)');
            } else {
              // Additional fallback: Check for payments with examAccess=true but only if they're specifically for TEGA exams
              // This is more restrictive to avoid false positives from regular course payments
              const anyExamAccessPayment = await RazorpayPayment.findOne({
                studentId: userId,
                examAccess: true,
                status: 'completed',
                $or: [
                  { courseId: null }, // Standalone TEGA exam payments
                  { courseName: { $regex: /tega|TEGA/i } } // Payments to courses with "TEGA" in the name
                ]
              });
              
              console.log('🔍 Checking for any exam access payments (examAccess=true):', anyExamAccessPayment ? 'Found' : 'Not found');
              if (anyExamAccessPayment) {
                console.log('🔍 Exam access payment details:', {
                  courseId: anyExamAccessPayment.courseId,
                  courseName: anyExamAccessPayment.courseName,
                  examAccess: anyExamAccessPayment.examAccess,
                  amount: anyExamAccessPayment.amount
                });
              }
          
              if (anyExamAccessPayment) {
                // Double-check: Make sure this is actually a TEGA exam payment, not a regular course
                if (!anyExamAccessPayment.courseId || 
                    (anyExamAccessPayment.courseName && anyExamAccessPayment.courseName.toLowerCase().includes('tega'))) {
                  hasPaidForTegaExam = true;
                  paymentSource = 'razorpay_exam_access';
                  paymentDetails = {
                    paymentId: anyExamAccessPayment._id,
                    amount: anyExamAccessPayment.amount,
                    paymentDate: anyExamAccessPayment.paymentDate,
                    validUntil: anyExamAccessPayment.validUntil,
                    courseName: anyExamAccessPayment.courseName
                  };
                  console.log('✅ Found TEGA exam payment with exam access (examAccess=true)');
                  console.log('🔍 Course name:', anyExamAccessPayment.courseName);
                } else {
                  console.log('❌ Found payment with exam access but it\'s for a regular course, not TEGA exam');
                }
              } else {
                console.log('❌ No TEGA exam payment found - user has not paid for TEGA exam');
              }
            }
          }
          
          // Note: Removed high-amount payment check as it was incorrectly treating 
          // any payment ≥₹799 as TEGA exam payment, even if it was for a regular course
          // Now checking for the correct TEGA exam price of ₹1
          
          // If still no payment found, check for payments to "Tega Exam" course
          if (!hasPaidForTegaExam) {
            const Course = (await import('../models/Course.js')).default;
            const tegaExamCourse = await Course.findOne({ 
              courseName: { $in: ['Tega Exam', 'TEGA Exam', 'tega exam', 'Tega Main Exam', 'TEGA Main Exam', 'tega main exam'] } // Match both TEGA exam courses
            });
            
            if (tegaExamCourse) {
              const tegaCoursePayment = await RazorpayPayment.findOne({
                studentId: userId,
                courseId: tegaExamCourse._id,
                status: 'completed',
                amount: { $gte: 1 } // Must be at least ₹1 (TEGA exam minimum price)
              });
              
              if (tegaCoursePayment) {
                hasPaidForTegaExam = true;
                paymentSource = 'razorpay_tega_course';
                paymentDetails = {
                  paymentId: tegaCoursePayment._id,
                  amount: tegaCoursePayment.amount,
                  paymentDate: tegaCoursePayment.paymentDate,
                  validUntil: tegaCoursePayment.validUntil,
                  courseName: tegaCoursePayment.courseName
                };
                console.log('✅ Found payment for Tega Exam course');
              }
            }
          }
        }
        
      } catch (error) {
        console.log('❌ MongoDB Tega exam payment check failed:', error.message);
      }
    }
    
    console.log(`🔍 Tega exam payment status: ${hasPaidForTegaExam ? 'PAID' : 'NOT PAID'}`);
    if (hasPaidForTegaExam) {
      console.log(`🔍 Payment source: ${paymentSource}`);
      console.log(`🔍 Payment details:`, paymentDetails);
    }
    
    return {
      success: true,
      hasPaidForTegaExam,
      paymentSource,
      paymentDetails
    };
    
  } catch (error) {
    console.error('Error checking Tega exam payment:', error);
    return {
      success: false,
      hasPaidForTegaExam: false,
      message: 'Failed to check Tega exam payment status'
    };
  }
};

// Express route handler for TEGA exam payment check
export const checkTegaExamPayment = async (req, res) => {
  try {
    const userId = req.studentId;
    const result = await checkTegaExamPaymentUtil(userId);
    res.json(result);
  } catch (error) {
    console.error('Error in checkTegaExamPayment route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check Tega exam payment status'
    });
  }
};

export const getUserPaidCourses = async (req, res) => {
  try {
    const userId = req.studentId; // Changed from req.user.id
    
    console.log('📚 Fetching paid courses for user:', userId);
    
    // Try MongoDB first, fallback to in-memory storage
    let oldPaidCourses = [];
    let razorpayPaidCourses = [];
    // Note: Do NOT shadow the imported in-memory map `userCourseAccess` from authController
    // Use a differently named variable for the array of course IDs fetched from UserCourse model
    let userCourseAccessIds = [];
    
    if (isMongoConnected()) {
      try {
        // Get paid courses from old Payment model
        oldPaidCourses = await Payment.getUserPaidCourses(userId);
        console.log(`📚 Found ${oldPaidCourses.length} paid courses from old Payment model for user ${userId}`);
        
        // Get paid courses from new RazorpayPayment model
        const RazorpayPayment = (await import('../models/RazorpayPayment.js')).default;
        const razorpayPayments = await RazorpayPayment.find({ 
          studentId: userId, 
          status: 'completed' 
        });
        razorpayPaidCourses = razorpayPayments.map(payment => payment.courseId);
        console.log(`📚 Found ${razorpayPaidCourses.length} paid courses from RazorpayPayment model for user ${userId}`);
        
        // Get paid courses from UserCourse model
        const UserCourse = (await import('../models/UserCourse.js')).default;
        const userCourses = await UserCourse.getActiveCourses(userId);
        // Map to raw ids, handling populated documents
        userCourseAccessIds = userCourses
          .map(userCourse => (userCourse.courseId && userCourse.courseId._id) ? userCourse.courseId._id : userCourse.courseId)
          .filter(Boolean);
        console.log(`📚 Found ${userCourseAccessIds.length} paid courses from UserCourse model for user ${userId}`);
        
      } catch (error) {
        console.log('❌ MongoDB paid courses query failed, using in-memory storage:', error.message);
      }
    }
    
    // Get from in-memory storage if MongoDB failed or not connected
    if (oldPaidCourses.length === 0 && userCourseAccess.has(userId)) {
      oldPaidCourses = userCourseAccess.get(userId);
      console.log(`📚 Retrieved ${oldPaidCourses.length} paid courses from in-memory storage for user ${userId}`);
    }

    // Combine and deduplicate course IDs from all sources
    const allPaidCourseIds = [...new Set([...oldPaidCourses, ...razorpayPaidCourses, ...userCourseAccessIds])];
    console.log(`📚 Total unique paid courses: ${allPaidCourseIds.length}`);
    console.log(`📚 Breakdown: Old=${oldPaidCourses.length}, Razorpay=${razorpayPaidCourses.length}, UserCourse=${userCourseAccessIds.length}`);

    // Normalize all course ids to primitive values first
    const normalizedPaidIds = [...new Set([...oldPaidCourses, ...razorpayPaidCourses, ...userCourseAccessIds]
      .map(id => (id && id._id) ? id._id : id))];

    // Get course details (try MongoDB first, then supplement with static data for string IDs)
    let courses = [];
    if (isMongoConnected()) {
      try {
        // Separate valid ObjectIds from legacy string course identifiers to avoid CastError
        const objectIdCourseIds = normalizedPaidIds
          .filter(id => mongoose.Types.ObjectId.isValid(id))
          .map(id => new mongoose.Types.ObjectId(id));
        const stringCourseIds = normalizedPaidIds
          .filter(id => !mongoose.Types.ObjectId.isValid(id) && typeof id === 'string');

        let coursesById = [];
        if (objectIdCourseIds.length > 0) {
          coursesById = await Course.find({ _id: { $in: objectIdCourseIds } });
        }

        courses = [...coursesById];

        // Supplement with static definitions for legacy string IDs
        if (stringCourseIds.length > 0) {
          const staticCoursesMap = {
            'java-programming': { courseId: 'java-programming', courseName: 'Java Programming', price: 799, duration: '4 weeks', category: 'Programming', description: '' },
            'python-data-science': { courseId: 'python-data-science', courseName: 'Python for Data Science', price: 799, duration: '4 weeks', category: 'Programming', description: '' },
            'react-development': { courseId: 'react-development', courseName: 'React.js Development', price: 799, duration: '4 weeks', category: 'Programming', description: '' },
            'aws-cloud': { courseId: 'aws-cloud', courseName: 'AWS Cloud Practitioner', price: 799, duration: '4 weeks', category: 'Cloud', description: '' },
            'tega-main-exam': { courseId: 'tega-main-exam', courseName: 'Tega Main Exam', price: 799, duration: '—', category: 'Exam', description: '' }
          };

          const supplemental = stringCourseIds
            .map(cid => staticCoursesMap[cid])
            .filter(Boolean)
            .map(c => ({
              _id: c.courseId, // keep identifier for client mapping
              courseId: c.courseId,
              courseName: c.courseName,
              price: c.price,
              duration: c.duration,
              category: c.category,
              description: c.description,
              isActive: true
            }));

          courses = [...courses, ...supplemental];
        }

        // Remove duplicates based on stringified id
        const uniqueCourses = courses.filter((course, index, self) => 
          index === self.findIndex(c => (c._id?.toString ? c._id.toString() : c._id) === (course._id?.toString ? course._id.toString() : course._id))
        );
        courses = uniqueCourses;
        
        console.log(`📚 Courses assembled (db + static): ${courses.length}`);
      } catch (error) {
        console.log('❌ Course assembly failed, will use static fallback:', error.message);
      }
    }
    
    // Fallback to static course data when nothing resolved above
    if (courses.length === 0) {
      const staticCourses = {
        'java-programming': { courseId: 'java-programming', name: 'Java Programming', price: 799 },
        'python-data-science': { courseId: 'python-data-science', name: 'Python for Data Science', price: 799 },
        'react-development': { courseId: 'react-development', name: 'React.js Development', price: 799 },
        'aws-cloud': { courseId: 'aws-cloud', name: 'AWS Cloud Practitioner', price: 799 },
        'tega-main-exam': { courseId: 'tega-main-exam', name: 'Tega Main Exam', price: 799 }
      };
      
      courses = normalizedPaidIds.map(courseId => staticCourses[courseId]).filter(Boolean);
      console.log(`📚 Using static data for ${courses.length} courses`);
    }

    console.log(`📚 Returning ${courses.length} paid courses for user ${userId}`);

    // Normalize for client expectations: include both id and courseId
    const normalizedCourses = courses.map((c) => ({
      id: c._id?.toString ? c._id.toString() : c._id,
      courseId: (c.courseId?.toString ? c.courseId.toString() : c.courseId) || (c._id?.toString ? c._id.toString() : c._id),
      courseName: c.courseName || c.name,
      price: c.price,
      duration: c.duration,
      category: c.category,
      description: c.description,
      isActive: c.isActive !== false
    }));

    res.json({
      success: true,
      data: normalizedCourses
    });
  } catch (error) {
    console.error('Error fetching user paid courses:', error);
    // Soft-fail with empty list to avoid breaking the client UI after refresh
    res.json({ success: true, data: [] });
  }
};

// Process refund
export const processRefund = async (req, res) => {
  try {
    const { paymentId, refundReason } = req.body;
    const userId = req.studentId; // Changed from req.user.id

    const payment = await Payment.findOne({ _id: paymentId, userId });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not completed'
      });
    }

    // Process refund through Razorpay if applicable
    if (payment.razorpayPaymentId && razorpay) {
      const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
        amount: payment.amount * 100,
        notes: {
          reason: refundReason
        }
      });

      payment.refundDetails = {
        refundId: refund.id,
        refundAmount: payment.amount,
        refundReason: refundReason,
        refundDate: new Date()
      };
    }

    payment.status = 'refunded';
    await payment.save();

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        paymentId: payment._id,
        refundId: payment.refundDetails?.refundId,
        refundAmount: payment.refundDetails?.refundAmount
      }
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process refund'
    });
  }
};

// Get payment statistics (for admin)
export const getPaymentStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    const totalPayments = await Payment.countDocuments();
    const totalRevenue = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    res.json({
      success: true,
      data: {
        stats: stats,
        totalPayments: totalPayments,
        totalRevenue: totalRevenue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment statistics'
    });
  }
};

// Get offer price for a student
export const getOfferPrice = async (req, res) => {
  try {
    const { studentId, feature = 'Course' } = req.params;
    
    console.log(`🔍 Getting offer price for student ${studentId}, feature: ${feature}`);
    
    const offerPrice = await getOfferPriceForStudent(studentId, feature);
    
    if (offerPrice !== null) {
      console.log(`🎯 Offer found: ₹${offerPrice} for ${feature}`);
    } else {
      console.log(`❌ No offer found for ${feature}`);
    }
    
    res.json({
      success: true,
      data: {
        studentId,
        feature,
        offerPrice,
        hasOffer: offerPrice !== null,
        message: offerPrice !== null ? `Institute offer available: ₹${offerPrice}` : 'No institute offer available'
      }
    });
  } catch (error) {
    console.error('Error getting offer price:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get offer price'
    });
  }
};

// Get all payments for admin with totals
export const getAllPayments = async (req, res) => {
  try {
    let payments = [];

    if (isMongoConnected()) {
      try {
        payments = await Payment.find({})
          .sort({ createdAt: -1 })
          .populate('studentId', 'username email firstName lastName'); // Populate student details
      } catch (error) {
        console.log('MongoDB getAllPayments failed, using in-memory storage:', error.message);
      }
    }

    if (payments.length === 0) {
      // Flatten in-memory payments from userPayments map
      const all = [];
      for (const [, userPayList] of userPayments.entries()) {
        all.push(...userPayList);
      }
      // Sort by createdAt desc if present
      payments = all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    const totals = payments.reduce(
      (acc, p) => {
        acc.count += 1;
        if (p.status === 'completed') acc.totalRevenue += Number(p.amount || 0);
        acc.byStatus[p.status] = (acc.byStatus[p.status] || 0) + 1;
        return acc;
      },
      { count: 0, totalRevenue: 0, byStatus: {} }
    );

    res.json({ success: true, data: payments, totals });
  } catch (error) {
    console.error('Error fetching all payments (admin):', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payments' });
  }
};

// Get course-specific offer price
export const getCourseSpecificOffer = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    
    console.log(`🔍 Getting course-specific offer for student ${studentId}, course: ${courseId}`);
    
    if (!isMongoConnected()) {
      return res.json({
        success: true,
        data: {
          hasOffer: false,
          offerPrice: null,
          message: 'Database not connected'
        }
      });
    }

    // Get student's institute
    const student = await Student.findById(studentId);
    if (!student || !student.institute) {
      console.log(`❌ Student not found or no institute: ${studentId}`);
      return res.json({
        success: true,
        data: {
          hasOffer: false,
          offerPrice: null,
          message: 'Student not found or no institute'
        }
      });
    }

    // Get course details
    const Course = (await import('../models/Course.js')).default;
    const course = await Course.findById(courseId);
    if (!course) {
      console.log(`❌ Course not found: ${courseId}`);
      return res.json({
        success: true,
        data: {
          hasOffer: false,
          offerPrice: null,
          message: 'Course not found'
        }
      });
    }

    console.log(`🔍 Looking for course-specific offers for institute: "${student.institute}", course: "${course.courseName}"`);

    // Escape special regex characters in the institute name
    const escapedInstitute = student.institute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Check for active offer for this institute with this specific course
    const Offer = (await import('../models/Offer.js')).default;
    let offer = await Offer.findOne({
      instituteName: { $regex: new RegExp(`^${escapedInstitute}$`, 'i') },
      isActive: true,
      validFrom: { $lte: new Date() },
      validUntil: { $gte: new Date() },
      'courseOffers.courseId': courseId
    });

    console.log(`🔍 Exact match result:`, offer ? `Found offer with course-specific pricing` : 'No exact match');

    // If no exact match found, try partial matching
    if (!offer) {
      console.log(`🔍 No exact offer match, trying partial match...`);
      const allOffers = await Offer.find({
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
        'courseOffers.courseId': courseId
      });
      
      console.log(`🔍 Found ${allOffers.length} active offers with this course`);
      
      // Try to find a partial match
      const partialMatch = allOffers.find(o => 
        o.instituteName.toLowerCase().includes(student.institute.toLowerCase()) ||
        student.institute.toLowerCase().includes(o.instituteName.toLowerCase())
      );
      
      if (partialMatch) {
        console.log(`🔍 Found partial offer match: "${partialMatch.instituteName}" for "${student.institute}"`);
        offer = partialMatch;
      }
    }

    if (offer) {
      console.log(`🎯 Found course-specific offer for "${student.institute}":`, {
        instituteName: offer.instituteName,
        courseOffers: offer.courseOffers?.length || 0
      });
      
      // Find the specific course offer
      const courseOffer = offer.courseOffers.find(co => co.courseId.toString() === courseId);
      if (courseOffer) {
        console.log(`🎯 Using course-specific offer price: ₹${courseOffer.offerPrice}`);
        return res.json({
          success: true,
          data: {
            hasOffer: true,
            offerPrice: courseOffer.offerPrice,
            originalPrice: course.price,
            discountPercentage: Math.round(((course.price - courseOffer.offerPrice) / course.price) * 100),
            message: `Course-specific offer available: ₹${courseOffer.offerPrice}`
          }
        });
      }
    }

    console.log(`❌ No course-specific offer found for course: "${course.courseName}"`);
    return res.json({
      success: true,
      data: {
        hasOffer: false,
        offerPrice: null,
        message: 'No course-specific offer available'
      }
    });
  } catch (error) {
    console.error('Error getting course-specific offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course-specific offer'
    });
  }
};

// Get TEGA exam-specific offer price
export const getTegaExamSpecificOffer = async (req, res) => {
  try {
    const { studentId, examId } = req.params;
    
    console.log(`🔍 Getting TEGA exam-specific offer for student ${studentId}, exam: ${examId}`);
    
    if (!isMongoConnected()) {
      return res.json({
        success: true,
        data: {
          hasOffer: false,
          offerPrice: null,
          message: 'Database not connected'
        }
      });
    }

    // Get student's institute
    const student = await Student.findById(studentId);
    if (!student || !student.institute) {
      console.log(`❌ Student not found or no institute: ${studentId}`);
      return res.json({
        success: true,
        data: {
          hasOffer: false,
          offerPrice: null,
          message: 'Student not found or no institute'
        }
      });
    }

    // Get exam details
    const Exam = (await import('../models/Exam.js')).default;
    const exam = await Exam.findById(examId);
    if (!exam) {
      console.log(`❌ TEGA exam not found: ${examId}`);
      return res.json({
        success: true,
        data: {
          hasOffer: false,
          offerPrice: null,
          message: 'TEGA exam not found'
        }
      });
    }

    console.log(`🔍 Looking for TEGA exam-specific offers for institute: "${student.institute}", exam: "${exam.title}"`);
    console.log(`🔍 Student ID: ${studentId}, Exam ID: ${examId}`);

    // Escape special regex characters in the institute name
    const escapedInstitute = student.institute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    console.log(`🔍 Escaped institute name: "${escapedInstitute}"`);
    
    // Check for active offer for this institute with TEGA exam offers
    const Offer = (await import('../models/Offer.js')).default;
    
    // Debug: Check what offers exist in the database
    const allOffers = await Offer.find({ isActive: true });
    console.log(`🔍 Found ${allOffers.length} active offers in database:`);
    allOffers.forEach((offer, index) => {
      console.log(`  ${index + 1}. Institute: "${offer.instituteName}"`);
      console.log(`     TEGA Exam Offers: ${offer.tegaExamOffers?.length || 0}`);
      console.log(`     Old TEGA Offer: ${offer.tegaExamOffer ? 'Yes' : 'No'}`);
    });
    
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

    console.log(`🔍 Exact match result:`, offer ? `Found offer with TEGA exam pricing` : 'No exact match');

    // If no exact match found, try partial matching
    if (!offer) {
      console.log(`🔍 No exact offer match, trying partial match...`);
      const allOffers = await Offer.find({
        isActive: true,
        validFrom: { $lte: new Date() },
        validUntil: { $gte: new Date() },
        $or: [
          { 'tegaExamOffers.examId': examId, 'tegaExamOffers.isActive': true },
          { 'tegaExamOffer.examId': examId, 'tegaExamOffer.isActive': true }
        ]
      });
      
      console.log(`🔍 Found ${allOffers.length} active offers with TEGA exam pricing for exam ${examId}`);
      
      // Try to find a partial match
      const partialMatch = allOffers.find(o => 
        o.instituteName.toLowerCase().includes(student.institute.toLowerCase()) ||
        student.institute.toLowerCase().includes(o.instituteName.toLowerCase())
      );
      
      if (partialMatch) {
        console.log(`🔍 Found partial offer match: "${partialMatch.instituteName}" for "${student.institute}"`);
        offer = partialMatch;
      }
    }

    // Check for new structure (tegaExamOffers array)
    if (offer && offer.tegaExamOffers && offer.tegaExamOffers.length > 0) {
      // Find the specific TEGA exam offer for this exam
      const tegaExamOffer = offer.tegaExamOffers.find(eo => 
        eo.examId.toString() === examId && eo.isActive
      );

      if (tegaExamOffer) {
        console.log(`🎯 Found TEGA exam-specific offer (new structure) for "${student.institute}":`, {
          instituteName: offer.instituteName,
          examTitle: tegaExamOffer.examTitle,
          originalPrice: tegaExamOffer.originalPrice,
          offerPrice: tegaExamOffer.offerPrice,
          discountPercentage: tegaExamOffer.discountPercentage
        });
        
        const offerPrice = tegaExamOffer.offerPrice;
        const originalPrice = tegaExamOffer.originalPrice || exam.price;
        console.log(`🎯 Using TEGA exam-specific offer price: ₹${offerPrice} (original: ₹${originalPrice})`);
        
        return res.json({
          success: true,
          data: {
            hasOffer: true,
            offerPrice: offerPrice,
            originalPrice: originalPrice,
            discountPercentage: tegaExamOffer.discountPercentage || Math.round(((originalPrice - offerPrice) / originalPrice) * 100),
            offerType: 'TEGA Exam',
            message: `TEGA exam-specific offer available: ₹${offerPrice}`
          }
        });
      }
    }

    // Check for old structure (tegaExamOffer single object) - backward compatibility
    if (offer && offer.tegaExamOffer && offer.tegaExamOffer.isActive) {
      console.log(`🎯 Found TEGA exam-specific offer (old structure) for "${student.institute}":`, {
        instituteName: offer.instituteName,
        tegaExamOffer: offer.tegaExamOffer
      });
      
      const offerPrice = offer.tegaExamOffer.offerPrice;
      const originalPrice = offer.tegaExamOffer.originalPrice || exam.price;
      console.log(`🎯 Using TEGA exam-specific offer price: ₹${offerPrice} (original: ₹${originalPrice})`);
      
      return res.json({
        success: true,
        data: {
          hasOffer: true,
          offerPrice: offerPrice,
          originalPrice: originalPrice,
          discountPercentage: offer.tegaExamOffer.discountPercentage || Math.round(((originalPrice - offerPrice) / originalPrice) * 100),
          offerType: 'TEGA Exam',
          message: `TEGA exam-specific offer available: ₹${offerPrice}`
        }
      });
    }

    console.log(`❌ No TEGA exam-specific offer found for exam: "${exam.title}"`);
    return res.json({
      success: true,
      data: {
        hasOffer: false,
        offerPrice: null,
        message: 'No TEGA exam-specific offer available'
      }
    });
  } catch (error) {
    console.error('Error getting TEGA exam-specific offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get TEGA exam-specific offer'
    });
  }
};

