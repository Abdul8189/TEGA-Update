import { useState, useEffect } from 'react'
import { Clock, Calendar, BookOpen, Award, CheckCircle, AlertCircle, Play, Target, BookText, Timer, Trophy, Lock, CreditCard, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import UserDashboardLayout from '../components/UserDashboardLayout'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import toast from 'react-hot-toast'
import ExamTimingPopup from '../components/ExamTimingPopup'
import ExamTimer from '../components/ExamTimer'
import { calculateExamTiming, getPopupContent, shouldRedirectToInstructions } from '../utils/examTiming'

const ExamsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedExam, setSelectedExam] = useState(null)
  const [showSlotModal, setShowSlotModal] = useState(false)
  const [examPaymentAttempts, setExamPaymentAttempts] = useState({})
  const [tegaExamPaymentStatus, setTegaExamPaymentStatus] = useState(null)
  
  // Timing system state
  const [showTimingPopup, setShowTimingPopup] = useState(false)
  const [timingPopupContent, setTimingPopupContent] = useState(null)
  const [examTimingInfo, setExamTimingInfo] = useState(null)
  const [examRegistrations, setExamRegistrations] = useState({})

  const examCategories = [
    { id: 'all', name: 'All Exams' },
    { id: 'programming', name: 'Programming' },
    { id: 'web', name: 'Web Development' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'cyber', name: 'Cyber Security' },
    { id: 'office', name: 'Microsoft Office' }
  ]

  // Helper function to convert UTC to IST
  const convertUTCToIST = (utcDate) => {
    const istDate = new Date(utcDate.getTime() + (5.5 * 60 * 60 * 1000)); // UTC + 5:30 hours
    return istDate;
  };

  // Helper function to check if exam is completed
  const isExamCompleted = (exam) => {
    try {
      const currentTime = new Date()
      let examDate = new Date(exam.examDate)
      
      // Convert UTC exam date to IST for comparison
      examDate = convertUTCToIST(examDate);
      
      // Handle different date formats
      if (isNaN(examDate.getTime())) {
        // Try parsing as ISO string
        examDate = new Date(exam.examDate + 'T00:00:00.000Z')
        examDate = convertUTCToIST(examDate);
        if (isNaN(examDate.getTime())) {
          // Try parsing as local date
          examDate = new Date(exam.examDate + 'T00:00:00')
          examDate = convertUTCToIST(examDate);
        }
      }
      
      console.log(`\n🔍 Checking completion for: ${exam.title}`);
      console.log(`  - Raw examDate: ${exam.examDate}`);
      console.log(`  - Parsed examDate: ${examDate.toISOString()}`);
      console.log(`  - Current time: ${currentTime.toISOString()}`);
      console.log(`  - Duration: ${exam.duration} minutes`);
      
      // Check if examDate is valid
      if (isNaN(examDate.getTime())) {
        console.warn(`  ❌ Invalid exam date for exam: ${exam.title}`, exam.examDate)
        console.log(`  ⚠️ Showing exam anyway due to invalid date parsing`);
        return false // Show the exam if we can't parse the date
      }
      
      // Calculate exam end time based on actual slot times, not just exam date + duration
      let examEndTime = null;
      
      if (exam.slots && exam.slots.length > 0) {
        // Find the latest slot end time
        for (const slot of exam.slots) {
          if (slot.isActive && slot.endTime) {
            // Ensure examDate is a Date object
            const examDateObj = new Date(exam.examDate);
            const examDateStr = examDateObj.toISOString().split('T')[0];
            const slotEndTime = new Date(`${examDateStr}T${slot.endTime}:00`);
            const slotEndTimeWithDuration = new Date(slotEndTime.getTime() + (exam.duration * 60 * 1000));
            
            if (!examEndTime || slotEndTimeWithDuration > examEndTime) {
              examEndTime = slotEndTimeWithDuration;
            }
          }
        }
      }
      
      // Fallback to simple calculation if no slots
      if (!examEndTime) {
        examEndTime = new Date(examDate.getTime() + (exam.duration * 60 * 1000));
      }
      
      const isCompleted = currentTime > examEndTime
      
      // Additional check: if exam is scheduled for today, be more lenient
      const today = new Date()
      const examDay = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate())
      const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const isToday = examDay.getTime() === todayDay.getTime()
      
      console.log(`  - Is today: ${isToday}`);
      console.log(`  - Exam day: ${examDay.toISOString()}`);
      console.log(`  - Today day: ${todayDay.toISOString()}`);
      
      // If exam is today, check if it has actually started
      if (isToday) {
        // For today's exams, we need to check if the exam has actually started
        // Since exam dates are stored as midnight, we need to check the actual slot times
        if (exam.slots && exam.slots.length > 0) {
          // Check if any slot has started
          const hasStartedSlot = exam.slots.some(slot => {
            if (!slot.isActive || !slot.startTime) return false;
            
            // Ensure examDate is a Date object
            const examDateObj = new Date(exam.examDate);
            const examDateStr = examDateObj.toISOString().split('T')[0];
            const slotStartTime = new Date(`${examDateStr}T${slot.startTime}:00`);
            const slotStartTimeIST = convertUTCToIST(slotStartTime);
            
            console.log(`  - Slot ${slot.slotId} start time: ${slotStartTimeIST.toISOString()}`);
            console.log(`  - Current time: ${convertUTCToIST(currentTime).toISOString()}`);
            console.log(`  - Has slot started: ${convertUTCToIST(currentTime) >= slotStartTimeIST}`);
            
            return convertUTCToIST(currentTime) >= slotStartTimeIST;
          });
          
          if (!hasStartedSlot) {
            console.log(`  ✅ Exam is today but hasn't started yet - showing`);
            return false; // Not completed
          }
        } else {
          // No slots, use the simple logic
          if (!isCompleted) {
            console.log(`  ✅ Exam is today and not completed - showing`);
            return false; // Not completed
          }
        }
      }
      
      // If exam is scheduled for tomorrow or later, show it
      if (examDay > todayDay) {
        console.log(`  ✅ Exam is scheduled for future - showing`);
        return false; // Not completed
      }
      
      console.log(`  - Exam end time: ${examEndTime.toISOString()}`);
      console.log(`  - Is completed: ${isCompleted}`);
      console.log(`  - Time difference: ${currentTime.getTime() - examEndTime.getTime()} ms`);
      
      if (isCompleted) {
        console.log(`  ❌ Exam "${exam.title}" is completed`);
      } else {
        console.log(`  ✅ Exam "${exam.title}" is not completed`);
      }
      
      return isCompleted
    } catch (error) {
      console.error(`Error checking exam completion for ${exam.title}:`, error)
      return false
    }
  }

  // Helper functions
  const canAccessExam = (examType) => {
    // For now, allow access to all exams if user has exam access
    return hasAccess('exams')
  }

  const getCoursePrice = (courseType) => {
    // Default prices for different course types
    const prices = {
      'tega-main-exam': 1999,
      'programming': 499,
      'web': 399,
      'ai': 599,
      'cloud': 699,
      'cyber': 799,
      'office': 299
    }
    return prices[courseType] || 499
  }

  useEffect(() => {
    fetchAvailableExams()
    
    // Auto-refresh every 30 seconds to catch newly created exams
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing exams...')
      fetchAvailableExams()
    }, 30000) // 30 seconds
    
    // Refresh when user comes back to the tab (in case they created an exam in another tab)
    const handleFocus = () => {
      console.log('🔄 Tab focused, refreshing exams...')
      fetchAvailableExams()
    }
    
    window.addEventListener('focus', handleFocus)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  const fetchAvailableExams = async () => {
    try {
      setLoading(true)
      const response = await api(`/api/exams/available/${user._id}`)
      if (response.success) {
        console.log('🔍 Fetched exams:', response.exams.length)
        console.log('🔍 Exam details:', response.exams.map(exam => ({
          title: exam.title,
          examDate: exam.examDate,
          duration: exam.duration,
          isActive: exam.isActive,
          availableSlots: exam.availableSlots?.length || 0,
          isCompleted: isExamCompleted(exam),
          slots: exam.slots?.length || 0,
          courseName: exam.courseId?.courseName || 'No course'
        })))
        
        // Additional debugging for each exam
        response.exams.forEach((exam, index) => {
          console.log(`\n🔍 Exam ${index + 1}: ${exam.title}`);
          console.log(`  - Raw examDate: ${exam.examDate}`);
          console.log(`  - Parsed examDate: ${new Date(exam.examDate)}`);
          console.log(`  - Duration: ${exam.duration} minutes`);
          console.log(`  - isActive: ${exam.isActive}`);
          console.log(`  - availableSlots: ${exam.availableSlots?.length || 0}`);
          console.log(`  - total slots: ${exam.slots?.length || 0}`);
          if (exam.slots && exam.slots.length > 0) {
            exam.slots.forEach((slot, slotIndex) => {
              console.log(`    Slot ${slotIndex + 1}: ${slot.slotId} - Active: ${slot.isActive} - Max: ${slot.maxParticipants}`);
            });
          }
        });
        
        setExams(response.exams)
        
        // Fetch detailed payment attempts for each exam
        await fetchExamPaymentAttempts(response.exams);
        
        // Check TEGA exam payment status
        await checkTegaExamPayments(response.exams);
        
        // Fetch exam registrations for timing system
        await fetchExamRegistrations(response.exams);
        
        // Show success message if this was a manual refresh
        if (response.exams.length > 0) {
          console.log(`✅ Successfully loaded ${response.exams.length} exams`)
          
          // Debug: Show raw exam data
          console.log('\n🔍 Raw exam data from API:');
          response.exams.forEach((exam, index) => {
            console.log(`\nExam ${index + 1}:`, {
              title: exam.title,
              examDate: exam.examDate,
              duration: exam.duration,
              isActive: exam.isActive,
              availableSlots: exam.availableSlots,
              slots: exam.slots,
              courseId: exam.courseId,
              examPaymentAttempts: exam.examPaymentAttempts
            });
          });
        }
      }
    } catch (error) {
      console.error('Error fetching exams:', error)
      toast.error('Failed to fetch available exams')
    } finally {
      setLoading(false)
    }
  }

  const fetchExamPaymentAttempts = async (examsList) => {
    try {
      const attemptsPromises = examsList.map(async (exam) => {
        try {
          const response = await api(`/api/exams/${exam._id}/payment-attempts`);
          if (response.success) {
            return { examId: exam._id, attempts: response.data };
          }
        } catch (error) {
          console.error(`Error fetching payment attempts for exam ${exam._id}:`, error);
        }
        return { examId: exam._id, attempts: [] };
      });

      const attemptsResults = await Promise.all(attemptsPromises);
      const attemptsMap = {};
      attemptsResults.forEach(({ examId, attempts }) => {
        attemptsMap[examId] = attempts;
      });
      
      setExamPaymentAttempts(attemptsMap);
      console.log('🔍 Exam payment attempts loaded:', attemptsMap);
    } catch (error) {
      console.error('❌ Error fetching exam payment attempts:', error);
    }
  };

  // Check TEGA exam payment status for all TEGA exams
  const checkTegaExamPayments = async (examsList) => {
    try {
      console.log('🔍 Checking TEGA exam payment status...');
      
      // Find TEGA exams
      const tegaExams = examsList.filter(exam => 
        exam.isTegaExam || (exam.title.toLowerCase().includes('tega') && exam.title.toLowerCase().includes('main'))
      );
      
      if (tegaExams.length === 0) {
        console.log('🔍 No TEGA exams found');
        return;
      }
      
      // Check payment status for each TEGA exam
      const paymentChecks = tegaExams.map(async (exam) => {
        try {
          const response = await api('/api/payments/check-tega-exam-payment');
          if (response.success) {
            return { examId: exam._id, hasPaid: response.hasPaidForTegaExam };
          }
        } catch (error) {
          console.error(`Error checking TEGA exam payment for ${exam._id}:`, error);
        }
        return { examId: exam._id, hasPaid: false };
      });
      
      const paymentResults = await Promise.all(paymentChecks);
      console.log('🔍 TEGA exam payment results:', paymentResults);
      
      // Set TEGA exam payment status for the first TEGA exam (main exam)
      if (paymentResults.length > 0) {
        setTegaExamPaymentStatus(paymentResults[0].hasPaid);
      }
      
      // Update exams with payment status
      setExams(prevExams => 
        prevExams.map(exam => {
          const paymentResult = paymentResults.find(result => result.examId === exam._id);
          if (paymentResult) {
            return { ...exam, hasPaidForTegaExam: paymentResult.hasPaid };
          }
          return exam;
        })
      );
      
    } catch (error) {
      console.error('❌ Error checking TEGA exam payments:', error);
    }
  };

  // Fetch exam registrations for timing system
  const fetchExamRegistrations = async (examsList) => {
    try {
      console.log('🔍 Fetching exam registrations for timing system...');
      
      const registrationPromises = examsList.map(async (exam) => {
        try {
          const response = await api(`/api/exams/${exam._id}/registrations`);
          if (response.success && response.registrations) {
            // Find user's registration
            const userRegistration = response.registrations.find(reg => 
              reg.studentId._id === user._id || reg.studentId === user._id
            );
            return { examId: exam._id, registration: userRegistration };
          }
        } catch (error) {
          console.error(`Error fetching registrations for exam ${exam._id}:`, error);
        }
        return { examId: exam._id, registration: null };
      });

      const registrationResults = await Promise.all(registrationPromises);
      const registrationsMap = {};
      registrationResults.forEach(({ examId, registration }) => {
        if (registration) {
          registrationsMap[examId] = registration;
        }
      });
      
      setExamRegistrations(registrationsMap);
      console.log('🔍 Exam registrations loaded:', registrationsMap);
      
      // Check timing for each registered exam
      checkExamTiming(examsList, registrationsMap);
      
    } catch (error) {
      console.error('❌ Error fetching exam registrations:', error);
    }
  };

  // Check exam timing and show appropriate popups
  const checkExamTiming = (examsList, registrationsMap) => {
    console.log('🔍 Checking exam timing...');
    
    examsList.forEach(exam => {
      const registration = registrationsMap[exam._id];
      if (registration) {
        const timingInfo = calculateExamTiming(exam, registration);
        console.log(`🔍 Timing for ${exam.title}:`, timingInfo);
        
        // Show popup if needed
        if (timingInfo.showPopup) {
          const popupContent = getPopupContent(timingInfo, exam);
          if (popupContent) {
            setTimingPopupContent(popupContent);
            setExamTimingInfo(timingInfo);
            setShowTimingPopup(true);
          }
        }
        
        // Check if should redirect to instructions
        if (shouldRedirectToInstructions(timingInfo)) {
          console.log(`🎯 Redirecting to instructions for ${exam.title}`);
          navigate(`/exam/${exam._id}/instructions`);
        }
      }
    });
  };

  // Handle exam start with timing check
  const handleExamStartWithTiming = (exam) => {
    const registration = examRegistrations[exam._id];
    if (registration) {
      const timingInfo = calculateExamTiming(exam, registration);
      
      if (timingInfo.canStart) {
        // Can start exam - go to instructions
        navigate(`/exam/${exam._id}/instructions`);
      } else {
        // Show timing popup
        const popupContent = getPopupContent(timingInfo, exam);
        if (popupContent) {
          setTimingPopupContent(popupContent);
          setExamTimingInfo(timingInfo);
          setShowTimingPopup(true);
        }
      }
    } else {
      // No registration - use existing logic
      handleStartExam(exam);
    }
  };

  // Show timing message for already registered exam
  const showTimingMessageForExam = (exam) => {
    // Simple toast message - the timer will be shown in the exam card
    toast.success('You are already registered for this exam. Check the timer below for exam timing.', {
      duration: 3000,
      position: 'top-center'
    });
  };

  // Helper function to get exam payment status
  const getExamPaymentStatus = (exam) => {
    const attempts = examPaymentAttempts[exam._id] || [];
    const completedAttempts = attempts.filter(attempt => attempt.status === 'exam_completed');
    const availableAttempts = attempts.filter(attempt => attempt.status === 'paid' && !attempt.isUsed);
    
    // For TEGA exams, also check if user has paid for the exam directly
    let hasTegaExamPayment = false;
    if (exam.isTegaExam || (exam.title.toLowerCase().includes('tega') && exam.title.toLowerCase().includes('main'))) {
      // Check if user has paid for TEGA exam (this will be set by the payment check)
      hasTegaExamPayment = exam.hasPaidForTegaExam || false;
    }
    
    return {
      hasPaidAttempts: attempts.length > 0 || hasTegaExamPayment,
      totalAttempts: attempts.length,
      completedAttempts: completedAttempts.length,
      availableAttempts: availableAttempts.length + (hasTegaExamPayment ? 1 : 0),
      latestAttempt: attempts.length > 0 ? attempts[attempts.length - 1] : null,
      nextAttemptNumber: attempts.length + 1,
      hasTegaExamPayment: hasTegaExamPayment
    };
  };

  // Helper function to check if user can retake exam
  const canRetakeExam = (exam) => {
    const paymentStatus = getExamPaymentStatus(exam);
    return paymentStatus.availableAttempts > 0 || !exam.requiresPayment;
  };

  // Helper function to get retake message
  const getRetakeMessage = (exam) => {
    const paymentStatus = getExamPaymentStatus(exam);
    if (paymentStatus.completedAttempts > 0 && paymentStatus.availableAttempts === 0) {
      return `You have already taken this exam ${paymentStatus.completedAttempts} time(s). Pay again to retake.`;
    }
    return null;
  };

  // Debug mode: temporarily show all exams to test filtering
  const DEBUG_MODE = false; // Set to false to enable normal filtering
  
  const filteredExams = (selectedCategory === 'all' 
    ? exams 
    : exams.filter(exam => exam.courseId?.courseName?.toLowerCase().includes(selectedCategory))
  ).filter(exam => {
    // Debug mode: show all exams
    if (DEBUG_MODE) {
      console.log(`🔍 DEBUG MODE: Showing exam ${exam.title} without filtering`);
      return true;
    }
    console.log(`\n🔍 Frontend filtering exam: ${exam.title}`);
    console.log(`  - isActive: ${exam.isActive}`);
    console.log(`  - availableSlots: ${exam.availableSlots?.length || 0}`);
    console.log(`  - examDate: ${exam.examDate}`);
    console.log(`  - duration: ${exam.duration}`);
    
    // Filter out TEGA Exam from regular exam cards (it has its own section)
    if (exam.isTegaExam || (exam.title.toLowerCase().includes('tega') && exam.title.toLowerCase().includes('main'))) {
      console.log(`  ❌ FILTERED: TEGA Exam (has separate section)`);
      return false;
    }
    
    // Check if exam has required fields
    if (!exam.examDate || !exam.duration) {
      console.log(`  ❌ FILTERED: Missing required fields (examDate: ${exam.examDate}, duration: ${exam.duration})`);
      return false
    }
    
    // Filter out exams that are not active
    if (!exam.isActive) {
      console.log(`  ❌ FILTERED: Inactive exam`);
      return false
    }
    
    // Filter out exams with no available slots
    if (!exam.availableSlots || exam.availableSlots.length === 0) {
      console.log(`  ❌ FILTERED: No available slots`);
      return false
    }
    
    // Check if exam is completed
    const isCompleted = isExamCompleted(exam);
    console.log(`  - isCompleted: ${isCompleted}`);
    if (isCompleted) {
      console.log(`  ❌ FILTERED: Completed exam`);
      return false
    }
    
    console.log(`  ✅ PASSED: Exam will be shown`);
    return true
  })

  // Debug: Log filtered results
  console.log(`🔍 Final filtered exams: ${filteredExams.length} out of ${exams.length} total exams`)
  
  // Debug: If no exams are showing, show all exams for debugging
  if (filteredExams.length === 0 && exams.length > 0) {
    console.log('⚠️ No exams passed filtering! Showing all exams for debugging...');
    console.log('All exams:', exams.map(exam => ({
      title: exam.title,
      isActive: exam.isActive,
      availableSlots: exam.availableSlots?.length || 0,
      examDate: exam.examDate,
      duration: exam.duration
    })));
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status, score) => {
    if (status === 'completed') {
      return score >= 70 ? (
        <CheckCircle className="w-5 h-5 text-green-600" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-600" />
      )
    }
    return <Play className="w-5 h-5 text-blue-600" />
  }

  const getStatusText = (status, score) => {
    if (status === 'completed') {
      return score >= 70 ? 'Passed' : 'Failed'
    }
    return 'Available'
  }

  const getStatusColor = (status, score) => {
    if (status === 'completed') {
      return score >= 70 ? 'text-green-600' : 'text-red-600'
    }
    return 'text-blue-600'
  }

  // Helper function to get exam time status
  const getExamTimeStatus = (exam) => {
    const currentTime = new Date()
    let examDate = new Date(exam.examDate)
    
    // Convert UTC exam date to IST
    examDate = convertUTCToIST(examDate);
    
    // Calculate exam end time based on actual slot times
    let examEndTime = null;
    
    if (exam.slots && exam.slots.length > 0) {
      // Find the latest slot end time
      for (const slot of exam.slots) {
        if (slot.isActive && slot.endTime) {
          // Ensure examDate is a Date object
          const examDateObj = new Date(exam.examDate);
          const examDateStr = examDateObj.toISOString().split('T')[0];
          const slotEndTime = new Date(`${examDateStr}T${slot.endTime}:00`);
          const slotEndTimeWithDuration = new Date(slotEndTime.getTime() + (exam.duration * 60 * 1000));
          
          if (!examEndTime || slotEndTimeWithDuration > examEndTime) {
            examEndTime = slotEndTimeWithDuration;
          }
        }
      }
    }
    
    // Fallback to simple calculation if no slots
    if (!examEndTime) {
      examEndTime = new Date(examDate.getTime() + (exam.duration * 60 * 1000));
    }
    
    // Check if exam is completed
    if (isExamCompleted(exam)) {
      return { status: 'completed', message: 'Exam completed', color: 'text-gray-600' }
    }
    
    // Check if exam has any available slots
    if (!exam.availableSlots || exam.availableSlots.length === 0) {
      return { status: 'expired', message: 'No slots available', color: 'text-red-600' }
    }

    // Calculate time difference from actual slot start time
    let examStartTime = examDate; // Default to exam date
    
    if (exam.slots && exam.slots.length > 0) {
      // Find the earliest slot start time
      const earliestSlot = exam.slots.reduce((earliest, slot) => {
        if (!slot.isActive || !slot.startTime) return earliest;
        if (!earliest || slot.startTime < earliest.startTime) {
          return slot;
        }
        return earliest;
      }, null);
      
      if (earliestSlot) {
        // Ensure examDate is a Date object
        const examDateObj = new Date(exam.examDate);
        const examDateStr = examDateObj.toISOString().split('T')[0];
        examStartTime = new Date(`${examDateStr}T${earliestSlot.startTime}:00`);
        examStartTime = convertUTCToIST(examStartTime);
      }
    }
    
    const timeDiff = examStartTime.getTime() - currentTime.getTime()
    const minutes = Math.ceil(timeDiff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (currentTime < examStartTime) {
      // Exam hasn't started yet
      if (days > 0) {
        return { 
          status: 'upcoming', 
          message: `Starts in ${days} day${days > 1 ? 's' : ''}`, 
          color: 'text-yellow-600' 
        }
      } else if (hours > 0) {
        return { 
          status: 'upcoming', 
          message: `Starts in ${hours} hour${hours > 1 ? 's' : ''}`, 
          color: 'text-yellow-600' 
        }
      } else {
        return { 
          status: 'upcoming', 
          message: `Starts in ${minutes} minute${minutes > 1 ? 's' : ''}`, 
          color: 'text-yellow-600' 
        }
      }
    } else if (currentTime <= examEndTime) {
      // Exam is ongoing
      const remainingTime = examEndTime.getTime() - currentTime.getTime()
      const remainingMinutes = Math.ceil(remainingTime / (1000 * 60))
      const remainingHours = Math.floor(remainingMinutes / 60)
      
      if (remainingHours > 0) {
        return { 
          status: 'active', 
          message: `${remainingHours} hour${remainingHours > 1 ? 's' : ''} left`, 
          color: 'text-green-600' 
        }
      } else {
        return { 
          status: 'active', 
          message: `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''} left`, 
          color: 'text-green-600' 
        }
      }
    } else {
      // Exam has ended
      return { 
        status: 'expired', 
        message: 'Exam ended', 
        color: 'text-red-600' 
      }
    }
  }

  const handleStartExam = async (exam) => {
    // First check exam access (payment deadline and retake status)
    try {
      console.log('🔍 Checking exam access for:', exam.title);
      const accessResponse = await api(`/api/exams/${exam._id}/check-access`);
      
      if (accessResponse.success) {
        const { canAccess, reason, requiresPayment, isRetake, paymentDeadline } = accessResponse.data;
        
        if (!canAccess) {
          // Show appropriate error message based on reason
          if (paymentDeadline && new Date() > new Date(paymentDeadline)) {
            toast.error('Payment deadline has passed. Payment must be completed before the exam start time.', {
              duration: 6000,
              position: 'top-center',
              style: {
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '16px',
                fontWeight: '500',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
            });
          } else if (isRetake) {
            toast.error('You have already taken this exam. You need to pay again to retake it.', {
              duration: 5000,
              position: 'top-center',
              style: {
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '16px',
                fontWeight: '500',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
            });
          } else {
            toast.error(reason, {
              duration: 5000,
              position: 'top-center',
              style: {
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '16px',
                fontWeight: '500',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
            });
          }
          return;
        }
      }
    } catch (error) {
      console.error('Error checking exam access:', error);
      // Continue with existing logic if access check fails
    }

    // Get payment status for this exam
    const paymentStatus = getExamPaymentStatus(exam);
    
    // Check if exam requires payment and user hasn't paid
    if (exam.requiresPayment && !exam.isFreeForUser && exam.effectivePrice > 0) {
      // Check if user has available payment attempts
      if (paymentStatus.availableAttempts === 0 && !paymentStatus.hasTegaExamPayment) {
        // Determine what type of payment is required
        let paymentMessage = `Payment required to access this exam. Please pay ₹${exam.effectivePrice} to continue.`;
        let paymentType = 'exam';
        let paymentAmount = exam.effectivePrice;
        
        // Check if this is a course-based exam
        if (exam.courseId && exam.courseId.toString() !== 'null') {
          // Course-based exam - check if user already wrote the exam
          if (paymentStatus.completedAttempts > 0) {
            // User already wrote the exam - show retake message
            paymentMessage = `You had already written the exam. If you want to rewrite, need to pay again for this course.`;
            paymentType = 'course';
            paymentAmount = exam.effectivePrice;
          } else {
            // User hasn't paid for the course - show course payment message
            paymentMessage = `You can't register for exam because you didn't pay for the course.`;
            paymentType = 'course';
            paymentAmount = exam.effectivePrice;
          }
        } else {
          // Tega/Standalone exam
          const retakeMessage = getRetakeMessage(exam);
          paymentMessage = retakeMessage || `Payment required to access this exam.`;
          paymentType = 'exam';
          paymentAmount = exam.effectivePrice;
        }
        
        toast.error(paymentMessage, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '20px',
            fontSize: '16px',
            fontWeight: '500',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            margin: '0 auto'
          }
        });
        
        // Navigate to payment page with appropriate data
        navigate('/payment', { 
          state: { 
            type: paymentType,
            examId: exam._id,
            courseId: exam.courseId,
            amount: paymentAmount,
            examTitle: exam.title,
            attemptNumber: paymentStatus.nextAttemptNumber,
            isRetake: paymentStatus.completedAttempts > 0
          }
        });
        return;
      }
    }

    if (exam.isRegistered) {
      if (exam.registration.paymentStatus !== 'paid') {
        if (exam.isTegaExam || exam.courseId === 'tega-exam' || !exam.courseId) {
          // TEGA Exam payment
          toast.error('Please complete TEGA Exam payment to access this exam!')
          navigate('/payment', { state: { type: 'tega-exam', examId: exam._id, amount: exam.price } })
        } else {
          // Regular course payment
          toast.error('Please complete payment to access this exam!')
          navigate('/payment')
        }
        return
      }
      
      // Navigate to exam with error handling
      try {
        const response = await api(`/api/exams/${exam._id}/start`, { method: 'GET' })
        if (response.success) {
          navigate(`/exam/${exam._id}`)
        } else {
          toast.error(response.message || 'Failed to start exam')
        }
      } catch (error) {
        console.error('Error starting exam:', error)
        toast.error(error.message || 'Failed to start exam')
      }
      return
    }

    // Show slot selection modal for free exams or exams with available payment attempts
    setSelectedExam(exam)
    setShowSlotModal(true)
  }

  const handleSlotSelection = async (exam, slot) => {
    try {
      const response = await api(`/api/exams/${exam._id}/register`, {
        method: 'POST',
        body: { slotId: slot.slotId }
      })

      if (response.success) {
        if (response.requiresPayment) {
          toast.success('Registration successful! Please complete payment.')
          navigate('/payment')
        } else {
          const message = response.isFreeForUser 
            ? 'Registration successful! You have free access to this exam.'
            : 'Registration successful! You can now take the exam.'
          toast.success(message)
          navigate(`/exam/${exam._id}`)
        }
        setShowSlotModal(false)
        fetchAvailableExams() // Refresh exams list
      } else {
        // Handle payment required error
        if (response.requiresPayment) {
          let paymentMessage = response.message || 'Payment required to register for this exam. Please complete payment first.';
          
          // Check if this is a course-based exam and customize the message
          if (response.paymentType === 'course') {
            const paymentStatus = getExamPaymentStatus(exam);
            if (paymentStatus.completedAttempts > 0) {
              // User already wrote the exam - show retake message
              paymentMessage = `You had already written the exam. If you want to rewrite, need to pay again for this course.`;
            } else {
              // User hasn't paid for the course - show course payment message
              paymentMessage = `You can't register for exam because you didn't pay for the course.`;
            }
          }
          
          toast.error(paymentMessage, {
            duration: 5000,
            position: 'top-center',
            style: {
              background: '#fee2e2',
              color: '#dc2626',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '20px',
              fontSize: '16px',
              fontWeight: '500',
              maxWidth: '500px',
              textAlign: 'center',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              margin: '0 auto'
            }
          });
          
          // Navigate to payment page with appropriate data
          if (response.paymentType === 'course') {
            // Course payment required
            navigate('/payment', { 
              state: { 
                type: 'course',
                courseId: response.courseId,
                amount: response.price,
                courseName: response.courseName || 'Course'
              }
            });
          } else {
            // Exam payment required
            navigate('/payment', { 
              state: { 
                type: (exam.isTegaExam || exam.courseId === 'tega-exam' || !exam.courseId) ? 'tega-exam' : 'course',
                examId: exam._id,
                amount: response.price || exam.effectivePrice || exam.price,
                examTitle: exam.title,
                attemptNumber: getExamPaymentStatus(exam).nextAttemptNumber
              }
            });
          }
        } else {
          // Handle already registered error from response
          if (response.message && response.message.includes('already registered')) {
            // Show timing message instead of toast
            showTimingMessageForExam(exam);
          } else {
            toast.error(response.message || 'Failed to register for exam')
          }
        }
        setShowSlotModal(false)
      }
    } catch (error) {
      console.error('Error registering for exam:', error)
      
      // Handle already registered error
      if (error.message && error.message.includes('already registered')) {
        // Show timing message instead of toast
        showTimingMessageForExam(exam);
        setShowSlotModal(false);
        return;
      }
      
      // Handle payment required error from catch block
      if (error.message && (error.message.includes('Payment required') || error.message.includes('must purchase'))) {
        let paymentMessage = error.message || 'Payment required to register for this exam. Please complete payment first.';
        
        // Check if this is a course-based exam and customize the message
        if (exam.courseId && exam.courseId.toString() !== 'null') {
          const paymentStatus = getExamPaymentStatus(exam);
          if (paymentStatus.completedAttempts > 0) {
            // User already wrote the exam - show retake message
            paymentMessage = `You had already written the exam. If you want to rewrite, need to pay again for this course.`;
          } else {
            // User hasn't paid for the course - show course payment message
            paymentMessage = `You can't register for exam because you didn't pay for the course.`;
          }
        }
        
        toast.error(paymentMessage, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '20px',
            fontSize: '16px',
            fontWeight: '500',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            margin: '0 auto'
          }
        });
        
        // Navigate to payment page with exam data
        navigate('/payment', { 
          state: { 
            type: (exam.courseId === 'tega-exam' || !exam.courseId) ? 'tega-exam' : 'course',
            examId: exam._id,
            amount: exam.effectivePrice || exam.price,
            examTitle: exam.title,
            attemptNumber: getExamPaymentStatus(exam).nextAttemptNumber
          }
        });
      } else {
        toast.error('Failed to register for exam')
      }
      setShowSlotModal(false)
    }
  }

  const handleTegaExamStart = async () => {
    // Find TEGA Exam
    const tegaExam = exams.find(exam => 
      exam.isTegaExam || (exam.title.toLowerCase().includes('tega') && exam.title.toLowerCase().includes('main'))
    )

    if (!tegaExam) {
      toast.error('TEGA Main Exam not found')
      return
    }

    // Check if this specific TEGA exam has been paid for
    const hasPaidForThisTegaExam = tegaExam.hasPaidForTegaExam || false;

    console.log('🔍 Starting TEGA exam check for:', tegaExam.title);

    // Use the exam-specific payment status
    console.log('🔍 TEGA exam payment status for this exam:', hasPaidForThisTegaExam);
    
    if (hasPaidForThisTegaExam) {
      // User has paid - show slot selection (instruction page)
      console.log('✅ User has paid for TEGA exam - showing slot selection');
      setSelectedExam(tegaExam);
      setShowSlotModal(true);
      return;
    } else {
      // User hasn't paid - redirect to payment
      console.log('❌ User hasn\'t paid for TEGA exam - redirecting to payment');
      navigate('/payment', { 
        state: { 
          type: 'tega-exam',
          examId: tegaExam._id,
          amount: tegaExam.price || 1999,
          examTitle: tegaExam.title,
          attemptNumber: 1,
          isRetake: false
        }
      });
      return;
    }

    // First check exam access (payment deadline and retake status)
    try {
      console.log('🔍 Checking TEGA exam access for:', tegaExam.title);
      const accessResponse = await api(`/api/exams/${tegaExam._id}/check-access`);
      
      if (accessResponse.success) {
        const { canAccess, reason, requiresPayment, isRetake, paymentDeadline } = accessResponse.data;
        
        if (!canAccess) {
          // Show appropriate error message based on reason
          if (paymentDeadline && new Date() > new Date(paymentDeadline)) {
            toast.error('Payment deadline has passed. Payment must be completed before the exam start time.', {
              duration: 6000,
              position: 'top-center',
              style: {
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '16px',
                fontWeight: '500',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
            });
          } else if (isRetake) {
            toast.error('You have already taken this exam. You need to pay again to retake it.', {
              duration: 5000,
              position: 'top-center',
              style: {
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '16px',
                fontWeight: '500',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
            });
          } else {
            toast.error(reason, {
              duration: 5000,
              position: 'top-center',
              style: {
                background: '#fee2e2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '16px',
                fontWeight: '500',
                maxWidth: '500px',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              },
            });
          }
          return;
        }
      }
    } catch (error) {
      console.error('Error checking TEGA exam access:', error);
      // Continue with existing logic if access check fails
    }

    // Check payment status for Tega Exam
    const paymentStatus = getExamPaymentStatus(tegaExam)
    
    console.log('🔍 Tega Exam payment status:', paymentStatus)
    
    // Check if user has paid for Tega Exam
    if (paymentStatus.availableAttempts === 0 && !paymentStatus.hasTegaExamPayment) {
      // User hasn't paid or has used all attempts
      if (paymentStatus.completedAttempts > 0) {
        // User already took the exam - show retake message
        const retakeMessage = `You have already taken this exam ${paymentStatus.completedAttempts} time(s). If you want to write exam again, you need to pay for this exam again.`
        
        toast.error(retakeMessage, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '20px',
            fontSize: '16px',
            fontWeight: '500',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            margin: '0 auto'
          }
        })
        
        // Navigate to payment page for retake
        navigate('/payment', { 
          state: { 
            type: 'tega-exam',
            examId: tegaExam._id,
            amount: tegaExam.price || 1999,
            examTitle: tegaExam.title,
            attemptNumber: paymentStatus.nextAttemptNumber,
            isRetake: true
          }
        })
      } else {
        // User hasn't paid for the exam - show payment message
        const paymentMessage = `You need to pay first to take this exam.`
        
        toast.error(paymentMessage, {
          duration: 5000,
          position: 'top-center',
          style: {
            background: '#fee2e2',
            color: '#dc2626',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '20px',
            fontSize: '16px',
            fontWeight: '500',
            maxWidth: '500px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
            margin: '0 auto'
          }
        })
        
        // Navigate to payment page
        navigate('/payment', { 
          state: { 
            type: 'tega-exam',
            examId: tegaExam._id,
            amount: tegaExam.price || 1999,
            examTitle: tegaExam.title,
            attemptNumber: paymentStatus.nextAttemptNumber,
            isRetake: false
          }
        })
      }
      return
    }

    // User has paid - show slot selection
    setSelectedExam(tegaExam)
    setShowSlotModal(true)
  }

  return (
    <UserDashboardLayout>
      
      {/* Main Content */}
      <div >
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Skill Assessment Exams
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Test your knowledge and earn certifications in various technical domains
              </p>
            </div>
          </div>
        </section>

        {/* TEGA Main Exam Section */}
        <section className="py-16 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-8 md:p-12">
                <div className="text-center text-white">
                  <div className="mb-6">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                      <Target className="inline-block w-8 h-8 mr-3" />
                      TEGA Main Exam
                    </h2>
                    <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full"></div>
                  </div>
                  
                  <div className="max-w-4xl mx-auto space-y-6">
                    <p className="text-lg md:text-xl text-purple-100 leading-relaxed">
                      Welcome to the comprehensive TEGA Main Exam - your gateway to demonstrating mastery across all core technical domains. This flagship assessment evaluates your proficiency in programming, web development, artificial intelligence, cloud computing, cybersecurity, and office productivity tools.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex justify-center mb-2">
                          <BookText className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Comprehensive Coverage</h3>
                        <p className="text-sm text-purple-100">Tests knowledge across 6 major technical domains with 200+ carefully crafted questions</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex justify-center mb-2">
                          <Timer className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Extended Duration</h3>
                        <p className="text-sm text-purple-100">3-hour comprehensive exam with adaptive difficulty based on your performance</p>
                      </div>
                      
                      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                        <div className="flex justify-center mb-2">
                          <Trophy className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="font-semibold mb-2">Premium Certification</h3>
                        <p className="text-sm text-purple-100">Earn the prestigious Tega Master Certification upon successful completion</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <button
                        onClick={handleTegaExamStart}
                        className={`font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center mx-auto ${
                          (() => {
                            const tegaExam = exams.find(exam => 
                              exam.isTegaExam || (exam.title.toLowerCase().includes('tega') && exam.title.toLowerCase().includes('main'))
                            );
                            return tegaExam?.hasPaidForTegaExam 
                              ? 'bg-gradient-to-r from-green-400 to-green-600 text-white hover:from-green-500 hover:to-green-700' 
                              : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600';
                          })()
                        }`}
                      >
                        {(() => {
                          const tegaExam = exams.find(exam => 
                            exam.isTegaExam || (exam.title.toLowerCase().includes('tega') && exam.title.toLowerCase().includes('main'))
                          );
                          return tegaExam?.hasPaidForTegaExam ? (
                            <>
                              <Play className="w-5 h-5 mr-2" />
                              Start TEGA Main Exam
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5 mr-2" />
                              Pay & Access TEGA Exam
                            </>
                          );
                        })()}
                      </button>
                      <p className="text-sm text-purple-200 mt-3">
                        Estimated time: 3 hours • 200 questions • Advanced difficulty
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center items-center">
              {examCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
              <button
                onClick={fetchAvailableExams}
                disabled={loading}
                className="px-4 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 bg-green-100 text-green-700 hover:bg-green-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-700"></div>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </section>

        {/* Exams Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No exams available</h3>
                <p className="text-gray-500">Check back later for new exam opportunities.</p>
              </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredExams.map((exam) => {
                  const isRegistered = exam.isRegistered
                  const isPaid = exam.registration?.paymentStatus === 'paid'
                  const availableSlots = exam.availableSlots?.length || 0
                  const timeStatus = getExamTimeStatus(exam)
                  const paymentStatus = getExamPaymentStatus(exam)
                  const retakeMessage = getRetakeMessage(exam)
                  const canRetake = canRetakeExam(exam)
                  
                  return (
                    <div
                      key={exam._id}
                      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group"
                    >
                      {/* Exam Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {exam.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {exam.requiresPayment && !exam.isFreeForUser && exam.effectivePrice > 0 && (
                              <div className="flex items-center text-yellow-600 text-xs">
                                <Lock className="w-3 h-3 mr-1" />
                                <span>PAYMENT REQUIRED</span>
                              </div>
                            )}
                            {exam.isFreeForUser && (
                              <div className="flex items-center text-green-600 text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                <span>FREE (Course Paid)</span>
                              </div>
                            )}
                            {paymentStatus.totalAttempts > 0 && (
                              <div className="flex items-center text-blue-600 text-xs">
                                <Target className="w-3 h-3 mr-1" />
                                <span>Attempt {paymentStatus.totalAttempts}</span>
                              </div>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isRegistered && isPaid
                                ? 'bg-green-100 text-green-800'
                                : isRegistered
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {isRegistered && isPaid ? 'Registered' : isRegistered ? 'Pending Payment' : 'Available'}
                            </span>
                          </div>
                        </div>
                        
                        <p className="text-gray-600 text-sm mb-4">
                          {exam.description}
                        </p>

                        {/* Payment Attempt Information */}
                        {paymentStatus.totalAttempts > 0 && (
                          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-blue-800 font-medium">
                                Payment Attempts: {paymentStatus.totalAttempts}
                              </span>
                              <span className="text-blue-600">
                                Completed: {paymentStatus.completedAttempts} | Available: {paymentStatus.availableAttempts}
                              </span>
                            </div>
                            {retakeMessage && (
                              <p className="text-orange-600 text-xs mt-2 font-medium">
                                {retakeMessage}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Exam Timer for Registered Exams */}
                        {isRegistered && examRegistrations[exam._id] && (
                          <ExamTimer 
                            exam={exam} 
                            registration={examRegistrations[exam._id]}
                            onStartExam={(exam) => navigate(`/exam/${exam._id}/instructions`)}
                          />
                        )}

                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {exam.subject}
                          </span>
                          {availableSlots > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {availableSlots} slots
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            timeStatus.status === 'active' ? 'bg-green-100 text-green-800' :
                            timeStatus.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                            timeStatus.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {timeStatus.message}
                          </span>
                        </div>
                      </div>

                      {/* Exam Details */}
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            {exam.duration} min
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 mr-2" />
                            {exam.questionPaperId?.totalQuestions || 0} Questions
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Award className="w-4 h-4 mr-2" />
                            {exam.passingMarks}/{exam.totalMarks} Pass
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            {convertUTCToIST(new Date(exam.examDate)).toLocaleDateString('en-IN', {
                              timeZone: 'Asia/Kolkata',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>

                        {/* Action Button */}
                        {timeStatus.status === 'expired' || timeStatus.status === 'completed' ? (
                          <div className="space-y-2">
                            <button 
                              disabled
                              className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
                            >
                              {timeStatus.status === 'completed' ? 'Exam Completed' : 'Exam Expired'}
                            </button>
                            {paymentStatus.completedAttempts > 0 && !canRetake && (
                              <Link
                                to="/payment"
                                state={{ 
                                  type: (exam.isTegaExam || exam.courseId === 'tega-exam' || !exam.courseId) ? 'tega-exam' : 'course',
                                  examId: exam._id,
                                  amount: exam.effectivePrice,
                                  examTitle: exam.title,
                                  isRetake: true,
                                  attemptNumber: paymentStatus.nextAttemptNumber
                                }}
                                className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center text-sm"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Retake Exam (Attempt {paymentStatus.nextAttemptNumber})
                              </Link>
                            )}
                          </div>
                        ) : canRetake && paymentStatus.availableAttempts > 0 ? (
                          <button 
                            onClick={() => handleExamStartWithTiming(exam)}
                            className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center ${
                              timeStatus.status === 'active' 
                                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800'
                                : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'
                            }`}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {timeStatus.status === 'active' ? 'Start Exam' : 'Join Exam'} (Attempt {paymentStatus.availableAttempts[0]?.attemptNumber || 1})
                          </button>
                        ) : isRegistered && isPaid ? (
                          <button 
                            onClick={() => handleExamStartWithTiming(exam)}
                            className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center ${
                              timeStatus.status === 'active' 
                                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800'
                                : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'
                            }`}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {timeStatus.status === 'active' ? 'Start Exam' : 'Join Exam'}
                          </button>
                        ) : exam.requiresPayment && !exam.isFreeForUser && exam.effectivePrice > 0 && paymentStatus.availableAttempts === 0 ? (
                          <Link
                            to="/payment"
                            state={{ 
                              type: (exam.isTegaExam || exam.courseId === 'tega-exam' || !exam.courseId) ? 'tega-exam' : 'course',
                              examId: exam._id,
                              amount: exam.effectivePrice,
                              examTitle: exam.title,
                              attemptNumber: paymentStatus.nextAttemptNumber,
                              isRetake: paymentStatus.completedAttempts > 0
                            }}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {exam.courseId && exam.courseId.toString() !== 'null' ? (
                              paymentStatus.completedAttempts > 0 ? (
                                `Pay ₹${exam.effectivePrice} to Rewrite Course`
                              ) : (
                                `Pay ₹${exam.effectivePrice} for Course Access`
                              )
                            ) : (
                              `Pay ₹${exam.effectivePrice} to Access ${paymentStatus.totalAttempts > 0 ? `(Attempt ${paymentStatus.nextAttemptNumber})` : ''}`
                            )}
                          </Link>
                        ) : availableSlots > 0 ? (
                          <button 
                            onClick={() => handleExamStartWithTiming(exam)}
                            className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center ${
                              timeStatus.status === 'active' 
                                ? 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800'
                                : timeStatus.status === 'upcoming'
                                ? 'bg-gradient-to-r from-yellow-500 to-orange-600 text-white hover:from-yellow-600 hover:to-orange-700'
                                : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'
                            }`}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {exam.isFreeForUser ? 'Register (Free)' : 'Register for Exam'}
                          </button>
                        ) : (
                          <button 
                            disabled
                            className="w-full bg-gray-300 text-gray-500 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
                          >
                            No Slots Available
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
            </div>
            )}
          </div>
        </section>

        {/* Slot Selection Modal */}
        {showSlotModal && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Select Exam Slot</h3>
              <p className="text-gray-600 mb-4">
                Choose a time slot for <strong>{selectedExam.title}</strong>
                <br />
                <span className="text-sm text-blue-600 font-medium">
                  Exam Date: {new Date(selectedExam.examDate).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </p>
              
              <div className="space-y-3 mb-6">
                {selectedExam.availableSlots?.map((slot) => (
                  <div key={slot.slotId} className="border border-gray-300 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                       onClick={() => handleSlotSelection(selectedExam, slot)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold">{slot.slotId}</h4>
                        <p className="text-sm text-gray-600">
                          {new Date(selectedExam.examDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })} | {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {slot.registeredStudents?.length || 0}/{slot.maxParticipants} registered
                        </p>
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Available
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSlotModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exam Timing Popup */}
        <ExamTimingPopup
          isOpen={showTimingPopup}
          onClose={() => setShowTimingPopup(false)}
          popupContent={timingPopupContent}
          timingInfo={examTimingInfo}
          onStartExam={(exam) => navigate(`/exam/${exam._id}/instructions`)}
          exam={selectedExam}
        />
      </div>
    </UserDashboardLayout>
  )
}

export default ExamsPage
