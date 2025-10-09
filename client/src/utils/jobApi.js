import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token (admin, principal, or student)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
      || localStorage.getItem('principalToken')
      || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling (do not force-redirect; let UI handle)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Leave routing to calling components/guards to prevent unwanted redirects
    return Promise.reject(error);
  }
);

// Public API calls (no authentication required)
export const jobApi = {
  // Get all active jobs (public)
  getActiveJobs: async (params = {}) => {
    try {
      // Get the appropriate token (admin or user)
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      const response = await api.get('/api/jobs', { 
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      
      console.log('API Response:', response);
      
      // Return the data in a consistent format
      if (response.data && Array.isArray(response.data.data)) {
        return response.data.data; // For paginated responses
      } else if (Array.isArray(response.data)) {
        return response.data; // For direct array responses
      } else if (response.data) {
        return [response.data]; // For single job responses
      }
      return [];
    } catch (error) {
      console.error('Error in getActiveJobs:', error);
      throw error.response?.data || { message: 'Failed to fetch jobs' };
    }
  },

  // Get single job by ID (public)
  getJobById: async (jobId) => {
    try {
      const response = await api.get(`/api/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch job' };
    }
  },

  // Apply for a job or internship
  applyForJob: async (jobId, applicationData = {}) => {
    try {
      // For job applications, we need to use the student token since we're using studentAuth middleware
      const studentToken = localStorage.getItem('token'); // Student token is stored as 'token'
      
      console.log('Applying for job with token:', studentToken ? 'present' : 'missing');
      
      const response = await api.post(`/api/jobs/${jobId}/apply`, applicationData, {
        token: studentToken
      });
      return response.data;
    } catch (error) {
      console.error('Job application error:', error);
      throw error.response?.data || { message: 'Failed to submit application' };
    }
  },
};

// Admin API calls (authentication required)
export const adminJobApi = {
  // Get all jobs for admin dashboard
  getAllJobs: async (params = {}) => {
    try {
      const response = await api.get('/api/jobs/admin/all', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to fetch jobs' };
    }
  },

  // Create new job
  createJob: async (jobData) => {
    try {
      const response = await api.post('/api/jobs', jobData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create job' };
    }
  },

  // Update job
  updateJob: async (jobId, jobData) => {
    try {
      const response = await api.put(`/api/jobs/${jobId}`, jobData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update job' };
    }
  },

  // Delete job
  deleteJob: async (jobId) => {
    try {
      const response = await api.delete(`/api/jobs/${jobId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete job' };
    }
  },

  // Update job status
  updateJobStatus: async (jobId, status) => {
    try {
      const response = await api.patch(`/api/jobs/${jobId}/status`, { status });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update job status' };
    }
  },
};

export default api;
