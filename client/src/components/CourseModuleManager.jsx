import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Save, 
  X, 
  ChevronDown, 
  ChevronRight, 
  Video, 
  BookOpen,
  Clock,
  Eye,
  EyeOff,
  FileText,
  Download,
  HelpCircle,
  Upload,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import QuizManagementModal from './QuizManagementModal';

const CourseModuleManager = ({ modules = [], onModulesChange, courseId = null, courseName = "Current Course" }) => {
  // Debug: Log modules data
  console.log('=== CourseModuleManager: Received modules ===');
  console.log('Modules count:', modules.length);
  modules.forEach((module, index) => {
    console.log(`Module ${index} (${module.title}):`, {
      hasMaterials: !!module.materials,
      materialsCount: module.materials ? module.materials.length : 0,
      materials: module.materials,
      hasQuiz: !!module.quiz,
      quiz: module.quiz
    });
  });
  
  // Expand all modules by default so video link fields are visible
  const [expandedModules, setExpandedModules] = useState(() => {
    const expanded = {};
    modules.forEach((_, index) => {
      expanded[index] = true;
    });
    return expanded;
  });
  const [editingModule, setEditingModule] = useState(-1);
  const [editingVideo, setEditingVideo] = useState({ moduleIndex: -1, videoIndex: -1 });
  const [newModule, setNewModule] = useState({
    title: '',
    description: '',
    order: modules.length
  });
  const [newVideo, setNewVideo] = useState({
    title: '',
    videoLink: '',
    duration: '0:00',
    isPreview: false,
    order: 0
  });
  
  // State for materials and quiz management
  const [newMaterial, setNewMaterial] = useState({
    title: '',
    type: 'pdf',
    file: null
  });
  const [newQuiz, setNewQuiz] = useState({
    isEnabled: false,
    timeLimit: 60,
    passingScore: 60,
    maxAttempts: 1,
    file: null
  });
  const [uploadingMaterial, setUploadingMaterial] = useState({ moduleIndex: -1, isUploading: false });
  const [uploadingQuiz, setUploadingQuiz] = useState({ moduleIndex: -1, isUploading: false });
  const [showQuizModal, setShowQuizModal] = useState(false);

  // Auto-expand new modules when they are added
  useEffect(() => {
    const newExpanded = { ...expandedModules };
    modules.forEach((_, index) => {
      if (!(index in newExpanded)) {
        newExpanded[index] = true;
      }
    });
    setExpandedModules(newExpanded);
  }, [modules.length]);

  const addModule = () => {
    if (!newModule.title.trim()) {
      toast.error('Please enter module title');
      return;
    }

    const module = {
      title: newModule.title.trim(),
      description: newModule.description.trim(),
      order: modules.length, // Use current modules length as order
      videos: []
    };

    const updatedModules = [...modules, module];
    onModulesChange(updatedModules);
    setNewModule({
      title: '',
      description: '',
      order: modules.length + 1
    });
    toast.success('Module added successfully! You can now add videos to this module.');
  };

  const updateModule = (index, updatedModule) => {
    const updatedModules = [...modules];
    updatedModules[index] = { ...updatedModules[index], ...updatedModule };
    onModulesChange(updatedModules);
    setEditingModule(-1);
    toast.success('Module updated successfully');
  };

  const deleteModule = (index) => {
    const updatedModules = modules.filter((_, i) => i !== index);
    // Update order for remaining modules
    updatedModules.forEach((module, i) => {
      module.order = i;
    });
    onModulesChange(updatedModules);
    toast.success('Module deleted successfully');
  };

  const addVideoToModule = (moduleIndex) => {
    if (!newVideo.title.trim() || !newVideo.videoLink.trim()) {
      toast.error('Please fill in video title and link');
      return;
    }

    const video = {
      title: newVideo.title.trim(),
      videoLink: newVideo.videoLink.trim(),
      duration: newVideo.duration || '0:00',
      isPreview: newVideo.isPreview,
      order: modules[moduleIndex].videos.length
    };

    const updatedModules = [...modules];
    updatedModules[moduleIndex].videos.push(video);
    onModulesChange(updatedModules);
    
    setNewVideo({
      title: '',
      videoLink: '',
      duration: '0:00',
      isPreview: false,
      order: 0
    });
    toast.success('Video added to module successfully');
  };

  const updateVideo = (moduleIndex, videoIndex, updatedVideo) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].videos[videoIndex] = { 
      ...updatedModules[moduleIndex].videos[videoIndex], 
      ...updatedVideo 
    };
    onModulesChange(updatedModules);
    setEditingVideo({ moduleIndex: -1, videoIndex: -1 });
    toast.success('Video updated successfully');
  };

  const deleteVideo = (moduleIndex, videoIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].videos.splice(videoIndex, 1);
    // Update order for remaining videos
    updatedModules[moduleIndex].videos.forEach((video, i) => {
      video.order = i;
    });
    onModulesChange(updatedModules);
    toast.success('Video deleted successfully');
  };

  const toggleModule = (moduleIndex) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleIndex]: !prev[moduleIndex]
    }));
  };

  const moveModuleUp = (index) => {
    if (index > 0) {
      const updatedModules = [...modules];
      [updatedModules[index], updatedModules[index - 1]] = [updatedModules[index - 1], updatedModules[index]];
      // Update order
      updatedModules.forEach((module, i) => {
        module.order = i;
      });
      onModulesChange(updatedModules);
    }
  };

  const moveModuleDown = (index) => {
    if (index < modules.length - 1) {
      const updatedModules = [...modules];
      [updatedModules[index], updatedModules[index + 1]] = [updatedModules[index + 1], updatedModules[index]];
      // Update order
      updatedModules.forEach((module, i) => {
        module.order = i;
      });
      onModulesChange(updatedModules);
    }
  };

  const getTotalVideos = () => {
    return modules.reduce((total, module) => total + module.videos.length, 0);
  };

  // Material upload functions
  const handleMaterialUpload = async (moduleIndex) => {
    if (!newMaterial.title.trim() || !newMaterial.file) {
      toast.error('Please provide material title and select a file');
      return;
    }

    // Validate file size (50MB limit)
    if (newMaterial.file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    if (!courseId) {
      toast.error('Please save the course first before uploading materials');
      return;
    }

    setUploadingMaterial({ moduleIndex, isUploading: true });

    try {
      const formData = new FormData();
      formData.append('file', newMaterial.file);
      formData.append('title', newMaterial.title);
      formData.append('type', newMaterial.type);
      formData.append('moduleIndex', moduleIndex);

      const response = await api(`/api/courses/${courseId}/upload-material`, {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        const updatedModules = [...modules];
        if (!updatedModules[moduleIndex].materials) {
          updatedModules[moduleIndex].materials = [];
        }
        updatedModules[moduleIndex].materials.push(response.material);
        onModulesChange(updatedModules);
        
        setNewMaterial({ title: '', type: 'pdf', file: null });
        toast.success('Material uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading material:', error);
      toast.error('Failed to upload material');
    } finally {
      setUploadingMaterial({ moduleIndex: -1, isUploading: false });
    }
  };

  const handleQuizUpload = async (moduleIndex) => {
    if (!newQuiz.file) {
      toast.error('Please select a quiz question paper file');
      return;
    }

    // Validate file size (50MB limit)
    if (newQuiz.file.size > 50 * 1024 * 1024) {
      toast.error('File size must be less than 50MB');
      return;
    }

    if (!courseId) {
      toast.error('Please save the course first before uploading quizzes');
      return;
    }

    setUploadingQuiz({ moduleIndex, isUploading: true });

    try {
      const formData = new FormData();
      formData.append('file', newQuiz.file);
      formData.append('timeLimit', newQuiz.timeLimit);
      formData.append('passingScore', newQuiz.passingScore);
      formData.append('maxAttempts', newQuiz.maxAttempts);
      formData.append('moduleIndex', moduleIndex);

      const response = await api(`/api/courses/${courseId}/upload-quiz`, {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        const updatedModules = [...modules];
        updatedModules[moduleIndex].quiz = {
          isEnabled: true,
          questionPaperPath: response.quiz.questionPaperPath,
          originalFileName: response.quiz.originalFileName,
          totalQuestions: response.quiz.totalQuestions,
          timeLimit: newQuiz.timeLimit,
          passingScore: newQuiz.passingScore,
          maxAttempts: newQuiz.maxAttempts,
          uploadedAt: new Date()
        };
        onModulesChange(updatedModules);
        
        setNewQuiz({ isEnabled: false, timeLimit: 60, passingScore: 60, maxAttempts: 1, file: null });
        toast.success('Quiz uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading quiz:', error);
      toast.error('Failed to upload quiz');
    } finally {
      setUploadingQuiz({ moduleIndex: -1, isUploading: false });
    }
  };

  const removeMaterial = (moduleIndex, materialIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].materials.splice(materialIndex, 1);
    onModulesChange(updatedModules);
    toast.success('Material removed successfully');
  };

  const removeQuiz = (moduleIndex) => {
    const updatedModules = [...modules];
    updatedModules[moduleIndex].quiz = {
      isEnabled: false,
      questionPaperPath: null,
      originalFileName: null,
      totalQuestions: 0,
      timeLimit: 60,
      passingScore: 60,
      maxAttempts: 1,
      uploadedAt: null
    };
    onModulesChange(updatedModules);
    toast.success('Quiz removed successfully');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
          <p className="text-sm text-gray-500">
            {modules.length} modules • {getTotalVideos()} videos
          </p>
          {modules.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              💡 Click on modules below to add videos with video links
            </p>
          )}
        </div>
        {modules.length > 0 && (
          <button
            onClick={() => setShowQuizModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Manage Quizzes
          </button>
        )}
      </div>

      {/* Add New Module Form */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <h4 className="font-medium text-gray-900 mb-3">Add New Module</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Title *
            </label>
            <input
              type="text"
              value={newModule.title}
              onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
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
              value={newModule.order}
              onChange={(e) => setNewModule({ ...newModule, order: parseInt(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module Description
            </label>
            <textarea
              value={newModule.description}
              onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
              placeholder="Brief description of what this module covers..."
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={addModule}
          className="mt-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Module
        </button>
      </div>

      {/* Modules List */}
      {modules.length > 0 && (
        <div className="space-y-4">
          {modules.map((module, moduleIndex) => (
            <div key={moduleIndex} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Module Header */}
              <div className="p-4 border-b border-gray-200">
                {editingModule === moduleIndex ? (
                  <EditModuleForm
                    module={module}
                    onSave={(updatedModule) => updateModule(moduleIndex, updatedModule)}
                    onCancel={() => setEditingModule(-1)}
                  />
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleModule(moduleIndex)}
                        className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                      >
                        {expandedModules[moduleIndex] ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                      <div>
                        <h5 className="font-medium text-gray-900 flex items-center gap-2">
                          Module {module.order + 1}: {module.title}
                          {module.videos.length === 0 && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                              Incomplete
                            </span>
                          )}
                        </h5>
                        {module.description && (
                          <p className="text-sm text-gray-500 mt-1">{module.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-1">
                          <span className={`text-xs ${module.videos.length === 0 ? 'text-red-500' : 'text-gray-500'}`}>
                            {module.videos.length} videos
                          </span>
                          {module.videos.length > 0 ? (
                            <span className="text-xs text-gray-500">
                              {module.videos.reduce((total, video) => {
                                const duration = video.duration.split(':');
                                return total + (parseInt(duration[0]) * 60 + parseInt(duration[1] || 0));
                              }, 0)} min total
                            </span>
                          ) : (
                            <span className="text-xs text-red-500 font-medium">
                              No videos - Add videos to complete this module
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingModule(moduleIndex)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteModule(moduleIndex)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Module Content */}
              <AnimatePresence>
                {expandedModules[moduleIndex] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50">
                      {/* Add Video to Module Form */}
                      <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                        <h6 className="font-medium text-gray-900 mb-3">Add Video to Module</h6>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Video Title *
                            </label>
                            <input
                              type="text"
                              value={newVideo.title}
                              onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                              placeholder="e.g., Introduction to Components"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Video Link * <span className="text-red-500">(Required)</span>
                            </label>
                            <input
                              type="url"
                              value={newVideo.videoLink}
                              onChange={(e) => setNewVideo({ ...newVideo, videoLink: e.target.value })}
                              placeholder="https://youtube.com/watch?v=..."
                              className="w-full px-3 py-2 border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Enter the full YouTube URL (e.g., https://youtube.com/watch?v=...)
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duration
                            </label>
                            <input
                              type="text"
                              value={newVideo.duration}
                              onChange={(e) => setNewVideo({ ...newVideo, duration: e.target.value })}
                              placeholder="e.g., 15:30"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div className="flex items-center">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newVideo.isPreview}
                                onChange={(e) => setNewVideo({ ...newVideo, isPreview: e.target.checked })}
                                className="mr-2"
                              />
                              <span className="text-sm text-gray-700">Preview (Free)</span>
                            </label>
                          </div>
                        </div>
                        <button
                          onClick={() => addVideoToModule(moduleIndex)}
                          className="mt-3 flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Video
                        </button>
                      </div>

                      {/* Videos List */}
                      {module.videos.length > 0 ? (
                        <div className="space-y-2">
                          <h6 className="font-medium text-gray-900">Videos in Module</h6>
                          {module.videos.map((video, videoIndex) => (
                            <div key={videoIndex} className="bg-white border border-gray-200 rounded-lg p-3">
                              {editingVideo.moduleIndex === moduleIndex && editingVideo.videoIndex === videoIndex ? (
                                <EditVideoForm
                                  video={video}
                                  onSave={(updatedVideo) => updateVideo(moduleIndex, videoIndex, updatedVideo)}
                                  onCancel={() => setEditingVideo({ moduleIndex: -1, videoIndex: -1 })}
                                />
                              ) : (
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <Video className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <h6 className="font-medium text-gray-900">{video.title}</h6>
                                      <p className="text-sm text-gray-500">{video.videoLink}</p>
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
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setEditingVideo({ moduleIndex, videoIndex })}
                                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => deleteVideo(moduleIndex, videoIndex)}
                                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No videos in this module yet</p>
                        </div>
                      )}

                      {/* Materials Section */}
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-medium text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Course Materials
                          </h6>
                        </div>

                        {/* Add Material Form */}
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Material Title
                              </label>
                              <input
                                type="text"
                                value={newMaterial.title}
                                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                                placeholder="e.g., Module Notes"
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                File Type
                              </label>
                              <select
                                value={newMaterial.type}
                                onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="pdf">PDF</option>
                                <option value="ppt">PowerPoint</option>
                                <option value="doc">Document</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Select File
                              </label>
                              <input
                                type="file"
                                accept=".pdf,.ppt,.pptx,.doc,.docx"
                                onChange={(e) => setNewMaterial({ ...newMaterial, file: e.target.files[0] })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleMaterialUpload(moduleIndex)}
                            disabled={uploadingMaterial.moduleIndex === moduleIndex && uploadingMaterial.isUploading}
                            className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                          >
                            {uploadingMaterial.moduleIndex === moduleIndex && uploadingMaterial.isUploading ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="w-3 h-3" />
                                Upload Material
                              </>
                            )}
                          </button>
                        </div>

                        {/* Materials List */}
                        {module.materials && module.materials.length > 0 ? (
                          <div className="space-y-2">
                            {module.materials.map((material, materialIndex) => (
                              <div key={materialIndex} className="bg-white border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <div>
                                      <h6 className="font-medium text-gray-900">{material.title}</h6>
                                      <p className="text-sm text-gray-500">{material.originalName}</p>
                                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        {material.type.toUpperCase()}
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => removeMaterial(moduleIndex, materialIndex)}
                                    className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-3 text-gray-500">
                            <FileText className="w-6 h-6 mx-auto mb-1 opacity-50" />
                            <p className="text-xs">No materials uploaded yet</p>
                          </div>
                        )}
                      </div>

                      {/* Quiz Section */}
                      <div className="mt-6 border-t border-gray-200 pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-medium text-gray-900 flex items-center gap-2">
                            <HelpCircle className="w-4 h-4" />
                            Module Quiz
                          </h6>
                          {module.quiz && module.quiz.isEnabled && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Quiz Active
                            </span>
                          )}
                        </div>

                        {!module.quiz || !module.quiz.isEnabled ? (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Time Limit (minutes)
                                </label>
                                <input
                                  type="number"
                                  value={newQuiz.timeLimit}
                                  onChange={(e) => setNewQuiz({ ...newQuiz, timeLimit: parseInt(e.target.value) || 60 })}
                                  min="1"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Passing Score (%)
                                </label>
                                <input
                                  type="number"
                                  value={newQuiz.passingScore}
                                  onChange={(e) => setNewQuiz({ ...newQuiz, passingScore: parseInt(e.target.value) || 60 })}
                                  min="1"
                                  max="100"
                                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Quiz Question Paper (Excel file)
                              </label>
                              <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={(e) => setNewQuiz({ ...newQuiz, file: e.target.files[0] })}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <button
                              onClick={() => handleQuizUpload(moduleIndex)}
                              disabled={uploadingQuiz.moduleIndex === moduleIndex && uploadingQuiz.isUploading}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                            >
                              {uploadingQuiz.moduleIndex === moduleIndex && uploadingQuiz.isUploading ? (
                                <>
                                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3 h-3" />
                                  Upload Quiz
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <HelpCircle className="w-4 h-4 text-green-600" />
                                <div>
                                  <h6 className="font-medium text-gray-900">Quiz Active</h6>
                                  <p className="text-sm text-gray-500">{module.quiz.originalFileName}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500">
                                      {module.quiz.totalQuestions} questions
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {module.quiz.timeLimit} min
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {module.quiz.passingScore}% pass
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => removeQuiz(moduleIndex)}
                                className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {modules.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No modules created yet</p>
          <p className="text-sm">Create your first module above to organize your course content.</p>
        </div>
      )}

      {/* Quiz Management Modal */}
      <QuizManagementModal
        isOpen={showQuizModal}
        onClose={() => setShowQuizModal(false)}
        courseId={courseId}
        courseName={courseName}
        modules={modules}
        onQuizUpdated={() => {
          // Refresh modules data if needed
          console.log('Quiz updated');
        }}
      />
    </div>
  );
};

// Edit Module Form Component
const EditModuleForm = ({ module, onSave, onCancel }) => {
  const [editedModule, setEditedModule] = useState(module);

  const handleSave = () => {
    if (!editedModule.title.trim()) {
      toast.error('Please enter module title');
      return;
    }
    onSave(editedModule);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Title
          </label>
          <input
            type="text"
            value={editedModule.title}
            onChange={(e) => setEditedModule({ ...editedModule, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Order
          </label>
          <input
            type="number"
            value={editedModule.order}
            onChange={(e) => setEditedModule({ ...editedModule, order: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Module Description
          </label>
          <textarea
            value={editedModule.description}
            onChange={(e) => setEditedModule({ ...editedModule, description: e.target.value })}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};

// Edit Video Form Component
const EditVideoForm = ({ video, onSave, onCancel }) => {
  const [editedVideo, setEditedVideo] = useState(video);

  const handleSave = () => {
    if (!editedVideo.title.trim() || !editedVideo.videoLink.trim()) {
      toast.error('Please fill in video title and link');
      return;
    }
    onSave(editedVideo);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video Title
          </label>
          <input
            type="text"
            value={editedVideo.title}
            onChange={(e) => setEditedVideo({ ...editedVideo, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Video Link
          </label>
          <input
            type="url"
            value={editedVideo.videoLink}
            onChange={(e) => setEditedVideo({ ...editedVideo, videoLink: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration
          </label>
          <input
            type="text"
            value={editedVideo.duration}
            onChange={(e) => setEditedVideo({ ...editedVideo, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={editedVideo.isPreview}
              onChange={(e) => setEditedVideo({ ...editedVideo, isPreview: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Preview (Free)</span>
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CourseModuleManager;
