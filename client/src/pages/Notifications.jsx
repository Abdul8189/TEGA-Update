import { useState, useEffect } from 'react'
import { Bell, CheckCircle, XCircle, Info, AlertTriangle, Clock, DollarSign, BookOpen } from 'lucide-react'
import UserDashboardLayout from '../components/UserDashboardLayout'
import toast from 'react-hot-toast'
import { notificationAPI, adminPaymentAPI } from '../utils/api'
import { useLocation } from 'react-router-dom'

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [adminPayments, setAdminPayments] = useState([])
  const [adminTotals, setAdminTotals] = useState(null)
  const [adminPaymentNotifications, setAdminPaymentNotifications] = useState([])
  const [paymentFilter, setPaymentFilter] = useState('all') // 'all', 'old', 'new'
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (isAdminRoute) {
      loadAdminPayments()
      loadAdminPaymentNotifications()
    } else {
    loadNotifications()
    }
    
    const handlePaymentComplete = () => {
      if (isAdminRoute) {
        loadAdminPayments();
        loadAdminPaymentNotifications();
      }
    }

    window.addEventListener('paymentCompleted', handlePaymentComplete)
    return () => window.removeEventListener('paymentCompleted', handlePaymentComplete)
  }, [isAdminRoute])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      
      // Get notifications from backend API
      const response = await notificationAPI.getUserNotifications()
      const apiNotifications = response.notifications || []
      
      // Convert API notifications to frontend format
      const apiNotificationFormatted = apiNotifications.map(notification => ({
        id: notification._id || notification.id,
        type: notification.type || 'info',
        title: notification.type === 'payment' ? 'Payment Successful' : 'Notification',
        message: notification.message,
        timestamp: new Date(notification.createdAt || notification.date),
        status: notification.type === 'payment' ? 'success' : 'info',
        icon: notification.type === 'payment' ? CheckCircle : Info,
        color: notification.type === 'payment' ? 'text-green-600' : 'text-blue-600',
        bgColor: notification.type === 'payment' ? 'bg-green-50' : 'bg-blue-50',
        read: notification.isRead || false
      }))

      // Add some sample system notifications
      const systemNotifications = [
        {
          id: 'sys-1',
          type: 'system',
          title: 'Welcome to Tega!',
          message: 'Thank you for joining our platform. Start exploring courses and enhance your skills.',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          status: 'info',
          icon: Info,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          read: false
        },
        {
          id: 'sys-2',
          type: 'course',
          title: 'New Course Available',
          message: 'Check out our new React.js Development course with hands-on projects.',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          status: 'info',
          icon: BookOpen,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          read: false
        }
      ]

      // Combine all notifications and sort by timestamp
      const allNotifications = [...apiNotificationFormatted, ...systemNotifications]
        .sort((a, b) => b.timestamp - a.timestamp)

      setNotifications(allNotifications)
    } catch (error) {
      console.error('Error loading notifications:', error)
      // Fallback to localStorage if API fails
      try {
        const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
        
        const paymentNotifications = paymentHistory.map(payment => ({
          id: payment.id,
          type: 'payment',
          title: 'Payment Successful',
          message: `Successfully paid ₹${payment.amount} for ${payment.courseName}`,
          timestamp: new Date(payment.date),
          status: 'success',
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          read: false
        }))

        setNotifications(paymentNotifications)
      } catch (localError) {
        console.error('Error loading from localStorage:', localError)
        setNotifications([])
      }
    } finally {
      setLoading(false)
    }
  }

  const loadAdminPayments = async () => {
    try {
      setLoading(true)
      console.log('🔍 Admin: Loading admin payments...')
      
      const response = await adminPaymentAPI.getAllPayments()
      console.log('🔍 Admin: Raw response from API:', response)
      console.log('🔍 Admin: Response data:', response.data)
      console.log('🔍 Admin: Number of payments:', response.data?.length || 0)
      
      // Debug: Check the source field in the first few payments
      if (response.data && response.data.length > 0) {
        console.log('🔍 Admin: Sample payment sources:', response.data.slice(0, 3).map(p => ({
          id: p._id,
          source: p.source,
          paymentMethod: p.paymentMethod,
          status: p.status
        })))
      }
      
      setAdminPayments(response.data || []) // Ensure data is accessed via .data
      
      // Calculate totals
      const totals = {
        count: response.data?.length || 0, // Ensure data is accessed via .data
        totalRevenue: response.data?.filter(p => p.status === 'completed').reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0, // Only completed payments
        byStatus: {},
        bySource: {
          old: response.data?.filter(p => p.source === 'old_payment').length || 0,
          new: response.data?.filter(p => p.source === 'razorpay_payment').length || 0
        }
      }
      
      // Debug: Log the source counts
      console.log('🔍 Admin: Source counts calculated:', {
        old: totals.bySource.old,
        new: totals.bySource.new,
        total: totals.count
      });
      
      // Debug: Check what sources are actually present
      const sources = response.data?.map(p => p.source).filter(Boolean) || [];
      const uniqueSources = [...new Set(sources)];
      console.log('🔍 Admin: Unique sources found:', uniqueSources);
      console.log('🔍 Admin: All sources:', sources);
      
      response.data?.forEach(payment => { // Ensure data is accessed via .data
        const status = payment.status || 'pending'
        totals.byStatus[status] = (totals.byStatus[status] || 0) + 1
      })
      
      console.log('🔍 Admin: Calculated totals:', totals)
      setAdminTotals(totals)
    } catch (error) {
      console.error('❌ Admin: Error loading admin payments:', error)
      toast.error('Failed to load payment data')
    } finally {
      setLoading(false)
    }
  }

  // Filter payments based on selected filter
  const getFilteredPayments = () => {
    const filtered = paymentFilter === 'old' 
      ? adminPayments.filter(p => p.source === 'old_payment')
      : paymentFilter === 'new' 
      ? adminPayments.filter(p => p.source === 'razorpay_payment')
      : adminPayments
    
    console.log('🔍 Admin: Filtered payments for', paymentFilter, ':', filtered.length, 'payments')
    console.log('🔍 Admin: Sample payment data:', filtered[0])
    return filtered
  }

  const loadAdminPaymentNotifications = async () => {
    try {
      console.log('🔍 Admin: Loading payment notifications...')
      const response = await adminPaymentAPI.getPaymentNotifications()
      console.log('🔍 Admin: Payment notifications response:', response)
      console.log('🔍 Admin: Number of notifications:', response.data?.length || 0)
      
      // Assuming response.data contains the notifications array
      setAdminPaymentNotifications(response.data || [])
    } catch (error) {
      console.error('❌ Admin: Error loading admin payment notifications:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      // Only call API for non-system notifications
      if (!notificationId.startsWith('sys-')) {
        await notificationAPI.markAsRead(notificationId)
      }
      
      setNotifications(prev => prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
      ))
      toast.success('Marked as read')
    } catch (error) {
      console.error('Error marking notification as read:', error)
      toast.error('Failed to mark as read')
    }
  }

  const deleteNotification = async (notificationId) => {
    try {
      // Only call API for non-system notifications
      if (!notificationId.startsWith('sys-')) {
        await notificationAPI.deleteNotification(notificationId)
      }
      
      setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const getFilteredNotifications = () => {
    if (filter === 'all') return notifications
    return notifications.filter(notification => notification.type === filter)
  }

  const getUnreadCount = (type) => {
    const filtered = type === 'all' 
      ? notifications 
      : notifications.filter(notification => notification.type === type)
    return filtered.filter(notification => !notification.read).length
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const filteredNotifications = getFilteredNotifications()

  // Loading state
  if (loading) {
    if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      )
    }
    
    return (
      <UserDashboardLayout>
        <div >
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
      </UserDashboardLayout>
    )
  }

  // Admin route
  if (isAdminRoute) {
  return (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Admin Payments Overview */}
            <div className="mb-10">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Payments Overview</h1>
                <p className="text-gray-600">All users payment history and totals</p>
              </div>

              {/* Totals */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500">Total Payments</div>
                  <div className="text-2xl font-semibold text-gray-900">{adminTotals?.count || 0}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500">Completed Amount</div>
                  <div className="text-2xl font-semibold text-gray-900">₹{(adminTotals?.totalRevenue || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-gray-500">By Status</div>
                  <div className="text-sm text-gray-900">
                    {adminTotals && Object.entries(adminTotals.byStatus || {}).map(([status, count]) => (
                      <span key={status} className="mr-3 inline-block">{status}: {count}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payment Filter */}
              <div className="mb-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Filter Payments:</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPaymentFilter('all')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        paymentFilter === 'all'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      All ({adminTotals?.count || 0})
                    </button>
                    <button
                      onClick={() => setPaymentFilter('old')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        paymentFilter === 'old'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Old System ({adminTotals?.bySource?.old || 0})
                    </button>
                    <button
                      onClick={() => setPaymentFilter('new')}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        paymentFilter === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      Razorpay ({adminTotals?.bySource?.new || 0})
                    </button>
                  </div>
                </div>
              </div>

              {/* Payments Table */}
              <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Txn ID</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-600">Loading payments...</td>
                      </tr>
                    ) : getFilteredPayments().length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No payments found.</td>
                      </tr>
                    ) : (
                      getFilteredPayments().map((p) => (
                        <tr key={p._id || p.transactionId} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">{new Date(p.createdAt).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{p.studentId?.firstName || p.studentId?.username || p.studentId?.email || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{p.studentId?.email || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{p.courseName || p.courseId || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">₹{(Number(p.amount || 0)).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">
                            <div className="flex items-center space-x-2">
                              <span>{p.paymentMethod || 'Razorpay'}</span>
                              {p.source === 'razorpay_payment' && (
                                <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              p.status === 'completed' ? 'bg-green-100 text-green-800' :
                              p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              p.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">{p.transactionId}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Payment Notifications Section */}
              {adminPaymentNotifications.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Payment Notifications</h2>
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="divide-y divide-gray-200">
                      {adminPaymentNotifications.slice(0, 5).map((notification) => (
                        <div key={notification._id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                                <span>{new Date(notification.createdAt).toLocaleString()}</span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  Payment Received
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Non-admin route - use UserDashboardLayout
  return (
    <UserDashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* User Notifications */}
          <div className="mb-10">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Stay updated with your latest activities</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              {[
                { key: 'all', label: 'All', count: notifications.length },
                { key: 'unread', label: 'Unread', count: getUnreadCount('unread') },
                { key: 'success', label: 'Success', count: getUnreadCount('success') },
                { key: 'error', label: 'Error', count: getUnreadCount('error') }
              ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      filter === tab.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                  </button>
              ))}
          </div>

          {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-lg border p-4 transition-all duration-200 ${
                      !notification.read ? 'border-blue-200 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h3 className="text-sm font-semibold text-gray-900">
                                {notification.title}
                              </h3>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimestamp(notification.timestamp)}</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                notification.status === 'success' ? 'bg-green-100 text-green-800' :
                                notification.status === 'error' ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            {!notification.read && (
                              <button
                                onClick={() => markAsRead(notification.id)}
                                className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                                title="Mark as read"
                              >
                                <CheckCircle className="w-4 h-4 text-gray-400" />
                              </button>
                            )}
                            <button
                              onClick={() => deleteNotification(notification.id)}
                              className="p-1 rounded-md hover:bg-red-50 transition-colors"
                              title="Delete notification"
                            >
                              <XCircle className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                ))}
                  </div>
            )}

          {/* Actions */}
          {filteredNotifications.length > 0 && (
            <div className="mt-8 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                {getUnreadCount(filter) > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({getUnreadCount(filter)} unread)
                  </span>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
                    toast.success('All notifications marked as read')
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Mark all as read
                </button>
                <button
                  onClick={() => {
                    setNotifications([])
                    toast.success('All notifications cleared')
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 transition-colors"
                >
                  Clear all
                </button>
              </div>
                </div>
              )}
            </div>
        </div>
      </div>
    </UserDashboardLayout>
  )
}

export default Notifications
