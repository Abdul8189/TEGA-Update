import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';
import { Upload, FileText, Video, User, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import CourseModuleManager from './CourseModuleManager.jsx';

const CourseUploadForm = ({ onCourseUploaded }) => {
  const [formData, setFormData] = useState({
    title: '',
    videoLink: '',
    professorName: '',
    description: '',
    category: 'programming',
    difficulty: 'beginner',
    price: 799,
    duration: '4 weeks'
  });

  const [modules, setModules] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validation[name]) {
      setValidation(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Course title is required';
    if (!formData.videoLink.trim()) errors.videoLink = 'Video link is required';
    if (!formData.professorName.trim()) errors.professorName = 'Professor name is required';
    if (!formData.description.trim()) errors.description = 'Course description is required';
    
    // Validate video link format
    if (formData.videoLink && !isValidUrl(formData.videoLink)) {
      errors.videoLink = 'Please enter a valid URL';
    }

    setValidation(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors');
      return;
    }

    // Check for incomplete modules
    const incompleteModules = modules.filter(module => module.videos.length === 0);
    if (incompleteModules.length > 0) {
      const confirmed = window.confirm(`You have ${incompleteModules.length} module(s) without videos. Do you want to proceed anyway? You can add videos later.`);
      if (!confirmed) {
        return;
      }
    }

    setIsLoading(true);
    
    try {
      const requestBody = {
        ...formData,
        modules: modules
      };
      console.log('Sending course data:', requestBody);
      
      const response = await api('/api/courses/upload', {
        method: 'POST',
        body: requestBody
      });

      toast.success('Course uploaded successfully!');
      
      // Reset form
      setFormData({
        title: '',
        videoLink: '',
        professorName: '',
        description: '',
        category: 'programming',
        difficulty: 'beginner',
        price: 799,
        duration: '4 weeks'
      });
      setModules([]);

      // Notify parent component
      if (onCourseUploaded) {
        onCourseUploaded(response.course);
      }

    } catch (error) {
      console.error('Course upload error:', error);
      toast.error(error.message || 'Failed to upload course');
    } finally {
      setIsLoading(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, borderColor: '#6366f1' },
    blur: { scale: 1, borderColor: '#e5e7eb' }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Upload className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Upload New Course</h2>
          <p className="text-sm text-gray-600">Add a single course to the platform</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <BookOpen className="w-4 h-4 inline mr-2" />
            Course Title *
          </label>
          <motion.input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              validation.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter course title"
            whileFocus="focus"
            initial="blur"
            variants={inputVariants}
          />
          {validation.title && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1 flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              {validation.title}
            </motion.p>
          )}
        </div>

        {/* Video Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Video className="w-4 h-4 inline mr-2" />
            Video Link/URL *
          </label>
          <motion.input
            type="url"
            name="videoLink"
            value={formData.videoLink}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              validation.videoLink ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="https://example.com/video"
            whileFocus="focus"
            initial="blur"
            variants={inputVariants}
          />
          {validation.videoLink && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1 flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              {validation.videoLink}
            </motion.p>
          )}
        </div>

        {/* Professor Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Professor Name *
          </label>
          <motion.input
            type="text"
            name="professorName"
            value={formData.professorName}
            onChange={handleChange}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
              validation.professorName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter professor name"
            whileFocus="focus"
            initial="blur"
            variants={inputVariants}
          />
          {validation.professorName && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1 flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              {validation.professorName}
            </motion.p>
          )}
        </div>

        {/* Course Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-2" />
            Course Description *
          </label>
          <motion.textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
              validation.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter detailed course description"
            whileFocus="focus"
            initial="blur"
            variants={inputVariants}
          />
          {validation.description && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1 flex items-center gap-1"
            >
              <XCircle className="w-4 h-4" />
              {validation.description}
            </motion.p>
          )}
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="programming">Programming</option>
              <option value="ai">AI & Machine Learning</option>
              <option value="web">Web Development</option>
              <option value="cloud">Cloud Computing</option>
              <option value="cyber">Cybersecurity</option>
              <option value="office">Office Skills</option>
              <option value="comprehensive">Comprehensive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
            <input
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 4 weeks, 2 months"
            />
          </div>
        </div>

        {/* Course Modules */}
        <div className="mt-6">
          <CourseModuleManager 
            modules={modules} 
            onModulesChange={setModules}
            courseId={null} // New course, no ID yet
            courseName={formData.title || "New Course"}
          />
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: isLoading ? 1 : 1.02 }}
          whileTap={{ scale: isLoading ? 1 : 0.98 }}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Uploading...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Upload Course
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
};

export default CourseUploadForm;
