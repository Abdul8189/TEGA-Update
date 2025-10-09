import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  BookOpen, 
  Play, 
  FileText, 
  Upload, 
  Edit, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  Video,
  File,
  HelpCircle,
  Settings,
  BarChart3,
  Users,
  Clock,
  DollarSign
} from 'lucide-react';
import { api } from '../utils/api.js';
import toast from 'react-hot-toast';

const UdemyStyleAdminCourseManagement = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateSection, setShowCreateSection] = useState(false);
  const [showCreateLecture, setShowCreateLecture] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');

  // Form states
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'programming',
    language: 'English',
    price: 0,
    isFree: false,
    allowPreview: true,
    difficulty: 'beginner',
    duration: '4 weeks',
    features: [],
    requirements: [],
    outcomes: [],
    instructor: {
      name: '',
      email: '',
      bio: ''
    },
    sections: []
  });

  const [sectionForm, setSectionForm] = useState({
    title: '',
    description: '',
    order: 0
  });

  const [lectureForm, setLectureForm] = useState({
    title: '',
    description: '',
    type: 'video',
    videoUrl: '',
    fileUrl: '',
    duration: '0:00',
    order: 0,
    isPreview: false
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await api('/api/courses/admin/all');
      setCourses(response.courses);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourseContent = async (courseId) => {
    try {
      const response = await api(`/api/courses/${courseId}`);
      setSections(response.course.sections || []);
      setLectures(response.course.sections?.flatMap(s => s.lectures) || []);
    } catch (error) {
      console.error('Error fetching course content:', error);
      toast.error('Failed to fetch course content');
    }
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchCourseContent(course._id);
    setExpandedSections({});
    setActiveTab('content');
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const response = await api('/api/admin-courses/create', {
        method: 'POST',
        body: JSON.stringify(courseForm)
      });
      
      toast.success('Course created successfully');
      setShowCreateCourse(false);
      resetCourseForm();
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const handleCreateSection = async (e) => {
    e.preventDefault();
    try {
      const response = await api(`/api/admin-courses/${selectedCourse._id}/sections`, {
        method: 'POST',
        body: JSON.stringify(sectionForm)
      });
      
      toast.success('Section added successfully');
      setShowCreateSection(false);
      setSectionForm({ title: '', description: '', order: 0 });
      fetchCourseContent(selectedCourse._id);
    } catch (error) {
      console.error('Error creating section:', error);
      toast.error('Failed to create section');
    }
  };

  const handleCreateLecture = async (e) => {
    e.preventDefault();
    try {
      const response = await api(`/api/admin-courses/sections/${editingItem}/lessons`, {
        method: 'POST',
        body: JSON.stringify(lectureForm)
      });
      
      toast.success('Lecture added successfully');
      setShowCreateLecture(false);
      setLectureForm({
        title: '',
        description: '',
        type: 'video',
        videoUrl: '',
        fileUrl: '',
        duration: '0:00',
        order: 0,
        isPreview: false
      });
      fetchCourseContent(selectedCourse._id);
    } catch (error) {
      console.error('Error creating lecture:', error);
      toast.error('Failed to create lecture');
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      return;
    }

    try {
      await api(`/api/admin-courses/${courseId}`, {
        method: 'DELETE'
      });
      
      setCourses(prev => prev.filter(course => course._id !== courseId));
      if (selectedCourse?._id === courseId) {
        setSelectedCourse(null);
        setSections([]);
        setLectures([]);
        setActiveTab('courses');
      }
      toast.success('Course deleted successfully');
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const handleDeleteLecture = async (lectureId, lectureTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${lectureTitle}"?`)) {
      return;
    }

    try {
      await api(`/api/admin-courses/lessons/${lectureId}`, {
        method: 'DELETE'
      });
      
      toast.success('Lecture deleted successfully');
      fetchCourseContent(selectedCourse._id);
    } catch (error) {
      console.error('Error deleting lecture:', error);
      toast.error('Failed to delete lecture');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      category: 'programming',
      language: 'English',
      price: 0,
      isFree: false,
      allowPreview: true,
      difficulty: 'beginner',
      duration: '4 weeks',
      features: [],
      requirements: [],
      outcomes: [],
      instructor: {
        name: '',
        email: '',
        bio: ''
      },
      sections: []
    });
  };

  const getLectureIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'pdf': return <File className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      default: return <BookOpen className="w-4 h-4" />;
    }
  };

  const tabs = [
    { id: 'courses', label: 'All Courses', icon: BookOpen },
    { id: 'content', label: 'Course Content', icon: Play },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
            <p className="text-gray-600">Create and manage your courses</p>
          </div>
          <button
            onClick={() => setShowCreateCourse(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Left Sidebar - Course List */}
        {activeTab === 'courses' && (
          <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">All Courses</h3>
              <div className="space-y-2">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedCourse?._id === course._id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm">{course.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{course.category}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{course.enrollmentCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {course.isFree ? 'Free' : `₹${course.price}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course._id, course.title);
                          }}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'courses' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div key={course._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="h-48 bg-gray-200 flex items-center justify-center">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-12 h-12 text-gray-400" />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2">{course.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-blue-600">
                          {course.isFree ? 'Free' : `₹${course.price}`}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleCourseSelect(course)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            Manage
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'content' && selectedCourse && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedCourse.title}</h2>
                  <p className="text-gray-600">Manage course content</p>
                </div>
                <button
                  onClick={() => setShowCreateSection(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Section</span>
                </button>
              </div>

              <div className="space-y-4">
                {sections.map((section, sectionIndex) => (
                  <div key={section._id} className="bg-white rounded-lg border border-gray-200">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleSection(section._id)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            {expandedSections[section._id] ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <h3 className="font-medium text-gray-900">{section.title}</h3>
                            <p className="text-sm text-gray-500">{section.lectures?.length || 0} lectures</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setEditingItem(section._id);
                            setShowCreateLecture(true);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          Add Lecture
                        </button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {expandedSections[section._id] && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 space-y-2">
                            {section.lectures?.map((lecture, lectureIndex) => (
                              <div key={lecture._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                  {getLectureIcon(lecture.type)}
                                  <div>
                                    <h4 className="font-medium text-gray-900 text-sm">{lecture.title}</h4>
                                    <p className="text-xs text-gray-500">{lecture.duration}</p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {lecture.isPreview && (
                                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                      Preview
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleDeleteLecture(lecture._id, lecture.title)}
                                    className="p-1 hover:bg-red-100 rounded text-red-600"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && selectedCourse && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Analytics</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Total Enrollments</p>
                      <p className="text-2xl font-semibold text-gray-900">{selectedCourse.enrollmentCount}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Play className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">Total Lectures</p>
                      <p className="text-2xl font-semibold text-gray-900">{lectures.length}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-8 h-8 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Course Duration</p>
                      <p className="text-2xl font-semibold text-gray-900">{selectedCourse.duration}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Course Modal */}
      <AnimatePresence>
        {showCreateCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Create New Course</h3>
                <button
                  onClick={() => setShowCreateCourse(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                    <input
                      type="text"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={courseForm.category}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="programming">Programming</option>
                      <option value="ai">AI & ML</option>
                      <option value="web">Web Development</option>
                      <option value="cloud">Cloud Computing</option>
                      <option value="cyber">Cyber Security</option>
                      <option value="office">Office Tools</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={courseForm.description}
                    onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      value={courseForm.price}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={courseForm.difficulty}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={courseForm.duration}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 4 weeks"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={courseForm.isFree}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, isFree: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Free Course</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={courseForm.allowPreview}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, allowPreview: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Allow Preview</span>
                  </label>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateCourse(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Course
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Section Modal */}
      <AnimatePresence>
        {showCreateSection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Section</h3>
                <button
                  onClick={() => setShowCreateSection(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateSection} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={sectionForm.title}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={sectionForm.description}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                  <input
                    type="number"
                    value={sectionForm.order}
                    onChange={(e) => setSectionForm(prev => ({ ...prev, order: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateSection(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Section
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Lecture Modal */}
      <AnimatePresence>
        {showCreateLecture && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add Lecture</h3>
                <button
                  onClick={() => setShowCreateLecture(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleCreateLecture} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lecture Title</label>
                  <input
                    type="text"
                    value={lectureForm.title}
                    onChange={(e) => setLectureForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={lectureForm.description}
                    onChange={(e) => setLectureForm(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select
                      value={lectureForm.type}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="video">Video</option>
                      <option value="pdf">PDF</option>
                      <option value="quiz">Quiz</option>
                      <option value="text">Text</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                    <input
                      type="text"
                      value={lectureForm.duration}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, duration: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 10:30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                  <input
                    type="url"
                    value={lectureForm.videoUrl}
                    onChange={(e) => setLectureForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={lectureForm.isPreview}
                      onChange={(e) => setLectureForm(prev => ({ ...prev, isPreview: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Preview Lecture</span>
                  </label>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateLecture(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Add Lecture
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UdemyStyleAdminCourseManagement;
