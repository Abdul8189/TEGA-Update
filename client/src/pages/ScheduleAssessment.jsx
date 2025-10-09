import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Upload, 
  FileText, 
  Users, 
  Plus, 
  Trash2, 
  Edit,
  Download,
  Eye,
  FolderOpen,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const ScheduleAssessment = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('schedule');
  const [loading, setLoading] = useState(false);
  const [assessmentData, setAssessmentData] = useState({
    title: '',
    courseId: '',
    description: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    examDate: '',
    instructions: '',
    requiresPayment: true,
    price: '',
    maxAttempts: 1,
    slots: [],
    questionPaperId: '',
    isTegaExam: false // New field to identify TEGA exams
  });
  
  const [courses, setCourses] = useState([]);
  const [exams, setExams] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [examAttempts, setExamAttempts] = useState([]);
  const [questionPapers, setQuestionPapers] = useState([]);
  const [selectedCoursePapers, setSelectedCoursePapers] = useState([]);
  
  // Edit modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    courseId: '',
    description: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    examDate: '',
    instructions: '',
    requiresPayment: true, // Default to true for course-based exams
    price: '',
    maxAttempts: 1,
    slots: [],
    questionPaperId: ''
  });
  
  const [newSlot, setNewSlot] = useState({
    slotId: '',
    startTime: '',
    endTime: '',
    maxParticipants: 30
  });

  // Edit modal slot state
  const [editNewSlot, setEditNewSlot] = useState({
    slotId: '',
    startTime: '',
    endTime: '',
    maxParticipants: 30
  });

  useEffect(() => {
    fetchCourses();
    fetchExams();
  }, []);

  // Auto-fetch question papers when courses are loaded
  useEffect(() => {
    if (courses.length > 0) {
      // Only auto-fetch if we're not in TEGA exam mode and have a valid course selected
      if (!assessmentData.isTegaExam && assessmentData.courseId && assessmentData.courseId.trim() !== '') {
        console.log('🔍 Auto-fetching question papers for selected course:', assessmentData.courseId);
        fetchQuestionPapers(assessmentData.courseId);
      }
    }
  }, [courses, assessmentData.courseId, assessmentData.isTegaExam]);

  // Auto-fetch TEGA exam question papers when in TEGA exam mode
  useEffect(() => {
    if (assessmentData.isTegaExam) {
      console.log('🔍 Auto-fetching TEGA exam question papers...');
      fetchTegaExamQuestionPapers();
    }
  }, [assessmentData.isTegaExam]);

  const fetchCourses = async () => {
    try {
      const response = await api('/api/courses/admin/all-courses');
      if (response.success) {
        // Remove Tega Exam from course dropdown - it will be handled separately
        setCourses(response.courses);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to fetch courses');
    }
  };

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api('/api/exams/admin/all');
      if (response.success) {
        setExams(response.exams);
      }
    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (examId) => {
    try {
      const response = await api(`/api/exams/admin/${examId}/registrations`);
      if (response.success) {
        setRegistrations(response.registrations);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to fetch registrations');
    }
  };

  const fetchExamAttempts = async (examId) => {
    try {
      const response = await api(`/api/exams/admin/${examId}/attempts`);
      if (response.success) {
        setExamAttempts(response.attempts);
      }
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
      toast.error('Failed to fetch exam attempts');
    }
  };

  const fetchQuestionPapers = async (courseId) => {
    try {
      console.log('🔍 fetchQuestionPapers called with courseId:', courseId);
      
      if (assessmentData.isTegaExam) {
        // For TEGA Exam, fetch TEGA exam question papers
        console.log('🔍 Fetching TEGA exam question papers');
        const response = await api('/api/question-papers/admin/tega-exam');
        if (response.success) {
          console.log('🔍 Found TEGA exam question papers:', response.questionPapers.length);
          setSelectedCoursePapers(response.questionPapers);
        }
      } else {
        // Only fetch course question papers if courseId is valid
        if (!courseId || courseId === null || courseId.trim() === '') {
          console.log('🔍 No courseId provided, clearing question papers');
          setSelectedCoursePapers([]);
          return;
        }
        
        console.log('🔍 Fetching question papers for course:', courseId);
        const response = await api(`/api/question-papers/admin/course/${courseId}`);
        if (response.success) {
          console.log('🔍 Found question papers:', response.questionPapers.length);
          setSelectedCoursePapers(response.questionPapers);
        }
      }
    } catch (error) {
      console.error('❌ Error fetching question papers:', error);
      toast.error('Failed to fetch question papers');
      setSelectedCoursePapers([]);
    }
  };

  const fetchAllQuestionPapers = async () => {
    try {
      const response = await api('/api/question-papers/admin/all');
      if (response.success) {
        setQuestionPapers(response.questionPapers);
      }
    } catch (error) {
      console.error('Error fetching all question papers:', error);
      toast.error('Failed to fetch question papers');
    }
  };

  const fetchTegaExamQuestionPapers = async () => {
    try {
      console.log('🔍 Fetching TEGA exam question papers...');
      const response = await api('/api/question-papers/admin/tega-exam');
      if (response.success) {
        console.log('🔍 Found TEGA exam question papers:', response.questionPapers.length);
        setSelectedCoursePapers(response.questionPapers);
      } else {
        console.log('❌ No TEGA exam question papers found');
        setSelectedCoursePapers([]);
      }
    } catch (error) {
      console.error('❌ Error fetching TEGA exam question papers:', error);
      toast.error('Failed to fetch TEGA exam question papers');
      setSelectedCoursePapers([]);
    }
  };

  const deleteQuestionPaper = async (questionPaperId) => {
    try {
      console.log('🔍 Deleting question paper:', questionPaperId);
      
      const response = await api(`/api/question-papers/admin/${questionPaperId}`, {
        method: 'DELETE'
      });
      
      if (response.success) {
        console.log('✅ Question paper deleted successfully');
        toast.success('Question paper deleted successfully');
        
        // Refresh the question papers list
        await fetchAllQuestionPapers();
        
        // Also refresh the selected course papers if needed
        if (assessmentData.isTegaExam) {
          await fetchTegaExamQuestionPapers();
        } else if (assessmentData.courseId && assessmentData.courseId.trim() !== '') {
          await fetchQuestionPapers(assessmentData.courseId);
        }
      } else {
        console.error('❌ Delete failed:', response.message);
        
        // Show detailed error message if question paper is being used by exams
        if (response.usedByExams && response.usedByExams.length > 0) {
          const examList = response.usedByExams.map(exam => exam.title).join(', ');
          toast.error(
            `Cannot delete question paper. It is being used by: ${examList}. Please remove it from these exams first.`,
            { duration: 6000 }
          );
        } else {
          toast.error(response.message || 'Failed to delete question paper');
        }
      }
    } catch (error) {
      console.error('❌ Error deleting question paper:', error);
      toast.error('Failed to delete question paper');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAssessmentData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // If course changes, fetch question papers for that course
    if (name === 'courseId' && value) {
      fetchQuestionPapers(value);
    }

    // If TEGA exam status changes, fetch appropriate question papers
    if (name === 'isTegaExam') {
      if (checked) {
        // Switching to TEGA exam - fetch TEGA exam question papers
        fetchTegaExamQuestionPapers();
      } else {
        // Switching away from TEGA exam - clear question papers
        setSelectedCoursePapers([]);
      }
    }

    // If "Requires Payment" is unchecked for TEGA Exam, clear the price
    if (name === 'requiresPayment' && !checked && assessmentData.isTegaExam) {
      setAssessmentData(prev => ({
        ...prev,
        price: ''
      }));
    }

    // Handle TEGA exam specific logic
    if (name === 'isTegaExam' && checked) {
      setAssessmentData(prev => ({
        ...prev,
        courseId: '', // Clear course for TEGA exams
        requiresPayment: true, // TEGA Exam always requires payment
        price: 1999 // Default TEGA exam price
      }));
    }
    // If switching away from TEGA exam, reset to course-based
    else if (name === 'isTegaExam' && !checked) {
      setAssessmentData(prev => ({
        ...prev,
        requiresPayment: false, // Reset payment requirement
        price: 0 // Reset price
      }));
    }
  };

  const handleSlotInputChange = (e) => {
    const { name, value } = e.target;
    setNewSlot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSlot = () => {
    if (!newSlot.slotId || !newSlot.startTime || !newSlot.endTime) {
      toast.error('Please fill in all slot fields!');
      return;
    }

    setAssessmentData(prev => ({
      ...prev,
      slots: [...prev.slots, { ...newSlot, isActive: true, registeredStudents: [] }]
    }));

    setNewSlot({
      slotId: '',
      startTime: '',
      endTime: '',
      maxParticipants: 30
    });
    toast.success('Slot added successfully!');
  };

  const removeSlot = (index) => {
    setAssessmentData(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index)
    }));
    toast.success('Slot removed successfully!');
  };

  // Edit modal slot functions
  const handleEditSlotInputChange = (e) => {
    const { name, value } = e.target;
    setEditNewSlot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addEditSlot = () => {
    if (!editNewSlot.slotId || !editNewSlot.startTime || !editNewSlot.endTime) {
      toast.error('Please fill in all slot fields!');
      return;
    }

    // Check if slot ID already exists
    const slotExists = editFormData.slots.some(slot => slot.slotId === editNewSlot.slotId);
    if (slotExists) {
      toast.error('Slot ID already exists! Please use a different ID.');
      return;
    }

    setEditFormData(prev => ({
      ...prev,
      slots: [...prev.slots, { ...editNewSlot, isActive: true, registeredStudents: [] }]
    }));

    setEditNewSlot({
      slotId: '',
      startTime: '',
      endTime: '',
      maxParticipants: 30
    });
    toast.success('Slot added successfully!');
  };

  const removeEditSlot = (index) => {
    setEditFormData(prev => ({
      ...prev,
      slots: prev.slots.filter((_, i) => i !== index)
    }));
    toast.success('Slot removed successfully!');
  };

  const handleQuestionPaperUpload = async (courseId, file, description, isTegaExamPaper = false) => {
    if (!file) return;

    if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' &&
        file.type !== 'application/vnd.ms-excel') {
      toast.error('Please upload Excel files only!');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('questionPaper', file);
      // Only append courseId if it's not a TEGA exam paper
      if (!isTegaExamPaper && courseId) {
      formData.append('courseId', courseId);
      }
      formData.append('description', description);
      formData.append('isTegaExamPaper', isTegaExamPaper);

      console.log('🔍 Uploading question paper:', {
        courseId,
        fileName: file.name,
        fileType: file.type,
        userRole: user.role,
        hasToken: !!user.token,
        tokenLength: user.token?.length
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/question-papers/admin/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      const result = await response.json();

      console.log('🔍 Upload response:', {
        status: response.status,
        success: result.success,
        message: result.message
      });

      if (result.success) {
        toast.success(`Successfully imported ${result.questionPaper.totalQuestions} questions!`);
        if (result.errors && result.errors.length > 0) {
          console.warn('Import warnings:', result.errors);
        }
        // Refresh question papers for the selected course
        fetchQuestionPapers(courseId);
      } else {
        console.error('❌ Upload failed:', result);
        toast.error(result.message || 'Failed to upload question paper');
      }
    } catch (error) {
      console.error('❌ Error uploading question paper:', error);
      toast.error('Failed to upload question paper');
    } finally {
      setLoading(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields (courseId not required for TEGA exams)
    if (!assessmentData.title || 
        (!assessmentData.courseId && !assessmentData.isTegaExam) ||
        !assessmentData.duration || !assessmentData.totalMarks || !assessmentData.passingMarks || 
        !assessmentData.examDate) {
      toast.error('Please fill in all required fields!');
      return;
    }

    if (assessmentData.slots.length === 0) {
      toast.error('Please add at least one time slot!');
      return;
    }

    // Validate TEGA exam payment
    if (assessmentData.isTegaExam && assessmentData.requiresPayment && (!assessmentData.price || assessmentData.price <= 0)) {
      toast.error('Please enter a valid TEGA Exam fee!');
      return;
    }

    try {
      setLoading(true);
      const response = await api('/api/exams/admin/create', {
        method: 'POST',
        body: assessmentData
      });

      if (response.success) {
        toast.success('Exam created successfully!');
    setAssessmentData({
      title: '',
          courseId: '',
      description: '',
          duration: '',
          totalMarks: '',
          passingMarks: '',
          examDate: '',
          instructions: '',
          requiresPayment: true,
          price: '',
          maxAttempts: 1,
          slots: [],
          questionPaperId: '',
          isTegaExam: false
        });
        setSelectedCoursePapers([]);
        fetchExams();
      } else {
        toast.error(response.message || 'Failed to create exam');
      }
    } catch (error) {
      console.error('Error creating exam:', error);
      toast.error('Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  const approveRetake = async (examId, studentId) => {
    try {
      const response = await api(`/api/exams/admin/${examId}/${studentId}/approve-retake`, {
        method: 'POST'
      });

      if (response.success) {
        toast.success('Retake approved successfully!');
        fetchExamAttempts(examId);
      } else {
        toast.error(response.message || 'Failed to approve retake');
      }
    } catch (error) {
      console.error('Error approving retake:', error);
      toast.error('Failed to approve retake');
    }
  };

  // Edit exam functions
  const handleEditExam = (exam) => {
    setEditingExam(exam);
    setEditFormData({
      title: exam.title,
      courseId: exam.courseId?._id || exam.courseId,
      description: exam.description,
      duration: exam.duration,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      examDate: exam.examDate ? new Date(exam.examDate).toISOString().split('T')[0] : '',
      instructions: exam.instructions,
      requiresPayment: exam.requiresPayment,
      price: exam.price,
      maxAttempts: exam.maxAttempts,
      slots: exam.slots || [],
      questionPaperId: exam.questionPaperId?._id || exam.questionPaperId
    });
    // Reset edit slot state
    setEditNewSlot({
      slotId: '',
      startTime: '',
      endTime: '',
      maxParticipants: 30
    });
    setEditModalOpen(true);
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    
    if (!editFormData.title || !editFormData.courseId || 
        !editFormData.duration || !editFormData.totalMarks || !editFormData.passingMarks || 
        !editFormData.examDate) {
      toast.error('Please fill in all required fields!');
      return;
    }

    if (editFormData.slots.length === 0) {
      toast.error('Please add at least one time slot!');
      return;
    }

    try {
      setLoading(true);
      const response = await api(`/api/exams/admin/${editingExam._id}/update`, {
        method: 'PUT',
        body: editFormData
      });

      if (response.success) {
        toast.success('Exam updated successfully!');
        setEditModalOpen(false);
        setEditingExam(null);
        fetchExams();
      } else {
        toast.error(response.message || 'Failed to update exam');
      }
    } catch (error) {
      console.error('Error updating exam:', error);
      toast.error('Failed to update exam');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExam = async (examId) => {
    // Get exam details to show in confirmation
    const exam = exams.find(e => e._id === examId);
    const examTitle = exam ? exam.title : 'this exam';
    
    const confirmMessage = `Are you sure you want to delete "${examTitle}"?\n\n` +
      `⚠️ WARNING: This will permanently delete:\n` +
      `• The exam and all its data\n` +
      `• All student registrations for this exam\n` +
      `• All exam attempts and results\n\n` +
      `This action cannot be undone!`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setLoading(true);
      const response = await api(`/api/exams/admin/${examId}/delete`, {
        method: 'DELETE'
      });

      if (response.success) {
        toast.success(response.message || 'Exam deleted successfully!');
        fetchExams();
      } else {
        toast.error(response.message || 'Failed to delete exam');
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast.error('Failed to delete exam');
    } finally {
      setLoading(false);
    }
  };

  // Create test exam with current time
  const createTestExam = async () => {
    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    const endTime = new Date(now.getTime() + 30 * 60 * 1000).toTimeString().split(' ')[0].substring(0, 5); // 30 minutes later

    const testExamData = {
      title: `TEGA Test Exam - ${now.toLocaleString()}`,
      courseId: '', // No course for TEGA exams
      isTegaExam: true, // Mark as TEGA exam
      description: 'Test TEGA exam created for debugging time access control',
      duration: 30,
      totalMarks: 50,
      passingMarks: 25,
      examDate: now.toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
      instructions: 'This is a test TEGA exam for debugging purposes',
      requiresPayment: false,
      price: 0,
      maxAttempts: 1,
      slots: [{
        slotId: `test-slot-${Date.now()}`,
        startTime: currentTime,
        endTime: endTime,
        maxParticipants: 10,
        isActive: true,
        registeredStudents: []
      }]
    };

    try {
      setLoading(true);
      const response = await api('/api/exams/admin/create', {
        method: 'POST',
        body: testExamData
      });

      if (response.success) {
        toast.success('Test exam created successfully!');
        fetchExams();
        setActiveTab('manage'); // Switch to manage tab to see the new exam
      } else {
        toast.error(response.message || 'Failed to create test exam');
      }
    } catch (error) {
      console.error('Error creating test exam:', error);
      toast.error('Failed to create test exam');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'full': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeIcon = (type) => {
    return type === 'pdf' ? '📄' : '📊';
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Assessment</h1>
          <p className="text-gray-600">Create and manage exam schedules, upload question papers, and assign slots to registered users.</p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'schedule', label: 'Schedule New Assessment', icon: Calendar },
                { id: 'question-papers', label: 'Question Papers', icon: FolderOpen },
                { id: 'manage', label: 'Manage Assessments', icon: FileText },
                { id: 'registrations', label: 'Exam Registrations', icon: Users },
                { id: 'results', label: 'Exam Results', icon: CheckCircle }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      if (tab.id === 'question-papers') {
                        fetchAllQuestionPapers();
                      }
                      if (tab.id === 'registrations' && exams.length > 0) {
                        fetchRegistrations(exams[0]._id);
                      }
                      if (tab.id === 'results' && exams.length > 0) {
                        fetchExamAttempts(exams[0]._id);
                      }
                    }}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow">
          {activeTab === 'schedule' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Schedule New Assessment</h2>
                <button
                  onClick={createTestExam}
                  className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  title="Create test exam with current time for debugging"
                >
                  Quick Test Exam
                </button>
              </div>

              {/* Tega Exam Banner */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">🎯 Tega Main Exam</h3>
                    <p className="text-purple-100 text-sm">
                      Create and manage the main Tega examination with custom settings
                    </p>
                  </div>
                  <button
                    onClick={() => {
                        setAssessmentData(prev => ({
                          ...prev,
                        courseId: '', // No course for TEGA exams
                        title: 'TEGA Main Exam',
                        isTegaExam: true, // Mark as TEGA exam
                          requiresPayment: true,
                        price: 1999 // Default TEGA exam price
                      }));
                      console.log('🔍 Setting up TEGA exam (standalone)');
                    }}
                    className="px-4 py-2 bg-white text-purple-600 rounded-md hover:bg-purple-50 transition-colors font-medium"
                  >
                    Create TEGA Exam
                  </button>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assessment Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={assessmentData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter assessment title"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {assessmentData.isTegaExam ? 'Exam Type' : 'Course *'}
                    </label>
                    {assessmentData.isTegaExam ? (
                      <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600">
                        🎯 TEGA Standalone Exam (No Course Required)
                      </div>
                    ) : (
                    <select
                      name="courseId"
                      value={assessmentData.courseId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Exam Date *
                    </label>
                    <input
                      type="date"
                      name="examDate"
                      value={assessmentData.examDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration (minutes) *
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={assessmentData.duration}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 120"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Marks *
                    </label>
                    <input
                      type="number"
                      name="totalMarks"
                      value={assessmentData.totalMarks}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passing Marks *
                    </label>
                    <input
                      type="number"
                      name="passingMarks"
                      value={assessmentData.passingMarks}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Attempts
                    </label>
                    <input
                      type="number"
                      name="maxAttempts"
                      value={assessmentData.maxAttempts}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="e.g., 1"
                      min="1"
                    />
                  </div>

                  {/* TEGA Exam Payment Settings */}
                  {assessmentData.isTegaExam && (
                  <div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="requiresPayment"
                          checked={assessmentData.requiresPayment}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                          TEGA Exam Payment Required
                        </label>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">
                        💡 TEGA Exam is a standalone exam with separate payment
                      </p>

                      {assessmentData.requiresPayment && (
                        <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                            TEGA Exam Fee (₹) *
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={assessmentData.price}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., 1999"
                            min="0"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            This is the fee for taking the TEGA Exam
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Regular Course Exams - No Payment */}
                  {!assessmentData.isTegaExam && assessmentData.courseId && (
                    <div>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <span className="text-sm font-medium text-green-800">
                            Free Exam Access
                          </span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          Users who have paid for this course will get free access to this exam
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Paper Selection */}
                {(assessmentData.courseId || assessmentData.isTegaExam) && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                      Select Question Paper
                    </label>
                      {assessmentData.isTegaExam && (
                        <button
                          type="button"
                          onClick={fetchTegaExamQuestionPapers}
                          className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                          title="Refresh TEGA exam question papers"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Refresh
                        </button>
                      )}
                    </div>
                    <div className="space-y-2">
                    <select
                      name="questionPaperId"
                      value={assessmentData.questionPaperId}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a question paper</option>
                      {selectedCoursePapers.map((paper) => (
                        <option key={paper._id} value={paper._id}>
                          {paper.name} ({paper.totalQuestions} questions)
                        </option>
                      ))}
                    </select>
                      
                      {/* Quick delete buttons for selected papers */}
                      {selectedCoursePapers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedCoursePapers.map((paper) => (
                            <div key={paper._id} className="flex items-center bg-gray-50 rounded-md px-2 py-1 text-xs">
                              <span className="text-gray-600 truncate max-w-32">{paper.name}</span>
                              <button
                                onClick={() => {
                                  if (paper.usedByExams && paper.usedByExams.length > 0) {
                                    const examList = paper.usedByExams.map(exam => exam.title).join(', ');
                                    toast.error(
                                      `Cannot delete "${paper.name}". It is being used by: ${examList}.`,
                                      { duration: 5000 }
                                    );
                                    return;
                                  }
                                  
                                  if (window.confirm(`Delete "${paper.name}"?`)) {
                                    deleteQuestionPaper(paper._id);
                                  }
                                }}
                                className={`ml-1 transition-colors ${
                                  paper.usedByExams && paper.usedByExams.length > 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-red-500 hover:text-red-700'
                                }`}
                                title={
                                  paper.usedByExams && paper.usedByExams.length > 0
                                    ? 'Cannot delete - being used by exams'
                                    : 'Delete this question paper'
                                }
                                disabled={paper.usedByExams && paper.usedByExams.length > 0}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedCoursePapers.length === 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        {assessmentData.isTegaExam ? (
                          <div>
                            <p>No TEGA exam question papers available. Upload one first.</p>
                            <p className="text-xs text-gray-400 mt-1">
                              💡 Go to "Question Papers" tab and upload a TEGA exam question paper
                            </p>
                          </div>
                        ) : (
                          <p>No question papers available for this course. Upload one first.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={assessmentData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter assessment description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instructions
                  </label>
                  <textarea
                    name="instructions"
                    value={assessmentData.instructions}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter exam instructions..."
                  />
                </div>

                {/* Time Slots Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Slots *
                  </label>
                  
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Slot ID
                        </label>
                        <input
                          type="text"
                          name="slotId"
                          value={newSlot.slotId}
                          onChange={handleSlotInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="e.g., Slot-1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Time
                        </label>
                        <input
                          type="time"
                          name="startTime"
                          value={newSlot.startTime}
                          onChange={handleSlotInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Time
                        </label>
                        <input
                          type="time"
                          name="endTime"
                          value={newSlot.endTime}
                          onChange={handleSlotInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Max Participants
                        </label>
                        <input
                          type="number"
                          name="maxParticipants"
                          value={newSlot.maxParticipants}
                          onChange={handleSlotInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          min="1"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addSlot}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Slot
                    </button>
                  </div>

                  {/* Display added slots */}
                  {assessmentData.slots.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900">Added Slots:</h4>
                      {assessmentData.slots.map((slot, index) => (
                        <div key={index} className="flex items-center justify-between bg-white border border-gray-300 rounded-md p-3">
                          <span className="text-sm">
                            <strong>{slot.slotId}</strong> - {slot.startTime} to {slot.endTime} (Max: {slot.maxParticipants})
                          </span>
                          <button
                            type="button"
                            onClick={() => removeSlot(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Assessment'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'question-papers' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Question Papers Management</h2>
              
              {/* Upload New Question Paper */}
              <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Upload New Question Paper</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question Paper Type *
                    </label>
                    <select
                      id="uploadType"
                      onChange={(e) => {
                        const uploadType = e.target.value;
                        const courseSelect = document.getElementById('uploadCourseId');
                        if (uploadType === 'tega-exam') {
                          courseSelect.style.display = 'none';
                          courseSelect.required = false;
                        } else {
                          courseSelect.style.display = 'block';
                          courseSelect.required = true;
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select type</option>
                      <option value="course">Course-based Question Paper</option>
                      <option value="tega-exam">TEGA Exam Question Paper</option>
                    </select>
                  </div>
                  <div id="courseSelectDiv">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Course *
                    </label>
                    <select
                      id="uploadCourseId"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select a course</option>
                      {courses.map((course) => (
                        <option key={course._id} value={course._id}>
                          {course.courseName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                  <textarea
                    id="uploadDescription"
                    rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Brief description of the question paper"
                    />
                  </div>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Excel File *
                    </label>
                    <input
                      id="uploadFile"
                      type="file"
                      accept=".xlsx,.xls"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Required Excel File Format</h4>
                    <p className="text-sm text-blue-700 mb-2">Your Excel file must contain these exact column headers:</p>
                    <div className="grid grid-cols-4 gap-2 text-sm font-mono bg-white p-2 rounded border">
                      <div className="font-semibold">sno</div>
                      <div className="font-semibold">question</div>
                      <div className="font-semibold">optionA</div>
                      <div className="font-semibold">optionB</div>
                      <div className="font-semibold">optionC</div>
                      <div className="font-semibold">optionD</div>
                      <div className="font-semibold">correct</div>
                </div>
                    <p className="text-xs text-blue-600 mt-2">
                      • Each question gets 1 mark for correct answer, 0 for wrong<br/>
                      • 'correct' column should contain A, B, C, or D<br/>
                      • Save your file as .xlsx or .xls format
                    </p>
                  </div>
                  <div className="flex items-end space-x-2">
                    <button
                      onClick={() => {
                        const uploadType = document.getElementById('uploadType').value;
                        const courseId = document.getElementById('uploadCourseId').value;
                        const description = document.getElementById('uploadDescription').value;
                        const file = document.getElementById('uploadFile').files[0];
                        
                        if (!uploadType || !file) {
                          toast.error('Please select type and upload file');
                          return;
                        }
                        
                        if (uploadType === 'course' && !courseId) {
                          toast.error('Please select a course for course-based question paper');
                          return;
                        }
                        
                        const isTegaExamPaper = uploadType === 'tega-exam';
                        handleQuestionPaperUpload(courseId, file, description, isTegaExamPaper);
                        
                        // Clear form
                        document.getElementById('uploadType').value = '';
                        document.getElementById('uploadCourseId').value = '';
                        document.getElementById('uploadDescription').value = '';
                        document.getElementById('uploadFile').value = '';
                      }}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {loading ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Papers List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {questionPapers.map((paper) => (
                  <div key={paper._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">📊</span>
                        <div>
                          <h4 className="font-medium text-gray-900 truncate">{paper.name}</h4>
                          <p className="text-sm text-gray-500">
                            {paper.isTegaExamPaper ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                🎯 TEGA Exam
                              </span>
                            ) : (
                              paper.courseId?.courseName || 'N/A'
                            )}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (paper.usedByExams && paper.usedByExams.length > 0) {
                            const examList = paper.usedByExams.map(exam => exam.title).join(', ');
                            toast.error(
                              `Cannot delete "${paper.name}". It is being used by: ${examList}. Please remove it from these exams first.`,
                              { duration: 6000 }
                            );
                            return;
                          }
                          
                          if (window.confirm(`Are you sure you want to delete "${paper.name}"? This action cannot be undone.`)) {
                            deleteQuestionPaper(paper._id);
                          }
                        }}
                        className={`transition-colors ${
                          paper.usedByExams && paper.usedByExams.length > 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-red-600 hover:text-red-800'
                        }`}
                        title={
                          paper.usedByExams && paper.usedByExams.length > 0
                            ? 'Cannot delete - being used by exams'
                            : 'Delete question paper'
                        }
                        disabled={paper.usedByExams && paper.usedByExams.length > 0}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{paper.description}</p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <span>Questions: {paper.totalQuestions}</span>
                    </div>
                    
                    {/* Show if question paper is being used by exams */}
                    {paper.usedByExams && paper.usedByExams.length > 0 && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-3">
                        <div className="flex items-center text-xs text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          <span className="font-medium">Used by {paper.usedByExams.length} exam(s)</span>
                        </div>
                        <div className="text-xs text-yellow-700 mt-1">
                          {paper.usedByExams.map(exam => exam.title).join(', ')}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-800 text-sm">
                        <Eye className="w-4 h-4 inline mr-1" />
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-800 text-sm">
                        <Download className="w-4 h-4 inline mr-1" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {questionPapers.length === 0 && (
                <div className="text-center py-12">
                  <FolderOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No question papers found</h3>
                  <p className="text-gray-500">Upload your first question paper to get started.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'manage' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Manage Assessments</h2>
              
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : exams.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No assessments found</h3>
                  <p className="text-gray-500">Create your first assessment to get started.</p>
                </div>
              ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assessment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date & Slots
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Questions
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                      {exams.map((exam) => (
                        <tr key={exam._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                              <div className="text-sm font-medium text-gray-900">{exam.title}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.isTegaExam ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                🎯 TEGA Exam
                              </span>
                            ) : (
                              exam.courseId?.courseName || 'N/A'
                            )}
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{new Date(exam.examDate).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{exam.slots?.length || 0} slots</div>
                            {exam.slots && exam.slots.length > 0 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {exam.slots.map((slot, index) => (
                                  <div key={index} className="flex items-center">
                                    <Clock className="w-3 h-3 mr-1" />
                                    {slot.startTime} - {slot.endTime} ({slot.maxParticipants - (slot.registeredStudents?.length || 0)} seats left)
                          </div>
                                ))}
                              </div>
                            )}
                        </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.questionPaperId?.totalQuestions || 0} questions
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {exam.duration || 'N/A'} minutes
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditExam(exam)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Edit Exam"
                              >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setActiveTab('question-papers')}
                                className="text-green-600 hover:text-green-900"
                                title="Manage Question Papers"
                              >
                                <FolderOpen className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteExam(exam._id)}
                              className="text-red-600 hover:text-red-900"
                                title="Delete Exam"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Exam Registrations</h2>
              
              {exams.length === 0 ? (
                <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                  <p className="text-gray-500">Create an exam first to view registrations.</p>
              </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <select 
                      onChange={(e) => fetchRegistrations(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select an exam to view registrations</option>
                      {exams.map((exam) => (
                        <option key={exam._id} value={exam._id}>
                          {exam.title} - {new Date(exam.examDate).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {registrations.length === 0 ? (
                    <div className="text-center py-12">
                      <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
                      <p className="text-gray-500">Students will appear here once they register for the selected exam.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Slot
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Registration Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Payment Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {registrations.map((registration) => (
                            <tr key={registration._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {registration.studentId?.studentName || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {registration.studentId?.email || 'N/A'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {registration.slotId} ({registration.slotStartTime} - {registration.slotEndTime})
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {new Date(registration.registrationDate).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  registration.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                                  registration.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {registration.paymentStatus}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button className="text-indigo-600 hover:text-indigo-900">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
            </div>
          )}
        </div>
              )}
      </div>
          )}

          {activeTab === 'results' && (
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-6">Exam Results</h2>
              
              {exams.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No exams found</h3>
                  <p className="text-gray-500">Create an exam first to view results.</p>
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <select 
                      onChange={(e) => fetchExamAttempts(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="">Select an exam to view results</option>
                      {exams.map((exam) => (
                        <option key={exam._id} value={exam._id}>
                          {exam.title} - {new Date(exam.examDate).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {examAttempts.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results yet</h3>
                      <p className="text-gray-500">Students' results will appear here once they complete the selected exam.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percentage
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attempt
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {examAttempts.map((attempt) => (
                            <tr key={attempt._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {attempt.studentId?.studentName || 'N/A'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {attempt.studentId?.email || 'N/A'}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {attempt.score}/{attempt.totalMarks}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {Math.round(attempt.percentage * 100) / 100}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {attempt.isQualified ? (
                                    <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                                  )}
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    attempt.isQualified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {attempt.isQualified ? 'Qualified' : 'Not Qualified'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {attempt.attemptNumber}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                {!attempt.canRetake && (
                                  <button 
                                    onClick={() => approveRetake(attempt.examId, attempt.studentId._id)}
                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                  >
                                    Allow Retake
                                  </button>
                                )}
                                <button className="text-indigo-600 hover:text-indigo-900">
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Exam Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Edit Exam</h2>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>

            <form onSubmit={handleUpdateExam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Course *
                  </label>
                  <select
                    value={editFormData.courseId}
                    onChange={(e) => setEditFormData({...editFormData, courseId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course._id} value={course._id}>
                        {course.courseName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes) *
                  </label>
                  <input
                    type="number"
                    value={editFormData.duration}
                    onChange={(e) => setEditFormData({...editFormData, duration: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks *
                  </label>
                  <input
                    type="number"
                    value={editFormData.totalMarks}
                    onChange={(e) => setEditFormData({...editFormData, totalMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Passing Marks *
                  </label>
                  <input
                    type="number"
                    value={editFormData.passingMarks}
                    onChange={(e) => setEditFormData({...editFormData, passingMarks: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                    min="1"
                    max={editFormData.totalMarks}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Date *
                </label>
                <input
                  type="date"
                  value={editFormData.examDate}
                  onChange={(e) => setEditFormData({...editFormData, examDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>

              {(() => {
                const tegaCourse = courses.find(course => course.courseName === 'Tega Exam');
                return tegaCourse && editFormData.courseId === tegaCourse._id;
              })() && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="editRequiresPayment"
                      checked={editFormData.requiresPayment}
                      onChange={(e) => setEditFormData({...editFormData, requiresPayment: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="editRequiresPayment" className="text-sm font-medium text-gray-700">
                      Requires Payment
                    </label>
                  </div>

                  {editFormData.requiresPayment && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tega Exam Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({...editFormData, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        min="0"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={editFormData.instructions}
                  onChange={(e) => setEditFormData({...editFormData, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  rows="3"
                  placeholder="Enter exam instructions..."
                />
              </div>

              {/* Time Slots Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Slots *
                </label>
                <div className="space-y-2">
                  {editFormData.slots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <span className="text-sm font-medium">Slot {index + 1}:</span>
                        <span className="ml-2 text-sm">
                          {slot.startTime} - {slot.endTime} ({slot.maxParticipants} participants)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEditSlot(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add New Slot Section */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-900 mb-3">Add New Time Slot</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slot ID
                      </label>
                      <input
                        type="text"
                        name="slotId"
                        value={editNewSlot.slotId}
                        onChange={handleEditSlotInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g., Slot-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Time
                      </label>
                      <input
                        type="time"
                        name="startTime"
                        value={editNewSlot.startTime}
                        onChange={handleEditSlotInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Time
                      </label>
                      <input
                        type="time"
                        name="endTime"
                        value={editNewSlot.endTime}
                        onChange={handleEditSlotInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Participants
                      </label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={editNewSlot.maxParticipants}
                        onChange={handleEditSlotInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        min="1"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={addEditSlot}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Slot
                  </button>
                </div>

                <p className="text-sm text-gray-500 mt-2">
                  Note: You can add new time slots or remove existing ones. Changes will be saved when you update the exam.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditModalOpen(false);
                    setEditNewSlot({
                      slotId: '',
                      startTime: '',
                      endTime: '',
                      maxParticipants: 30
                    });
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Exam'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleAssessment;
