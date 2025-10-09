import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import UserDashboardLayout from '../components/UserDashboardLayout'
import RazorpayPayment from '../components/RazorpayPayment'
import { 
  CreditCard, 
  CheckCircle, 
  Calendar, 
  BookOpen, 
  History, 
  Receipt,
  DollarSign
} from 'lucide-react'
import { paymentAPI } from '../utils/api'

const PaymentPage = () => {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  
  // State management
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const [tegaExams, setTegaExams] = useState([])
  const [paidCourses, setPaidCourses] = useState([])
  const [paymentHistory, setPaymentHistory] = useState([])
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay')
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [showRazorpayModal, setShowRazorpayModal] = useState(false)
  const [examPaymentData, setExamPaymentData] = useState(null)
  const [paymentDetails, setPaymentDetails] = useState({ amount: 0 })
  const [upiDetails, setUpiDetails] = useState({ amount: 0 })
  const [hasPaidForTegaExam, setHasPaidForTegaExam] = useState(false)
  const [isCheckingTegaPayment, setIsCheckingTegaPayment] = useState(false)

  // Payment methods
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'UPI/Card/Wallet',
      icon: CreditCard,
      description: 'Pay with UPI, Credit/Debit Cards, Net Banking, or Digital Wallets'
    }
  ]

  // Check TEGA exam payment status
  const checkTegaExamPayment = async () => {
    try {
      setIsCheckingTegaPayment(true)
      console.log('🔍 Checking TEGA exam payment status for user:', user?.id)
      
      const response = await paymentAPI.checkTegaExamPayment()
      console.log('🔍 TEGA exam payment check response:', response)
      
      if (response && response.success) {
        setHasPaidForTegaExam(response.hasPaidForTegaExam)
        console.log('✅ TEGA exam payment status:', response.hasPaidForTegaExam)
        console.log('🔍 Payment source:', response.paymentSource)
        console.log('🔍 Payment details:', response.paymentDetails)
      } else {
        console.log('❌ Failed to check TEGA exam payment status')
        setHasPaidForTegaExam(false)
      }
    } catch (error) {
      console.error('❌ Error checking TEGA exam payment:', error)
      setHasPaidForTegaExam(false)
    } finally {
      setIsCheckingTegaPayment(false)
    }
  }

  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
    try {
      setLoading(true)
      
      // Check TEGA exam payment status first
      await checkTegaExamPayment()
        
        // Load courses
        console.log('🔍 Loading courses...')
        const coursesResponse = await paymentAPI.getCourses()
        console.log('🔍 Courses response:', coursesResponse)
        console.log('🔍 Courses response.data:', coursesResponse.data)
        console.log('🔍 Courses response.data type:', typeof coursesResponse.data)
        console.log('🔍 Courses response.data length:', coursesResponse.data?.length)
        
        // Handle different response structures
        let coursesData = []
        if (coursesResponse.courses && Array.isArray(coursesResponse.courses)) {
          coursesData = coursesResponse.courses
        } else if (coursesResponse.data) {
          if (Array.isArray(coursesResponse.data)) {
            coursesData = coursesResponse.data
          } else if (coursesResponse.data.courses && Array.isArray(coursesResponse.data.courses)) {
            coursesData = coursesResponse.data.courses
          } else if (coursesResponse.data.data && Array.isArray(coursesResponse.data.data)) {
            coursesData = coursesResponse.data.data
          }
        }
        
        // Fetch offer prices for each course (only course-specific offers, no general fallback)
        console.log('🔍 Fetching offer prices for courses...')
        console.log('🔍 User ID:', user?.id)
        console.log('🔍 User Institute:', user?.institute)
        console.log('🔍 User object:', user)
        console.log('🔍 Token from localStorage:', localStorage.getItem('token'))
        console.log('🔍 Admin token from localStorage:', localStorage.getItem('adminToken'))
        console.log('🔍 Principal token from localStorage:', localStorage.getItem('principalToken'))
        const coursesWithOffers = await Promise.all(coursesData.map(async (course) => {
          try {
            console.log(`\n🔍 Processing course: "${course.courseName || course.name}" (ID: ${course._id || course.id})`)
            
            // First try course-specific offer
            console.log(`🔍 Trying course-specific offer for course ID: ${course._id || course.id}`)
            const courseSpecificResponse = await paymentAPI.getCourseSpecificOffer(user?.id, course._id || course.id)
            console.log(`🔍 Course-specific response:`, courseSpecificResponse)
            
            if (courseSpecificResponse.success && courseSpecificResponse.data?.hasOffer) {
              const offerPrice = courseSpecificResponse.data.offerPrice
              const discountPercentage = Math.round(((course.price - offerPrice) / course.price) * 100)
              console.log(`🎯 Course "${course.courseName || course.name}" - Course-specific offer: Original: ₹${course.price}, Offer: ₹${offerPrice}, Discount: ${discountPercentage}%`)
              return {
                ...course,
                offerPrice: offerPrice,
                finalPrice: offerPrice,
                discountPercentage: discountPercentage,
                hasOffer: true,
                offerType: 'course-specific'
              }
            }
            
            // Only show course-specific offers, no general institute fallback
            console.log(`ℹ️ No course-specific offer found for "${course.courseName || course.name}" - no offer will be displayed`)
            
            console.log(`ℹ️ No offers found for course "${course.courseName || course.name}"`)
            return {
              ...course,
              offerPrice: null,
              finalPrice: course.price,
              discountPercentage: 0,
              hasOffer: false,
              offerType: 'none'
            }
    } catch (error) {
            console.log(`❌ Failed to fetch offer for course "${course.courseName || course.name}":`, error.message)
            console.log(`❌ Error details:`, error)
            return {
              ...course,
              offerPrice: null,
              finalPrice: course.price,
              discountPercentage: 0,
              hasOffer: false,
              offerType: 'error'
            }
          }
        }))
        
        console.log('🔍 Processed courses with offers:', coursesWithOffers)
        setCourses(coursesWithOffers)
        
        // Load paid courses
        console.log('🔍 Loading paid courses...')
        const paidResponse = await paymentAPI.getPaidCourses()
        console.log('🔍 Paid courses response:', paidResponse)
        setPaidCourses(paidResponse.data?.map(course => course.courseId || course.id) || [])
        
        // Load payment history
        console.log('🔍 Loading payment history...')
        const historyResponse = await paymentAPI.getPaymentHistory()
        console.log('🔍 Payment history response:', historyResponse)
        setPaymentHistory(historyResponse.data || [])
        
        // Load TEGA exams
        console.log('🔍 Loading TEGA exams...')
        const tegaResponse = await paymentAPI.getTegaExams()
        console.log('🔍 TEGA exams response:', tegaResponse)
        let tegaExamsData = tegaResponse.exams || tegaResponse.data || []
        
        // Fetch offer prices for TEGA exams (only exam-specific offers, no general fallback)
        console.log('🔍 Fetching offer prices for TEGA exams...')
        const tegaExamsWithOffers = await Promise.all(tegaExamsData.map(async (exam) => {
          try {
            // First try exam-specific offer
            const examSpecificResponse = await paymentAPI.getTegaExamSpecificOffer(user?.id, exam._id || exam.id)
            if (examSpecificResponse.success && examSpecificResponse.data?.hasOffer) {
              const offerPrice = examSpecificResponse.data.offerPrice
              const originalPrice = examSpecificResponse.data.originalPrice || exam.price
              const discountPercentage = examSpecificResponse.data.discountPercentage || Math.round(((originalPrice - offerPrice) / originalPrice) * 100)
              console.log(`🎯 TEGA Exam "${exam.title}" - Exam-specific offer: Original: ₹${originalPrice}, Offer: ₹${offerPrice}, Discount: ${discountPercentage}%`)
              return {
                ...exam,
            offerPrice: offerPrice,
                originalPrice: originalPrice,
                finalPrice: offerPrice,
                discountPercentage: discountPercentage,
                hasOffer: true,
                offerType: 'exam-specific'
              }
            }
            
            // Only show exam-specific offers, no general institute fallback
            console.log(`ℹ️ No exam-specific offer found for "${exam.title}" - no offer will be displayed`)
            
            console.log(`ℹ️ No offers found for TEGA exam "${exam.title}"`)
            return {
              ...exam,
              offerPrice: null,
              finalPrice: exam.price,
              discountPercentage: 0,
              hasOffer: false,
              offerType: 'none'
                }
              } catch (error) {
            console.log(`❌ Failed to fetch offer for TEGA exam "${exam.title}":`, error.message)
              return {
              ...exam,
              offerPrice: null,
              finalPrice: exam.price,
              discountPercentage: 0,
              hasOffer: false,
              offerType: 'error'
            }
          }
        }))
        
        console.log('🔍 Processed TEGA exams with offers:', tegaExamsWithOffers)
        setTegaExams(tegaExamsWithOffers)
        
    } catch (error) {
        console.error('Error initializing payment data:', error)
    } finally {
      setLoading(false)
    }
  }

    initializeData()
  }, [])

  // Handle exam payment data from location state
  useEffect(() => {
    if (location.state) {
      console.log('🔍 Payment page received state:', location.state)
      if (location.state.examId || location.state.type === 'tega-exam') {
        setExamPaymentData(location.state)
        console.log('🔍 Exam payment data set:', location.state)
      }
    }
  }, [location.state])

  // Fetch TEGA exams separately
  const fetchTegaExams = async () => {
    try {
      console.log('🔍 Fetching TEGA exams...')
      const response = await paymentAPI.getTegaExams()
      console.log('🔍 TEGA exams fetched:', response)
      setTegaExams(response.data || [])
    } catch (error) {
      console.error('Error fetching TEGA exams:', error)
    }
  }

  // Check if token is valid
  const isTokenValid = (token) => {
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      const isValid = payload.exp > now;
      
      console.log('🔍 Token validation:', {
        payload: payload,
        exp: payload.exp,
        now: now,
        isValid: isValid,
        timeLeft: payload.exp - now
      });
      
      return isValid;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  };

  // Handle payment start
  const handleStartPayment = () => {
    // Check authentication before proceeding
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    console.log('🔍 PaymentPage: Authentication check:', {
      hasToken: !!token,
      hasUserData: !!userData,
      user: user,
      tokenValid: isTokenValid(token),
      userRole: user?.role
    });
    
    // Check if user has student role
    if (!token || !userData || !isTokenValid(token)) {
      alert('Your session has expired. Please log in again to continue.');
      // Clear invalid session data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }
    
    // Additional check for student role
    if (user?.role !== 'student') {
      alert('Access denied. Student role required for payments.');
      return;
    }
    
      setShowRazorpayModal(true)
  }

  // Handle Razorpay payment success
  const handleRazorpayPaymentSuccess = async (paymentData) => {
    try {
      if (examPaymentData || (location.state && (location.state.examId || location.state.type === 'tega-exam'))) {
        // TEGA Exam Payment
        const examData = examPaymentData || location.state
      const newPayment = {
        id: paymentData.id || Date.now().toString(),
          examId: examData.examId,
          examTitle: examData.examTitle || examData.title,
        amount: paymentData.amount,
          paymentMethod: 'Razorpay',
        status: 'completed',
        date: new Date().toISOString(),
        transactionId: paymentData.transactionId,
        userId: user?.id,
        userEmail: user?.email,
          timestamp: new Date().toISOString(),
          type: 'tega-exam'
      }

      // Save payment to localStorage
      const existingPayments = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
      const updatedPayments = [newPayment, ...existingPayments]
      localStorage.setItem('paymentHistory', JSON.stringify(updatedPayments))

        // Update payment history state
        setPaymentHistory(updatedPayments)

        // Refresh TEGA exam payment status
        await checkTegaExamPayment()

        // Navigate to exams page
        navigate('/exams')
      } else {
        // Course Payment
          const newPayment = {
          id: paymentData.id || Date.now().toString(),
          courseId: courses.find(c => c.id === selectedCourse)?.courseId || selectedCourse,
            courseName: courses.find(c => c.id === selectedCourse)?.name,
          amount: paymentData.amount,
          paymentMethod: 'Razorpay',
            status: 'completed',
            date: new Date().toISOString(),
          transactionId: paymentData.transactionId,
          userId: user?.id,
          userEmail: user?.email,
          timestamp: new Date().toISOString()
          }

          // Update paid courses list
        setPaidCourses(prev => [...prev, courses.find(c => c.id === selectedCourse)?.courseId || selectedCourse])

        // Save payment to localStorage
          const existingPayments = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
        const updatedPayments = [newPayment, ...existingPayments]
          localStorage.setItem('paymentHistory', JSON.stringify(updatedPayments))

        // Update payment history state
        setPaymentHistory(updatedPayments)
      }
        } catch (error) {
      console.error('Error handling payment success:', error)
    }
  }

  const checkPaymentStatus = (courseId) => {
    return paidCourses.includes(courseId)
  }

  const handleCourseSelection = (courseId) => {
    setSelectedCourse(courseId)
    const course = courses.find(c => c.id === courseId)
    if (course) {
      setPaymentDetails(prev => ({ ...prev, amount: course.finalPrice }))
      setUpiDetails(prev => ({ ...prev, amount: course.finalPrice }))
    }
  }

  // Determine if this is a TEGA exam payment
  const isTegaExamPayment = examPaymentData || (location.state && (location.state.examId || location.state.type === 'tega-exam'))
  
  console.log('🔍 isTegaExamPayment check:', {
    examPaymentData,
    locationState: location.state,
    hasExamId: location.state?.examId,
    hasType: location.state?.type,
    isTegaExamPayment
  })

  // Debug logging
  console.log('🔍 PaymentPage state:', {
    courses: courses.length,
    paidCourses: paidCourses.length,
    tegaExams: tegaExams.length,
    paymentHistory: paymentHistory.length,
    isTegaExamPayment,
    loading
  })
  console.log('🔍 Courses array:', courses)
  console.log('🔍 First course:', courses[0])
  
  // Debug current session
  const currentToken = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  console.log('🔍 Current session debug:', {
    user: user,
    token: currentToken ? 'present' : 'missing',
    userData: localStorage.getItem('user') ? 'present' : 'missing',
    tokenValid: isTokenValid(currentToken),
    refreshToken: refreshToken ? 'present' : 'missing',
    tokenExpiry: currentToken ? JSON.parse(atob(currentToken.split('.')[1])).exp : null,
    currentTime: Math.floor(Date.now() / 1000)
  })

  // Loading state
  if (loading) {
    return (
      <UserDashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
      </UserDashboardLayout>
    )
  }

  return (
    <UserDashboardLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {isTegaExamPayment ? 'TEGA Exam Payment' : 'Course Payment Gateway'}
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {isTegaExamPayment 
                ? 'Secure payment processing for TEGA exam access'
                : 'Secure payment processing for course enrollment and exam access'
              }
            </p>
                  </div>
                </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Debug Panel - Remove this after testing */}
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 mb-6 rounded">
          <h3 className="font-bold">🔍 TEGA Exam Payment Debug Info:</h3>
          <p><strong>User ID:</strong> {user?.id || 'Not logged in'}</p>
          <p><strong>User Email:</strong> {user?.email || 'Not available'}</p>
          <p><strong>Checking TEGA Payment:</strong> {isCheckingTegaPayment ? 'Yes' : 'No'}</p>
          <p><strong>Has Paid for TEGA Exam:</strong> {hasPaidForTegaExam ? 'Yes' : 'No'}</p>
          <p><strong>TEGA Exams Count:</strong> {tegaExams.length}</p>
              </div>

        {/* TEGA Exam Payment Section */}
        {isTegaExamPayment ? (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-purple-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
                <CheckCircle className="w-8 h-8 mr-3 text-purple-600" />
                TEGA Exam Payment
              </h2>

              {/* Exam Details */}
              <div className="bg-purple-50 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {examPaymentData?.examTitle || location.state?.examTitle || 'TEGA Exam'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                        <div>
                    <span className="font-medium">Exam Type:</span> TEGA Assessment
                        </div>
                        <div>
                    <span className="font-medium">Duration:</span> {examPaymentData?.duration || location.state?.duration || 'As per exam rules'}
                        </div>
                      <div>
                    <span className="font-medium">Questions:</span> {examPaymentData?.questionCount || location.state?.questionCount || 'Multiple choice'}
                      </div>
                      <div>
                    <span className="font-medium">Access:</span> Immediate after payment
                        </div>
                        </div>
                      </div>

              {/* Amount Display */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-xl text-gray-700">Total Amount:</span>
                  <span className="text-3xl font-bold text-purple-600">
                    ₹{examPaymentData?.amount || location.state?.amount || 1999}
                  </span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={() => {
                  const amount = (examPaymentData?.amount || location.state?.amount) || 1999
                  setPaymentDetails(prev => ({ ...prev, amount }))
                  setUpiDetails(prev => ({ ...prev, amount }))
                  handleStartPayment()
                }}
                className="w-full bg-gradient-to-r from-purple-500 to-purple-700 text-white font-bold py-4 px-8 rounded-lg hover:from-purple-600 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg text-lg"
              >
                Pay for TEGA Exam
              </button>

              {/* Payment Features */}
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                  Secure SSL encrypted payment
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                  Instant access after payment
                </div>
                <div className="flex items-center text-gray-600">
                  <CheckCircle className="w-5 h-5 mr-3 text-green-500" />
                  Multiple payment options
                </div>
              </div>
            </div>
                          </div>
                        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <BookOpen className="w-6 h-6 mr-2" />
                Select Course
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-700">
                  <strong>💡 Note:</strong> Offers are only displayed for courses specifically configured by your institute admin. 
                  If you don't see an offer, the course is available at the regular price.
                </p>
              </div>
              
              {courses.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Available</h3>
                  <p className="text-gray-500 mb-4">Please contact admin to add courses.</p>
                </div>
              ) : (
              <div className="space-y-4">
                  {console.log('🔍 Rendering courses:', courses)}
                  {courses.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No courses available</p>
                      <p className="text-sm">Courses count: {courses.length}</p>
                    </div>
                  ) : (
                    courses.map((course) => {
                    console.log('🔍 Rendering course:', course)
                    const courseId = course._id || course.id || course.courseId
                    const isPaid = checkPaymentStatus(courseId)
                  return (
                    <div
                        key={courseId}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedCourse === courseId
                          ? 'border-blue-500 bg-blue-50'
                            : isPaid
                            ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${isPaid ? 'opacity-75' : ''}`}
                        onClick={() => !isPaid && handleCourseSelection(courseId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{course.courseName || course.name || course.title}</h3>
                              {isPaid && (
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                                  PAID
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{course.description || 'No description available'}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            {course.duration}
                          </div>
                        </div>
                        <div className="text-right">
                            {course.hasOffer ? (
                            <div>
                                <div className="text-lg font-bold text-green-600">
                                  {course.finalPrice === 0 ? 'FREE' : `₹${course.finalPrice}`}
                                </div>
                              <div className="text-sm text-gray-500 line-through">₹{course.price}</div>
                                <div className="text-xs text-green-600 font-medium">
                                  🎯 {course.discountPercentage}% OFF
                                  {course.offerType === 'course-specific' && <span className="text-blue-600"> (Course)</span>}
                                  {course.offerType === 'institute-general' && <span className="text-purple-600"> (Institute)</span>}
                                </div>
                            </div>
                          ) : (
                            <div className="text-lg font-bold text-gray-900">₹{course.price}</div>
                          )}
                          {isPaid ? (
                            <div className="text-xs text-green-600 font-medium">✓ Purchased</div>
                          ) : (
                            <div className="text-xs text-blue-600 font-medium">Available</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                    })
                  )}
                </div>
              )}
            </div>

            {/* TEGA Exam Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-purple-600" />
                TEGA Exams
              </h2>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-purple-700">
                  <strong>💡 Note:</strong> Offers are only displayed for TEGA exams specifically configured by your institute admin. 
                  If you don't see an offer, the exam is available at the regular price.
                </p>
              </div>
              
              {tegaExams.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No TEGA Exams Available</h3>
                  <p className="text-gray-500 mb-4">Please contact admin to add TEGA exams.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tegaExams.map((exam) => {
                    console.log('🔍 Rendering TEGA exam:', exam)
                    const examId = exam._id || exam.id
                    return (
                      <div
                        key={examId}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          hasPaidForTegaExam
                            ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100'
                            : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                        onClick={() => {
                          if (!hasPaidForTegaExam) {
                            setExamPaymentData({
                              examId: examId,
                              examTitle: exam.title,
                              amount: exam.finalPrice,
                              type: 'tega-exam'
                            })
                            setPaymentDetails(prev => ({ ...prev, amount: exam.finalPrice }))
                            setUpiDetails(prev => ({ ...prev, amount: exam.finalPrice }))
                          }
                        }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                              <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                                TEGA
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{exam.description || 'TEGA Assessment Exam'}</p>
                            <div className="flex items-center text-sm text-gray-500">
                              <Calendar className="w-4 h-4 mr-1" />
                              <span>Duration: {exam.duration} minutes</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {hasPaidForTegaExam ? (
                              <div>
                                <div className="text-lg font-bold text-green-600">₹{exam.price || exam.effectivePrice}</div>
                                <div className="text-sm text-green-600 font-medium">✅ Purchased</div>
                              </div>
                            ) : (
                              <>
                                {exam.hasOffer ? (
                                  <div>
                                    <div className="text-lg font-bold text-green-600">
                                      {exam.finalPrice === 0 ? 'FREE' : `₹${exam.finalPrice}`}
                                    </div>
                                    <div className="text-sm text-gray-500 line-through">₹{exam.price || exam.effectivePrice}</div>
                                    <div className="text-xs text-green-600 font-medium">
                                      🎯 {exam.discountPercentage}% OFF
                                      {exam.offerType === 'exam-specific' && <span className="text-blue-600"> (Exam)</span>}
                                      {exam.offerType === 'institute-general' && <span className="text-purple-600"> (Institute)</span>}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-lg font-bold text-gray-900">₹{exam.price || exam.effectivePrice}</div>
                                )}
                                <div className="text-sm text-purple-600 font-medium">Pay & Access</div>
                              </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
              )}
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <DollarSign className="w-6 h-6 mr-2" />
                Payment Details
              </h2>

              {selectedCourse || examPaymentData ? (
                <div className="space-y-6">
                  {/* Selected Course/Exam Info */}
                  <div className={`p-4 rounded-lg ${examPaymentData ? 'bg-purple-50' : 'bg-blue-50'}`}>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      {examPaymentData ? examPaymentData.examTitle : 
                        (courses.find(c => (c._id || c.id || c.courseId) === selectedCourse)?.courseName || 
                         courses.find(c => (c._id || c.id || c.courseId) === selectedCourse)?.name)}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {examPaymentData ? (examPaymentData.description || 'TEGA Assessment Exam') :
                        courses.find(c => (c._id || c.id || c.courseId) === selectedCourse)?.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {examPaymentData ? `Type: TEGA Exam` : 
                          `Duration: ${courses.find(c => (c._id || c.id || c.courseId) === selectedCourse)?.duration}`}
                      </span>
                          <span className="text-xl font-bold text-gray-900">
                        ₹{examPaymentData ? examPaymentData.amount : 
                          courses.find(c => (c._id || c.id || c.courseId) === selectedCourse)?.price}
                          </span>
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
                    <div className="grid grid-cols-1 gap-3">
                      {paymentMethods.map((method) => {
                        const Icon = method.icon
                        return (
                          <div
                            key={method.id}
                            className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                              selectedPaymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            <div className="flex items-center">
                              <Icon className="w-5 h-5 mr-3 text-gray-600" />
                              <div>
                                <div className="font-medium text-gray-900">{method.name}</div>
                                <div className="text-sm text-gray-500">{method.description}</div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Amount Display */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Total Amount:</span>
                      <span className="text-2xl font-bold text-gray-900">
                        ₹{examPaymentData ? examPaymentData.amount : 
                          courses.find(c => (c._id || c.id || c.courseId) === selectedCourse)?.finalPrice}
                      </span>
                    </div>
                  </div>

                  {/* Start Payment Button */}
                  <button
                    onClick={handleStartPayment}
                    className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${
                      examPaymentData 
                        ? 'bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800'
                    } text-white`}
                  >
                    {examPaymentData ? 'Pay for TEGA Exam' : 'Start Payment'}
                  </button>

                  {/* Payment Features */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Secure SSL encrypted payment
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      {examPaymentData ? 'Instant exam access after payment' : 'Instant course access after payment'}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      {examPaymentData ? 'Direct exam access' : 'Exam access included'}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course or TEGA Exam</h3>
                  <p className="text-gray-500">Choose a course or TEGA exam from the left to proceed with payment</p>
                </div>
              )}
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <History className="w-6 h-6 mr-2" />
                  Payment History
                </h2>
                <button
                  onClick={() => setShowPaymentHistory(!showPaymentHistory)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showPaymentHistory ? 'Hide' : 'Show'} History
                </button>
              </div>

              {showPaymentHistory && (
                <div className="space-y-4">
                  {paymentHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No payment history found</p>
                    </div>
                  ) : (
                    paymentHistory.map((payment, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            {payment.courseName || payment.examTitle || 'Payment'}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            payment.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Amount:</span> ₹{payment.amount}
                          </div>
                          <div>
                            <span className="font-medium">Method:</span> {payment.paymentMethod}
                          </div>
                          <div>
                            <span className="font-medium">Date:</span> {new Date(payment.date || payment.timestamp).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Transaction ID:</span> {payment.transactionId || 'N/A'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Razorpay Payment Modal */}
      {showRazorpayModal && (
        <RazorpayPayment
          course={isTegaExamPayment ? null : courses.find(c => (c._id || c.id || c.courseId) === selectedCourse)}
          onPaymentSuccess={handleRazorpayPaymentSuccess}
          onClose={() => setShowRazorpayModal(false)}
          examPaymentData={isTegaExamPayment ? (examPaymentData || location.state) : null}
        />
      )}
    </UserDashboardLayout>
  )
}

export default PaymentPage