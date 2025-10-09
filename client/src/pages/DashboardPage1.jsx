import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import studentImage from '../assets/dashboard.png';
import UserDashboardLayout from '../components/UserDashboardLayout';

const DashboardPage1 = () => {
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0)
  const [userName, setUserName] = useState('DineshDinesh')
  const [userProgress, setUserProgress] = useState({
    completedCourses: 3,
    inProgress: 2,
    certificates: 5,
    totalHours: 120
  })

  const courses = [
    {
      id: 1,
      title: 'MERN Stack Development',
      instructor: 'Ms. Geethu Pravya',
      level: 'Beginner',
      duration: '3 Weeks',
      language: 'English',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
      icon: '⚛️',
      category: 'Web Development'
    },
    {
      id: 2,
      title: 'Microsoft PowerPoint for Beginners',
      instructor: 'Mr SK Siraj',
      level: 'Beginner',
      duration: '3 Weeks',
      language: 'English',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      icon: '📊',
      category: 'Office Tools'
    },
    {
      id: 3,
      title: 'MEAN Stack Development',
      instructor: 'Mr Akram',
      level: 'Beginner',
      duration: '3 Weeks',
      language: 'English',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
      icon: '🔄',
      category: 'Web Development'
    },
    {
      id: 4,
      title: 'Machine Learning',
      instructor: 'Mr. Wasim',
      level: 'Intermediate',
      duration: '3 Months',
      language: 'English',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
      icon: '🤖',
      category: 'AI & ML'
    },
    {
      id: 5,
      title: 'AWS Cloud Computing',
      instructor: 'Mr. Vijay K',
      level: 'Intermediate',
      duration: '5 Months',
      language: 'English',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
      icon: '☁️',
      category: 'Cloud Computing'
    },
    {
      id: 6,
      title: 'Frontend Technologies',
      instructor: 'Mr Razak Abdul',
      level: 'Beginner',
      duration: '3 Months',
      language: 'English',
      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
      icon: '🎨',
      category: 'Web Development'
    }
  ]

  const stats = [
    { 
      number: '5000+', 
      label: 'Students Trained', 
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z"/>
        </svg>
      )
    },
    { 
      number: '50+', 
      label: 'Expert Instructors', 
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
        </svg>
      )
    },
    { 
      number: '95%', 
      label: 'Employment Rate', 
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
      )
    },
    { 
      number: '100+', 
      label: 'Corporate Partners', 
      icon: (
        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
        </svg>
      )
    }
  ]

  const nextCourse = () => {
    setCurrentCourseIndex((prev) => (prev + 1) % (courses.length - 3))
  }

  const prevCourse = () => {
    setCurrentCourseIndex((prev) => (prev - 1 + (courses.length - 3)) % (courses.length - 3))
  }

  // Auto-scroll courses
  useEffect(() => {
    const interval = setInterval(() => {
      nextCourse()
    }, 5000)
    return () => clearInterval(interval)
  }, [])

const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  useEffect(() => {
    if (authUser) {
      setUser(authUser);
    } else {
      toast.error("Please login to access dashboard");
      navigate('/auth');
    }
  }, [authUser, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <UserDashboardLayout>
      <div className="flex-1 flex flex-col overflow-hidden w-full max-w-full">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white pt-20 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left Content */}
              <div className="space-y-12">
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-6xl font-bold">
                    Welcome, {user.firstName || user.username || user.email} 👋
                  </h1>
                  <p className="text-2xl md:text-3xl font-semibold text-blue-100">
                    Empowering Talent with Countless Career Opportunities.
                  </p>
                  <p className="text-xl text-blue-200 leading-relaxed">
                    Unlock your potential with top-notch training programs and industry-specific exams tailored for your success.
                  </p>
                </div>

                {/* User Progress Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-200">{userProgress.completedCourses}</div>
                    <div className="text-sm text-blue-100">Completed</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-200">{userProgress.inProgress}</div>
                    <div className="text-sm text-blue-100">In Progress</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-200">{userProgress.certificates}</div>
                    <div className="text-sm text-blue-100">Certificates</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-center">
                    <div className="text-3xl font-bold text-blue-200">{userProgress.totalHours}h</div>
                    <div className="text-sm text-blue-100">Total Hours</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-6">
                  <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-3 text-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                    <span>Enroll for Exams</span>
                  </button>
                  <button className="border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-3 text-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                    </svg>
                    <span>Explore Courses</span>
                  </button>
                </div>
              </div>

              {/* Right Content - Student Image */}
              <div className="relative h-full flex items-end">
                <div className="w-full max-w-md mx-auto h-full flex items-end">
                  <img
                    src={studentImage}
                    alt="Student Dashboard"
                    className="w-full h-auto max-h-[90vh] object-contain object-bottom"
                    style={{
                      filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2))',
                      backgroundColor: 'transparent',
                      maxHeight: 'calc(100% - 2rem)'
                    }}
                  />
                </div>
                
                {/* Subtle overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Floating particles effect */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-blue-400 rounded-full animate-pulse opacity-60"></div>
                <div className="absolute -top-4 -right-4 w-3 h-3 bg-purple-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute -bottom-2 -right-2 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-60" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Course Search Section */}
        <section className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Your Dream Course is Just a Click Away
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Find the course you want and build the best future with TEGA.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Enter Course Name"
                  className="w-full px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <button className="bg-yellow-500 text-gray-900 font-bold py-3 px-8 rounded-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2">
                <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
                <span>Search</span>
              </button>
            </div>
          </div>
        </section>

        {/* Find Your New Career Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Find Your New Career
              </h2>
            </div>

          {/* Course Carousel */}
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevCourse}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </button>

            <button
              onClick={nextCourse}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
            >
              <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </button>

            {/* Course Cards */}
            <div className="flex gap-6 overflow-hidden">
              {courses.slice(currentCourseIndex, currentCourseIndex + 4).map((course, index) => (
                <div
                  key={course.id}
                  className="flex-shrink-0 w-80 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Course Image */}
                  <div className="relative h-48 overflow-hidden rounded-t-xl">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Course Icon */}
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-full w-12 h-12 flex items-center justify-center text-2xl">
                      {course.icon}
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                        {course.category}
                      </span>
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-gray-600 mb-4">by {course.instructor}</p>

                    {/* Course Details */}
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Level: {course.level}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                        </svg>
                        Duration: {course.duration}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Language: {course.language}
                      </div>
                    </div>

                    {/* Enroll Button */}
                    <button className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                      Enroll Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

        {/* Empowering Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Empowering Young Minds for a Brighter Future
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-6 mb-8 text-lg">
              <span className="flex items-center">
                <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Excellence in Training
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
                </svg>
                Skill Assessment
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 text-purple-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                </svg>
                Verified Certifications
              </span>
            </div>
            <button className="bg-orange-500 text-white font-bold py-4 px-8 rounded-lg hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 mx-auto">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
              <span>Join the Revolution!</span>
            </button>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { number: '1.5K+', label: 'Students', icon: '👥' },
                { number: '50+', label: 'Courses', icon: '📚' },
                { number: '98%', label: 'Success Rate', icon: '🏆' },
                { number: '24/7', label: 'Support', icon: '🛟' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </UserDashboardLayout>
  )
}

export default DashboardPage1
