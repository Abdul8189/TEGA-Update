// Get API URL from environment variable, with fallback and cleanup
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001'
  // Clean up any malformed URLs (remove extra characters like 'tega-')
  const cleanUrl = envUrl.replace(/tega-.*$/, '')
  // Ensure it ends with a clean URL
  return cleanUrl.endsWith('/') ? cleanUrl.slice(0, -1) : cleanUrl
}

const API_URL = getApiUrl()

// Debug logging for API URL
console.log('🔧 API_URL resolved to:', API_URL)
console.log('🔧 Original VITE_API_URL:', import.meta.env.VITE_API_URL)

// Function to refresh the token
async function refreshToken() {
  try {
    console.log('🔄 Attempting to refresh token...');
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      console.log('No refresh token available');
      return null;
    }

    console.log('🔍 Refresh token request:', {
      url: `${API_URL}/api/auth/refresh-token`,
      hasRefreshToken: !!refreshToken,
      refreshTokenPrefix: refreshToken.substring(0, 20) + '...'
    });

    const response = await fetch(`${API_URL}/api/auth/refresh-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      console.log('Failed to refresh token:', await response.text());
      return null;
    }

    const data = await response.json();
    console.log('Token refresh successful');
    
    // Store the new tokens
    localStorage.setItem('token', data.token);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return data.token;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return null;
  }
}

export async function api(path, { method = 'GET', body, token: passedToken, headers = {}, skipAuth = false } = {}) {
  // Skip token logic for auth-related endpoints
  const isAuthRoute = path.includes('/auth/') || 
                     path.includes('/login') || 
                     path === '/api/register';
  
  // Dynamically select the token based on the path
  const isAdminRoute = path.startsWith('/api/admin') || 
                      path.includes('/admin/') || 
                      path.startsWith('/api/college-access/admin') || 
                      path.startsWith('/api/college-access/individual-students') ||
                      path.startsWith('/api/offers') ||
                      path.startsWith('/api/student/with-individual-access') ||
                      path.includes('/individual-features') ||
                      path.startsWith('/api/exams/admin') ||
                      path.startsWith('/api/question-papers/admin') ||
                      path.startsWith('/api/courses/upload') ||
                      path.startsWith('/api/courses/bulk-upload') ||
                      path.startsWith('/api/courses/bulk-import') ||
                      path.startsWith('/api/courses/admin') ||
                      path.startsWith('/api/admin-courses') ||
                      path.includes('/upload-material') ||
                      path.includes('/upload-quiz');
  
  const isPrincipalRoute = path.startsWith('/api/principal');
  const isStudentRoute = path.startsWith('/api/student');
  
  // Get the appropriate token
  let token = passedToken || localStorage.getItem(
    isAdminRoute ? 'adminToken' : 
    isPrincipalRoute ? 'principalToken' : 
    'token' // Default to regular token
  );
  
  // Debug logging
  const debugInfo = {
    url: `${API_URL}${path}`,
    method,
    routeType: isAdminRoute ? 'admin' : isPrincipalRoute ? 'principal' : isStudentRoute ? 'student' : 'user',
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 10) + '...' : 'none',
    isAuthRoute,
    skipAuth,
    fullToken: token // Add full token for debugging
  };
  
  console.log('🌐 API Request:', debugInfo);
  
  // Skip token for auth routes or if explicitly skipped
  if (isAuthRoute || skipAuth) {
    debugInfo.authSkipped = true;
  }

  const makeRequest = async (retry = true) => {
    try {
      const fullUrl = `${API_URL}${path}`;
      
      // Check if body is FormData (for file uploads)
      const isFormData = body instanceof FormData;
      
      const requestHeaders = {
        // Don't set Content-Type for FormData - browser will set it with boundary
        ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
        ...(token && !isAuthRoute && !skipAuth ? { 'Authorization': `Bearer ${token}` } : {}),
        ...headers,
      };

      const response = await fetch(fullUrl, {
        method,
        headers: requestHeaders,
        body: body ? (isFormData ? body : (typeof body === 'string' ? body : JSON.stringify(body))) : undefined,
        credentials: 'include'
      });

      // Handle 401 Unauthorized - try to refresh token and retry
      if (response.status === 401 && retry && !isAuthRoute) {
        console.log('🔑 Token expired, attempting to refresh...');
        console.log('🔍 401 Response details:', {
          status: response.status,
          statusText: response.statusText,
          url: fullUrl,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        const newToken = await refreshToken();
        if (newToken) {
          console.log('🔄 Token refreshed, retrying request...');
          token = newToken;
          return makeRequest(false); // Don't retry again to avoid infinite loops
        } else {
          // If refresh fails, clear auth and redirect to login
          console.log('❌ Token refresh failed, clearing auth data');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login?session=expired';
          throw new Error('Session expired. Please log in again.');
        }
      }

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        // Special handling for specific error cases
        if (response.status === 403 && path.includes('/exams/') && path.includes('/start') && 
            data.message && (data.message.includes('Exam has not started yet') || 
                            data.message.includes('maximum number of attempts'))) {
          return data;
        }
        
        const error = new Error(data.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
      
    } catch (error) {
      console.error('API Request Error:', {
        url: `${API_URL}${path}`,
        error: error.message,
        status: error.status,
        data: error.data
      });
      
      if (error.message === 'Failed to fetch') {
        throw new Error(`Cannot connect to server. Please check your internet connection.`);
      }
      
      throw error;
    }
  };

  return makeRequest();
}

// Payment API functions
export const paymentAPI = {
  // Process dummy payment
  processDummyPayment: async (paymentData) => {
    console.log('Processing dummy payment with data:', paymentData);
    const result = await api('/api/payments/process-dummy', {
      method: 'POST',
      body: paymentData
    });
    console.log('Payment processing result:', result);
    return result;
  },

  // Get payment history
  getPaymentHistory: async () => {
    console.log('Fetching payment history for current user');
    const result = await api('/api/payments/history');
    console.log('Payment history result:', result);
    return result;
  },

  // Check course access
  checkCourseAccess: async (courseId) => {
    console.log('Checking course access for course:', courseId);
    const result = await api(`/api/payments/access/${courseId}`);
    console.log('Course access result:', result);
    return result;
  },

  // Get user's paid courses
  getPaidCourses: async () => {
    console.log('Fetching paid courses for current user');
    const result = await api('/api/payments/paid-courses');
    console.log('Paid courses result:', result);
    return result;
  },

  // Get available courses
  getCourses: async () => {
    console.log('Fetching available courses');
    const result = await api('/api/courses/all');
    console.log('Courses result:', result);
    return result;
  },

  // Get TEGA exams
  getTegaExams: async () => {
    console.log('Fetching TEGA exams');
    // Try the student route first, fallback to admin route if needed
    try {
      const result = await api('/api/exams/student/all');
      console.log('TEGA exams result:', result);
      return result;
    } catch (error) {
      console.log('Student route failed, trying admin route...');
      const result = await api('/api/exams/admin/all');
      console.log('TEGA exams result (admin):', result);
      return result;
    }
  },

  // Get offer price for a student's institute
  getOfferPrice: async (studentId, feature = 'Course') => {
    console.log('Fetching offer price for student:', studentId, 'feature:', feature);
    const result = await api(`/api/payments/offer-price/${studentId}/${feature}`);
    console.log('Offer price result:', result);
    return result;
  },

  // Get course-specific offer price
  getCourseSpecificOffer: async (studentId, courseId) => {
    console.log('Fetching course-specific offer for student:', studentId, 'course:', courseId);
    const result = await api(`/api/payments/course-offer/${studentId}/${courseId}`);
    console.log('Course-specific offer result:', result);
    return result;
  },

  // Get TEGA exam-specific offer price
  getTegaExamSpecificOffer: async (studentId, examId) => {
    console.log('Fetching TEGA exam-specific offer for student:', studentId, 'exam:', examId);
    const result = await api(`/api/payments/tega-exam-offer/${studentId}/${examId}`);
    console.log('TEGA exam-specific offer result:', result);
    return result;
  },

  // Check TEGA exam payment status
  checkTegaExamPayment: async () => {
    console.log('Checking TEGA exam payment status');
    const result = await api('/api/payments/check-tega-exam-payment');
    console.log('TEGA exam payment status result:', result);
    return result;
  }
};

// Notification API functions
export const notificationAPI = {
  // Get user notifications
  getUserNotifications: async () => {
    return api('/api/notifications/user');
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    return api(`/api/notifications/user/${notificationId}/read`, {
      method: 'PATCH'
    });
  },

  // Delete notification
  deleteNotification: async (notificationId) => {
    return api(`/api/notifications/user/${notificationId}`, {
      method: 'DELETE'
    });
  },

  // Create notification
  createNotification: async (notificationData) => {
    return api('/api/notifications/user', {
      method: 'POST',
      body: notificationData
    });
  }
};

// Admin Payment API functions
export const adminPaymentAPI = {
  getAllPayments: async () => {
    console.log('Fetching all payments for admin');
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      console.warn('Admin token missing in localStorage');
    }
    const result = await api('/api/admin/payments', {
      token: adminToken
    });
    console.log('Admin all payments result:', result);
    return result;
  },

  getPaymentNotifications: async () => {
    console.log('Fetching payment notifications for admin');
    const adminToken = localStorage.getItem('adminToken');
    if (!adminToken) {
      console.warn('Admin token missing in localStorage');
    }
    const result = await api('/api/admin/payment-notifications', {
      token: adminToken
    });
    console.log('Admin payment notifications result:', result);
    return result;
  }
};

