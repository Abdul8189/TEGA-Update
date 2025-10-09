import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';
import CourseModuleManager from './CourseModuleManager.jsx';
import { 
  X,
  Save,
  AlertCircle
} from 'lucide-react';

const CourseEditModal = ({ isOpen, onClose, course, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState({});
  
  // Course data
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    category: 'programming',
    difficulty: 'beginner',
    price: 799,
    duration: '4 weeks',
    language: 'English',
    professorName: '',
    videoLink: ''
  });

  // Modules data
  const [modules, setModules] = useState([]);

  useEffect(() => {
    if (course && isOpen) {
      console.log('=== CourseEditModal: Loading course data ===');
      console.log('Full course object:', course);
      console.log('Course modules:', course.modules);
      console.log('Course modules type:', typeof course.modules);
      console.log('Course modules is array:', Array.isArray(course.modules));
      console.log('Course modules length:', course.modules ? course.modules.length : 'undefined');
      
      setCourseData({
        title: course.title || course.courseName || '',
        description: course.description || '',
        category: course.category || 'programming',
        difficulty: course.difficulty || course.level?.toLowerCase() || 'beginner',
        price: course.price || 799,
        duration: course.duration || '4 weeks',
        language: course.language || 'English',
        professorName: course.professorName || course.instructor || '',
        videoLink: course.videoLink || ''
      });
      
      const courseModules = Array.isArray(course.modules) ? course.modules : [];
      console.log('Setting modules to state:', courseModules);
      console.log('Modules count:', courseModules.length);
      
      // Debug each module's materials and quiz
      courseModules.forEach((module, index) => {
        console.log(`Module ${index} (${module.title}):`, {
          hasMaterials: !!module.materials,
          materialsCount: module.materials ? module.materials.length : 0,
          materials: module.materials,
          hasQuiz: !!module.quiz,
          quiz: module.quiz
        });
      });
      
      setModules(courseModules);
      console.log('=== CourseEditModal: Data loading complete ===');
    }
  }, [course, isOpen]);

  const handleCourseDataChange = (field, value) => {
    setCourseData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (validation[field]) {
      setValidation(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!courseData.title.trim()) {
      errors.title = 'Course title is required';
    }
    
    if (!courseData.description.trim()) {
      errors.description = 'Course description is required';
    }
    
    if (!courseData.category) {
      errors.category = 'Course category is required';
    }
    
    if (!courseData.difficulty) {
      errors.difficulty = 'Difficulty level is required';
    }
    
    if (!courseData.price || courseData.price <= 0) {
      errors.price = 'Price must be greater than 0';
    }
    
    if (!courseData.duration.trim()) {
      errors.duration = 'Duration is required';
    }
    
    if (!courseData.professorName.trim()) {
      errors.professorName = 'Professor name is required';
    }
    
    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const getTotalVideos = () => {
    return modules.reduce((total, module) => {
      return total + (module.videos ? module.videos.length : 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    setIsLoading(true);
    
    try {
      const requestBody = {
        ...courseData,
        modules: modules
      };
      
      console.log('Sending updated course data:', requestBody);
      console.log('Professor name being sent:', courseData.professorName);
      
      // Debug course ID
      console.log('Course object:', course);
      console.log('Course._id:', course._id);
      console.log('Course.courseId:', course.courseId);
      console.log('Course.id:', course.id);
      
      // Use courseId if _id is not available, check id field as well
      const courseId = course._id || course.courseId || course.id;
      console.log('Using courseId:', courseId);
      
      if (!courseId) {
        throw new Error('Course ID is missing');
      }
      
      console.log('Making API call to:', `/api/admin/courses/${courseId}`);
      console.log('Request body:', requestBody);
      
      const response = await api(`/api/admin/courses/${courseId}`, {
        method: 'PUT',
        body: requestBody
      });

      console.log('API response:', response);

      if (!response.success) {
        throw new Error(response.message || 'Update failed');
      }

      toast.success('Course updated successfully!');
      
      // Notify parent component
      if (onSave) {
        onSave(courseId, response.course || requestBody);
      }

      onClose();

    } catch (error) {
      console.error('Course update error:', error);
      toast.error(error.message || 'Failed to update course');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence mode="wait">
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          key="course-edit-modal"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Course</h2>
                <p className="text-sm text-gray-600">Update course details and manage modules</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Course Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={courseData.title}
                    onChange={(e) => handleCourseDataChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validation.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter course title"
                  />
                  {validation.title && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validation.title}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Professor Name *
                  </label>
                  <input
                    type="text"
                    value={courseData.professorName}
                    onChange={(e) => handleCourseDataChange('professorName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validation.professorName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter professor name"
                  />
                  {validation.professorName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validation.professorName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={courseData.category}
                    onChange={(e) => handleCourseDataChange('category', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validation.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="programming">Programming</option>
                    <option value="ai">Artificial Intelligence</option>
                    <option value="web">Web Development</option>
                    <option value="cloud">Cloud Computing</option>
                    <option value="cyber">Cybersecurity</option>
                    <option value="office">Office Applications</option>
                    <option value="comprehensive">Comprehensive</option>
                    <option value="data-science">Data Science</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="devops">DevOps</option>
                  </select>
                  {validation.category && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validation.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    value={courseData.difficulty}
                    onChange={(e) => handleCourseDataChange('difficulty', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validation.difficulty ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  {validation.difficulty && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validation.difficulty}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    value={courseData.price}
                    onChange={(e) => handleCourseDataChange('price', parseInt(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validation.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter course price"
                    min="0"
                  />
                  {validation.price && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validation.price}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={courseData.duration}
                    onChange={(e) => handleCourseDataChange('duration', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validation.duration ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., 4 weeks, 2 months"
                  />
                  {validation.duration && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {validation.duration}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={courseData.language}
                    onChange={(e) => handleCourseDataChange('language', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., English, Hindi"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Main Video URL
                  </label>
                  <input
                    type="url"
                    value={courseData.videoLink}
                    onChange={(e) => handleCourseDataChange('videoLink', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course Description *
                </label>
                <textarea
                  value={courseData.description}
                  onChange={(e) => handleCourseDataChange('description', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validation.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  rows="4"
                  placeholder="Describe what students will learn in this course..."
                />
                {validation.description && (
                  <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {validation.description}
                  </p>
                )}
              </div>
            </div>

            {/* Modules Management */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
                <div className="text-sm text-gray-500">
                  {modules.length} modules • {getTotalVideos()} videos
                </div>
              </div>
              
              {/* Use the new CourseModuleManager component */}
              <CourseModuleManager 
                modules={modules}
                onModulesChange={setModules}
                courseId={course?._id}
                courseName={courseData.title}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Update Course
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CourseEditModal;