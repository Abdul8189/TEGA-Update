import { Search, MapPin, Clock, DollarSign, Building } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { jobApi } from '../utils/jobApi'
import { applicationApi } from '../utils/applicationApi'
import UserDashboardLayout from '../components/UserDashboardLayout'
import toast from 'react-hot-toast'

const InternshipsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'tech', name: 'Technology' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'finance', name: 'Finance' },
    { id: 'design', name: 'Design' },
    { id: 'hr', name: 'Human Resources' }
  ]

  const [internships, setInternships] = useState([])

  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all')
  

  useEffect(() => {
    const fetchInternships = async () => {
      try {
        setLoading(true);
        console.log('Fetching internships...');
        
        // Try to get internships with more permissive filters first
        const response = await jobApi.getActiveJobs({ 
          postingType: 'internship',
          status: 'all',  // Changed from 'open' to 'all' to see all statuses
          isActive: true,
          limit: 50
        });
        
        console.log('Raw Internships API Response:', response);
        
        let internshipListings = [];
        
        // Handle different API response structures
        if (response && Array.isArray(response)) {
          // Case 1: Response is already an array
          internshipListings = response;
        } else if (response && response.data) {
          // Case 2: Response has a data property that might be an array
          internshipListings = Array.isArray(response.data) ? response.data : [];
          
          // Case 3: Check for nested data structure (common with pagination)
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            internshipListings = response.data.data;
          }
          
        }
        
        console.log('Extracted Internships:', internshipListings);
        
        // Less restrictive filtering for debugging
        internshipListings = internshipListings.filter(internship => {
          if (!internship) return false;
          console.log('Internship:', {
            id: internship._id,
            title: internship.title,
            postingType: internship.postingType,
            status: internship.status,
            isActive: internship.isActive
          });
          return true; // Temporarily show all internships regardless of status
        });
        
        console.log('Filtered Internships:', internshipListings);
        setInternships(internshipListings);
        
        if (internshipListings.length === 0) {
          console.warn('No internships found. Response structure:', response);
          toast('No internship listings found. Please try different filters.', { icon: 'ℹ️' });
        }
      } catch (error) {
        console.error('Error in fetchInternships:', error);
        toast.error(error.message || 'Failed to fetch internships. Please try again.');
        setInternships([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInternships();
    
    // Add event listener for custom refresh event
    const handleRefresh = () => fetchInternships();
    window.addEventListener('refreshInternships', handleRefresh);
    
    // Cleanup
    return () => {
      window.removeEventListener('refreshInternships', handleRefresh);
    };
  }, [])

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = 
      (internship.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (internship.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (internship.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    
    const matchesCategory = selectedCategory === 'all' || 
      internship.category === selectedCategory ||
      internship.jobType === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  return (
    <UserDashboardLayout>
      
      {/* Main Content */}
      <div >
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Internship Opportunities
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Gain valuable experience and kickstart your career with exciting internship opportunities
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
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search internships by title or company..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Internships Section */}
        <section className="py-16 bg-gray-50">
        
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredInternships.map((internship) => (
                <div
                  key={internship._id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group"
                >
                  {/* Internship Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                          {internship.title}
                        </h3>
                        <p className="text-gray-600 font-medium">{internship.company}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        internship.jobType === 'remote' ? 'bg-green-100 text-green-800' :
                        internship.jobType === 'hybrid' ? 'bg-blue-100 text-blue-800' :
                        internship.jobType === 'full-time' ? 'bg-purple-100 text-purple-800' :
                        internship.jobType === 'part-time' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {internship.jobType ? (internship.jobType.charAt(0).toUpperCase() + internship.jobType.slice(1)) : 'Internship'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      {internship.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {internship.location}
                        </div>
                      )}
                      {internship.duration && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {internship.duration}
                        </div>
                      )}
                      {internship.experience && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {internship.experience}
                        </div>
                      )}
                      {internship.salary && (
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {internship.salary}
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm">
                      {internship.description}
                    </p>
                  </div>

                  {/* Internship Details */}
                  <div className="p-6">
                    {/* Requirements */}
                    {internship.requirements && internship.requirements.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Requirements:</h4>
                        <div className="flex flex-wrap gap-2">
                          {internship.requirements.map((req, index) => (
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
                    
                    {/* Benefits */}
                    {internship.benefits && internship.benefits.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                        <div className="flex flex-wrap gap-2">
                          {internship.benefits.map((benefit, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full"
                            >
                              {benefit}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <button
                      disabled={internship.expired || internship.status === 'closed'}
                      onClick={() => {
                        // Find the internship details
                        const internshipData = internships.find(i => i._id === internship._id);
                        if (!internshipData) {
                          toast.error('Internship not found');
                          return;
                        }

                        console.log('Applying for internship:', internshipData);

                        // Check if internship has an application link
                        if (internshipData.applicationLink) {
                          // Redirect to external application link
                          window.open(internshipData.applicationLink, '_blank');
                          toast.success('Redirecting to application page...');
                          return;
                        }

                        // For internships without external links, redirect to internship application page
                        window.location.href = `/internships/apply/${internship._id}`;
                        toast.success('Redirecting to internship application...');
                      }}
                      className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${internship.expired || internship.status === 'closed' ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800'}`}
                    >
                        {internship.expired ? 'Expired' : 
                         internship.status === 'closed' ? 'Closed' : 
                         internship.applied ? 'Applied ✓' : 'Apply Now'}
                      </button>
                  </div>
                </div>
              ))}
            </div>

            {/* No Results */}
            {filteredInternships.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Building className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No internships found</h3>
                <p className="text-gray-600">Try adjusting your search criteria or check back later for new opportunities.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </UserDashboardLayout>
  )
}

export default InternshipsPage
