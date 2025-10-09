import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import UserDashboardLayout from '../components/UserDashboardLayout'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const CourseDashboardPage = () => {
  const navigate = useNavigate()
  const [activeFilter, setActiveFilter] = useState('all')
  const [courses, setCourses] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const courseCategories = [
    { id: 'all', name: 'ALL COURSES', color: 'from-blue-500 to-purple-700' },
    { id: 'ongoing', name: 'ONGOING COURSES', color: 'from-blue-500 to-blue-700' },
    { id: 'programming', name: 'PROGRAMMING LANGUAGES', color: 'from-blue-500 to-green-700' },
    { id: 'web', name: 'WEB TECHNOLOGIES', color: 'from-blue-500 to-purple-700' },
    { id: 'office', name: 'MICROSOFT OFFICE', color: 'from-blue-500 to-orange-700' },
    { id: 'fullstack', name: 'FULL STACK DEVELOPMENT', color: 'from-blue-500 to-indigo-700' },
    { id: 'ai', name: 'ARTIFICIAL INTELLIGENCE', color: 'from-blue-500 to-pink-700' },
    { id: 'cloud', name: 'CLOUD COMPUTING', color: 'from-blue-500 to-cyan-700' },
    { id: 'cyber', name: 'CYBER SECURITY', color: 'from-blue-500 to-red-700' },
    { id: 'personality', name: 'PERSONALITY DEVELOPMENT', color: 'from-blue-500 to-teal-700' }
  ]

  // Fetch courses from API
  const fetchCourses = async () => {
    try {
      setIsLoading(true)
      setError(null)
      // Use public/unrestricted courses endpoint for explore
      const response = await api('/api/payments/courses')
      setCourses(response.data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Failed to load courses. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch courses on component mount and set up polling
  useEffect(() => {
    fetchCourses()
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCourses, 30000)
    return () => clearInterval(interval)
  }, [])

  // Helper function to get default image for courses without images
  const getDefaultImage = (category) => {
    const defaultImages = {
      'Web Development': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
      'Programming': 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop',
      'AI & ML': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
      'Data Science': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      'Cloud Computing': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
      'Cyber Security': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=250&fit=crop',
      'Office Tools': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      'Personality Development': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop'
    }
    return defaultImages[category] || 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=250&fit=crop'
  }

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-500'
      case 'intermediate': return 'bg-yellow-500'
      case 'advanced': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  // Function to get courses based on active filter
  const getFilteredCourses = () => {
    if (activeFilter === 'all') {
      return courses;
    }
    
    // Map filter categories to course categories
    const categoryMapping = {
      'ongoing': ['Web Development', 'Data Science', 'AI & ML', 'Cloud Computing'],
      'programming': ['Programming'],
      'web': ['Web Development'],
      'office': ['Office Tools'],
      'fullstack': ['Web Development', 'Programming'],
      'ai': ['AI & ML'],
      'cloud': ['Cloud Computing'],
      'cyber': ['Cyber Security'],
      'personality': ['Personality Development']
    };
    
    const targetCategories = categoryMapping[activeFilter] || [];
    return courses.filter(course => targetCategories.includes(course.category));
  };

  return (
    <UserDashboardLayout>
      <div >
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Explore Our Courses
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Discover a wide range of courses designed to enhance your skills and advance your career
              </p>
            </div>
          </div>
        </section>

        {/* Filter Section */}
        <section className="py-8 bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-4 justify-center">
              {courseCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveFilter(category.id)}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                    activeFilter === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">Loading courses...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
                <button 
                  onClick={fetchCourses}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Courses Grid */}
            {!isLoading && !error && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {getFilteredCourses().map((course) => (
                  <div
                    key={course._id || course.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group flex flex-col h-[450px]"
                  >
                    {/* Course Image */}
                    <div className="relative h-48 overflow-hidden rounded-t-xl flex-shrink-0">
                      <img
                        src={course.thumbnail || course.image || getDefaultImage(course.category)}
                        alt={(course.courseName || course.title) || 'Course image'}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Live Session Badge */}
                      {course.hasLiveSessions && (
                        <div className="absolute top-4 left-4">
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                            🔴 Live Sessions
                          </span>
                        </div>
                      )}

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                          {course.category}
                        </span>
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {course.courseName || course.title}
                      </h3>
                      <p className="text-gray-600 mb-4">by {course.instructor?.name || course.professorName || course.instructor || 'Instructor'}</p>

                      {/* Course Details */}
                      <div className="space-y-2 mb-4 flex-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          Level: {course.level || course.difficulty || 'Beginner'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          Duration: {course.duration || '4 weeks'}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          Language: {course.language || 'English'}
                        </div>
                      </div>

                      {/* Enroll Button */}
                      <button 
                        onClick={() => {
                          navigate(`/course/${course._id}`);
                          toast.success(`Opening ${(course.courseName || course.title) || 'course'}!`);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg mt-auto"
                      >
                        Enroll Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* No Courses Message */}
            {!isLoading && !error && getFilteredCourses().length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">
                  No courses found for the selected category.
                </div>
                <button 
                  onClick={() => setActiveFilter('all')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View All Courses
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </UserDashboardLayout>
  )
}

export default CourseDashboardPage
