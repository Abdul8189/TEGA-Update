import { useState, useEffect } from 'react'
import { History as HistoryIcon, DollarSign, CheckCircle, XCircle, Clock, Download, Eye, Calendar, CreditCard, Smartphone, Building2 } from 'lucide-react'
import UserDashboardLayout from '../components/UserDashboardLayout'
import toast from 'react-hot-toast'
import { paymentAPI } from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

const History = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState('all') // all, completed, failed, pending
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      loadTransactionHistory()
    }
    
    // Set up event listener for payment completion
    const handlePaymentComplete = (event) => {
      if (event.detail && event.detail.payment) {
        addNewTransaction(event.detail.payment)
        // Reload payment history to get the latest data
        loadTransactionHistory()
      }
    }

    // Listen for custom payment completion event
    window.addEventListener('paymentCompleted', handlePaymentComplete)
    
    // Listen for storage changes (when localStorage is updated from other tabs/windows)
    const handleStorageChange = (e) => {
      if (e.key === 'paymentHistory') {
        loadTransactionHistory()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)

    // Cleanup event listeners
    return () => {
      window.removeEventListener('paymentCompleted', handlePaymentComplete)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [user])

  const loadTransactionHistory = async () => {
    if (!user) {
      console.log('No user found, skipping payment history load')
      return
    }

    try {
      setLoading(true)
      
      // Get payment history from backend API for the specific user
      const response = await paymentAPI.getPaymentHistory()
      const paymentHistory = response.data || []
      
      console.log('Loading transaction history from API for user:', user.email, paymentHistory)
      
      // Convert to transaction format with date validation
      const transactionData = paymentHistory.map(payment => {
        let date
        try {
          date = new Date(payment.createdAt || payment.date)
          if (isNaN(date.getTime())) {
            // If date is invalid, use current date
            date = new Date()
          }
        } catch (error) {
          // If date parsing fails, use current date
          date = new Date()
        }

        return {
          id: payment._id || payment.id || Date.now() + Math.random(),
          transactionId: payment.transactionId || `TXN${Date.now()}`,
          courseId: payment.courseId,
          courseName: payment.courseName,
          amount: payment.amount || 0,
          paymentMethod: payment.paymentMethod || 'unknown',
          status: payment.status || 'completed',
          date: date,
          type: 'payment'
        }
      })

      console.log('Processed transaction data:', transactionData)
      setTransactions(transactionData)
    } catch (error) {
      console.error('Error loading transaction history:', error)
      // Fallback to localStorage if API fails
      try {
        const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
        // Filter payments for current user
        const userPayments = paymentHistory.filter(payment => 
          payment.userId === user.id || payment.userEmail === user.email
        )
        const transactionData = userPayments.map(payment => {
          let date
          try {
            date = new Date(payment.date)
            if (isNaN(date.getTime())) {
              date = new Date()
            }
          } catch (error) {
            date = new Date()
          }

          return {
            id: payment.id || Date.now() + Math.random(),
            transactionId: payment.transactionId || `TXN${Date.now()}`,
            courseId: payment.courseId,
            courseName: payment.courseName,
            amount: payment.amount || 0,
            paymentMethod: payment.paymentMethod || 'unknown',
            status: payment.status || 'completed',
            date: date,
            type: 'payment'
          }
        })
        setTransactions(transactionData)
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
        toast.error('Failed to load transaction history')
        setTransactions([])
      }
    } finally {
      setLoading(false)
    }
  }

  const addNewTransaction = (payment) => {
    let date
    try {
      date = new Date(payment.date)
      if (isNaN(date.getTime())) {
        date = new Date()
      }
    } catch (error) {
      date = new Date()
    }

    const newTransaction = {
      id: payment.id || Date.now() + Math.random(),
      transactionId: payment.transactionId || `TXN${Date.now()}`,
      courseId: payment.courseId,
      courseName: payment.courseName,
      amount: payment.amount || 0,
      paymentMethod: payment.paymentMethod || 'unknown',
      status: payment.status || 'completed',
      date: date,
      type: 'payment'
    }

    setTransactions(prev => [newTransaction, ...prev])
    toast.success('New transaction added to history!')
  }

  // Function to clear payment history (for testing purposes)
  const clearPaymentHistory = () => {
    if (window.confirm('Are you sure you want to clear all payment history? This action cannot be undone.')) {
      localStorage.removeItem('paymentHistory')
      setTransactions([])
      toast.success('Payment history cleared successfully!')
    }
  }

  const getFilteredTransactions = () => {
    let filtered = transactions

    // Filter by status
    if (filter !== 'all') {
      filtered = filtered.filter(transaction => transaction.status === filter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.transactionId?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.sort((a, b) => b.date - a.date)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return <CreditCard className="w-4 h-4" />
      case 'upi':
        return <Smartphone className="w-4 h-4" />
      case 'netbanking':
        return <Building2 className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const formatDate = (date) => {
    try {
      const dateObj = new Date(date)
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date'
      }
      return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj)
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const downloadReceipt = (transaction) => {
    // Create a simple receipt text
    const receipt = `
TEGA - Payment Receipt
======================

Transaction ID: ${transaction.transactionId}
Date: ${formatDate(transaction.date)}
Course: ${transaction.courseName}
Amount: ${formatAmount(transaction.amount)}
Payment Method: ${transaction.paymentMethod}
Status: ${transaction.status}

Thank you for your payment!
    `.trim()

    // Create and download file
    const blob = new Blob([receipt], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${transaction.transactionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Receipt downloaded')
  }

  const viewTransactionDetails = (transaction) => {
    // Show transaction details in a modal or alert
    const details = `
Transaction Details:
- ID: ${transaction.transactionId}
- Course: ${transaction.courseName}
- Amount: ${formatAmount(transaction.amount)}
- Method: ${transaction.paymentMethod}
- Status: ${transaction.status}
- Date: ${formatDate(transaction.date)}
    `.trim()

    alert(details)
  }

  const filteredTransactions = getFilteredTransactions()

  return (
    <UserDashboardLayout>
      <div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <HistoryIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
                <p className="text-gray-600">View your payment history and transaction details</p>
                {user && (
                  <p className="text-sm text-blue-600 mt-1">
                    User: {user.firstName || user.username || user.email}
                  </p>
                )}
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by course name or transaction ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <HistoryIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
                </div>
              </div>

              {/* Status Filter */}
              <div className="flex space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'failed', label: 'Failed' },
                  { key: 'pending', label: 'Pending' }
                ].map((status) => (
                  <button
                    key={status.key}
                    onClick={() => setFilter(status.key)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      filter === status.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>

              {/* Clear History Button (for testing) */}
              <button
                onClick={clearPaymentHistory}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                title="Clear all payment history (for testing)"
              >
                Clear History
              </button>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-lg font-semibold text-gray-900">{transactions.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {transactions.filter(t => t.status === 'completed').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {transactions.filter(t => t.status === 'pending').length}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {transactions.filter(t => t.status === 'failed').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading transactions...</h3>
                <p className="text-gray-500">Please wait while we fetch your transaction history.</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <HistoryIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                <p className="text-gray-500">
                  {searchTerm 
                    ? "No transactions match your search criteria."
                    : "You haven't made any transactions yet. Complete a payment to see your transaction history here."
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => window.location.href = '/payment'}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Make Your First Payment
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Status Icon */}
                        <div className="flex-shrink-0">
                          {getStatusIcon(transaction.status)}
                        </div>

                        {/* Transaction Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {transaction.courseName}
                            </h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                              {transaction.status}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              {getPaymentMethodIcon(transaction.paymentMethod)}
                              <span className="capitalize">{transaction.paymentMethod}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(transaction.date)}</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              {formatAmount(transaction.amount)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            ID: {transaction.transactionId}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewTransactionDetails(transaction)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => downloadReceipt(transaction)}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Download receipt"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary */}
          {filteredTransactions.length > 0 && (
            <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {filteredTransactions.length} of {transactions.length} transactions
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Total: {formatAmount(filteredTransactions.reduce((sum, t) => sum + t.amount, 0))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UserDashboardLayout>
  )
}

export default History
