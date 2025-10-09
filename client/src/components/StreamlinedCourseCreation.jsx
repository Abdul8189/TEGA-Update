import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';
import { 
  Upload, 
  FileText, 
  Video, 
  User, 
  BookOpen, 
  CheckCircle, 
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  ChevronDown,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  Play,
  AlertCircle,
  Info,
  Copy,
  ExternalLink,
  ArrowLeft,
  ArrowRight,
  Download,
  HelpCircle,
  Settings
} from 'lucide-react';

const StreamlinedCourseCreation = ({ onCourseCreated }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState({});
  
  // Course basic information
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

  // Current module being created
  const [currentModule, setCurrentModule] = useState({
    title: '',
    description: '',
    order: 0,
    videos: [],
    materials: [],
    quiz: {
      isEnabled: false,
      timeLimit: 60,
      passingScore: 60,
      maxAttempts: 1,
      file: null
    }
  });

  // All modules created so far
  const [modules, setModules] = useState([]);

  // Current video being added
  const [currentVideo, setCurrentVideo] = useState({
    title: '',
    videoLink: '',
    duration: '0:00',
    isPreview: false
  });

  // Current material being added
  const [currentMaterial, setCurrentMaterial] = useState({
    title: '',
    type: 'pdf',
    file: null
  });

  // Bulk video URLs for current module
  const [bulkVideoUrls, setBulkVideoUrls] = useState('');

  const steps = [
    { id: 1, title: 'Course Details', description: 'Basic course information' },
    { id: 2, title: 'Create Modules', description: 'Add modules with videos' },
    { id: 3, title: 'Review & Publish', description: 'Final review and publish' }
  ];

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

  const validateStep1 = () => {
    const errors = {};
    
    if (!courseData.title.trim()) errors.title = 'Course title is required';
    if (!courseData.description.trim()) errors.description = 'Course description is required';
    if (!courseData.professorName.trim()) errors.professorName = 'Professor name is required';
    if (!courseData.videoLink.trim()) errors.videoLink = 'Main video link is required';
    
    // Validate video link format
    if (courseData.videoLink && !isValidUrl(courseData.videoLink)) {
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

  const addVideoToCurrentModule = () => {
    if (!currentVideo.title.trim() || !currentVideo.videoLink.trim()) {
      toast.error('Please fill in video title and link');
      return;
    }

    const video = {
      id: `video-${Date.now()}`,
      title: currentVideo.title,
      videoLink: currentVideo.videoLink,
      duration: currentVideo.duration,
      isPreview: currentVideo.isPreview,
      order: currentModule.videos.length
    };

    setCurrentModule(prev => ({
      ...prev,
      videos: [...prev.videos, video]
    }));
    
    setCurrentVideo({
      title: '',
      videoLink: '',
      duration: '0:00',
      isPreview: false
    });
    toast.success('Video added to current module');
  };

  const addBulkVideosToCurrentModule = () => {
    if (!bulkVideoUrls.trim()) {
      toast.error('Please enter video URLs');
      return;
    }

    const urls = bulkVideoUrls.split('\n').filter(url => url.trim());
    if (urls.length === 0) {
      toast.error('No valid URLs found');
      return;
    }

    const videos = urls.map((url, index) => ({
      id: `video-${Date.now()}-${index}`,
      title: `Video ${currentModule.videos.length + index + 1}`,
      videoLink: url.trim(),
      duration: '0:00',
      isPreview: false,
      order: currentModule.videos.length + index
    }));

    setCurrentModule(prev => ({
      ...prev,
      videos: [...prev.videos, ...videos]
    }));
    
    setBulkVideoUrls('');
    toast.success(`${videos.length} videos added to current module`);
  };

  const removeVideoFromCurrentModule = (videoIndex) => {
    setCurrentModule(prev => ({
      ...prev,
      videos: prev.videos.filter((_, index) => index !== videoIndex)
    }));
    toast.success('Video removed from current module');
  };

  // Material management functions
  const addMaterialToCurrentModule = () => {
    if (!currentMaterial.title.trim() || !currentMaterial.file) {
      toast.error('Please provide material title and select a file');
      return;
    }

    // Validate file size (50MB limit)
    if (currentMaterial.file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    const material = {
      id: `material-${Date.now()}`,
      title: currentMaterial.title.trim(),
      type: currentMaterial.type,
      file: currentMaterial.file,
      originalName: currentMaterial.file.name,
      fileSize: currentMaterial.file.size
    };

    setCurrentModule(prev => ({
      ...prev,
      materials: [...prev.materials, material]
    }));

    setCurrentMaterial({
      title: '',
      type: 'pdf',
      file: null
    });
    toast.success('Material added to current module');
  };

  const removeMaterialFromCurrentModule = (materialIndex) => {
    setCurrentModule(prev => ({
      ...prev,
      materials: prev.materials.filter((_, index) => index !== materialIndex)
    }));
    toast.success('Material removed from current module');
  };

  const handleMaterialFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedTypes = ['pdf', 'ppt', 'pptx', 'doc', 'docx'];
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please select a PDF, PPT, or DOC file');
        return;
      }

      setCurrentMaterial(prev => ({ ...prev, file }));
    }
  };

  // Quiz management functions
  const handleQuizFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedTypes = ['xlsx', 'xls'];
      
      if (!allowedTypes.includes(fileExtension)) {
        toast.error('Please select an Excel file (.xlsx or .xls)');
        return;
      }

      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }

      setCurrentModule(prev => ({
        ...prev,
        quiz: {
          ...prev.quiz,
          file: file,
          isEnabled: true
        }
      }));
      toast.success('Quiz file added to current module');
    }
  };

  const removeQuizFromCurrentModule = () => {
    setCurrentModule(prev => ({
      ...prev,
      quiz: {
        isEnabled: false,
        timeLimit: 60,
        passingScore: 60,
        maxAttempts: 1,
        file: null
      }
    }));
    toast.success('Quiz removed from current module');
  };

  const saveCurrentModule = () => {
    console.log('=== Save Current Module Called ===');
    console.log('Current module data:', currentModule);
    console.log('Current module title:', currentModule.title);
    console.log('Current module title trimmed:', currentModule.title.trim());
    console.log('Current module videos:', currentModule.videos);
    
    if (!currentModule.title.trim()) {
      console.log('Error: Module title is empty');
      toast.error('Please enter module title');
      return;
    }

    // Allow modules without videos but show a warning
    if (currentModule.videos.length === 0) {
      console.log('Warning: Module has no videos');
      const confirmed = window.confirm('This module has no videos. Are you sure you want to save it? You can add videos later.');
      if (!confirmed) {
        console.log('User cancelled saving module without videos');
        return;
      }
    }

    const module = {
      id: `module-${Date.now()}`,
      title: currentModule.title,
      description: currentModule.description,
      order: modules.length,
      videos: [...currentModule.videos],
      materials: [...currentModule.materials],
      quiz: { ...currentModule.quiz }
    };

    console.log('Saving module:', module);
    console.log('Current modules count:', modules.length);

    setModules(prev => {
      const updated = [...prev, module];
      console.log('Updated modules:', updated);
      return updated;
    });
    
    // Reset current module
    const newOrder = modules.length + 1;
    console.log('Resetting current module with order:', newOrder);
    setCurrentModule({
      title: '',
      description: '',
      order: newOrder,
      videos: [],
      materials: [],
      quiz: {
        isEnabled: false,
        timeLimit: 60,
        passingScore: 60,
        maxAttempts: 1,
        file: null
      }
    });
    
    setBulkVideoUrls('');
    toast.success(`Module saved successfully! ${currentModule.videos.length === 0 ? 'Remember to add videos later.' : 'You can now add another module.'}`);
    console.log('=== Save Current Module Complete ===');
  };

  const removeModule = (moduleIndex) => {
    setModules(prev => {
      const updated = prev.filter((_, i) => i !== moduleIndex);
      // Update order for remaining modules
      updated.forEach((module, i) => {
        module.order = i;
      });
      return updated;
    });
    toast.success('Module removed successfully');
  };

  const getTotalVideos = () => {
    return modules.reduce((total, module) => total + module.videos.length, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep1()) {
      setCurrentStep(1);
      toast.error('Please fix the validation errors');
      return;
    }

    if (modules.length === 0) {
      toast.error('Please add at least one module to the course');
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
      // Prepare modules without file objects for initial course creation
      const modulesForCreation = modules.map(module => ({
        ...module,
        materials: module.materials.map(material => ({
          title: material.title,
          type: material.type,
          originalName: material.originalName,
          fileSize: material.fileSize
          // Note: file object is excluded for JSON serialization
        })),
        quiz: module.quiz.file ? {
          isEnabled: module.quiz.isEnabled,
          timeLimit: module.quiz.timeLimit,
          passingScore: module.quiz.passingScore,
          maxAttempts: module.quiz.maxAttempts,
          originalFileName: module.quiz.file.name
          // Note: file object is excluded for JSON serialization
        } : module.quiz
      }));

      const requestBody = {
        ...courseData,
        modules: modulesForCreation
      };
      
      console.log('=== FRONTEND COURSE CREATION DEBUG ===');
      console.log('Sending course data:', requestBody);
      console.log('Modules being sent:', modulesForCreation);
      console.log('Modules length:', modulesForCreation.length);
      console.log('API endpoint: /api/courses/upload');
      
      const adminToken = localStorage.getItem('adminToken');
      console.log('Admin token present:', !!adminToken);
      
      const response = await api('/api/courses/upload', {
        method: 'POST',
        body: requestBody,
        token: adminToken
      });
      
      console.log('Response received:', response);

      if (!response.success || !response.course) {
        throw new Error(response.message || 'Course creation failed');
      }

      const courseId = response.course._id || response.course.id;
      console.log('Course created with ID:', courseId);

      // Now upload materials and quiz files for each module
      try {
        await uploadModuleFiles(courseId, modules);
        toast.success('Course created successfully with all materials and quizzes!');
      } catch (uploadError) {
        console.error('File upload error:', uploadError);
        toast.warning('Course created successfully, but some files may not have uploaded. You can add them later.');
      }
      
      // Reset form
      setCourseData({
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
      setModules([]);
      setCurrentModule({
        title: '',
        description: '',
        order: 0,
        videos: [],
        materials: [],
        quiz: {
          isEnabled: false,
          timeLimit: 60,
          passingScore: 60,
          maxAttempts: 1,
          file: null
        }
      });
      setCurrentStep(1);

      // Notify parent component
      if (onCourseCreated) {
        onCourseCreated(response.course);
      }

    } catch (error) {
      console.error('Course creation error:', error);
      toast.error(error.message || 'Failed to create course');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to upload materials and quiz files for each module
  const uploadModuleFiles = async (courseId, modules) => {
    console.log('=== UPLOADING MODULE FILES ===');
    console.log('Course ID:', courseId);
    console.log('Modules to process:', modules.length);

    let uploadErrors = [];

    for (let moduleIndex = 0; moduleIndex < modules.length; moduleIndex++) {
      const module = modules[moduleIndex];
      console.log(`Processing module ${moduleIndex}: ${module.title}`);

      // Upload materials for this module
      if (module.materials && module.materials.length > 0) {
        console.log(`Uploading ${module.materials.length} materials for module ${moduleIndex}`);
        
        for (let materialIndex = 0; materialIndex < module.materials.length; materialIndex++) {
          const material = module.materials[materialIndex];
          console.log(`Uploading material ${materialIndex}: ${material.title}`);

          try {
            if (!material.file) {
              console.warn(`⚠️ Material ${material.title} has no file, skipping upload`);
              continue;
            }

            const formData = new FormData();
            formData.append('file', material.file);
            formData.append('title', material.title);
            formData.append('type', material.type);
            formData.append('moduleIndex', moduleIndex);

            const materialResponse = await api(`/api/courses/${courseId}/upload-material`, {
              method: 'POST',
              body: formData
            });

            if (materialResponse.success) {
              console.log(`✅ Material uploaded successfully: ${material.title}`);
            } else {
              const error = `Failed to upload material: ${material.title} - ${materialResponse.message}`;
              console.error(`❌ ${error}`);
              uploadErrors.push(error);
            }
          } catch (error) {
            const errorMsg = `Error uploading material ${material.title}: ${error.message}`;
            console.error(`❌ ${errorMsg}`);
            uploadErrors.push(errorMsg);
          }
        }
      }

      // Upload quiz for this module
      if (module.quiz && module.quiz.file) {
        console.log(`Uploading quiz for module ${moduleIndex}`);

        try {
          const formData = new FormData();
          formData.append('file', module.quiz.file);
          formData.append('timeLimit', module.quiz.timeLimit);
          formData.append('passingScore', module.quiz.passingScore);
          formData.append('maxAttempts', module.quiz.maxAttempts);
          formData.append('moduleIndex', moduleIndex);

          const quizResponse = await api(`/api/courses/${courseId}/upload-quiz`, {
            method: 'POST',
            body: formData
          });

          if (quizResponse.success) {
            console.log(`✅ Quiz uploaded successfully for module ${moduleIndex}`);
          } else {
            const error = `Failed to upload quiz for module ${moduleIndex}: ${quizResponse.message}`;
            console.error(`❌ ${error}`);
            uploadErrors.push(error);
          }
        } catch (error) {
          const errorMsg = `Error uploading quiz for module ${moduleIndex}: ${error.message}`;
          console.error(`❌ ${errorMsg}`);
          uploadErrors.push(errorMsg);
        }
      }
    }

    console.log('=== MODULE FILES UPLOAD COMPLETE ===');
    
    if (uploadErrors.length > 0) {
      console.warn('⚠️ Upload errors occurred:', uploadErrors);
      throw new Error(`Some files failed to upload: ${uploadErrors.join(', ')}`);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Information</h2>
        <p className="text-gray-600">Provide the basic details for your course</p>
      </div>

      {/* Course Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <BookOpen className="w-4 h-4 inline mr-2" />
          Course Title *
        </label>
        <input
          type="text"
          value={courseData.title}
          onChange={(e) => handleCourseDataChange('title', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            validation.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter course title"
        />
        {validation.title && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            {validation.title}
          </p>
        )}
      </div>

      {/* Course Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-2" />
          Course Description *
        </label>
        <textarea
          value={courseData.description}
          onChange={(e) => handleCourseDataChange('description', e.target.value)}
          rows={4}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none ${
            validation.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter detailed course description"
        />
        {validation.description && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            {validation.description}
          </p>
        )}
      </div>

      {/* Professor Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="w-4 h-4 inline mr-2" />
          Professor Name *
        </label>
        <input
          type="text"
          value={courseData.professorName}
          onChange={(e) => handleCourseDataChange('professorName', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            validation.professorName ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter professor name"
        />
        {validation.professorName && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            {validation.professorName}
          </p>
        )}
      </div>

      {/* Main Video Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Video className="w-4 h-4 inline mr-2" />
          Main Video Link/URL *
        </label>
        <input
          type="url"
          value={courseData.videoLink}
          onChange={(e) => handleCourseDataChange('videoLink', e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
            validation.videoLink ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="https://example.com/video"
        />
        {validation.videoLink && (
          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
            <XCircle className="w-4 h-4" />
            {validation.videoLink}
          </p>
        )}
      </div>

      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={courseData.category}
            onChange={(e) => handleCourseDataChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="programming">Programming</option>
            <option value="ai">AI & Machine Learning</option>
            <option value="web">Web Development</option>
            <option value="cloud">Cloud Computing</option>
            <option value="cyber">Cybersecurity</option>
            <option value="office">Office Skills</option>
            <option value="comprehensive">Comprehensive</option>
            <option value="data-science">Data Science</option>
            <option value="mobile">Mobile Development</option>
            <option value="devops">DevOps</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
          <select
            value={courseData.difficulty}
            onChange={(e) => handleCourseDataChange('difficulty', e.target.value)}
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
            value={courseData.price}
            onChange={(e) => handleCourseDataChange('price', parseFloat(e.target.value))}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
          <input
            type="text"
            value={courseData.duration}
            onChange={(e) => handleCourseDataChange('duration', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 4 weeks, 2 months"
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Course Modules</h2>
        <p className="text-gray-600">Add modules with videos to organize your course content</p>
      </div>

      {/* Current Module Creation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          Current Module: {currentModule.title || 'Untitled Module'}
        </h3>
        
        {/* Module Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Title *
            </label>
            <input
              type="text"
              value={currentModule.title}
              onChange={(e) => {
                console.log('Module title input changed:', e.target.value);
                setCurrentModule({ ...currentModule, title: e.target.value });
              }}
              placeholder="e.g., Introduction to React"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Order
            </label>
            <input
              type="number"
              value={currentModule.order}
              onChange={(e) => setCurrentModule({ ...currentModule, order: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Description
            </label>
            <textarea
              value={currentModule.description}
              onChange={(e) => setCurrentModule({ ...currentModule, description: e.target.value })}
              placeholder="Brief description of what this module covers..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Add Video to Current Module */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Add Video to Current Module</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Title *
              </label>
              <input
                type="text"
                value={currentVideo.title}
                onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                placeholder="e.g., Getting Started"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video Link *
              </label>
              <input
                type="url"
                value={currentVideo.videoLink}
                onChange={(e) => setCurrentVideo({ ...currentVideo, videoLink: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                type="text"
                value={currentVideo.duration}
                onChange={(e) => setCurrentVideo({ ...currentVideo, duration: e.target.value })}
                placeholder="e.g., 15:30"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={currentVideo.isPreview}
                  onChange={(e) => setCurrentVideo({ ...currentVideo, isPreview: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Preview (Free)</span>
              </label>
            </div>
          </div>
          <button
            onClick={addVideoToCurrentModule}
            className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Video
          </button>
        </div>

        {/* Bulk Video URLs */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Bulk Add Videos
          </h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Video URLs (one per line)
              </label>
              <textarea
                value={bulkVideoUrls}
                onChange={(e) => setBulkVideoUrls(e.target.value)}
                placeholder="https://youtube.com/watch?v=1&#10;https://youtube.com/watch?v=2&#10;https://youtube.com/watch?v=3"
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Enter one video URL per line. Videos will be automatically titled as "Video 1", "Video 2", etc.</span>
            </div>
            <button
              onClick={addBulkVideosToCurrentModule}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Copy className="w-4 h-4" />
              Add All Videos
            </button>
          </div>
        </div>

        {/* Add Course Materials */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Add Course Materials
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Title *
              </label>
              <input
                type="text"
                value={currentMaterial.title}
                onChange={(e) => setCurrentMaterial({ ...currentMaterial, title: e.target.value })}
                placeholder="e.g., Course Notes, Assignment"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material Type *
              </label>
              <select
                value={currentMaterial.type}
                onChange={(e) => setCurrentMaterial({ ...currentMaterial, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="pdf">PDF Document</option>
                <option value="ppt">PowerPoint Presentation</option>
                <option value="doc">Word Document</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Choose File *
              </label>
              <input
                type="file"
                onChange={handleMaterialFileChange}
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: PDF, PPT, PPTX, DOC, DOCX (max 50MB)
              </p>
            </div>
          </div>
          <button
            onClick={addMaterialToCurrentModule}
            className="mt-3 flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Material
          </button>
        </div>

        {/* Add Module Quiz */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <HelpCircle className="w-4 h-4" />
            Add Module Quiz
          </h4>
          
          {/* Quiz Template Example */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <h5 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Quiz Template Format
            </h5>
            <p className="text-sm text-yellow-700 mb-2">
              Your Excel file should have these columns:
            </p>
            <div className="text-xs text-yellow-600 font-mono bg-yellow-100 p-2 rounded">
              Question | OptionA | OptionB | OptionC | OptionD | CorrectAnswer
            </div>
            <p className="text-xs text-yellow-600 mt-2">
              Example: "What is React?" | "A library" | "A framework" | "A language" | "A database" | "A"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                value={currentModule.quiz.timeLimit}
                onChange={(e) => setCurrentModule(prev => ({
                  ...prev,
                  quiz: { ...prev.quiz, timeLimit: parseInt(e.target.value) || 60 }
                }))}
                min="1"
                max="300"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passing Score (%)
              </label>
              <input
                type="number"
                value={currentModule.quiz.passingScore}
                onChange={(e) => setCurrentModule(prev => ({
                  ...prev,
                  quiz: { ...prev.quiz, passingScore: parseInt(e.target.value) || 60 }
                }))}
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Attempts
              </label>
              <input
                type="number"
                value={currentModule.quiz.maxAttempts}
                onChange={(e) => setCurrentModule(prev => ({
                  ...prev,
                  quiz: { ...prev.quiz, maxAttempts: parseInt(e.target.value) || 1 }
                }))}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Choose Quiz File (Excel)
            </label>
            <input
              type="file"
              onChange={handleQuizFileChange}
              accept=".xlsx,.xls"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Upload an Excel file with questions in the format shown above (max 50MB)
            </p>
          </div>

          {currentModule.quiz.file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Quiz file uploaded: {currentModule.quiz.file.name}
                  </span>
                </div>
                <button
                  onClick={removeQuizFromCurrentModule}
                  className="text-red-600 hover:text-red-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current Module Materials */}
        {currentModule.materials.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Materials in Current Module ({currentModule.materials.length})</h4>
            <div className="space-y-2">
              {currentModule.materials.map((material, index) => (
                <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">{material.title}</h5>
                      <p className="text-xs text-gray-500">
                        {material.type.toUpperCase()} • {material.originalName} • {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMaterialFromCurrentModule(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current Module Videos */}
        {currentModule.videos.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Videos in Current Module ({currentModule.videos.length})</h4>
            <div className="space-y-2">
              {currentModule.videos.map((video, index) => (
                <div key={video.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="w-4 h-4 text-gray-400" />
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">{video.title}</h5>
                      <p className="text-xs text-gray-500 truncate max-w-md">{video.videoLink}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {video.duration}
                        </span>
                        {video.isPreview && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            Preview
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeVideoFromCurrentModule(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Module Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              console.log('Save Module button clicked');
              console.log('Button disabled state:', !currentModule.title.trim());
              console.log('Current module title for button:', currentModule.title);
              saveCurrentModule();
            }}
            disabled={!currentModule.title.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            Save Module & Add Next
            {currentModule.videos.length === 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-2">
                No Videos
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Saved Modules */}
      {modules.length > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Saved Modules ({modules.length})</h3>
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={module.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 flex items-center gap-2">
                      Module {module.order + 1}: {module.title}
                      {module.videos.length === 0 && (
                        <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                          Incomplete
                        </span>
                      )}
                    </h4>
                    {module.description && (
                      <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-gray-500">
                        {module.videos.length} videos
                      </span>
                      <span className="text-xs text-gray-500">
                        {module.videos.reduce((total, video) => {
                          const duration = video.duration.split(':');
                          return total + (parseInt(duration[0]) * 60 + parseInt(duration[1] || 0));
                        }, 0)} min total
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeModule(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <h4 className="font-medium text-green-800">Course Progress</h4>
        </div>
        <div className="text-sm text-green-700">
          <p>• {modules.length} modules created</p>
          <p>• {getTotalVideos()} total videos</p>
          <p>• {currentModule.videos.length} videos in current module</p>
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Review & Publish</h2>
        <p className="text-gray-600">Review your course details before publishing</p>
      </div>

      {/* Course Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Title:</span> {courseData.title}</div>
              <div><span className="font-medium">Professor:</span> {courseData.professorName}</div>
              <div><span className="font-medium">Category:</span> {courseData.category}</div>
              <div><span className="font-medium">Difficulty:</span> {courseData.difficulty}</div>
              <div><span className="font-medium">Price:</span> ₹{courseData.price}</div>
              <div><span className="font-medium">Duration:</span> {courseData.duration}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Content Overview</h4>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">Modules:</span> {modules.length}</div>
              <div><span className="font-medium">Total Videos:</span> {getTotalVideos()}</div>
              <div><span className="font-medium">Main Video:</span> 
                <a href={courseData.videoLink} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 hover:underline flex items-center gap-1">
                  View <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
          <p className="text-sm text-gray-600">{courseData.description}</p>
        </div>
      </div>

      {/* Modules Summary */}
      {modules.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Modules Overview</h3>
          <div className="space-y-4">
            {modules.map((module, index) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Module {module.order + 1}: {module.title}
                </h4>
                {module.description && (
                  <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                )}
                <div className="text-sm text-gray-500">
                  {module.videos.length} videos
                  {module.videos.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {module.videos.map((video, videoIndex) => (
                        <div key={video.id} className="flex items-center gap-2">
                          <Play className="w-3 h-3" />
                          <span>{video.title}</span>
                          {video.isPreview && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              Preview
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warning if no modules */}
      {modules.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <h4 className="font-medium text-yellow-800">No Modules Added</h4>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            Your course will be created with only the main video. Consider adding modules to better organize your content.
          </p>
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Upload className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
            <p className="text-sm text-gray-600">Build a comprehensive course with modules and videos</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                currentStep >= step.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step.id}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 flex items-center justify-between">
        <button
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>
        
        <div className="flex items-center gap-3">
          {currentStep < 3 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Create Course
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamlinedCourseCreation;

