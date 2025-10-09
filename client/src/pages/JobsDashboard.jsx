import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { jobApi } from '../utils/jobApi';
import { 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Building, 
  Clock,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';

const JobsDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalJobs: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Fetch jobs from API
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: 6,
        search: searchTerm,
        jobType: filterType !== 'all' ? filterType : '',
        location: filterLocation !== 'all' ? filterLocation : ''
      };

      const response = await jobApi.getActiveJobs(params);
      
      setJobs(response.data || []);
      setPagination(response.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalJobs: 0,
        hasNextPage: false,
        hasPrevPage: false
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
      toast.error(err.message || 'Failed to fetch jobs');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [currentPage, searchTerm, filterType, filterLocation]);

  const handleApply = async (jobId) => {
    try {
      // Make API call to apply for the job
      await jobApi.applyForJob(jobId);
      toast.success('Application submitted successfully!');
      // Update the job to show as applied
      setJobs(jobs.map(job => 
        job._id === jobId 
          ? { ...job, applied: true }
          : job
      ));
    } catch (error) {
      toast.error(error.message || 'Failed to submit application');
    }
  };

  // Filter jobs based on search and filters (handled by API now)
  const filteredJobs = jobs;

  const getTypeBadge = (type) => {
    const badges = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-green-100 text-green-800',
      'remote': 'bg-purple-100 text-purple-800',
      'hybrid': 'bg-orange-100 text-orange-800',
      'contract': 'bg-red-100 text-red-800'
    };
    return badges[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Pagination logic - handled by API
  const currentJobs = filteredJobs;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading jobs...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Opportunities</h1>
              <p className="text-gray-600 mt-2">Discover exciting career opportunities and internships</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {pagination.totalJobs} jobs found
              </span>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Bar */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search jobs by title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Dropdowns */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="full-time">Full Time</option>
              <option value="part-time">Part Time</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="contract">Contract</option>
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
              <option value="Pune">Pune</option>
            </select>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {currentJobs.map((job) => (
                         <div
               key={job._id}
               className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col h-full"
             >
               {/* Job Header */}
               <div className="p-6 border-b border-gray-100 flex-shrink-0">
                 <div className="flex items-start justify-between mb-4">
                   <div className="flex-1">
                     <h3 className="text-xl font-bold text-gray-900 mb-2">
                       {job.title}
                     </h3>
                     <p className="text-gray-600 font-medium">{job.company}</p>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(job.jobType)}`}>
                     {job.jobType.charAt(0).toUpperCase() + job.jobType.slice(1)}
                   </span>
                 </div>

                 <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                   <div className="flex items-center">
                     <MapPin className="w-4 h-4 mr-1" />
                     {job.location}
                   </div>
                   <div className="flex items-center">
                     <Clock className="w-4 h-4 mr-1" />
                     {job.duration}
                   </div>
                   <div className="flex items-center">
                     <DollarSign className="w-4 h-4 mr-1" />
                     {job.salary}
                   </div>
                 </div>

                 <p className="text-gray-600 text-sm line-clamp-2">
                   {job.description}
                 </p>
               </div>

               {/* Job Details */}
               <div className="p-6 flex flex-col flex-grow">
                 {/* Requirements */}
                 {job.requirements && job.requirements.length > 0 && (
                   <div className="mb-4">
                     <h4 className="font-semibold text-gray-900 mb-2">Key Skills:</h4>
                     <div className="flex flex-wrap gap-2">
                       {job.requirements.slice(0, 4).map((req, index) => (
                         <span
                           key={index}
                           className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                         >
                           {req}
                         </span>
                       ))}
                       {job.requirements.length > 4 && (
                         <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                           +{job.requirements.length - 4} more
                         </span>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Spacer to push content to bottom */}
                 <div className="flex-grow"></div>

                 {/* Application Info */}
                 <div className="flex items-center justify-center mb-4">
                   <div className="text-sm text-gray-600">
                     Posted: {formatDate(job.createdAt)}
                   </div>
                 </div>

                 {/* Action Button */}
                 <button
                   onClick={() => handleApply(job._id)}
                   disabled={job.applied}
                   className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                     job.applied
                       ? 'bg-green-500 text-white cursor-not-allowed'
                       : 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg'
                   }`}
                 >
                   {job.applied ? 'Applied ✓' : 'Apply Now'}
                 </button>
               </div>
             </div>
          ))}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {((pagination.currentPage - 1) * 6) + 1} to {Math.min(pagination.currentPage * 6, pagination.totalJobs)} of {pagination.totalJobs} jobs
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-lg ${
                      pagination.currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredJobs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 mb-4">
              <Briefcase className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default JobsDashboard;
