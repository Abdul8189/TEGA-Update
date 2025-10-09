import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import AlertModal from '../components/AlertModal';
import { 
  Clock, 
  Info, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Bookmark, 
  Circle,
  AlertCircle,
  Play,
  Square
} from 'lucide-react';

const ExamConductingPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Exam state
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedQuestions, setMarkedQuestions] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [courseId, setCourseId] = useState(null);
  
  // Wait timer state
  const [waitForStartTime, setWaitForStartTime] = useState(false);
  const [examStartTime, setExamStartTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [timeUntilStart, setTimeUntilStart] = useState(0);
  
  // Exam completion state
  const [examCompleted, setExamCompleted] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // UI state
  const [showInstructions, setShowInstructions] = useState(false);
  const [showQuestionPaper, setShowQuestionPaper] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Alert modal state
  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'warning'
  });
  
  const timerRef = useRef(null);
  const fullscreenTimerRef = useRef(null);
  const examStartTimeRef = useRef(null);
  const tabSwitchCountRef = useRef(0);
  const lastActivityRef = useRef(Date.now());

  // Helper function to show alert modal
  const showAlert = (title, message, type = 'warning') => {
    setAlertModal({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const closeAlert = () => {
    setAlertModal(prev => ({ ...prev, isOpen: false }));
  };

  // Security Functions
  const enterFullscreen = async () => {
    try {
      // Check if fullscreen is supported
      if (!document.fullscreenEnabled && 
          !document.webkitFullscreenEnabled && 
          !document.mozFullScreenEnabled && 
          !document.msFullscreenEnabled) {
        console.log('⚠️ Fullscreen not supported by browser');
        return;
      }

      const element = document.documentElement;
      if (element.requestFullscreen) {
        await element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        await element.webkitRequestFullscreen();
      } else if (element.msRequestFullscreen) {
        await element.msRequestFullscreen();
      } else if (element.mozRequestFullScreen) {
        await element.mozRequestFullScreen();
      }
      
      // Force fullscreen and prevent escape
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    } catch (error) {
      console.log('⚠️ Fullscreen permission denied or not supported:', error.message);
      // Don't show alert for permission errors, just log them
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && 
        !document.webkitFullscreenElement && 
        !document.mozFullScreenElement && 
        !document.msFullscreenElement && 
        examStarted) {
      // User exited fullscreen during exam - force back to fullscreen
      setTimeout(() => {
        enterFullscreen();
        showAlert('Fullscreen Warning', 'You cannot exit fullscreen during the exam!', 'warning');
      }, 100);
    }
  };

  const exitFullscreen = () => {
    try {
      // Check if we're actually in fullscreen before trying to exit
      if (document.fullscreenElement || 
          document.webkitFullscreenElement || 
          document.mozFullScreenElement || 
          document.msFullscreenElement) {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
        }
      }
    } catch (error) {
      console.log('⚠️ Could not exit fullscreen:', error.message);
      // Ignore fullscreen exit errors
    }
  };

  const saveExamState = () => {
    // Don't save state if exam is completed
    if (examCompleted) {
      return;
    }
    
    const examState = {
      examId,
      currentQuestionIndex,
      answers,
      markedQuestions: Array.from(markedQuestions),
      timeLeft,
      examStartTime: examStartTimeRef.current,
      lastActivity: Date.now(),
      examDuration: exam?.duration ? exam.duration * 60 : 0, // Store original duration in seconds
      examCompleted: false // Explicitly mark as not completed
    };
    localStorage.setItem(`examState_${examId}`, JSON.stringify(examState));
  };

  const loadExamState = () => {
    const savedState = localStorage.getItem(`examState_${examId}`);
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        
        // Calculate remaining time based on elapsed time
        let remainingTime = state.timeLeft || 0;
        if (state.examStartTime && state.examDuration) {
          const now = Date.now();
          const elapsed = Math.floor((now - state.examStartTime) / 1000);
          remainingTime = Math.max(0, state.examDuration - elapsed);
        }
        
        setCurrentQuestionIndex(state.currentQuestionIndex || 0);
        setAnswers(state.answers || {});
        setMarkedQuestions(new Set(state.markedQuestions || []));
        setTimeLeft(remainingTime);
        
        if (state.examStartTime) {
          examStartTimeRef.current = state.examStartTime;
        }
        
        // If time is up, clear the saved state and don't restore it
        if (remainingTime <= 0) {
          console.log('⏰ Exam time has expired - clearing saved state');
          localStorage.removeItem(`examState_${examId}`);
          return null;
        }
        
        // Don't restore state if the exam was already completed
        if (state.examCompleted) {
          console.log('⏰ Exam was already completed - clearing saved state');
          localStorage.removeItem(`examState_${examId}`);
          return null;
        }
        
        return state;
      } catch (error) {
        console.error('Error loading exam state:', error);
      }
    }
    return null;
  };

  const handleVisibilityChange = () => {
    if (document.hidden && examStarted) {
      tabSwitchCountRef.current++;
      lastActivityRef.current = Date.now();
      
      // Show warning after first few tab switches
      if (tabSwitchCountRef.current <= 3) {
        showAlert('Tab Switch Warning', `You have switched tabs ${tabSwitchCountRef.current} time(s). Please stay focused on the exam.`, 'warning');
      } else if (tabSwitchCountRef.current >= 5) {
        showAlert('Exam Terminated', 'You have switched tabs too many times. Your exam has been automatically submitted.', 'error');
        submitExam();
        return;
      }
    }
  };

  const handleWindowBlur = () => {
    if (examStarted) {
      tabSwitchCountRef.current++;
      lastActivityRef.current = Date.now();
      
      if (tabSwitchCountRef.current <= 3) {
        showAlert('Window Focus Warning', `You have lost focus ${tabSwitchCountRef.current} time(s). Please stay focused on the exam.`, 'warning');
      } else if (tabSwitchCountRef.current >= 5) {
        showAlert('Exam Terminated', 'You have lost focus too many times. Your exam has been automatically submitted.', 'error');
        submitExam();
        return;
      }
    }
  };

  const handleBeforeUnload = (e) => {
    if (examStarted) {
      saveExamState();
      const message = '⚠️ WARNING: You are about to leave the exam. Your progress will be saved, but the timer will continue running.';
      e.preventDefault();
      e.returnValue = message;
      return message;
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleKeyDown = (e) => {
    if (!examStarted) return;
    
    // Disable F5, Ctrl+R, Ctrl+Shift+R, Ctrl+F5
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r') || (e.ctrlKey && e.shiftKey && e.key === 'R')) {
      e.preventDefault();
      showAlert('Page Refresh Blocked', 'Page refresh is not allowed during the exam!', 'warning');
      return false;
    }
    
    // Disable ALL tab-related shortcuts
    if ((e.ctrlKey && e.key === 't') ||           // Ctrl+T (new tab)
        (e.ctrlKey && e.key === 'n') ||           // Ctrl+N (new window)
        (e.ctrlKey && e.shiftKey && e.key === 'T') || // Ctrl+Shift+T (reopen tab)
        (e.ctrlKey && e.key === 'w') ||           // Ctrl+W (close tab)
        (e.ctrlKey && e.shiftKey && e.key === 'W') || // Ctrl+Shift+W (close window)
        (e.ctrlKey && e.key === 'Tab') ||         // Ctrl+Tab (switch tabs)
        (e.ctrlKey && e.shiftKey && e.key === 'Tab') || // Ctrl+Shift+Tab (switch tabs)
        (e.altKey && e.key === 'Tab') ||          // Alt+Tab (switch apps)
        (e.altKey && e.shiftKey && e.key === 'Tab')) { // Alt+Shift+Tab (switch apps)
      e.preventDefault();
      showAlert('Tab Switching Blocked', 'Tab switching and window management are not allowed during the exam!', 'warning');
      return false;
    }
    
    // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (Developer Tools)
    if (e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && e.key === 'I') || 
        (e.ctrlKey && e.shiftKey && e.key === 'J') || 
        (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
      showAlert('Developer Tools Blocked', 'Developer tools are not allowed during the exam!', 'warning');
      return false;
    }
    
    // Disable Escape key (to prevent exiting fullscreen)
    if (e.key === 'Escape') {
      e.preventDefault();
      showAlert('Fullscreen Locked', 'You cannot exit fullscreen during the exam!', 'warning');
      return false;
    }
    
    // Disable Windows key combinations
    if (e.key === 'Meta' || e.key === 'Win') {
      e.preventDefault();
      showAlert('Windows Key Disabled', 'Windows key is disabled during the exam!', 'warning');
      return false;
    }
  };

  useEffect(() => {
    console.log('🔍 Component mounted, initializing exam...');
    
    // Load saved exam state if exists
    const savedState = loadExamState();
    
    // Only fetch exam data if we don't have a saved state or if the exam hasn't expired
    if (!savedState || !examCompleted) {
      // Use setTimeout to ensure fetchExamData runs after render cycle
      setTimeout(() => {
    fetchExamData();
      }, 0);
    }
    
    // Add security event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    
    // Disable text selection during exam
    if (examStarted) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
      document.body.style.mozUserSelect = 'none';
      document.body.style.msUserSelect = 'none';
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (fullscreenTimerRef.current) {
        clearInterval(fullscreenTimerRef.current);
      }
      
      // Remove event listeners
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      
      // Re-enable text selection
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.body.style.mozUserSelect = '';
      document.body.style.msUserSelect = '';
    };
  }, [examId, examStarted]);

  // Countdown timer for wait time
  useEffect(() => {
    console.log('⏰ Countdown useEffect triggered:', {
      waitForStartTime,
      examStartTime,
      timeUntilStart
    });
    
    if (waitForStartTime && examStartTime) {
      console.log('⏰ Setting up countdown timer with examStartTime:', examStartTime);
      
      const updateCountdown = () => {
        const now = new Date();
        const startTime = new Date(examStartTime);
        const timeDiff = startTime.getTime() - now.getTime();
        
        console.log('⏰ Countdown update:', {
          now: now.toISOString(),
          startTime: startTime.toISOString(),
          timeDiff: timeDiff,
          timeDiffSeconds: Math.ceil(timeDiff / 1000),
          isValidStartTime: !isNaN(startTime.getTime())
        });
        
        if (timeDiff <= 0) {
          // Exam has started, refresh the page to start the exam
          console.log('⏰ Exam time reached, refreshing page to start exam');
          setWaitForStartTime(false);
          // Clear any cached state and refresh
          localStorage.removeItem(`examState_${examId}`);
          window.location.reload();
        } else {
          const secondsUntilStart = Math.ceil(timeDiff / 1000);
          setTimeUntilStart(secondsUntilStart);
          console.log('⏰ Time until start:', secondsUntilStart, 'seconds');
        }
      };

      updateCountdown();
      timerRef.current = setInterval(updateCountdown, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else {
      console.log('⏰ Countdown timer not started:', {
        waitForStartTime,
        examStartTime: examStartTime ? 'present' : 'missing'
      });
    }
  }, [waitForStartTime, examStartTime]);

  useEffect(() => {
    if (examStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          
          // Save exam state every 10 seconds
          if (prev % 10 === 0) {
            saveExamState();
          }
          
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examStarted, timeLeft]);

  const fetchExamData = async () => {
    try {
      console.log('🔍 Fetching exam data for ID:', examId);
      const response = await api(`/api/exams/${examId}/start`);
      console.log('🔍 API Response:', response);
      console.log('🔍 Response type:', typeof response);
      console.log('🔍 Response keys:', Object.keys(response || {}));
      
      if (response.success) {
        console.log('✅ Exam loaded successfully:', {
          exam: response.exam,
          questions: response.questions?.length || 0,
          duration: response.exam?.duration
        });
        
        setExam(response.exam);
        setQuestions(response.questions || []);
        const durationInSeconds = response.exam.duration * 60;
        console.log('🔍 Setting exam duration:', {
          duration: response.exam.duration,
          durationInSeconds: durationInSeconds,
          timeRemaining: response.examAttempt?.timeRemaining
        });
        setTimeLeft(durationInSeconds); // Convert minutes to seconds
        setExamStarted(true);
        
        // Set exam start time for security tracking
        examStartTimeRef.current = Date.now();
        
        // Enter fullscreen mode
        enterFullscreen();
        
        // Save initial exam state
        saveExamState();
        
        // Start fullscreen monitoring
        const fullscreenCheckInterval = setInterval(() => {
          if (examStarted && !document.fullscreenElement && 
              !document.webkitFullscreenElement && 
              !document.mozFullScreenElement && 
              !document.msFullscreenElement) {
            enterFullscreen();
          }
        }, 1000);
        
        // Store interval reference for cleanup
        fullscreenTimerRef.current = fullscreenCheckInterval;
        
        // Load saved answers if any
        if (response.savedAnswers) {
          setAnswers(response.savedAnswers);
        }
        
        // Load marked questions if any
        if (response.markedQuestions) {
          setMarkedQuestions(new Set(response.markedQuestions));
        }
      } else {
        console.log('❌ Exam loading failed:', response.message);
        
        if (response.message === 'Payment required') {
          setAccessDenied(true);
        } else if (response.message && response.message.includes('Exam has not started yet')) {
          // Handle "wait for start time" case
          console.log('⏰ Exam not started yet, setting wait state');
          console.log('📅 Full response:', response);
          console.log('📅 Start time from response:', response.startTime);
          console.log('📅 Current time from response:', response.currentTime);
          
          setWaitForStartTime(true);
          setExamStartTime(response.startTime);
          setCurrentTime(response.currentTime);
          
          // Calculate initial time until start
          console.log('📅 Checking startTime in response:', response.startTime);
          console.log('📅 startTime type:', typeof response.startTime);
          console.log('📅 startTime value:', response.startTime);
          
          if (response.startTime) {
            const now = new Date();
            const startTime = new Date(response.startTime);
            const timeDiff = startTime.getTime() - now.getTime();
            console.log('📅 Time calculation:', {
              now: now.toISOString(),
              startTime: startTime.toISOString(),
              timeDiff: timeDiff,
              timeDiffSeconds: Math.ceil(timeDiff / 1000),
              isValidStartTime: !isNaN(startTime.getTime())
            });
            if (timeDiff > 0) {
              setTimeUntilStart(Math.ceil(timeDiff / 1000));
              console.log('📅 Set timeUntilStart to:', Math.ceil(timeDiff / 1000));
        } else {
              console.log('📅 Time difference is negative or zero:', timeDiff);
            }
          } else {
            console.log('⚠️ No startTime in response, trying to calculate from exam data');
            console.log('📅 Full response for debugging:', JSON.stringify(response, null, 2));
            // Fallback: try to calculate from exam data if available
            if (response.exam && response.exam.examDate) {
              console.log('📅 Exam date available:', response.exam.examDate);
              console.log('📅 Exam slots available:', response.exam.slots);
              
              // Try to find the earliest slot time
              if (response.exam.slots && response.exam.slots.length > 0) {
                const earliestSlot = response.exam.slots.reduce((earliest, slot) => {
                  if (!earliest || slot.startTime < earliest.startTime) {
                    return slot;
                  }
                  return earliest;
                });
                
                if (earliestSlot) {
                  const examDateStr = new Date(response.exam.examDate).toISOString().split('T')[0];
                  const slotStartTime = new Date(`${examDateStr}T${earliestSlot.startTime}:00`);
                  const now = new Date();
                  const timeDiff = slotStartTime.getTime() - now.getTime();
                  
                  console.log('📅 Calculated start time from slot:', {
                    examDate: examDateStr,
                    slotStartTime: earliestSlot.startTime,
                    calculatedStartTime: slotStartTime.toISOString(),
                    timeDiff: timeDiff,
                    timeDiffSeconds: Math.ceil(timeDiff / 1000)
                  });
                  
                  if (timeDiff > 0) {
                    setExamStartTime(slotStartTime.toISOString());
                    setTimeUntilStart(Math.ceil(timeDiff / 1000));
                    console.log('📅 Set fallback start time and countdown');
                  }
                }
              }
            }
          }
          
          // Use exam details from the response
          if (response.exam) {
            setExam(response.exam);
            console.log('📅 Exam details set:', response.exam);
            // Also set questions if available
            if (response.questions) {
              setQuestions(response.questions);
            }
          }
        } else {
          console.log('❌ Exam loading failed with message:', response.message);
          
          // Handle specific error cases
          if (response.message && response.message.includes('maximum number of attempts')) {
            // Redirect to results page instead of showing error
            console.log('🔍 Maximum attempts reached - redirecting to results');
            toast.success('You have already completed this exam. Redirecting to results...');
            setTimeout(() => {
              navigate(`/exam-result/${examId}`);
            }, 2000);
            return;
          } else if (response.message && response.message.includes('Payment required')) {
            // Handle payment required case
            console.log('🔍 Payment required - setting access denied state');
            console.log('🔍 Payment response data:', response);
            setLoading(false);
            setAccessDenied(true);
            
            // Store courseId for payment redirect
            if (response.courseId) {
              console.log('🔍 Storing courseId for payment redirect:', response.courseId);
              setCourseId(response.courseId);
            }
          } else if (response.message && response.message.includes('Exam access period has expired')) {
            // Handle exam access period expired
            console.log('🔍 Exam access period expired - redirecting to results');
            toast.error('Exam access period has expired. Redirecting to results...');
            setTimeout(() => {
              navigate(`/exam-result/${examId}`);
            }, 2000);
            return;
          } else if (response.message && response.message.includes('Exam has ended')) {
            // Handle exam has ended (different from access period expired)
            console.log('🔍 Exam has ended - redirecting to results');
            toast.error('Exam has ended. The exam duration has expired. Redirecting to results...');
            setTimeout(() => {
              navigate(`/exam-result/${examId}`);
            }, 2000);
            return;
          } else {
            // Show generic error message
          toast.error(response.message || 'Failed to load exam');
            setLoading(false);
            setAccessDenied(true);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error fetching exam:', error);
      
      // Check if it's a "wait for start time" error
      if (error.message && error.message.includes('Exam has not started yet')) {
        // Try to extract start time from error if available
        setWaitForStartTime(true);
        // For now, we'll set a placeholder - the user can refresh manually
        toast.error('Exam has not started yet. Please wait and try again.');
      } else if (error.message && error.message.includes('Exam access period has expired')) {
        // Handle exam access period expired in catch block
        console.log('🔍 Exam access period expired (catch block) - redirecting to results');
        toast.error('Exam access period has expired. Redirecting to results...');
        setTimeout(() => {
          navigate(`/exam-result/${examId}`);
        }, 2000);
        return;
      } else if (error.message && error.message.includes('Exam has ended')) {
        // Handle exam has ended in catch block
        console.log('🔍 Exam has ended (catch block) - redirecting to results');
        toast.error('Exam has ended. The exam duration has expired. Redirecting to results...');
        setTimeout(() => {
          navigate(`/exam-result/${examId}`);
        }, 2000);
        return;
      } else {
        console.log('❌ Critical error occurred:', error.message);
        toast.error('Failed to load exam: ' + (error.message || 'Unknown error'));
        // Set error state instead of redirecting
        setLoading(false);
        setAccessDenied(true);
      }
    } finally {
      // Only set loading to false if we haven't already handled the error
      if (loading) {
      setLoading(false);
      }
    }
  };

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Auto-save answer
    saveAnswer(questionId, answer);
  };

  const saveAnswer = async (questionId, answer) => {
    try {
      await api(`/api/exams/${examId}/save-answer`, {
        method: 'POST',
        body: { questionId, answer }
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleMarkForReview = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const newMarkedQuestions = new Set(markedQuestions);
    
    if (newMarkedQuestions.has(currentQuestion._id)) {
      newMarkedQuestions.delete(currentQuestion._id);
    } else {
      newMarkedQuestions.add(currentQuestion._id);
    }
    
    setMarkedQuestions(newMarkedQuestions);
    
    // Save marked question
    api(`/api/exams/${examId}/mark-question`, {
      method: 'POST',
      body: { 
        questionId: currentQuestion._id, 
        marked: newMarkedQuestions.has(currentQuestion._id) 
      }
    });
  };

  const handleClearResponse = () => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => {
      const newAnswers = { ...prev };
      delete newAnswers[currentQuestion._id];
      return newAnswers;
    });
    
    // Clear saved answer
    api(`/api/exams/${examId}/clear-answer`, {
      method: 'POST',
      body: { questionId: currentQuestion._id }
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
  };

  const handleAutoSubmit = async () => {
    if (examStarted) {
    toast.success('Time up! Submitting exam automatically...');
    await submitExam();
    }
  };

  const submitExam = async () => {
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Exit fullscreen mode
      exitFullscreen();
      
      // Clear exam state from localStorage
      localStorage.removeItem(`examState_${examId}`);
      
      const response = await api(`/api/exams/${examId}/submit`, {
        method: 'POST',
        body: { answers, markedQuestions: Array.from(markedQuestions) }
      });
      
      if (response.success) {
        // Set completion state instead of immediately redirecting
        setExamCompleted(true);
        setSubmissionResult(response);
        setExamStarted(false); // Stop the exam timer
        
        toast.success('Exam submitted successfully!');
      } else {
        toast.error(response.message || 'Failed to submit exam');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionIndex) => {
    const question = questions[questionIndex];
    if (!question) return 'not-visited';
    
    const isAnswered = answers[question._id];
    const isMarked = markedQuestions.has(question._id);
    
    if (isAnswered && isMarked) return 'answered-marked';
    if (isAnswered) return 'answered';
    if (isMarked) return 'marked';
    return 'not-visited';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'answered': return 'bg-green-500';
      case 'not-answered': return 'bg-red-500';
      case 'marked': return 'bg-purple-500';
      case 'not-visited': return 'bg-gray-400';
      case 'answered-marked': return 'bg-purple-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You cannot access this exam at this time. This could be due to:
          </p>
          <ul className="text-sm text-gray-500 mb-6 text-left">
            <li>• You have reached the maximum number of attempts</li>
            <li>• Payment is required to access this exam</li>
            <li>• You are not registered for this exam</li>
            <li>• The exam is not currently active</li>
            <li>• Contact your administrator for assistance</li>
          </ul>
          
          <div className="space-y-3">
            {courseId && (
              <button
                onClick={() => navigate(`/course-payment/${courseId}`)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                💳 Pay for Course Access
              </button>
            )}
            <button
              onClick={() => navigate(`/exam-result/${examId}`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              View Exam Results
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (waitForStartTime) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl w-full">
          <div className="text-center mb-6">
            <Clock className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Exam Instructions</h2>
            <p className="text-gray-600">Please read all instructions carefully before starting the exam</p>
          </div>
          
          {exam && (
            <div className="mb-8">
              {/* Exam Details */}
              <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">{exam.title}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Subject:</span>
                    <span className="ml-2 text-gray-600">{exam.subject}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Duration:</span>
                    <span className="ml-2 text-gray-600">{exam.duration} minutes</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Total Marks:</span>
                    <span className="ml-2 text-gray-600">{exam.totalMarks}</span>
                  </div>
                </div>
                {examStartTime && (
                  <div className="mt-3 text-sm">
                    <span className="font-medium text-gray-700">Start Time:</span>
                    <span className="ml-2 text-gray-600">
                      {new Date(examStartTime).toLocaleString('en-IN', { 
                        timeZone: 'Asia/Kolkata',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {exam.description && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Description:</h4>
                  <p className="text-gray-700">{exam.description}</p>
                </div>
              )}

              {/* Instructions */}
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-gray-900 mb-4">Important Instructions:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">1.</span>
                    <span>Ensure you have a stable internet connection throughout the exam.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">2.</span>
                    <span>Do not refresh the page or close the browser during the exam.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">3.</span>
                    <span>Read each question carefully before selecting your answer.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">4.</span>
                    <span>You can navigate between questions using the question navigation panel.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">5.</span>
                    <span>Use the "Mark for Review" feature to flag questions you want to revisit.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">6.</span>
                    <span>Answer all questions before the time limit expires.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">7.</span>
                    <span>Once you submit the exam, you cannot make any changes.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">8.</span>
                    <span>Your exam will be automatically submitted when time runs out.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">9.</span>
                    <span>Do not use any external resources or assistance during the exam.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">10.</span>
                    <span>Keep your camera and microphone ready if required by the exam.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">11.</span>
                    <span>Ensure your device has sufficient battery or is connected to power.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">12.</span>
                    <span>Contact the exam administrator immediately if you encounter any technical issues.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">13.</span>
                    <span>Make sure you are in a quiet environment with minimal distractions.</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-medium text-blue-600 mr-2">14.</span>
                    <span>Review your answers before final submission to avoid any mistakes.</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Timer Section */}
          <div className="text-center mb-6">
            {timeUntilStart > 0 ? (
              <>
                <div className="text-5xl font-bold text-blue-600 mb-2">
                  {formatTime(timeUntilStart)}
                </div>
                <p className="text-lg text-gray-600 mb-4">
                  Time remaining until exam starts
                </p>
                <div className="text-sm text-gray-500 mb-6">
                  <p>The exam will start automatically when the timer reaches zero.</p>
                  <p>Please keep this page open and do not refresh.</p>
                </div>
              </>
            ) : (
              <>
                <div className="text-5xl font-bold text-green-600 mb-4">
                  Ready to Start!
                </div>
                <p className="text-lg text-gray-600 mb-6">
                  The exam is now available. Click the button below to begin.
                </p>
                <button
                  onClick={() => {
                    setWaitForStartTime(false);
                    window.location.reload();
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
                >
                  Start Exam
                </button>
              </>
            )}
          </div>
          
          {/* Go to Dashboard Button */}
          <div className="text-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam || !questions.length) {
    const errorMessage = !exam 
      ? "The exam you're looking for doesn't exist or is not available."
      : "This exam doesn't have any questions available. Please contact your administrator.";
    
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Exam Not Available</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          
          <div className="space-y-3">
            <button
              onClick={() => fetchExamData()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Retry Loading Exam
            </button>
          <button
            onClick={() => navigate('/dashboard')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
              Go to Dashboard
          </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  // Debug logging
  console.log('Debug - Exam Conducting Page:', {
    exam,
    questions: questions.length,
    currentQuestionIndex,
    currentQuestion,
    examStarted,
    loading
  });

  // Temporary test: Add sample questions if none are loaded
  const testQuestions = questions.length === 0 ? [
    {
      _id: 'test1',
      question: 'What command is used to list files in Linux?',
      options: ['ls', 'cd', 'pwd', 'cat'],
      marks: 1
    },
    {
      _id: 'test2',
      question: 'Which command is used to change directory?',
      options: ['ls', 'cd', 'pwd', 'mv'],
      marks: 1
    }
  ] : questions;

  const testCurrentQuestion = testQuestions[currentQuestionIndex];

  // Show completion popup modal after exam submission
  if (examCompleted) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>
        
        {/* Modal */}
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 z-50 transform transition-all duration-300 scale-100">
          <div className="p-8 text-center">
            {/* Success Icon with Animation */}
            <div className="mb-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-3xl font-bold text-gray-900 mb-4">🎉 Congratulations!</h2>
            <h3 className="text-xl font-semibold text-green-600 mb-4">Exam Submitted Successfully!</h3>
            
            <p className="text-gray-600 mb-6 leading-relaxed">
              Great job! You have successfully completed the exam. Your answers have been submitted and are now under review.
            </p>

            {/* Exam Details */}
            {exam && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">{exam.title}</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Subject: {exam.subject}</p>
                  <p>Duration: {exam.duration} minutes</p>
                  <p>Questions Answered: {Object.keys(answers).length}</p>
                </div>
              </div>
            )}

            {/* Congratulations Message */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">
                🏆 Well done! Your hard work and preparation have paid off. 
                Results will be available once reviewed by the administrator.
              </p>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Go to Dashboard
            </button>

            {/* Additional Info */}
            <p className="text-xs text-gray-500 mt-4">
              You can check your results later from the dashboard
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Security Warning Banner */}
      {examStarted && (
        <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-medium flex-shrink-0">
          🚨 EXAM SECURITY ACTIVE: Fullscreen mode enabled. Tab switching and page refresh are monitored.
        </div>
      )}

        {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{exam.title}</h1>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {exam.subject}
            </span>
            </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-red-50 px-4 py-2 rounded-lg">
              <Clock className="w-5 h-5 text-red-600" />
              <span className="text-xl font-bold text-red-600">{formatTime(timeLeft)}</span>
          </div>
            <div className="text-sm text-gray-600 font-medium">
              {examStarted ? 'Exam Active' : 'Student Mode'}
            </div>
          </div>
          </div>
        </div>

      {/* Main Content Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Content Area - Questions */}
        <div className="flex-1 bg-white flex flex-col overflow-hidden">
          {/* Question Info Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 px-6 py-4 flex-shrink-0">
            <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
                <span className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm">
                  Question {currentQuestionIndex + 1} of {testQuestions.length || 0}
            </span>
                {currentQuestion && (
                  <div className="flex items-center space-x-4 text-sm text-gray-700">
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                      +{currentQuestion.marks || 1} mark
                    </span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full">
                      -0 mark
                    </span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Total Questions: <span className="font-bold">{testQuestions.length || 0}</span>
              </div>
          </div>
        </div>


          {/* Question Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {testQuestions.length > 0 ? (
                testCurrentQuestion ? (
                  <>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-8 leading-relaxed">
                      {testCurrentQuestion.question || 'Question loading...'}
              </h3>
              
              {/* Options */}
              <div className="space-y-3">
                      {testCurrentQuestion.options && testCurrentQuestion.options.length > 0 ? (
                        testCurrentQuestion.options.map((option, index) => (
                  <label
                    key={index}
                            className={`flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 hover:shadow-md ${
                              answers[testCurrentQuestion._id] === option
                                ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-[1.02]'
                                : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                              name={`question-${testCurrentQuestion._id}`}
                      value={option}
                              checked={answers[testCurrentQuestion._id] === option}
                              onChange={() => handleAnswerSelect(testCurrentQuestion._id, option)}
                      className="sr-only"
                    />
                            <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center transition-all duration-200 ${
                              answers[testCurrentQuestion._id] === option
                        ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-400'
                    }`}>
                              {answers[testCurrentQuestion._id] === option && (
                                <div className="w-3 h-3 bg-white rounded-full"></div>
                      )}
                    </div>
                            <span className="text-gray-800 text-lg font-medium">{option}</span>
                  </label>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="text-gray-500 text-lg">No options available for this question.</div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-red-500 text-lg">Error: Current question is not available</div>
                    <div className="text-gray-500 text-sm mt-2">
                      Test Questions loaded: {testQuestions.length} | Current index: {currentQuestionIndex}
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500 text-lg">Loading questions...</div>
                  <div className="text-gray-400 text-sm mt-2">
                    Please wait while the exam questions are being loaded.
                  </div>
                </div>
              )}
              </div>
            </div>

            {/* Navigation Buttons */}
          {testQuestions.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex justify-between items-center max-w-4xl mx-auto">
              <button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                  className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                  currentQuestionIndex === 0
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-600 text-white hover:bg-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                }`}
              >
                  ← Previous
              </button>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleClearResponse}
                    className="px-6 py-3 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                >
                  Clear Response
                </button>
                <button
                  onClick={handleMarkForReview}
                    className={`px-6 py-3 rounded-lg transition-all duration-200 flex items-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 ${
                      currentQuestion && markedQuestions.has(currentQuestion._id)
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                    <Bookmark className="w-4 h-4 mr-2" />
                    {currentQuestion && markedQuestions.has(currentQuestion._id) ? 'Marked ✓' : 'Mark for Review'}
                </button>
                <button
                  onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === testQuestions.length - 1}
                    className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
                      currentQuestionIndex === testQuestions.length - 1
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl transform hover:scale-105'
                    }`}
                  >
                    Next →
                </button>
              </div>
            </div>
            </div>
          )}
          </div>

          {/* Right Sidebar - Navigation */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0">
          {/* Student Info */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
            <h4 className="font-bold text-lg">
              {user?.username || user?.email || user?.name || 'Student'}
            </h4>
            <p className="text-blue-100 text-sm">
              {user?.role === 'admin' ? 'Admin Mode' : 
               user?.role === 'principal' ? 'Principal Mode' : 
               'Exam in Progress'}
            </p>
                </div>

          {/* Subject Badge */}
          <div className="p-4 border-b border-gray-200">
            <div className="bg-orange-500 text-white px-4 py-2 rounded-lg text-center font-bold">
              {exam.subject}
              </div>
            </div>

          {/* Question Palette */}
          <div className="flex-1 p-4 overflow-y-auto">
            <h5 className="font-bold text-gray-900 mb-4 text-center">Question Palette</h5>
            <div className="grid grid-cols-5 gap-3">
              {testQuestions.map((question, index) => {
                  const status = getQuestionStatus(index);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={question._id}
                      onClick={() => handleQuestionNavigation(index)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold transition-all duration-300 ${
                        isCurrent
                        ? 'ring-4 ring-blue-500 ring-offset-2 transform scale-110 shadow-2xl'
                        : 'hover:scale-105 hover:shadow-lg'
                    } ${
                      status === 'answered'
                        ? 'bg-green-500 text-white shadow-lg'
                          : status === 'marked'
                        ? 'bg-purple-500 text-white shadow-lg'
                        : status === 'answered-marked'
                        ? 'bg-purple-500 text-white shadow-lg relative'
                        : status === 'not-answered'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                      }`}
                    >
                      {index + 1}
                      {status === 'answered-marked' && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

          {/* Legend */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <h5 className="font-bold text-gray-900 mb-3">Status Legend</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-700">Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                <span className="text-gray-700">Not Answered</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded mr-2"></div>
                <span className="text-gray-700">Marked</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 rounded mr-2"></div>
                <span className="text-gray-700">Not Visited</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowSubmitModal(true)}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
              Submit Exam
              </button>
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Exam Instructions</h3>
            <div className="space-y-3 text-sm">
              <p><strong>1.</strong> This is a timed exam. You have {exam.duration} minutes to complete all questions.</p>
              <p><strong>2.</strong> Each question has only one correct answer.</p>
              <p><strong>3.</strong> You can mark questions for review and come back to them later.</p>
              <p><strong>4.</strong> Use the question grid on the right to navigate between questions.</p>
              <p><strong>5.</strong> The exam will be automatically submitted when time runs out.</p>
              <p><strong>6.</strong> Do not refresh the page or close the browser during the exam.</p>
              <p><strong>7.</strong> Your answers are automatically saved as you select them.</p>
            </div>
            <button
              onClick={() => setShowInstructions(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Question Paper Modal */}
      {showQuestionPaper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Question Paper</h3>
            <div className="space-y-4">
              {questions.map((question, index) => (
                <div key={question._id} className="border-b border-gray-200 pb-4">
                  <h4 className="font-semibold mb-2">Q{index + 1}. {question.question}</h4>
                  <div className="ml-4 space-y-1">
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="text-sm">
                        {String.fromCharCode(65 + optIndex)}. {option}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowQuestionPaper(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Submit Exam</h3>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">Are you sure you want to submit your exam?</p>
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <span>Total Questions:</span>
                  <span className="font-semibold">{questions.length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Answered:</span>
                  <span className="font-semibold text-green-600">{Object.keys(answers).length}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span>Marked for Review:</span>
                  <span className="font-semibold text-purple-600">{markedQuestions.size}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unanswered:</span>
                  <span className="font-semibold text-red-600">{questions.length - Object.keys(answers).length}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  submitExam();
                }}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={closeAlert}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
      />
    </div>
  );
};

export default ExamConductingPage;
