import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../utils/api.js'
import toast from 'react-hot-toast'
import MessageDisplay from '../components/ui/MessageDisplay'
import { useMessage } from '../hooks/useMessage'
import { getMessage } from '../utils/messages'
import StreamlinedCourseCreation from '../components/StreamlinedCourseCreation.jsx'
import BulkCourseImport from '../components/BulkCourseImport.jsx'
import EditCourseModal from '../components/EditCourseModal.jsx'
import CourseEditModal from '../components/CourseEditModal.jsx'
import styles from '../styles/tabContent.module.css'
import {
  Upload,
  FileSpreadsheet,
  BookOpen,
  Search,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  QrCode,
  DollarSign
} from 'lucide-react'

const AdminCoursePayment = () => {
  const { user, loading: authLoading } = useAuth()
  const { message, showSuccess, showError, clearMessage } = useMessage()

  const [activeTab, setActiveTab] = useState('create')

  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')

  const [editingCourse, setEditingCourse] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isCourseEditModalOpen, setIsCourseEditModalOpen] = useState(false)

  const [upiSettings, setUpiSettings] = useState({
    upiId: '9347623445@ybl',
    merchantName: 'TEGA Platform',
    isEnabled: true
  })

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      fetchCourses()
      loadUPISettings()
    }
  }, [authLoading, user])

  const fetchCourses = async (retryCount = 0) => {
    try {
      setIsLoading(true)
      const response = await api('/api/courses/admin/all')
      setCourses(response.courses || response.data || [])
    } catch (error) {
      if (
        retryCount === 0 &&
        (error.message.includes('token') ||
          error.message.includes('unauthorized') ||
          error.message.includes('401'))
      ) {
        setTimeout(() => fetchCourses(1), 1000)
        return
      }
      const errorMessage = getMessage('system', 'load', 'Failed to fetch courses');
      showError(errorMessage, 'Loading Failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCourseUploaded = (newCourse) => {
    setCourses((prev) => [newCourse, ...prev])
    showSuccess('Course created successfully and is now available to students.', 'Course Added')
    setActiveTab('manage')
  }

  const handleCoursesUploaded = (newCourses) => {
    setCourses((prev) => [...newCourses, ...prev])
    showSuccess(`Successfully imported ${newCourses.length} courses. All courses are now available to students.`, 'Bulk Import Successful')
    setActiveTab('manage')
  }

  const handleToggleCourseStatus = async (course) => {
    try {
      const normalizeCategory = (raw) => {
        const value = (raw || '').toString().toLowerCase()
        const map = {
          'web development': 'web',
          'web': 'web',
          'programming': 'programming',
          'ai & ml': 'ai',
          'ai/ml': 'ai',
          'ai': 'ai',
          'data science': 'data-science',
          'cloud computing': 'cloud',
          'cloud': 'cloud',
          'cyber security': 'cyber',
          'cybersecurity': 'cyber',
          'office tools': 'office',
          'office skills': 'office',
          'mobile development': 'mobile',
          'devops': 'devops',
          'comprehensive': 'comprehensive'
        }
        return map[value] || 'programming'
      }

      const normalizeDifficulty = (raw) => {
        const value = (raw || '').toString().toLowerCase()
        if (['beginner','intermediate','advanced'].includes(value)) return value
        // Map possible display variants
        if (value === 'easy') return 'beginner'
        if (value === 'medium') return 'intermediate'
        if (value === 'hard') return 'advanced'
        return 'beginner'
      }

      const payload = {
        // Server requires title and description
        title: course.courseName || course.title || 'Course',
        description: course.description || 'No description provided',
        // Preserve existing fields to avoid unintended validation issues
        category: normalizeCategory(course.category),
        difficulty: normalizeDifficulty(course.level || course.difficulty || 'beginner'),
        price: course.price,
        duration: course.duration,
        instructor: typeof course.instructor === 'string' ? course.instructor : (course.instructor?.name || 'Instructor'),
        isActive: !course.isActive
      }

      await api(`/api/courses/${course._id || course.courseId}`, { method: 'PUT', body: payload })

      setCourses((prev) => prev.map((c) => (c._id === course._id || c.courseId === course.courseId ? { ...c, isActive: !course.isActive } : c)))

      showSuccess(`Course "${course.title}" has been ${!course.isActive ? 'activated' : 'deactivated'} successfully.`, 'Status Updated')
    } catch (error) {
      const errorMessage = getMessage('course', 'update', error.message);
      showError(errorMessage, 'Update Failed')
    }
  }

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) return
    try {
      await api(`/api/admin/courses/${courseId}`, { method: 'DELETE' })
      setCourses((prev) => prev.filter((course) => course.courseId !== courseId && course._id !== courseId))
      showSuccess(`Course "${courseTitle}" has been deleted successfully.`, 'Course Deleted')
    } catch (error) {
      const errorMessage = getMessage('course', 'delete', error.message);
      showError(errorMessage, 'Deletion Failed')
    }
  }

  const handleEditCourse = async (course) => {
    try {
      let response = await api(`/api/admin/courses/${course._id}`)
      if (!response.success && course.courseId && course.courseId !== course._id) {
        response = await api(`/api/admin/courses/${course.courseId}`)
      }
      if (response.success && response.course) {
        setEditingCourse(response.course)
        setIsCourseEditModalOpen(true)
      } else {
        setEditingCourse(course)
        setIsCourseEditModalOpen(true)
      }
    } catch (error) {
      setEditingCourse(course)
      setIsCourseEditModalOpen(true)
    }
  }

  const handleSaveCourse = async (courseId, updatedData) => {
    try {
      const response = await api(`/api/admin/courses/${courseId}`, { method: 'PUT', body: JSON.stringify(updatedData) })
      if (response.success) {
        showSuccess('Course information updated successfully and changes are now live.', 'Course Updated')
        await fetchCourses()
        setIsCourseEditModalOpen(false)
        setEditingCourse(null)
      } else {
        throw new Error(response.message || 'Failed to update course')
      }
    } catch (error) {
      const errorMessage = getMessage('course', 'update', error.message);
      showError(errorMessage, 'Update Failed')
      throw error
    }
  }

  const loadUPISettings = async () => {
    try {
      const response = await api('/api/admin/upi-settings')
      if (response.success) {
        setUpiSettings(response.data || response.settings)
      }
    } catch (error) {
      // non-blocking
    }
  }

  const updateUPISettings = async () => {
    try {
      await api('/api/admin/upi-settings', { method: 'PUT', body: upiSettings })
      showSuccess('UPI payment settings updated successfully. Changes are now active.', 'Settings Updated')
      loadUPISettings()
    } catch (error) {
      const errorMessage = getMessage('system', 'save', error.message);
      showError(errorMessage, 'Update Failed')
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      (course.courseName && course.courseName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.description && course.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (course.instructor && course.instructor.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory
    const matchesDifficulty = filterDifficulty === 'all' || course.level === filterDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses & Payments</h1>
          <p className="text-gray-600">Create and manage courses, pricing, and UPI settings</p>
        </div>

        {/* Professional Message Display */}
        <MessageDisplay
          show={message.show}
          type={message.type}
          title={message.title}
          message={message.message}
          onClose={clearMessage}
          className="mb-6"
        />

        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[{ id: 'create', label: 'Course Creation', icon: Upload }, { id: 'bulk', label: 'Bulk Import', icon: FileSpreadsheet }, { id: 'manage', label: 'Manage & Pricing', icon: BookOpen }, { id: 'payments', label: 'UPI Settings', icon: QrCode }].map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div className={`p-6 ${styles.tabContent}`}>
            <AnimatePresence mode="wait">
              {activeTab === 'create' && (
                <motion.div key="create" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <StreamlinedCourseCreation onCourseCreated={handleCourseUploaded} />
                </motion.div>
              )}

              {activeTab === 'bulk' && (
                <motion.div key="bulk" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <BulkCourseImport onCoursesUploaded={handleCoursesUploaded} />
                </motion.div>
              )}

              {activeTab === 'manage' && (
                <motion.div key="manage" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="mb-6 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <button onClick={() => fetchCourses()} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                      </button>

                      <div className="flex gap-2">
                        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="all">All Categories</option>
                          <option value="programming">Programming</option>
                          <option value="ai">AI & ML</option>
                          <option value="web">Web Development</option>
                          <option value="cloud">Cloud Computing</option>
                          <option value="cyber">Cybersecurity</option>
                          <option value="office">Office Skills</option>
                          <option value="comprehensive">Comprehensive</option>
                        </select>

                        <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                          <option value="all">All Levels</option>
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                        Course Pricing Management
                      </h2>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modules</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredCourses.map((course) => (
                            <tr key={course._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{course.courseName}</div>
                                  <div className="text-sm text-gray-500">{course.description}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                  <span className="text-sm font-medium text-gray-900">₹{course.price}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">{course.duration}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 text-blue-600 mr-1" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {course.modules?.length || 0} modules
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {course.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex space-x-2">
                                  <button onClick={() => handleEditCourse(course)} className="text-indigo-600 hover:text-indigo-900">
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <button onClick={() => handleToggleCourseStatus(course)} className={"text-sm"}>
                                    {course.isActive ? (
                                      <span className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700">
                                        <EyeOff className="w-4 h-4" /> Deactivate
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-green-600 hover:text-green-700">
                                        <Eye className="w-4 h-4" /> Activate
                                      </span>
                                    )}
                                  </button>
                                  <button onClick={() => handleDeleteCourse(course._id, course.courseName)} className="text-red-600 hover:text-red-900">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'payments' && (
                <motion.div key="payments" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h2 className="text-lg font-medium text-gray-900 flex items-center">
                        <QrCode className="h-5 w-5 mr-2 text-purple-600" />
                        UPI Payment Settings
                      </h2>
                    </div>
                    <div className="px-6 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                          <input
                            type="text"
                            value={upiSettings.upiId}
                            onChange={(e) => setUpiSettings({ ...upiSettings, upiId: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Name</label>
                          <input
                            type="text"
                            value={upiSettings.merchantName}
                            onChange={(e) => setUpiSettings({ ...upiSettings, merchantName: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div className="flex items-end">
                          <button onClick={updateUPISettings} className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            Update UPI Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <EditCourseModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} course={editingCourse} onSave={handleSaveCourse} />
      <CourseEditModal isOpen={isCourseEditModalOpen} onClose={() => setIsCourseEditModalOpen(false)} course={editingCourse} onSave={handleSaveCourse} />
    </div>
  )
}

export default AdminCoursePayment