import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import toast from 'react-hot-toast';
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
  Play,
  FileText,
  HelpCircle,
  Trophy
} from 'lucide-react';
import UserDashboardLayout from '../components/UserDashboardLayout';

const CoursePlayerPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [videos, setVideos] = useState([]);
  const [modules, setModules] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState({});
  const [downloadingMaterial, setDownloadingMaterial] = useState({ moduleIndex: -1, materialIndex: -1 });
  const [courseProgress, setCourseProgress] = useState(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  // Fetch course progress
  const fetchCourseProgress = async () => {
    try {
      const response = await api(`/api/progress/course/${courseId}`);
      if (response.success) {
        setCourseProgress(response.progress);
        
        // Update completed lessons from progress
        const watchedVideos = new Set();
        response.progress.modules.forEach(module => {
          module.videosWatched.forEach(video => {
            watchedVideos.add(video.videoId);
          });
        });
        setCompletedLessons(watchedVideos);
      }
    } catch (error) {
      console.error('Error fetching course progress:', error);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchCourseProgress();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const response = await api(`/api/courses/${courseId}`);
      if (response.success && response.course) {
        setCourse(response.course);
        
        // Debug: Log the complete course data
        console.log('📚 Complete course data:', response.course);
        console.log('📚 Course modules:', response.course.modules);
        console.log('📚 Course modules length:', response.course.modules ? response.course.modules.length : 'undefined');
        console.log('📚 Course modules type:', typeof response.course.modules);
        console.log('📚 Course modules is array:', Array.isArray(response.course.modules));
        
        // Set up modules from the new structure
        if (response.course.modules && response.course.modules.length > 0) {
          setModules(response.course.modules);
          
          // Flatten all videos from all modules for the video player
          const allVideos = [];
          response.course.modules.forEach((module, moduleIndex) => {
            // Debug: Log materials for each module
            console.log(`📄 Module ${moduleIndex} (${module.title}):`, {
              hasMaterials: !!module.materials,
              materialsCount: module.materials ? module.materials.length : 0,
              materials: module.materials,
              hasQuiz: !!module.quiz,
              quizEnabled: module.quiz ? module.quiz.isEnabled : false,
              quiz: module.quiz,
              moduleKeys: Object.keys(module)
            });
            
            if (module.videos && module.videos.length > 0) {
              module.videos.forEach((video, videoIndex) => {
                allVideos.push({
                  ...video,
                  moduleTitle: module.title,
                  moduleId: module.id,
                  // Ensure we have the right properties for video display
                  id: video.id || `video-${moduleIndex}-${videoIndex}`,
                  title: video.title || `Video ${videoIndex + 1}`,
                  videoLink: video.videoLink,
                  duration: video.duration || '0:00',
                  isPreview: video.isPreview || false,
                  order: video.order || videoIndex,
                  type: 'video'
                });
              });
            }
          });
          setVideos(allVideos);
          console.log('Set up modules and videos:', { modules: response.course.modules, videos: allVideos });
        } else if (response.course.sections && response.course.sections.length > 0) {
          // Fallback to sections structure
          const allLectures = [];
          response.course.sections.forEach((section, sectionIndex) => {
            if (section.lectures) {
              section.lectures.forEach((lecture, lectureIndex) => {
                allLectures.push({
                  ...lecture,
                  sectionTitle: section.title,
                  // Ensure we have the right properties for video display
                  id: lecture._id || lecture.id,
                  title: lecture.title || lecture.name,
                  videoLink: lecture.videoLink || lecture.videoUrl,
                  duration: lecture.duration || '0:00',
                  isPreview: lecture.isPreview || false,
                  order: lecture.order || 0,
                  type: lecture.type || 'video'
                });
              });
            }
          });
          setVideos(allLectures);
        } else {
          // Fallback to old structure if no modules or sections exist
          if (response.course.videos && response.course.videos.length > 0) {
            setVideos(response.course.videos);
          } else if (response.course.videoLink) {
            // Create a single video from the main videoLink
            const singleVideo = [{
              id: 'video-1',
              title: 'Introduction',
              videoLink: response.course.videoLink,
              duration: '0:00',
              isPreview: true,
              order: 0,
              type: 'video'  // Ensure type is set to 'video'
            }];
            setVideos(singleVideo);
            console.log('Created single video from videoLink:', singleVideo);
          } else {
            setVideos([]);
          }
        }
      } else {
        toast.error('Course not found');
        navigate('/courses');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
      toast.error('Failed to load course');
      navigate('/courses');
    } finally {
      setIsLoading(false);
    }
  };


  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const toggleModule = (moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  const markLessonComplete = (lessonId) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
  };

  // Material download function
  const handleMaterialDownload = async (moduleIndex, materialIndex) => {
    try {
      setDownloadingMaterial({ moduleIndex, materialIndex, isDownloading: true });
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/courses/${courseId}/${moduleIndex}/${materialIndex}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Get filename from response headers or use default
      const contentDisposition = response.headers.get('content-disposition');
      let filename = 'material';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Track material download in progress
      try {
        const material = modules[moduleIndex].materials[materialIndex];
        await api(`/api/progress/course/${courseId}/material/${moduleIndex}/${materialIndex}`, {
          method: 'POST',
          body: {
            materialTitle: material.title
          }
        });
      } catch (progressError) {
        console.error('Error tracking material download:', progressError);
      }

      toast.success('Material downloaded successfully!');
    } catch (error) {
      console.error('Error downloading material:', error);
      toast.error('Failed to download material');
    } finally {
      setDownloadingMaterial({ moduleIndex: -1, materialIndex: -1, isDownloading: false });
    }
  };

  // Quiz navigation function
  const handleQuizStart = (moduleIndex) => {
    navigate(`/quiz/${courseId}/${moduleIndex}`);
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

  // Load quiz attempts for all modules and expand all modules by default
  useEffect(() => {
    if (modules.length > 0) {
      // Expand all modules by default so users can see materials and quiz
      const expanded = {};
      modules.forEach((module, index) => {
        // Use module index as key since modules don't have individual IDs
        expanded[index] = true;
        if (module.quiz && module.quiz.isEnabled) {
          checkQuizAttempt(index);
        }
      });
      setExpandedModules(expanded);
      console.log('🔓 Expanded all modules by default:', expanded);
      console.log('🔓 Modules that will be expanded:', Object.keys(expanded));
    }
  }, [modules]);


  const getTotalLessons = () => {
    return videos.length;
  };

  const getCompletedLessons = () => {
    return completedLessons.size;
  };

  const getProgressPercentage = () => {
    const total = getTotalLessons();
    return total > 0 ? (getCompletedLessons() / total) * 100 : 0;
  };

  const getCurrentVideo = () => {
    return videos[currentVideoIndex] || null;
  };

  const handleVideoSelect = (videoIndex) => {
    setCurrentVideoIndex(videoIndex);
    if (videos[videoIndex]) {
      markLessonComplete(videos[videoIndex].id || videos[videoIndex]._id);
    }
  };

  // Helper function to validate video URL
  const isValidVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    // Check for valid video file extensions
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.avi', '.mov', '.wmv', '.flv', '.mkv'];
    const hasVideoExtension = videoExtensions.some(ext => url.toLowerCase().includes(ext));
    
    // Check for valid video platforms
    const validVideoPlatforms = [
      'youtube.com', 'youtu.be', 'vimeo.com', 'dailymotion.com', 
      'twitch.tv', 'facebook.com', 'instagram.com', 'tiktok.com',
      'commondatastorage.googleapis.com', 'storage.googleapis.com'
    ];
    const hasValidPlatform = validVideoPlatforms.some(platform => url.includes(platform));
    
    // Exclude invalid URLs
    const invalidPatterns = [
      'flic.kr', 
      'search.yahoo.com', 
      'google.com/search',
      'youtube.com/results',
      'youtube.com/search'
    ];
    const hasInvalidPattern = invalidPatterns.some(pattern => url.includes(pattern));
    
    return (hasVideoExtension || hasValidPlatform) && !hasInvalidPattern;
  };

  // Convert video URL to embeddable format
  const getEmbeddableUrl = (url) => {
    if (!url || !isValidVideoUrl(url)) return null;
    
    // If it's already an embed URL, return as is
    if (url.includes('embed')) {
      return url;
    }
    
    // Convert YouTube watch URL to embed URL
    if (url.includes('youtube.com/watch')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convert YouTube short URL to embed URL
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // Convert Vimeo URL to embed URL
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
    
    // For other video platforms or direct video files, return as is
    return url;
  };

  if (isLoading) {
    return (
      <UserDashboardLayout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
              onClick={() => navigate('/courses')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Courses
            </button>
          </div>
        </div>
      </UserDashboardLayout>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/courses')}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{course.title}</h1>
                <p className="text-sm text-gray-600">by {course.professorName || course.instructor?.name || course.instructor || 'Instructor'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Share2 className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Download className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-80px)]">
          {/* Main Video Area */}
          <div className="flex-1 bg-black relative">
            {/* Video Player */}
            <div className="relative w-full h-full">
              {(() => {
                const currentVideo = getCurrentVideo();
                console.log('Current video:', currentVideo);
                console.log('Video link exists:', !!currentVideo?.videoLink);
                console.log('Video type:', currentVideo?.type);
                console.log('Is valid video URL:', currentVideo?.videoLink ? isValidVideoUrl(currentVideo.videoLink) : false);
                return currentVideo?.videoLink && currentVideo?.type === 'video' && isValidVideoUrl(currentVideo.videoLink);
              })() ? (
                // Check if it's a direct video file or embeddable URL
                getCurrentVideo().videoLink.includes('.mp4') || getCurrentVideo().videoLink.includes('.webm') || getCurrentVideo().videoLink.includes('.ogg') ? (
                  <video
                    src={getCurrentVideo().videoLink}
                    className="w-full h-full"
                    autoPlay={false}
                    onError={(e) => {
                      console.error('Video load error:', e);
                      toast.error('Failed to load video. The video URL may be invalid or the video may not be available.');
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : (
                  <iframe
                    src={getEmbeddableUrl(getCurrentVideo().videoLink)}
                    className="w-full h-full"
                    allowFullScreen
                    title={getCurrentVideo().title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    onError={() => {
                      console.error('Iframe load error');
                      toast.error('Failed to load video. The video URL may be invalid or the video may not be available.');
                    }}
                  />
                )
              ) : getCurrentVideo()?.type === 'text' ? (
                <div className="flex items-center justify-center h-full bg-white p-8">
                  <div className="text-center text-gray-800 max-w-2xl">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 text-blue-600" />
                    <h3 className="text-2xl font-bold mb-4">{getCurrentVideo()?.title}</h3>
                    <p className="text-lg text-gray-600">{getCurrentVideo()?.description}</p>
                    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                      <p className="text-sm text-gray-500">This is a text-based lesson. Read through the content and mark it as complete when finished.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-900">
                  <div className="text-center text-white">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg mb-2">
                      {getCurrentVideo()?.videoLink && !isValidVideoUrl(getCurrentVideo().videoLink) 
                        ? 'Invalid video URL' 
                        : 'No video content available'
                      }
                    </p>
                    <p className="text-sm opacity-75 mb-4">
                      {getCurrentVideo()?.videoLink && !isValidVideoUrl(getCurrentVideo().videoLink)
                        ? 'The video URL provided is not valid or the video is not accessible. Please contact the instructor to update the video link.'
                        : 'This course doesn\'t have any video content yet.'
                      }
                    </p>
                    <button
                      onClick={() => navigate('/course-dashboard')}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Other Courses
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            {/* Course Progress */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Course Progress</span>
                <span className="text-sm text-gray-500">
                  {courseProgress ? `${courseProgress.completedModules}/${courseProgress.totalModules} modules` : `${getCompletedLessons()}/${getTotalLessons()} lessons`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${courseProgress ? courseProgress.overallProgress : getProgressPercentage()}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {courseProgress ? `${courseProgress.overallProgress}% Complete` : `${Math.round(getProgressPercentage())}% Complete`}
              </p>
            </div>

            {/* Course Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
                
                {modules && modules.length > 0 ? (
                  <div className="space-y-2">
                    {modules.map((module, moduleIndex) => {
                      // Debug logging
                      console.log(`🎯 RENDERING Module ${moduleIndex}:`, {
                        title: module.title,
                        hasMaterials: module.materials && module.materials.length > 0,
                        materialsCount: module.materials ? module.materials.length : 0,
                        hasQuiz: module.quiz && module.quiz.isEnabled,
                        quiz: module.quiz,
                        isExpanded: expandedModules[moduleIndex],
                        expandedModulesState: expandedModules
                      });
                      
                      return (
                      <div key={moduleIndex} className="border border-gray-200 rounded-lg">
                        {/* Module Header */}
                        <div
                          className="p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => toggleModule(moduleIndex)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {expandedModules[moduleIndex] ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              )}
                              <BookOpen className="w-4 h-4 text-blue-600" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-gray-900">
                                    Module {module.order + 1}: {module.title}
                                  </h4>
                                  {courseProgress && courseProgress.modules[moduleIndex]?.isCompleted && (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  )}
                                </div>
                                {module.description && (
                                  <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {module.videos.length} videos
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {module.videos.reduce((total, video) => {
                                      const duration = video.duration.split(':');
                                      return total + (parseInt(duration[0]) * 60 + parseInt(duration[1] || 0));
                                    }, 0)} min total
                                  </span>
                                  {module.materials && module.materials.length > 0 && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                                      📄 {module.materials.length} materials
                                    </span>
                                  )}
                                  {module.quiz && module.quiz.isEnabled && (
                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-medium">
                                      ❓ Quiz Available
                                    </span>
                                  )}
                                  {courseProgress && courseProgress.modules[moduleIndex] && (
                                    <span className="text-xs text-blue-600">
                                      {courseProgress.modules[moduleIndex].completionCriteria.videosWatched}/{courseProgress.modules[moduleIndex].completionCriteria.videosRequired} watched
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Module Videos */}
                        {expandedModules[moduleIndex] && module.videos && module.videos.length > 0 && (
                          <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <div className="space-y-1">
                              {module.videos.map((video, videoIndex) => {
                                const globalVideoIndex = videos.findIndex(v => v.id === video.id);
                                return (
                                  <div
                                    key={video.id}
                                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                                      currentVideoIndex === globalVideoIndex 
                                        ? 'bg-blue-50 border border-blue-200' 
                                        : 'hover:bg-white'
                                    }`}
                                    onClick={() => handleVideoSelect(globalVideoIndex)}
                                  >
                                    <div className="flex items-center space-x-3">
                                      {completedLessons.has(video.id) ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      ) : video.isPreview ? (
                                        <Play className="w-4 h-4 text-blue-600" />
                                      ) : (
                                        <Play className="w-4 h-4 text-gray-400" />
                                      )}
                                      <div className="flex flex-col">
                                        <span className={`text-sm ${
                                          completedLessons.has(video.id) 
                                            ? 'text-green-600' 
                                            : currentVideoIndex === globalVideoIndex 
                                              ? 'text-blue-600 font-medium' 
                                              : 'text-gray-700'
                                        }`}>
                                          {video.title}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs text-gray-500">{video.duration}</span>
                                      {video.isPreview && (
                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Preview</span>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Materials Section */}
                        {expandedModules[moduleIndex] && (
                          console.log(`📄 Module ${moduleIndex} expanded, checking materials:`, {
                            hasMaterials: !!module.materials,
                            materialsCount: module.materials ? module.materials.length : 0,
                            materials: module.materials,
                            moduleTitle: module.title,
                            moduleIndex: moduleIndex,
                            expandedState: expandedModules[moduleIndex]
                          }) ||
                          (module.materials && module.materials.length > 0) && (
                            console.log(`📄 Showing materials for module ${moduleIndex}:`, module.materials) ||
                          <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <div className="flex items-center gap-2 mb-3">
                              <FileText className="w-4 h-4 text-blue-600" />
                              <h5 className="font-medium text-gray-900">Course Materials</h5>
                            </div>
                            <div className="space-y-2">
                              {module.materials.map((material, materialIndex) => (
                                <div
                                  key={materialIndex}
                                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">{material.title}</p>
                                      <p className="text-xs text-gray-500">{material.originalName}</p>
                                    </div>
                                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                      {material.type.toUpperCase()}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => handleMaterialDownload(moduleIndex, materialIndex)}
                                    disabled={downloadingMaterial.moduleIndex === moduleIndex && downloadingMaterial.materialIndex === materialIndex}
                                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
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
                          </div>
                          )
                        )}


                        {/* Quiz Section */}
                        {expandedModules[moduleIndex] && module.quiz && module.quiz.isEnabled && (
                          console.log(`❓ Showing quiz for module ${moduleIndex}:`, {
                            quiz: module.quiz,
                            isEnabled: module.quiz.isEnabled,
                            moduleIndex: moduleIndex,
                            expandedState: expandedModules[moduleIndex]
                          }) ||
                          <div className="border-t border-gray-200 p-3 bg-gray-50">
                            <div className="flex items-center gap-2 mb-3">
                              <HelpCircle className="w-4 h-4 text-green-600" />
                              <h5 className="font-medium text-gray-900">Module Quiz</h5>
                            </div>
                            <div className="bg-white rounded-lg border border-gray-200 p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h6 className="font-medium text-gray-900">Quiz Available</h6>
                                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                                    <span>{module.quiz.totalQuestions} questions</span>
                                    <span>{module.quiz.timeLimit} minutes</span>
                                    <span>{module.quiz.passingScore}% passing score</span>
                                  </div>
                                  {quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted && (
                                    <div className="mt-2">
                                      <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                                        Already Attempted
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleQuizStart(moduleIndex)}
                                  disabled={quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted}
                                  className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                                    quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {quizAttempts[moduleIndex] && quizAttempts[moduleIndex].hasAttempted ? (
                                    <>
                                      <CheckCircle className="w-4 h-4" />
                                      Completed
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
                          </div>
                        )}

                        {/* DEBUG: Force Show Materials and Quiz for Testing */}
                        <div className="border-t border-red-200 p-3 bg-red-50 mt-2">
                          <div className="text-sm text-red-700">
                            <p><strong>DEBUG INFO:</strong></p>
                            <p>Module: {module.title}</p>
                            <p>Module Index: {moduleIndex}</p>
                            <p>Is Expanded: {expandedModules[moduleIndex] ? 'YES' : 'NO'}</p>
                            <p>Has Materials: {module.materials ? 'YES' : 'NO'}</p>
                            <p>Materials Count: {module.materials ? module.materials.length : 0}</p>
                            <p>Has Quiz: {module.quiz ? 'YES' : 'NO'}</p>
                            <p>Quiz Enabled: {module.quiz ? module.quiz.isEnabled ? 'YES' : 'NO' : 'NO'}</p>
                            <p>Expanded Modules State: {JSON.stringify(expandedModules)}</p>
                          </div>
                        </div>
                      </div>
                      );
                    })}
                  </div>
                ) : videos && videos.length > 0 ? (
                  <div className="space-y-1">
                    {videos.map((video, index) => (
                      <div
                        key={video.id || video._id || `video-${index}`}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                          currentVideoIndex === index 
                            ? 'bg-blue-50 border border-blue-200' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleVideoSelect(index)}
                      >
                        <div className="flex items-center space-x-3">
                          {completedLessons.has(video.id) ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : video.isPreview ? (
                            <BookOpen className="w-4 h-4 text-blue-600" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-gray-400" />
                          )}
                          <div className="flex flex-col">
                            <span className={`text-sm ${
                              completedLessons.has(video.id) 
                                ? 'text-green-600' 
                                : currentVideoIndex === index 
                                  ? 'text-blue-600 font-medium' 
                                  : 'text-gray-700'
                            }`}>
                              {video.title}
                            </span>
                            {video.sectionTitle && (
                              <span className="text-xs text-gray-500">{video.sectionTitle}</span>
                            )}
                            {video.moduleTitle && (
                              <span className="text-xs text-gray-500">{video.moduleTitle}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">{video.duration}</span>
                          {video.isPreview && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Preview</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">No videos available for this course</p>
                    <p className="text-sm text-gray-400 mb-4">
                      This course doesn't have any video content yet. Please check back later or contact the instructor.
                    </p>
                    <button
                      onClick={() => navigate('/course-dashboard')}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Browse Other Courses
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Course Info */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-700">{getTotalLessons()} lessons</span>
                </div>
                {modules && modules.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">{modules.length} modules</span>
                  </div>
                )}
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
    </UserDashboardLayout>
  );
};

export default CoursePlayerPage;
