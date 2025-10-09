// Payment utility functions

// Check if user has paid for a specific course
export const hasPaidForCourse = (courseId) => {
  const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
  return paymentHistory.find(payment => payment.courseId === courseId && payment.status === 'completed')
}

// Check if user has paid for Tega Main Exam
export const hasPaidForTegaExam = () => {
  return hasPaidForCourse('tega-main-exam')
}

// Get user's paid courses
export const getUserPaidCourses = () => {
  const paymentHistory = JSON.parse(localStorage.getItem('paymentHistory') || '[]')
  return paymentHistory
    .filter(payment => payment.status === 'completed')
    .map(payment => payment.courseId)
}

// Check if user can access exam for a specific course
export const canAccessExam = (courseId) => {
  // Special case for Tega Main Exam
  if (courseId === 'tega-main-exam') {
    return hasPaidForTegaExam()
  }
  
  // For other courses, check if user has paid
  return hasPaidForCourse(courseId)
}

// Get payment status for display
export const getPaymentStatus = (courseId) => {
  const payment = hasPaidForCourse(courseId)
  if (payment) {
    return {
      status: 'paid',
      date: payment.date,
      amount: payment.amount,
      transactionId: payment.transactionId
    }
  }
  return {
    status: 'unpaid',
    date: null,
    amount: null,
    transactionId: null
  }
}

// Get course price
export const getCoursePrice = (courseId) => {
  const coursePrices = {
    'java-programming': 799,
    'python-data-science': 799,
    'react-development': 799,
    'aws-cloud': 799,
    'tega-main-exam': 799
  }
  return coursePrices[courseId] || 0
}
