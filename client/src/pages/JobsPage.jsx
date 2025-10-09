import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import UserDashboardLayout from '../components/UserDashboardLayout';
import { jobApi } from '../utils/jobApi';

const JobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');



  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        console.log('Fetching jobs...');
        
        try {
          // Try to get jobs with more permissive filters first
          let response = await jobApi.getActiveJobs({ 
            postingType: 'job',
            status: 'all',  // Changed from 'open' to 'all' to see all statuses
            isActive: true,
            limit: 50
          });
          
          console.log('Raw API Response:', response);
          
          let jobListings = [];
          
          // Handle different API response structures
          if (response && Array.isArray(response)) {
            // Case 1: Response is already an array
            jobListings = response;
          } else if (response && response.data) {
            // Case 2: Response has a data property that might be an array
            jobListings = Array.isArray(response.data) ? response.data : [];
            
            // Case 3: Check for nested data structure (common with pagination)
            if (response.data && response.data.data && Array.isArray(response.data.data)) {
              jobListings = response.data.data;
            }
          }
          
          console.log('Extracted Jobs:', jobListings);
          
          // Less restrictive filtering for debugging
          jobListings = jobListings.filter(job => {
            if (!job) return false;
            console.log('Job:', {
              id: job._id,
              title: job.title,
              postingType: job.postingType,
              status: job.status,
              isActive: job.isActive
            });
            return true; // Temporarily show all jobs regardless of status
          });
          
          console.log('Filtered Jobs:', jobListings);
          setJobs(jobListings);
          
          if (jobListings.length === 0) {
            console.warn('No jobs found. Response structure:', response);
            toast('No job listings found. Please try different filters.', { icon: 'ℹ️' });
          }
        } catch (error) {
          console.error('Error fetching jobs:', error);
          toast.error('Failed to fetch jobs. Please try again.');
        }
      } catch (error) {
        console.error('Error in fetchJobs:', error);
        toast.error(error.message || 'Failed to fetch jobs. Please try again.');
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
    
    // Add event listener for custom refresh event
    const handleRefresh = () => fetchJobs();
    window.addEventListener('refreshJobs', handleRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('refreshJobs', handleRefresh);
    };
  }, []);

  const handleApply = async (jobId) => {
    try {
      // Find the job details
      const job = jobs.find(j => j._id === jobId);
      if (!job) {
        toast.error('Job not found');
        return;
      }

      console.log('Applying for job:', job);

      // Check if job has an application link
      if (job.applicationLink) {
        // Redirect to external application link
        window.open(job.applicationLink, '_blank');
        toast.success('Redirecting to application page...');
        return;
      }

      // For jobs without external links, redirect based on job type
      if (job.postingType === 'internship') {
        // Redirect to internship application page
        window.location.href = `/internships/apply/${jobId}`;
        toast.success('Redirecting to internship application...');
      } else {
        // Redirect to job application page
        window.location.href = `/jobs/apply/${jobId}`;
        toast.success('Redirecting to job application...');
      }

      // Update the job to show as applied (optional)
      setJobs(jobs.map(j => 
        j._id === jobId 
          ? { ...j, applied: true }
          : j
      ));
    } catch (error) {
      console.error('Application error:', error);
      toast.error('Failed to process application');
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || job.jobType === filterType;
    const matchesLocation = filterLocation === 'all' || job.location === filterLocation;
    
    return matchesSearch && matchesType && matchesLocation;
  });

  const getTypeBadge = (jobType) => {
    if (!jobType) return 'bg-gray-100 text-gray-800';
    
    const type = jobType.toLowerCase();
    const badges = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-green-100 text-green-800',
      'remote': 'bg-purple-100 text-purple-800',
      'hybrid': 'bg-orange-100 text-orange-800',
      'contract': 'bg-red-100 text-red-800',
      'internship': 'bg-yellow-100 text-yellow-800',
      'job': 'bg-blue-100 text-blue-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <UserDashboardLayout>
      
      {/* Main Content */}
      <div >
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Job Opportunities
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Discover exciting career opportunities and internships in the tech industry
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1 w-full lg:w-auto">
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex gap-4">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="internship">Internship</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>

                <select
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Bangalore">Bangalore</option>
                  <option value="Mumbai">Mumbai</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Chennai">Chennai</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Jobs Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredJobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group"
                  >
                    {/* Job Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                            {job.title}
                          </h3>
                          <p className="text-gray-600 font-medium">{job.company}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(job.jobType)}`}>
                          {job.jobType ? (job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)) : 'Job'}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                          </svg>
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          {job.duration || 'Full-time'}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"/>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"/>
                          </svg>
                          {job.salary || 'Competitive'}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm">
                        {job.description}
                      </p>
                    </div>

                    {/* Job Details */}
                    <div className="p-6">
                      {/* Requirements */}
                      {job.requirements && job.requirements.length > 0 && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                          <div className="flex flex-wrap gap-2">
                            {job.requirements.map((req, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full"
                              >
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Application Info */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-sm text-gray-600">
                          {job.positions && <span className="font-medium">{job.positions}</span>} positions available
                        </div>
                        <div className="text-sm text-gray-600">
                          Deadline: {job.applicationDeadline ? new Date(job.applicationDeadline).toLocaleDateString() : 'Open'}
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => handleApply(job._id)}
                        disabled={job.applied}
                        className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg ${
                          job.applied
                            ? 'bg-green-500 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white'
                        }`}
                      >
                        {job.applied ? 'Applied ✓' : 'Apply Now'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Results */}
            {!loading && filteredJobs.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"/>
                    <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </UserDashboardLayout>
  );
};

export default JobsPage;
