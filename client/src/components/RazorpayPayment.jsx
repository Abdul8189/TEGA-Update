import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const RazorpayPayment = ({ course, onPaymentSuccess, onClose, examPaymentData = null }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(''); // 'pending', 'success', 'failed', 'already_paid'
  // Effective amount to display (prefer exam amount -> offer -> finalPrice -> price). Overridden by server chargedAmount if present.
  const [displayAmount, setDisplayAmount] = useState(
    examPaymentData?.amount || (course?.offerPrice ?? course?.finalPrice ?? course?.price) || 0
  );
  const { user } = useAuth();
  const studentName = (user?.firstName || user?.lastName)
    ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim()
    : (user?.studentName || user?.username || 'Student');
  const studentEmail = user?.email || 'student@example.com';
  const sanitizePhone = (v) => {
    const digits = (v || '').toString().replace(/\D/g, '');
    return digits.length >= 10 ? digits.slice(-10) : '';
  };
  const studentPhone = sanitizePhone(user?.phone || user?.contactNumber || user?.phoneNumber) || '9999999999';

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      setError('');

      // Debug authentication
      console.log('🔍 RazorpayPayment: User context:', user);
      console.log('🔍 RazorpayPayment: User role:', user?.role);
      console.log('🔍 RazorpayPayment: Token in localStorage:', !!localStorage.getItem('token'));
      console.log('🔍 RazorpayPayment: Admin token in localStorage:', !!localStorage.getItem('adminToken'));

      const requestBody = {};
      
      // Add course ID only if this is a course payment
      if (course && !examPaymentData) {
        requestBody.courseId = course.courseId || course._id || course.id;
      }

      // Add offer information if available (only for course payments)
      if (course && !examPaymentData && course?.offerPrice && course?.offerPrice !== course?.price) {
        requestBody.offerInfo = {
          hasOffer: true,
          originalPrice: course?.price,
          offerPrice: course?.offerPrice,
          finalPrice: course?.finalPrice || course?.offerPrice,
          discountPercentage: Math.round(((course?.price - course?.offerPrice) / course?.price) * 100)
        };
        console.log('🎯 Sending offer info to backend:', requestBody.offerInfo);
      }

           // Add exam payment data if this is an exam payment
           if (examPaymentData) {
             requestBody.examId = examPaymentData.examId;
             requestBody.examTitle = examPaymentData.examTitle;
             requestBody.attemptNumber = examPaymentData.attemptNumber;
             requestBody.isRetake = examPaymentData.isRetake;
             requestBody.amount = examPaymentData.amount;
             requestBody.type = examPaymentData.type || 'tega-exam';
             console.log('🔍 Creating order for exam payment:', requestBody);
             console.log('🎯 Exam payment amount:', examPaymentData.amount);
           }

      console.log('🔍 RazorpayPayment: Making API call to create-order...');
      const response = await api('/api/razorpay/create-order', {
        method: 'POST',
        body: requestBody
      });

      console.log('🔍 RazorpayPayment: API response:', response);

      if (response.success) {
        // Prefer server-returned charged amount (rupees) if provided
        if (response.data && typeof response.data.chargedAmount === 'number') {
          console.log('✅ Using server chargedAmount (rupees):', response.data.chargedAmount);
          setDisplayAmount(response.data.chargedAmount);
        }
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      const message = error.message || 'Failed to create order';
      
      // Check for authentication errors
      if (message.toLowerCase().includes('unauthorized') || 
          message.toLowerCase().includes('token') || 
          message.toLowerCase().includes('session') ||
          message.toLowerCase().includes('401')) {
        console.error('🔑 Authentication error detected:', message);
        setError('Your session has expired. Please log in again to continue.');
        // Optionally redirect to login
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
        return null;
      }
      
      // If user already has access, show already paid popup
      if (message.toLowerCase().includes('already have access')) {
        console.log('✅ User already has access to this course');
        setPaymentStatus('already_paid');
        setError(''); // Clear any error message
        return null;
      }
      
      setError(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (paymentData) => {
    try {
      console.log('🔍 Frontend: Verifying payment with data:', paymentData);
      
      const response = await api('/api/razorpay/verify-payment', {
        method: 'POST',
        body: paymentData
      });

      console.log('🔍 Frontend: Payment verification response:', response);

      if (response.success) {
        console.log('✅ Frontend: Payment verification successful');
        
        // If this is an exam payment, create exam payment attempt
        if (examPaymentData && examPaymentData.examId) {
          try {
            console.log('🔍 Creating exam payment attempt for exam:', examPaymentData.examId);
            const examAttemptResponse = await api('/api/exams/payment-attempt', {
              method: 'POST',
              body: {
                examId: examPaymentData.examId,
                paymentId: response.data.paymentId,
                paymentAmount: response.data.amount
              }
            });
            
            if (examAttemptResponse.success) {
              console.log('✅ Exam payment attempt created:', examAttemptResponse.data);
            } else {
              console.error('❌ Failed to create exam payment attempt:', examAttemptResponse.message);
            }
          } catch (error) {
            console.error('❌ Error creating exam payment attempt:', error);
          }
        }
        
        setPaymentStatus('success');
        setTimeout(() => {
          onPaymentSuccess(response.data);
        }, 2000);
      } else {
        throw new Error(response.message || 'Payment verification failed');
      }
    } catch (error) {

      console.error('❌ Frontend: Error verifying payment:', error);
      setError(error.message || 'Payment verification failed');
      setPaymentStatus('failed');
    }
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load Razorpay script');
      }

      // Create order
      const orderData = await createOrder();
      // If already paid shortcut handled, stop here
      if (!orderData) return;

      // Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        // amount is already in paise from the server (offer already applied if available)
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Tega Education',
        description: `Payment for ${examPaymentData ? examPaymentData.examTitle : (course?.courseName || course?.name || 'Course')}`,
        order_id: orderData.orderId,
        receipt: orderData.receipt,
        handler: async function (response) {
          console.log('🔍 Frontend: Razorpay payment successful:', response);
          
          // Verify payment
          console.log('🔍 Frontend: Calling verifyPayment...');
          await verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
        },
        prefill: {
          name: studentName,
          email: studentEmail,
          contact: studentPhone
        },
        notes: {
          courseId: examPaymentData ? null : (course?.courseId || course?._id || course?.id),
          courseName: examPaymentData ? examPaymentData.examTitle : (course?.courseName || course?.name),
          examId: examPaymentData ? examPaymentData.examId : null,
          examTitle: examPaymentData ? examPaymentData.examTitle : null,
          studentEmail: studentEmail,
          studentName: studentName,
          studentPhone: studentPhone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function() {
            setError('Payment cancelled by user');
            setPaymentStatus('failed');
          }
        }
      };

      console.log('🧾 Razorpay prefill:', { name: studentName, email: studentEmail, contact: studentPhone });
      console.log('🧾 Razorpay notes:', options.notes);

      // Open Razorpay checkout
      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Error initiating payment:', error);
      setError(error.message || 'Failed to initiate payment');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  if (paymentStatus === 'already_paid') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-blue-800">✅ Already Paid!</h3>
            <p className="text-blue-600 text-lg">
              You already have access to {examPaymentData ? 'this exam' : 'this course'}. No payment needed!
            </p>
            <div className="bg-blue-50 p-3 rounded-lg text-left">
              <p className="text-sm text-blue-700">
                <strong>{examPaymentData ? 'Exam' : 'Course'}:</strong> {examPaymentData ? examPaymentData.examTitle : course?.name}<br/>
                <strong>Amount:</strong> ₹{examPaymentData ? examPaymentData.amount : course?.price}<br/>
                <strong>Status:</strong> ✅ Already paid
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-green-800">✅ Payment Successful!</h3>
            <p className="text-green-600 text-lg">
              Your payment has been processed successfully. You now have access to {examPaymentData ? 'the exam' : 'the course'}!
            </p>
            <div className="bg-green-50 p-3 rounded-lg text-left">
              <p className="text-sm text-green-700">
                <strong>{examPaymentData ? 'Exam' : 'Course'}:</strong> {examPaymentData ? examPaymentData.examTitle : course.name}<br/>
                <strong>Amount:</strong> ₹{displayAmount}<br/>
                <strong>Status:</strong> ✅ Payment completed
                {examPaymentData && (
                  <>
                    <br/>
                    <strong>Attempt:</strong> {examPaymentData.isRetake ? `Retake ${examPaymentData.attemptNumber}` : `Attempt ${examPaymentData.attemptNumber}`}
                  </>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed') {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center animate-pulse">
              <AlertCircle className="text-red-600" size={48} />
            </div>
            <h3 className="text-2xl font-bold text-red-800">❌ Payment Failed</h3>
            <p className="text-red-600 text-lg">{error}</p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setPaymentStatus('');
                  setError('');
                }}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Complete Payment</h3>
            <p className="text-gray-600">
              Pay ₹{displayAmount} to access <strong>{examPaymentData ? examPaymentData.examTitle : course?.name}</strong>
            </p>
            {examPaymentData && (
              <p className="text-sm text-gray-500 mt-1">
                {examPaymentData.isRetake ? `Retake Attempt ${examPaymentData.attemptNumber}` : `Attempt ${examPaymentData.attemptNumber}`}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 p-3 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Payment Methods Available:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• UPI (Google Pay, PhonePe, Paytm)</li>
              <li>• Credit/Debit Cards</li>
              <li>• Net Banking</li>
              <li>• Wallets</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;
