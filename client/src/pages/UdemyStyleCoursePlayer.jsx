import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  BookOpen, 
  Clock, 
  Star, 
  Users, 
  ChevronRight, 
  ChevronDown,
  CheckCircle,
  Lock,
  ArrowLeft,
  Share2,
  Heart,
  Download,
  PlayCircle,
  Lock as LockIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
  Trophy,
  XCircle
} from 'lucide-react';
import UserDashboardLayout from '../components/UserDashboardLayout';

const UdemyStyleCoursePlayer = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { user, loading: authLoading } = useAuth();
  
  // Debug component mounting
  console.log('🎯 UdemyStyleCoursePlayer mounted with courseId:', courseId);
  
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [currentLectureIndex, setCurrentLectureIndex] = useState(0);
  
  // Debug current lecture changes
  useEffect(() => {
    console.log('🔄 Current lecture changed:', {
      title: currentLecture?.title,
      videoUrl: currentLecture?.videoUrl,
      videoLink: currentLecture?.videoLink,
      isPreview: currentLecture?.isPreview,
      sectionTitle: currentLecture?.sectionTitle
    });
  }, [currentLecture]);
  const [expandedSections, setExpandedSections] = useState({});
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [enrollment, setEnrollment] = useState(null);
  const [lectureAccess, setLectureAccess] = useState({});
  const [progress, setProgress] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAccessDeniedModal, setShowAccessDeniedModal] = useState(false);
  const [hasShownPaymentModal, setHasShownPaymentModal] = useState(false);
  const [hasPaymentAccess, setHasPaymentAccess] = useState(false);
  
  // Debug payment access changes
  useEffect(() => {
    console.log('💰 Payment access changed:', hasPaymentAccess);
  }, [hasPaymentAccess]);
  const [paymentCheckLoading, setPaymentCheckLoading] = useState(false);
  
  // Materials and Quiz state
  const [downloadingMaterial, setDownloadingMaterial] = useState({ moduleIndex: -1, materialIndex: -1 });
  const [quizAttempts, setQuizAttempts] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [currentQuizResults, setCurrentQuizResults] = useState(null);

  useEffect(() => {
    console.log('🔍 useEffect triggered:', {
      authLoading,
      hasUser: !!user,
      user: user ? { id: user.id, email: user.email } : null,
      courseId,
      dependencies: { courseId, authLoading, user_id: user?.id }
    });
    
    // Reset component state when courseId changes
    if (courseId) {
      console.log('🔄 Resetting component state for new course:', courseId);
      setCourse(null);
      setCurrentLecture(null);
      setCurrentLectureIndex(0);
      setEnrollment(null);
      setLectureAccess({});
      setProgress(0);
      setIsLoading(true);
      setIsFetching(false);
      setHasShownPaymentModal(false);
      setHasPaymentAccess(false);
    }
    
    if (!authLoading && user && courseId && !isFetching) {
      console.log('✅ Conditions met, calling fetchCourseData for course:', courseId);
      fetchCourseData();
    } else {
      console.log('❌ Conditions not met:', {
        authLoading,
        hasUser: !!user,
        hasCourseId: !!courseId,
        isFetching
      });
    }
  }, [courseId, authLoading, user?.id]);

  // Real-time payment status checking (every 30 seconds)
  useEffect(() => {
    if (!courseId || !user) return;

    console.log('🔄 Setting up real-time payment checking for course:', courseId);
    
    const interval = setInterval(async () => {
      console.log('🔄 [INTERVAL] Checking payment status...');
      await checkPaymentAccess();
    }, 30000); // Check every 30 seconds

    return () => {
      console.log('🔄 Clearing payment checking interval');
      clearInterval(interval);
    };
  }, [courseId, user?.id]);

  // Check payment status when page becomes visible (user returns from payment page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && courseId && user) {
        console.log('🔄 Page became visible, checking payment status...');
        checkPaymentAccess();
      }
    };

    const handleFocus = () => {
      if (courseId && user) {
        console.log('🔄 Window focused, checking payment status...');
        checkPaymentAccess();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [courseId, user?.id]);

  // Debug component unmounting
  useEffect(() => {
    return () => {
      console.log('🎯 UdemyStyleCoursePlayer unmounting for courseId:', courseId);
    };
  }, [courseId]);

  const fetchCourseData = async () => {
    // Prevent multiple simultaneous calls
    if (isFetching) {
      console.log('⏳ Already fetching, skipping duplicate call');
      return;
    }
    
    try {
      setIsFetching(true);
      setIsLoading(true);
      
      console.log('🔍 Fetching course data for courseId:', courseId);
      console.log('🔍 Current URL courseId:', courseId);
      console.log('🔍 Current course state:', course ? course._id : 'null');
      console.log('🔍 User authentication status:', { 
        authLoading, 
        user: user ? { id: user.id, email: user.email, role: user.role } : null 
      });
      console.log('🔍 Available tokens:', {
        token: localStorage.getItem('token') ? 'present' : 'missing',
        adminToken: localStorage.getItem('adminToken') ? 'present' : 'missing',
        principalToken: localStorage.getItem('principalToken') ? 'present' : 'missing'
      });
      
      // Check if user is authenticated
      if (authLoading || !user) {
        console.log('❌ User not authenticated or still loading, redirecting to login');
        toast.error('Please log in to access this course');
        setIsLoading(false);
        navigate('/auth');
        return;
      }
      
      // Fetch course with sections and lectures
      console.log('🚀 Making API call to:', `/api/courses/${courseId}`);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API call timeout after 10 seconds')), 10000);
      });
      
      const apiCall = api(`/api/courses/${courseId}`);
      const courseResponse = await Promise.race([apiCall, timeoutPromise]);
      
      console.log('🔍 Course response received:', courseResponse);
      console.log('🔍 Response success:', courseResponse.success);
      console.log('🔍 Response data:', courseResponse);
        console.log('🔍 Course structure:', {
          hasModules: !!courseResponse.course?.modules,
          modulesCount: courseResponse.course?.modules?.length || 0,
          hasVideoUrl: !!courseResponse.course?.videoUrl,
          videoUrl: courseResponse.course?.videoUrl,
          hasSections: !!courseResponse.course?.sections,
          sectionsCount: courseResponse.course?.sections?.length || 0,
          sections: courseResponse.course?.sections
        });
      console.log('🔍 Full course object:', courseResponse.course);
      if (courseResponse.success) {
        setCourse(courseResponse.course);
        
        // Expand all modules by default so users can see materials and quiz
        if (courseResponse.course.modules && courseResponse.course.modules.length > 0) {
          const expanded = {};
          courseResponse.course.modules.forEach((module, index) => {
            expanded[index] = true;
            // Check quiz attempts for each module
            if (module.quiz && module.quiz.isEnabled) {
              checkQuizAttempt(index);
            }
          });
          setExpandedModules(expanded);
        }
        
        // Set first lecture as current - handle both sections and modules
        const courseContent = courseResponse.course.sections || courseResponse.course.modules || [];
        const allLectures = getAllLectures(courseContent);
        
        // Always show intro video if it exists, regardless of modules
        
        if (courseResponse.course.videoUrl) {
          const introLecture = {
            _id: `${courseResponse.course._id}-intro`,
            title: 'Course Introduction',
            videoUrl: courseResponse.course.videoUrl,
            duration: courseResponse.course.duration || '0:00',
            isPreview: true
          };
          console.log('🔍 Created intro lecture:', introLecture);
          setCurrentLecture(introLecture);
          setCurrentLectureIndex(0);
        } else if (allLectures.length > 0) {
          console.log('🔍 No intro video, setting first module lecture as current');
          setCurrentLecture(allLectures[0]);
          setCurrentLectureIndex(0);
        }

      // Check enrollment status
      const enrollmentResponse = await api(`/api/enrollments/${courseId}/check`);
      if (enrollmentResponse.success) {
        setEnrollment(enrollmentResponse.enrollment);
      }

      // Check payment access as well (real-time)
      await checkPaymentAccess();

        // Check access for all lectures (non-blocking)
        console.log('🚀 Starting lecture access check (non-blocking)');
        checkAllLectureAccess(courseContent).catch(error => {
          console.error('❌ Lecture access check failed:', error);
          // Don't let lecture access errors prevent course loading
          console.log('⚠️ Continuing course load despite lecture access errors');
        });

      } else {
        console.log('❌ Course response not successful:', courseResponse);
        throw new Error(courseResponse.message || 'Course not found or access denied');
      }

    } catch (error) {
      console.error('❌ Error fetching course data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      toast.error('Failed to load course: ' + error.message);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  const getAllLectures = (sectionsOrModules) => {
    const lectures = [];
    if (!sectionsOrModules) return lectures;
    
    console.log('🔍 getAllLectures processing:', sectionsOrModules);
    
    sectionsOrModules.forEach(sectionOrModule => {
      // Handle both sections (with lectures) and modules (with videos)
      const items = sectionOrModule.lectures || sectionOrModule.videos || [];
      console.log(`🔍 Processing ${sectionOrModule.title}:`, {
        hasVideos: !!sectionOrModule.videos,
        videosCount: sectionOrModule.videos?.length || 0,
        videos: sectionOrModule.videos
      });
      
      items.forEach(item => {
        const lecture = {
          ...item,
          sectionTitle: sectionOrModule.title,
          sectionId: sectionOrModule._id || sectionOrModule.id,
          // Map videoLink to videoUrl for consistency
          videoUrl: item.videoUrl || item.videoLink
        };
        
        console.log('🔍 Created lecture:', {
          title: lecture.title,
          videoUrl: lecture.videoUrl,
          videoLink: item.videoLink,
          originalVideoUrl: item.videoUrl,
          fullLectureObject: lecture
        });
        
        lectures.push(lecture);
      });
    });
    
    console.log('🔍 All lectures created:', lectures);
    return lectures;
  };

  const isValidObjectId = (id) => typeof id === 'string' && /^[a-f\d]{24}$/i.test(id);

  const checkAllLectureAccess = async (sections) => {
    console.log('🔍 checkAllLectureAccess started with sections:', sections?.length || 0);
    const accessMap = {};
    const allLectures = getAllLectures(sections);
    console.log('🔍 All lectures found:', allLectures.length);
    
    // First, check payment access for the entire course
    let hasPaymentAccess = false;
    try {
      console.log('🔍 Checking payment access for course:', courseId);
      const paymentAccessResponse = await api(`/api/payments/access/${courseId}`);
      console.log('🔍 Payment access response:', paymentAccessResponse);
      if (paymentAccessResponse.success && paymentAccessResponse.data.hasAccess) {
        hasPaymentAccess = true;
        console.log('✅ Payment access confirmed for course:', courseId, 'Source:', paymentAccessResponse.data.accessSource);
      } else {
        console.log('❌ No payment access for course:', courseId);
      }
    } catch (error) {
      console.log('❌ Payment access check failed:', error);
    }
    
    // If no lectures found, return early
    if (allLectures.length === 0) {
      console.log('⚠️ No lectures found, skipping access check');
      setLectureAccess({});
      return;
    }
    
    // Check if this is a course with Vimeo links (might not have proper enrollment setup)
    const hasVimeoLinks = allLectures.some(lecture => 
      lecture.videoUrl && lecture.videoUrl.includes('vimeo.com')
    ) || (course && course.videoUrl && course.videoUrl.includes('vimeo.com'));
    
    if (hasVimeoLinks) {
      console.log('🎬 Course has Vimeo links, granting access to all lectures');
      for (let i = 0; i < allLectures.length; i++) {
        const lecture = allLectures[i];
        accessMap[lecture._id] = {
          hasAccess: true,
          reason: 'Vimeo course access',
          isFirstLecture: i === 0
        };
      }
      setLectureAccess(accessMap);
      return;
    }
    
    for (let i = 0; i < allLectures.length; i++) {
      const lecture = allLectures[i];
      
      console.log(`🔍 Processing lecture ${i + 1}/${allLectures.length}:`, {
        id: lecture._id,
        title: lecture.title,
        isPreview: lecture.isPreview,
        isValidId: isValidObjectId(lecture._id)
      });

      // Grant access locally for preview or synthetic IDs
      if (lecture.isPreview || !isValidObjectId(lecture._id)) {
        console.log(`✅ Granting preview access to lecture: ${lecture._id} (${lecture.title})`);
        accessMap[lecture._id] = { hasAccess: true, reason: 'Preview' };
        continue;
      }
      
      // If user has payment access, grant access to all lectures
      if (hasPaymentAccess) {
        accessMap[lecture._id] = {
          hasAccess: true,
          reason: 'Payment access',
          isFirstLecture: i === 0
        };
        console.log('✅ Granting payment access to lecture:', lecture._id, lecture.title);
        continue;
      }
      
      // Otherwise, check enrollment access
      try {
        console.log(`🔍 Checking access for lecture: ${lecture._id} (${lecture.title})`);
        const response = await api(`/api/enrollments/${courseId}/lectures/${lecture._id}/access`);
        if (response.success) {
          accessMap[lecture._id] = {
            hasAccess: response.hasAccess,
            reason: response.reason,
            isFirstLecture: response.isFirstLecture
          };
          console.log(`✅ Access granted for lecture: ${lecture._id}`, response);
        } else {
          accessMap[lecture._id] = { hasAccess: false, reason: 'Enrollment required' };
          console.log(`❌ Access denied for lecture: ${lecture._id}`, response);
        }
      } catch (error) {
        console.error(`❌ Error checking access for lecture ${lecture._id} (${lecture.title}):`, error);
        console.error(`❌ Error details:`, {
          status: error.status,
          message: error.message,
          data: error.data,
          url: error.url
        });
        
        // If it's a 404 error, the lecture doesn't exist, so grant access locally
        if (error.status === 404 || 
            error.message?.includes('not found') || 
            error.message?.includes('Course or lecture not found') ||
            error.data?.message?.includes('not found')) {
          console.log(`⚠️ Lecture ${lecture._id} not found in database, granting local access`);
          accessMap[lecture._id] = { hasAccess: true, reason: 'Local access (lecture not in DB)' };
        } else {
          console.log(`❌ Other error for lecture ${lecture._id}, denying access`);
          accessMap[lecture._id] = { hasAccess: false, reason: 'Access check failed' };
        }
      }
    }
    
    setLectureAccess(accessMap);
  };

  const handleLectureSelect = async (lecture, index) => {
    console.log('🎯 handleLectureSelect called:', {
      lectureTitle: lecture.title,
      lectureId: lecture._id,
      lectureVideoUrl: lecture.videoUrl,
      index: index,
      isPreview: lecture.isPreview,
      isValidId: isValidObjectId(lecture._id)
    });
    
    const access = lectureAccess[lecture._id];
    console.log('🔍 Lecture access:', access);

    // Allow previews and synthetic IDs without backend
    if (lecture.isPreview || !isValidObjectId(lecture._id)) {
      console.log('✅ Allowing preview/synthetic lecture');
      setCurrentLecture(lecture);
      setCurrentLectureIndex(index);
      return;
    }

    // If user has payment access, allow access to all lectures
    if (access?.reason === 'Payment access' && access?.hasAccess) {
      console.log('✅ Allowing lecture due to payment access');
      setCurrentLecture(lecture);
      setCurrentLectureIndex(index);
      return;
    }

    // TEMPORARY FIX: Allow all module videos if user has paid for the course
    // This bypasses the complex access control for now
    if (hasPaymentAccess) {
      console.log('✅ Allowing lecture due to course payment access');
      setCurrentLecture(lecture);
      setCurrentLectureIndex(index);
      return;
    }

    if (!enrollment && lecture.isPreview) {
      if (!hasShownPaymentModal) {
        setShowPaymentModal(true);
        setHasShownPaymentModal(true);
      }
      return;
    }
    
    if (!access?.hasAccess) {
      console.log('❌ No access to lecture:', access?.reason);
      
      // If user has paid for the course, allow access regardless of access control
      if (hasPaymentAccess) {
        console.log('✅ Overriding access control - user has paid for course');
        setCurrentLecture(lecture);
        setCurrentLectureIndex(index);
        return;
      }
      
      if (access?.reason === 'Enrollment required' || access?.reason === 'Access check failed') {
        if (!hasShownPaymentModal) {
          setShowPaymentModal(true);
          setHasShownPaymentModal(true);
        }
        return;
      } else {
        setShowAccessDeniedModal(true);
        return;
      }
    }

    console.log('✅ Setting current lecture:', lecture.title);
    setCurrentLecture(lecture);
    setCurrentLectureIndex(index);
    
    if (videoRef.current && videoRef.current.duration) {
      const watchedPercentage = (videoRef.current.currentTime / videoRef.current.duration) * 100;
      if (watchedPercentage > 80) {
        markLectureCompleted(lecture._id);
      }
    }
  };

  // Add a fallback function to handle module video access
  const handleModuleVideoAccess = (lecture, index) => {
    console.log('🎯 handleModuleVideoAccess called for:', {
      title: lecture.title,
      videoUrl: lecture.videoUrl,
      videoLink: lecture.videoLink,
      index: index,
      hasPaymentAccess: hasPaymentAccess,
      fullLectureObject: lecture
    });
    
    // Check if user has paid for the course
    if (hasPaymentAccess) {
      console.log('✅ Module video access granted - user has paid');
      
      // Ensure the lecture has a videoUrl (fallback to videoLink if needed)
      const lectureWithVideoUrl = {
        ...lecture,
        videoUrl: lecture.videoUrl || lecture.videoLink
      };
      
      console.log('🔍 Setting current lecture to:', lectureWithVideoUrl);
      setCurrentLecture(lectureWithVideoUrl);
      setCurrentLectureIndex(index);
      console.log('✅ Current lecture set successfully');
      return;
    }
    
    // User hasn't paid - show payment modal
    console.log('❌ Access denied - user has not paid for course');
    toast.error('Please purchase the course to access this content');
    if (!hasShownPaymentModal) {
      setShowPaymentModal(true);
      setHasShownPaymentModal(true);
    }
    return;
  };

  const markLectureCompleted = async (lectureId) => {
    try {
      await api(`/api/lectures/${lectureId}/progress`, {
        method: 'PUT',
        body: JSON.stringify({
          progressPercentage: 100,
          isCompleted: true
        })
      });
      
      setCompletedLectures(prev => new Set([...prev, lectureId]));
      toast.success('Lecture marked as completed!');
      
      // Update progress
      updateCourseProgress();
    } catch (error) {
      console.error('Error marking lecture completed:', error);
    }
  };

  const updateCourseProgress = () => {
    const allLectures = getAllLectures(course?.sections || course?.modules || []);
    const completedCount = allLectures.filter(lecture => 
      completedLectures.has(lecture._id)
    ).length;
    const newProgress = allLectures.length > 0 ? (completedCount / allLectures.length) * 100 : 0;
    setProgress(newProgress);
  };

  // Test route function
  const testRoute = async (moduleIndex, materialIndex) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      console.log('🧪 Testing route:', { courseId, moduleIndex, materialIndex, API_URL });
      const response = await fetch(`${API_URL}/api/courses/test/${courseId}/${moduleIndex}/${materialIndex}`);
      const data = await response.json();
      console.log('🧪 Test response:', data);
      return data;
    } catch (error) {
      console.error('🧪 Test error:', error);
      return null;
    }
  };

  // Material download function
  const handleMaterialDownload = async (moduleIndex, materialIndex) => {
    try {
      setDownloadingMaterial({ moduleIndex, materialIndex, isDownloading: true });
      
      console.log('📥 Starting download:', { courseId, moduleIndex, materialIndex });
      
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
      const token = localStorage.getItem('token');
      
      console.log('📥 API_URL:', API_URL);
      console.log('📥 Token exists:', !!token);
      
      // Use a direct link with token in URL for file downloads (bypasses CORS issues)
      const downloadUrl = `${API_URL}/api/courses/download/${courseId}/${moduleIndex}/${materialIndex}?token=${encodeURIComponent(token)}`;
      
      console.log('📥 Download URL created');
      
      // Create a hidden iframe to trigger the download
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = downloadUrl;
      document.body.appendChild(iframe);
      
      // Remove iframe after download starts
      setTimeout(() => {
        document.body.removeChild(iframe);
        console.log('✅ Download initiated via iframe');
      }, 2000);

      toast.success('Download started!');
    } catch (error) {
      console.error('❌ Error downloading material:', error);
      toast.error(`Failed to download material: ${error.message}`);
    } finally {
      setDownloadingMaterial({ moduleIndex: -1, materialIndex: -1, isDownloading: false });
    }
  };

  // Quiz navigation function
  const handleQuizStart = (moduleIndex) => {
    navigate(`/quiz/${courseId}/${moduleIndex}`);
  };

  // Check payment access for the course (real-time)
  const checkPaymentAccess = async (showLoading = false) => {
    try {
      if (showLoading) {
        setPaymentCheckLoading(true);
      }
      
      console.log('🔍 [REAL-TIME] Checking payment access for course:', courseId);
      console.log('🔍 [REAL-TIME] User ID:', user?.id);
      
      const response = await api(`/api/payments/access/${courseId}`);
      console.log('🔍 [REAL-TIME] Payment access response:', response);
      
      if (response.success && response.data && response.data.hasAccess) {
        setHasPaymentAccess(true);
        console.log('✅ [REAL-TIME] Payment access confirmed for course:', courseId, 'Source:', response.data.accessSource);
        toast.success('Payment access confirmed!');
      } else {
        setHasPaymentAccess(false);
        console.log('❌ [REAL-TIME] No payment access for course:', courseId);
        if (showLoading) {
          toast.error('No payment access found');
        }
      }
    } catch (error) {
      console.error('❌ [REAL-TIME] Error checking payment access:', error);
      setHasPaymentAccess(false);
      if (showLoading) {
        toast.error('Failed to check payment status');
      }
    } finally {
      if (showLoading) {
        setPaymentCheckLoading(false);
      }
    }
  };

  // Refresh payment access (for real-time updates)
  const refreshPaymentAccess = async () => {
    await checkPaymentAccess(true);
  };

  // Check quiz attempt status
  const checkQuizAttempt = async (moduleIndex) => {
    try {
      const response = await api(`/api/quiz/check-attempt/${courseId}/${moduleIndex}`);
      if (response.success) {
        setQuizAttempts(prev => ({
          ...prev,
          [moduleIndex]: response
        }));
      }
    } catch (error) {
      console.error('Error checking quiz attempt:', error);
    }
  };

  // View quiz results
  const handleViewQuizResults = async (moduleIndex) => {
    try {
      const response = await api(`/api/quiz/attempts/${courseId}`);
      if (response.success && response.attempts) {
        // Find the attempt for this specific module
        const moduleAttempt = response.attempts.find(attempt => 
          attempt.moduleIndex === moduleIndex && attempt.status === 'completed'
        );
        
        if (moduleAttempt) {
          setCurrentQuizResults(moduleAttempt);
          setShowQuizResults(true);
        } else {
          toast.error('No completed quiz found for this module');
        }
      }
    } catch (error) {
      console.error('Error fetching quiz results:', error);
      toast.error('Failed to load quiz results');
    }
  };

  // Toggle module expansion
  const toggleModule = (moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  const handleEnroll = async () => {
    try {
      const response = await api(`/api/enrollments/${courseId}/enroll`, {
        method: 'POST'
      });
      
      if (response.success) {
        toast.success('Successfully enrolled in course!');
        setEnrollment(response.enrollment);
        // Refresh access for all lectures
        await checkAllLectureAccess(course.sections || course.modules);
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast.error('Failed to enroll in course');
    }
  };


  const getEmbeddableUrl = (url) => {
    console.log('🔍 getEmbeddableUrl called with:', url);
    if (!url) {
      console.log('🔍 No URL provided, returning null');
      return null;
    }
    
    // Decode HTML entities first
    const decodedUrl = url.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    console.log('🔍 Decoded URL:', decodedUrl);
    
    if (decodedUrl.includes('embed')) {
      console.log('🔍 URL already embeddable, returning as-is');
      return decodedUrl;
    }
    
    if (decodedUrl.includes('youtube.com/watch')) {
      const videoId = decodedUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log('🔍 Converted YouTube watch URL to embed:', embedUrl);
        return embedUrl;
      }
    }
    
    if (decodedUrl.includes('youtu.be/')) {
      const videoId = decodedUrl.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log('🔍 Converted YouTube short URL to embed:', embedUrl);
        return embedUrl;
      }
    }
    
    if (decodedUrl.includes('vimeo.com/')) {
      // Handle both regular vimeo.com and player.vimeo.com URLs
      let videoId;
      if (decodedUrl.includes('player.vimeo.com/video/')) {
        videoId = decodedUrl.split('player.vimeo.com/video/')[1]?.split('?')[0];
      } else if (decodedUrl.includes('vimeo.com/')) {
        videoId = decodedUrl.split('vimeo.com/')[1]?.split('?')[0];
      }
      
      if (videoId) {
        const embedUrl = `https://player.vimeo.com/video/${videoId}`;
        console.log('🔍 Converted Vimeo URL to embed:', embedUrl);
        return embedUrl;
      }
    }
    
    console.log('🔍 No conversion needed, returning original URL');
    return decodedUrl;
  };

  if (authLoading || isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              {authLoading ? 'Loading authentication...' : 'Loading course content...'}
            </p>
            {/* Debug info */}
            <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-2 rounded">
              <p>Course ID: {courseId}</p>
              <p>Auth Loading: {authLoading ? 'true' : 'false'}</p>
              <p>Has User: {user ? 'true' : 'false'}</p>
              <p>User ID: {user?.id || 'none'}</p>
            </div>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  if (!course) {
    return (
      <UserDashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h2>
            <button
              onClick={() => navigate('/course-dashboard')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  const allLectures = getAllLectures(course.sections || course.modules || []);

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Get Premium Access</h3>
                <button onClick={() => {
                  setShowPaymentModal(false);
                  setHasShownPaymentModal(false);
                }} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Purchase this course to unlock all lectures and premium content.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setHasShownPaymentModal(false);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Not now
                </button>
                <button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setHasShownPaymentModal(false);
                    navigate('/payment', { state: { courseId } });
                  }}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Pay and proceed
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Access Denied Modal */}
        {showAccessDeniedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-full bg-red-100 text-red-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M5.07 19h13.86A2 2 0 0021 17.93L13.41 4.51a2 2 0 00-3.52 0L3 17.93A2 2 0 005.07 19z"/></svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Access denied</h3>
              </div>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                You don't have permission to view this lecture. Please try another lecture or contact support if you believe this is a mistake.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowAccessDeniedModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 px-8 py-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => navigate('/course-dashboard')}
                className="p-3 bg-gray-100 hover:bg-blue-100 rounded-xl transition-all duration-300 group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">{course.title || course.courseName}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    by {course.professorName || course.instructor?.name || course.instructor || 'Instructor'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    4.8 (1,234 reviews)
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-colors shadow-sm">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-120px)]">
          {/* Main Video Area */}
          <div className="flex-1 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden">
            {currentLecture ? (
              <div className="relative w-full h-full">
                {console.log('🔍 Rendering current lecture:', {
                  hasCurrentLecture: !!currentLecture,
                  currentLectureId: currentLecture?._id,
                  hasVideoUrl: !!currentLecture?.videoUrl,
                  videoUrl: currentLecture?.videoUrl,
                  title: currentLecture?.title,
                  isPreview: currentLecture?.isPreview,
                  sectionTitle: currentLecture?.sectionTitle,
                  fullCurrentLecture: currentLecture
                })}
                {(currentLecture.videoUrl || currentLecture.videoLink) ? (
                  (currentLecture.videoUrl || currentLecture.videoLink).includes('.mp4') || 
                  (currentLecture.videoUrl || currentLecture.videoLink).includes('.webm') || 
                  (currentLecture.videoUrl || currentLecture.videoLink).includes('.ogg') ? (
                    <video
                      ref={videoRef}
                      src={currentLecture.videoUrl || currentLecture.videoLink}
                      className="w-full h-full"
                      autoPlay={false}
                      onEnded={() => markLectureCompleted(currentLecture._id)}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      src={getEmbeddableUrl(currentLecture.videoUrl || currentLecture.videoLink)}
                      className="w-full h-full"
                      allowFullScreen
                      title={currentLecture.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      onLoad={() => console.log('✅ Iframe loaded successfully')}
                      onError={(e) => console.error('❌ Iframe load error:', e)}
                    />
                  )
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 max-w-md text-center">
                      <PlayCircle className="w-20 h-20 mx-auto mb-6 text-white/60" />
                      <h3 className="text-2xl font-bold mb-3 text-white">No Video Available</h3>
                      <p className="text-white/70 text-lg">This lecture doesn't have a video yet.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : course.videoUrl ? (
              <div className="relative w-full h-full">
                {course.videoUrl.includes('.mp4') || 
                 course.videoUrl.includes('.webm') || 
                 course.videoUrl.includes('.ogg') ? (
                  <video
                    ref={videoRef}
                    src={course.videoUrl}
                    className="w-full h-full"
                    autoPlay={false}
                    controls
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    src={getEmbeddableUrl(course.videoUrl)}
                    className="w-full h-full"
                    allowFullScreen
                    title={course.courseName || course.title || 'Course Video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onLoad={() => console.log('✅ Course video iframe loaded successfully')}
                    onError={(e) => console.error('❌ Course video iframe load error:', e)}
                  />
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 max-w-md text-center">
                  <BookOpen className="w-24 h-24 mx-auto mb-6 text-white/60" />
                  <h3 className="text-3xl font-bold mb-4 text-white">Welcome to the Course</h3>
                  <p className="text-white/70 text-lg">Select a lecture to start your learning journey.</p>
                </div>
              </div>
            )}

          </div>

          {/* Right Sidebar - Playlist */}
          <div className="w-96 bg-white/95 backdrop-blur-sm border-l border-gray-200/50 flex flex-col shadow-2xl">
            {/* Course Progress */}
            <div className="p-6 border-b border-gray-200/50 bg-gradient-to-r from-white to-blue-50/30">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Course Progress</h3>
                  <p className="text-sm text-gray-600">Track your learning journey</p>
                </div>
                <button className="p-3 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-xl transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm font-medium text-gray-700 mb-3">
                  <span className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {completedLectures.size}/{allLectures.length} lectures
                  </span>
                  <span className="text-blue-600 font-bold">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Limited Access Warning */}
              {!hasPaymentAccess && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <LockIcon className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-800 mb-2">Premium Course</h4>
                      <p className="text-sm text-amber-700 mb-4">
                        You can watch the introduction for free. Purchase the course to access all modules, materials, and quizzes.
                      </p>
                      <button
                        onClick={() => navigate('/payment', { state: { courseId } })}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Purchase Course (₹{course.price})
                      </button>
                    </div>
                  </div>
                </div>
              )}


            </div>

            {/* Course Content - Scrollable Area */}
            <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-gray-50/50" style={{ maxHeight: 'calc(100vh - 450px)' }}>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-xl">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {hasPaymentAccess ? 'Course Content' : 'Premium Content'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {hasPaymentAccess ? 'Explore all modules and lectures' : 'Purchase to unlock all content'}
                    </p>
                  </div>
                </div>
                
                
                {hasPaymentAccess && (course.sections || course.modules) && (course.sections?.length > 0 || course.modules?.length > 0) && (
                  <div className="space-y-2">
                    {/* Intro Video Section */}
                    {course.videoUrl && (
                      <div className="border border-gray-200 rounded-lg">
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <PlayCircle className="w-4 h-4 text-blue-500" />
                              <span className="font-medium text-gray-900">Course Introduction</span>
                            </div>
                            <span className="text-sm text-gray-500">1 lecture</span>
                          </div>
                        </div>
                        <div className="border-t border-gray-200">
                          <div
                            className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
                              currentLecture?._id === `${course._id}-intro`
                                ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => {
                              const introLecture = {
                                _id: `${course._id}-intro`,
                                title: 'Course Introduction',
                                videoUrl: course.videoUrl,
                                duration: course.duration || '0:00',
                                isPreview: true
                              };
                              setCurrentLecture(introLecture);
                              setCurrentLectureIndex(0);
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="flex-shrink-0">
                                {currentLecture?._id === `${course._id}-intro` ? (
                                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                                    <PlayCircle className="w-3 h-3 text-white" />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                                    <PlayCircle className="w-3 h-3 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">Course Introduction</p>
                                <p className="text-xs text-gray-500">{course.duration || '0:00'}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Preview
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Render Modules First (if they exist) */}
                    {course.modules && course.modules.length > 0 && course.modules.map((module, moduleIndex) => {
                      const isModule = true;
                      const moduleData = module;
                      
                      return (
                        <div key={module._id || moduleIndex} className={`border rounded-2xl shadow-sm transition-all duration-300 overflow-hidden mb-4 ${
                          !hasPaymentAccess 
                            ? 'border-gray-300 bg-gray-50 opacity-75' 
                            : 'border-gray-200 bg-white hover:shadow-md'
                        }`}>
                          <button
                            onClick={() => toggleModule(moduleIndex)}
                            className="w-full flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group"
                          >
                            <div className="flex items-center space-x-4">
                              <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-xl transition-colors duration-300">
                                {expandedModules[moduleIndex] ? (
                                  <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-all duration-300" />
                                ) : (
                                  <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-all duration-300" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className={`text-lg font-bold transition-colors duration-300 ${
                                    !hasPaymentAccess 
                                      ? 'text-gray-500' 
                                      : 'text-gray-900 group-hover:text-blue-700'
                                  }`}>
                                    {module.title}
                                    {!hasPaymentAccess && <span className="ml-2 text-sm text-red-500">(Locked)</span>}
                                  </h4>
                                  {!hasPaymentAccess && (
                                    <div className="p-1 bg-amber-100 rounded-lg">
                                      <LockIcon className="w-4 h-4 text-amber-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {module.videos?.length || 0} lectures
                                  </span>
                                  {/* Show badges for materials and quiz */}
                                  {module.materials && module.materials.length > 0 && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${
                                      hasPaymentAccess 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                      <FileText className="w-3 h-3" />
                                      {module.materials.length}
                                    </span>
                                  )}
                                  {module.quiz && module.quiz.isEnabled && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${
                                      hasPaymentAccess 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                      <HelpCircle className="w-3 h-3" />
                                      Quiz
                                    </span>
                                  )}
                                  {!hasPaymentAccess && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-md">
                                      <LockIcon className="w-3 h-3" />
                                      Premium
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                          
                          <AnimatePresence>
                            {expandedModules[moduleIndex] && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="border-t border-gray-200">
                                  {/* Videos/Lectures Section */}
                                  {module.videos?.map((lecture, lectureIndex) => {
                                    const globalIndex = allLectures.findIndex(l => l._id === lecture._id);
                                    const access = lectureAccess[lecture._id];
                                    const isCompleted = completedLectures.has(lecture._id);
                                    const isCurrent = currentLecture?._id === lecture._id;
                                    
                                    return (
                                      <div
                                        key={lecture._id}
                                        className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-300 border-b border-gray-100 last:border-b-0 group ${
                                          isCurrent 
                                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-sm' 
                                            : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                                        }`}
                                        onClick={() => handleModuleVideoAccess(lecture, globalIndex)}
                                      >
                                        <div className="flex items-center space-x-4 flex-1">
                                          <div className="flex-shrink-0">
                                            {isCompleted ? (
                                              <div className="p-2 bg-green-100 rounded-lg">
                                                <CheckCircle2 className="w-5 h-5 text-green-600" />
                                              </div>
                                            ) : !hasPaymentAccess ? (
                                              <div className="p-2 bg-gray-100 rounded-lg">
                                                <LockIcon className="w-5 h-5 text-gray-400" />
                                              </div>
                                            ) : (
                                              <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors duration-300">
                                                <PlayCircle className="w-5 h-5 text-blue-600" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className={`text-base font-semibold mb-1 ${
                                              isCompleted 
                                                ? 'text-green-700' 
                                                : isCurrent 
                                                  ? 'text-blue-700' 
                                                  : !hasPaymentAccess
                                                    ? 'text-gray-400'
                                                    : 'text-gray-900'
                                            }`}>
                                              {lecture.title}
                                              {!hasPaymentAccess && <span className="ml-2 text-xs text-red-500">(Locked)</span>}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                              {lecture.duration || '0:00'}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          {isCompleted && (
                                            <CheckCircle className="w-5 h-5 text-green-500" />
                                          )}
                                          {!access?.hasAccess && (
                                            <LockIcon className="w-5 h-5 text-gray-400" />
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}

                                  {/* Materials Section - Only for modules */}
                                  {module.materials && module.materials.length > 0 && (
                                    <div className="border-t border-gray-200 p-4 bg-blue-50/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-blue-100 rounded-lg">
                                          <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <h5 className="font-semibold text-gray-900">Course Materials</h5>
                                      </div>
                                      
                                      {!hasPaymentAccess ? (
                                        <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-4">
                                          <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                              <LockIcon className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div>
                                              <h6 className="font-semibold text-gray-900">Premium Content</h6>
                                              <p className="text-sm text-gray-600">Purchase the course to access materials</p>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => navigate('/payment', { state: { courseId } })}
                                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                          >
                                            Purchase Course
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {module.materials.map((material, materialIndex) => (
                                            <div
                                              key={materialIndex}
                                              className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
                                            >
                                              <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                  <FileText className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                  <h6 className="font-medium text-gray-900 text-sm">
                                                    {material.title}
                                                  </h6>
                                                  <p className="text-xs text-gray-600">{material.originalName}</p>
                                                </div>
                                              </div>
                                              <button
                                                onClick={() => handleMaterialDownload(moduleIndex, materialIndex)}
                                                disabled={downloadingMaterial.moduleIndex === moduleIndex && downloadingMaterial.materialIndex === materialIndex}
                                                className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-300"
                                              >
                                                {downloadingMaterial.moduleIndex === moduleIndex && downloadingMaterial.materialIndex === materialIndex ? (
                                                  <>
                                                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    Downloading...
                                                  </>
                                                ) : (
                                                  <>
                                                    <Download className="w-3 h-3" />
                                                    Download
                                                  </>
                                                )}
                                              </button>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Quiz Section - Only for modules */}
                                  {module.quiz && module.quiz.isEnabled && (
                                    <div className="border-t border-gray-200 p-4 bg-green-50/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-green-100 rounded-lg">
                                          <HelpCircle className="w-4 h-4 text-green-600" />
                                        </div>
                                        <h5 className="font-semibold text-gray-900">Module Quiz</h5>
                                      </div>
                                      
                                      {!hasPaymentAccess ? (
                                        <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-4">
                                          <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-amber-100 rounded-lg">
                                              <LockIcon className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <div>
                                              <h6 className="font-semibold text-gray-900">Premium Quiz</h6>
                                              <p className="text-sm text-gray-600">Purchase the course to access quizzes</p>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => navigate('/payment', { state: { courseId } })}
                                            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                          >
                                            Purchase Course
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="bg-white rounded-lg border border-green-200 shadow-sm p-4">
                                          <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                              <h6 className="font-semibold text-gray-900 mb-2">Quiz Available</h6>
                                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                                <span className="flex items-center gap-1">
                                                  <HelpCircle className="w-3 h-3" />
                                                  {module.quiz.totalQuestions} questions
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <Clock className="w-3 h-3" />
                                                  {module.quiz.timeLimit} minutes
                                                </span>
                                                <span className="flex items-center gap-1">
                                                  <Trophy className="w-3 h-3" />
                                                  {module.quiz.passingScore}% passing score
                                                </span>
                                              </div>
                                              {quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted && (
                                                <div className="mb-2">
                                                  <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Already Attempted
                                                  </span>
                                                </div>
                                              )}
                                            </div>
                                            <button
                                              onClick={() => 
                                                quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted
                                                  ? handleViewQuizResults(moduleIndex)
                                                  : handleQuizStart(moduleIndex)
                                              }
                                              className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ${
                                                quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted
                                                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                                                  : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                                              }`}
                                            >
                                              {quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted ? (
                                                <>
                                                  <Trophy className="w-4 h-4" />
                                                  View Results
                                                </>
                                              ) : (
                                                <>
                                                  <Trophy className="w-4 h-4" />
                                                  Start Quiz
                                                </>
                                              )}
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Deleted Quiz Section - Show previous results if quiz was deleted */}
                                  {(!module.quiz || !module.quiz.isEnabled) && quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted && (
                                    <div className="border-t border-gray-200 p-4 bg-orange-50/30">
                                      <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-orange-100 rounded-lg">
                                          <AlertCircle className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <h5 className="font-semibold text-gray-900">Quiz Results</h5>
                                      </div>
                                      <div className="bg-white rounded-lg border border-orange-200 shadow-sm p-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <h6 className="font-semibold text-gray-900 mb-2">Previous Quiz Attempt</h6>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                              <span className="flex items-center gap-1">
                                                <CheckCircle className="w-3 h-3" />
                                                Quiz Completed
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" />
                                                Quiz Removed
                                              </span>
                                            </div>
                                            <div className="mb-2">
                                              <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                                <Trophy className="w-3 h-3" />
                                                Results Available
                                              </span>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() => handleViewQuizResults(moduleIndex)}
                                            className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md"
                                          >
                                            <Trophy className="w-4 h-4" />
                                            View Results
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                    
                    {/* Render Sections (if no modules or as fallback) */}
                    {(!course.modules || course.modules.length === 0) && course.sections && course.sections.map((section, sectionIndex) => {
                      const isModule = false;
                      const moduleData = section;
                      
                      
                      return (
                      <div key={section._id || sectionIndex} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden mb-4">
                        <button
                          onClick={() => {
                            if (isModule) {
                              toggleModule(moduleIndex);
                            } else {
                              setExpandedSections(prev => ({
                            ...prev,
                            [section._id]: !prev[section._id]
                              }));
                            }
                          }}
                          className="w-full flex items-center justify-between p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-300 group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="p-2 bg-gray-100 group-hover:bg-blue-100 rounded-xl transition-colors duration-300">
                              {(isModule ? expandedModules[moduleIndex] : expandedSections[section._id]) ? (
                                <ChevronDown className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-all duration-300" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-all duration-300" />
                              )}
                            </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors duration-300">
                                    {section.title}
                                  </h4>
                                  {isModule && !hasPaymentAccess && (
                                    <div className="p-1 bg-amber-100 rounded-lg">
                                      <LockIcon className="w-4 h-4 text-amber-600" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    {(section.lectures || section.videos)?.length || 0} lectures
                                  </span>
                                  {/* Show badges for materials and quiz */}
                                  {isModule && moduleData.materials && moduleData.materials.length > 0 && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${
                                      hasPaymentAccess 
                                        ? 'bg-blue-100 text-blue-800' 
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                      <FileText className="w-3 h-3" />
                                      {moduleData.materials.length}
                                    </span>
                                  )}
                                  {isModule && moduleData.quiz && moduleData.quiz.isEnabled && (
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md ${
                                      hasPaymentAccess 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                      <HelpCircle className="w-3 h-3" />
                                      Quiz
                                    </span>
                                  )}
                                  {isModule && !hasPaymentAccess && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-md">
                                      <LockIcon className="w-3 h-3" />
                                      Premium
                                    </span>
                                  )}
                                </div>
                              </div>
                          </div>
                        </button>
                        
                        <AnimatePresence>
                          {((isModule && expandedModules[moduleIndex]) || (!isModule && expandedSections[section._id])) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-gray-200">
                                {/* Videos/Lectures Section */}
                                {(section.lectures || section.videos)?.map((lecture, lectureIndex) => {
                                  const globalIndex = allLectures.findIndex(l => l._id === lecture._id);
                                  const access = lectureAccess[lecture._id];
                                  const isCompleted = completedLectures.has(lecture._id);
                                  const isCurrent = currentLecture?._id === lecture._id;
                                  
                                  return (
                                    <div
                                      key={lecture._id}
                                      className={`flex items-center justify-between p-4 cursor-pointer transition-all duration-300 border-b border-gray-100 last:border-b-0 group ${
                                        isCurrent 
                                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-sm' 
                                          : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50'
                                      }`}
                                      onClick={() => handleModuleVideoAccess(lecture, globalIndex)}
                                    >
                                      <div className="flex items-center space-x-4 flex-1">
                                        <div className="flex-shrink-0">
                                          {isCompleted ? (
                                            <div className="p-2 bg-green-100 rounded-lg">
                                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                                            </div>
                                          ) : !access?.hasAccess ? (
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                              <LockIcon className="w-5 h-5 text-gray-400" />
                                            </div>
                                          ) : (
                                            <div className="p-2 bg-blue-100 group-hover:bg-blue-200 rounded-lg transition-colors duration-300">
                                              <PlayCircle className="w-5 h-5 text-blue-600" />
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <p className={`text-base font-semibold mb-1 ${
                                            isCompleted 
                                              ? 'text-green-700' 
                                              : isCurrent 
                                                ? 'text-blue-700' 
                                                : !access?.hasAccess
                                                  ? 'text-gray-400'
                                                  : 'text-gray-900 group-hover:text-blue-700'
                                          } transition-colors duration-300`}>
                                            {lecture.title}
                                          </p>
                                          <div className="flex items-center gap-2">
                                            {lecture.duration && (
                                              <span className="text-sm text-gray-600">{lecture.duration}</span>
                                            )}
                                            {isCurrent && (
                                              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                                                Playing
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        {lecture.isPreview && (
                                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                            Preview
                                          </span>
                                        )}
                                        {!access?.hasAccess && (
                                          <LockIcon className="w-3 h-3 text-gray-400" />
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Materials Section - Only for modules */}
                                {isModule && moduleData.materials && moduleData.materials.length > 0 && (
                                  <div className="border-t border-gray-200 p-4 bg-blue-50/30">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="p-1.5 bg-blue-100 rounded-lg">
                                        <FileText className="w-4 h-4 text-blue-600" />
                                      </div>
                                      <h5 className="font-semibold text-gray-900">Course Materials</h5>
                                    </div>
                                    
                                    {!hasPaymentAccess ? (
                                      <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="p-2 bg-amber-100 rounded-lg">
                                            <LockIcon className="w-4 h-4 text-amber-600" />
                                          </div>
                                          <div>
                                            <h6 className="font-semibold text-gray-900">Premium Content</h6>
                                            <p className="text-sm text-gray-600">Purchase the course to access materials</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => navigate('/payment', { state: { courseId } })}
                                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                          Purchase Course
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {moduleData.materials.map((material, materialIndex) => (
                                          <div
                                            key={materialIndex}
                                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300"
                                          >
                                            <div className="flex items-center gap-3">
                                              <div className="p-2 bg-blue-100 rounded-lg">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                              </div>
                                              <div>
                                                <h6 className="font-medium text-gray-900 text-sm">
                                                  {material.title}
                                                </h6>
                                                <p className="text-xs text-gray-600">{material.originalName}</p>
                                              </div>
                                            </div>
                                            <button
                                              onClick={() => handleMaterialDownload(moduleIndex, materialIndex)}
                                              disabled={downloadingMaterial.moduleIndex === moduleIndex && downloadingMaterial.materialIndex === materialIndex}
                                              className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-all duration-300"
                                            >
                                              {downloadingMaterial.moduleIndex === moduleIndex && downloadingMaterial.materialIndex === materialIndex ? (
                                                <>
                                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                  Downloading...
                                                </>
                                              ) : (
                                                <>
                                                  <Download className="w-3 h-3" />
                                                  Download
                                                </>
                                              )}
                                            </button>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Quiz Section - Only for modules */}
                                {isModule && moduleData.quiz && moduleData.quiz.isEnabled && (
                                  <div className="border-t border-gray-200 p-4 bg-green-50/30">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="p-1.5 bg-green-100 rounded-lg">
                                        <HelpCircle className="w-4 h-4 text-green-600" />
                                      </div>
                                      <h5 className="font-semibold text-gray-900">Module Quiz</h5>
                                    </div>
                                    
                                    {!hasPaymentAccess ? (
                                      <div className="bg-white rounded-lg border border-amber-200 shadow-sm p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                          <div className="p-2 bg-amber-100 rounded-lg">
                                            <LockIcon className="w-4 h-4 text-amber-600" />
                                          </div>
                                          <div>
                                            <h6 className="font-semibold text-gray-900">Premium Quiz</h6>
                                            <p className="text-sm text-gray-600">Purchase the course to access quizzes</p>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => navigate('/payment', { state: { courseId } })}
                                          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                          Purchase Course
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="bg-white rounded-lg border border-green-200 shadow-sm p-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <h6 className="font-semibold text-gray-900 mb-2">Quiz Available</h6>
                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                              <span className="flex items-center gap-1">
                                                <HelpCircle className="w-3 h-3" />
                                                {moduleData.quiz.totalQuestions} questions
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {moduleData.quiz.timeLimit} minutes
                                              </span>
                                              <span className="flex items-center gap-1">
                                                <Trophy className="w-3 h-3" />
                                                {moduleData.quiz.passingScore}% passing score
                                              </span>
                                            </div>
                                            {quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted && (
                                              <div className="mb-2">
                                                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                                  <CheckCircle className="w-3 h-3" />
                                                  Already Attempted
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                          <button
                                            onClick={() => 
                                              quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted
                                                ? handleViewQuizResults(moduleIndex)
                                                : handleQuizStart(moduleIndex)
                                            }
                                            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 ${
                                              quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted
                                                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm hover:shadow-md'
                                                : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
                                            }`}
                                          >
                                            {quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted ? (
                                              <>
                                                <Trophy className="w-4 h-4" />
                                                View Results
                                              </>
                                            ) : (
                                              <>
                                                <Trophy className="w-4 h-4" />
                                                Start Quiz
                                              </>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Deleted Quiz Section - Show previous results if quiz was deleted */}
                                {isModule && (!moduleData.quiz || !moduleData.quiz.isEnabled) && quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted && (
                                  <div className="border-t border-gray-200 p-4 bg-orange-50/30">
                                    <div className="flex items-center gap-2 mb-3">
                                      <div className="p-1.5 bg-orange-100 rounded-lg">
                                        <AlertCircle className="w-4 h-4 text-orange-600" />
                                      </div>
                                      <h5 className="font-semibold text-gray-900">Quiz Results</h5>
                                    </div>
                                    <div className="bg-white rounded-lg border border-orange-200 shadow-sm p-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <h6 className="font-semibold text-gray-900 mb-2">Previous Quiz Attempt</h6>
                                          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <span className="flex items-center gap-1">
                                              <CheckCircle className="w-3 h-3" />
                                              Quiz Completed
                                            </span>
                                            <span className="flex items-center gap-1">
                                              <AlertCircle className="w-3 h-3" />
                                              Quiz Removed
                                            </span>
                                          </div>
                                          <div className="mb-2">
                                            <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
                                              <Trophy className="w-3 h-3" />
                                              Results Available
                                            </span>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => handleViewQuizResults(moduleIndex)}
                                          className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 bg-orange-600 text-white hover:bg-orange-700 shadow-sm hover:shadow-md"
                                        >
                                          <Trophy className="w-4 h-4" />
                                          View Results
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                      );
                    })}
                  </div>
                )}
                
                {!hasPaymentAccess && (
                  <div className="text-center py-12">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-8">
                      <div className="flex flex-col items-center">
                        <div className="p-4 bg-amber-100 rounded-full mb-4">
                          <LockIcon className="w-12 h-12 text-amber-600" />
                        </div>
                        <h4 className="text-xl font-bold text-amber-800 mb-3">Premium Content</h4>
                        <p className="text-amber-700 text-center mb-6 max-w-sm">
                          Purchase the course to unlock all modules, materials, and quizzes.
                        </p>
                        <button
                          onClick={() => navigate('/payment', { state: { courseId } })}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          Purchase Course (₹{course.price})
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {hasPaymentAccess && !(course.sections || course.modules) && course.videoUrl && (
                  <div className="space-y-2">
                    <div className="border border-gray-200 rounded-lg">
                      <div className="p-3">
                        <div className="flex items-center space-x-2">
                          <PlayCircle className="w-4 h-4 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {course.courseName || course.title || 'Introduction'}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Preview
                          </span>
                        </div>
                        {course.duration && (
                          <p className="text-xs text-gray-500 mt-1">{course.duration}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Course Info - Fixed Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 mt-auto">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{allLectures.length} lectures</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{course.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{course.enrollmentCount} students</span>
                </div>
                {course.rating && course.rating.count > 0 && (
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">
                      {course.rating.average.toFixed(1)} ({course.rating.count} ratings)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quiz Results Modal */}
      <AnimatePresence>
        {showQuizResults && currentQuizResults && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowQuizResults(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    Quiz Results
                  </h2>
                  <button
                    onClick={() => setShowQuizResults(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Quiz Info */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{currentQuizResults.moduleTitle}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Score:</span>
                        <div className="font-bold text-lg text-blue-600">{currentQuizResults.score}%</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Correct:</span>
                        <div className="font-bold text-lg text-green-600">{currentQuizResults.correctAnswers}/{currentQuizResults.totalQuestions}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <div className="font-bold text-lg text-purple-600">{currentQuizResults.timeSpent} min</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <div className={`font-bold text-lg ${currentQuizResults.isPassed ? 'text-green-600' : 'text-red-600'}`}>
                          {currentQuizResults.isPassed ? 'Passed' : 'Failed'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Results */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Question Details</h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {currentQuizResults.answers.map((answer, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${
                          answer.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                        }`}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="font-medium text-sm text-gray-700">Q{index + 1}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              answer.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {answer.isCorrect ? 'Correct' : 'Incorrect'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-800 mb-2">{answer.questionText}</p>
                          <div className="text-xs space-y-1">
                            <div>
                              <span className="text-gray-600">Your Answer: </span>
                              <span className="font-medium">{answer.selectedAnswer || 'Not answered'}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Correct Answer: </span>
                              <span className="font-medium text-green-700">{answer.correctAnswer}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowQuizResults(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        setShowQuizResults(false);
                        navigate('/course-dashboard');
                      }}
                      className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      All Courses
                    </button>
                    <button
                      onClick={() => {
                        setShowQuizResults(false);
                        navigate('/dashboard');
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </UserDashboardLayout>
  );
};

export default UdemyStyleCoursePlayer;
