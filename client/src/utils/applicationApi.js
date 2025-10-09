import api from './jobApi';

export const applicationApi = {
  apply: async (jobId) => {
    const applicationData = {
      resume: {
        personalInfo: {
          fullName: localStorage.getItem('userName') || 'Applicant',
          email: localStorage.getItem('userEmail') || '',
          phone: '',
          linkedin: ''
        },
        experience: [],
        education: [],
        skills: []
      }
    };
    const response = await api.post(`/api/jobs/${jobId}/apply`, applicationData);
    return response.data;
  },
  confirm: async (applicationId) => {
    const res = await api.patch(`/api/applications/${applicationId}/confirm`);
    return res.data;
  },
  listMine: async () => {
    const res = await api.get('/api/applications/me');
    return res.data;
  },
  uploadProof: async (applicationId, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    const res = await api.post(`/api/applications/${applicationId}/upload-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  }
};

export default applicationApi;
