import { useState, useMemo } from 'react'
import { Search, Filter, Clock, ChevronDown, Brain, Globe, Wifi, Smartphone, Cpu, Shield, TrendingUp, Code, Database, Cloud, Users, Code2 } from 'lucide-react'

const CoursePage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedLevel, setSelectedLevel] = useState('All')

  const [showFilters, setShowFilters] = useState(false)

  // Sample course data based on the image description
  const courses = [
    {
      id: 1,
      title: 'Data Science and AI',
      description: 'Master the fundamentals of data science, machine learning, and artificial intelligence. Learn to analyze complex datasets and build intelligent systems.',
      category: 'Data Science',
      level: 'Intermediate',
      duration: '6 months',

      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
      icon: Brain
    },
    {
      id: 2,
      title: 'Networking',
      description: 'Learn computer networking fundamentals, protocols, and network security. Understand how to design and maintain robust network infrastructure.',
      category: 'Networking',
      level: 'Beginner',
      duration: '4 months',

      image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=250&fit=crop',
      icon: Globe
    },
    {
      id: 3,
      title: 'Internet of Things (IoT)',
      description: 'Explore IoT technologies, sensors, and connected devices. Build smart systems and understand IoT architecture and protocols.',
      category: 'IoT',
      level: 'Intermediate',
      duration: '5 months',

      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=250&fit=crop',
      icon: Wifi
    },
    {
      id: 4,
      title: 'Mobile Applications',
      description: 'Develop mobile apps for iOS and Android platforms. Learn React Native, Flutter, and native mobile development.',
      category: 'Mobile Development',
      level: 'Beginner',
      duration: '7 months',

      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
      icon: Smartphone
    },
    {
      id: 5,
      title: 'Machine Learning',
      description: 'Deep dive into machine learning algorithms, neural networks, and AI applications. Build predictive models and intelligent systems.',
      category: 'Data Science',
      level: 'Advanced',
      duration: '8 months',

      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop',
      icon: Cpu
    },
    {
      id: 6,
      title: 'Cybersecurity',
      description: 'Learn ethical hacking, network security, and cyber defense strategies. Protect systems from threats and vulnerabilities.',
      category: 'Security',
      level: 'Advanced',
      duration: '6 months',

      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=250&fit=crop',
      icon: Shield
    },
    {
      id: 7,
      title: 'Digital Marketing',
      description: 'Master digital marketing strategies, SEO, social media marketing, and analytics. Drive business growth through digital channels.',
      category: 'Marketing',
      level: 'Beginner',
      duration: '4 months',

      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop',
      icon: TrendingUp
    },
    {
      id: 8,
      title: 'Java FullStack',
      description: 'Build complete web applications using Java Spring Boot, React, and modern development practices.',
      category: 'Web Development',
      level: 'Intermediate',
      duration: '9 months',

      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
      icon: Code
    },
    {
      id: 9,
      title: 'MERN Stack',
      description: 'Learn MongoDB, Express.js, React, and Node.js to build modern full-stack web applications.',
      category: 'Web Development',
      level: 'Intermediate',
      duration: '8 months',

      image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
      icon: Database
    },
    {
      id: 10,
      title: 'AWS Cloud',
      description: 'Master Amazon Web Services cloud computing, deployment, and infrastructure management.',
      category: 'Cloud Computing',
      level: 'Intermediate',
      duration: '5 months',

      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
      icon: Cloud
    },
    {
      id: 11,
      title: 'Personality Development',
      description: 'Enhance your communication skills, leadership abilities, and professional presence for career success.',
      category: 'Soft Skills',
      level: 'Beginner',
      duration: '3 months',

      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop',
      icon: Users
    },
    {
      id: 12,
      title: 'Advanced Python',
      description: 'Master advanced Python programming, data structures, algorithms, and software development best practices.',
      category: 'Programming',
      level: 'Advanced',
      duration: '6 months',

      image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
      icon: Code2
    }
  ]

  const categories = ['All', 'Data Science', 'Web Development', 'Mobile Development', 'Networking', 'IoT', 'Security', 'Marketing', 'Cloud Computing', 'Soft Skills', 'Programming']
  const levels = ['All', 'Beginner', 'Intermediate', 'Advanced']


  // Filter courses based on search and filters
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory
      const matchesLevel = selectedLevel === 'All' || course.level === selectedLevel

      return matchesSearch && matchesCategory && matchesLevel
    })
  }, [searchTerm, selectedCategory, selectedLevel])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedLevel('All')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Explore Our Courses
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Discover comprehensive training programs designed to advance your career in technology and business.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        {/* Search and Filters Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          {/* Search Bar */}
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
            <input
              type="text"
              placeholder="Search courses by title, description, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 placeholder-gray-400"
            />
          </div>

          {/* Filter Toggle and Clear */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 rounded-xl transition-all duration-200 hover:scale-105 transform font-semibold"
            >
              <Filter size={20} />
              <span>Filters</span>
              <ChevronDown size={16} className={`transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200 hover:scale-105 transform px-4 py-2 rounded-lg hover:bg-gray-50"
            >
              Clear all filters
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t-2 border-gray-100">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-gray-700 bg-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 text-gray-700 bg-white"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Results Count and Sort */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <p className="text-gray-700 font-medium text-lg">
              Showing <span className="text-blue-600 font-semibold">{filteredCourses.length}</span> of <span className="text-gray-900 font-semibold">{courses.length}</span> courses
            </p>
            <div className="flex items-center space-x-3">
              <span className="text-gray-600 font-medium">Sort by:</span>
              <select className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-4 focus:ring-blue-100 focus:border-blue-500 hover:border-blue-300 transition-all duration-200 bg-white font-medium">
                <option>Most Popular</option>
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {filteredCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                {/* Course Image */}
                <div className="relative h-56 bg-gray-200 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-full w-14 h-14 flex items-center justify-center shadow-lg">
                    <course.icon size={28} className="text-gray-700" />
                  </div>
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Course Content */}
                <div className="p-6">
                  {/* Course Meta */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-600 flex items-center font-medium">
                      <Clock size={16} className="mr-2" />
                      {course.duration}
                    </span>
                    <span className={`text-sm px-3 py-1.5 rounded-full font-semibold ${
                      course.level === 'Beginner' ? 'bg-green-100 text-green-800 border border-green-200' :
                      course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {course.level}
                    </span>
                  </div>

                  {/* Course Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-[3rem]">
                    {course.title}
                  </h3>

                  {/* Course Description */}
                  <p className="text-gray-600 mb-4 line-clamp-2 min-h-[3rem] leading-relaxed">
                    {course.description}
                  </p>

                  {/* Course Category */}
                  <div className="mb-6">
                    <span className="text-xs bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-200">
                      {course.category}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold py-3 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* No Results */
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search size={32} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No courses found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Clear Filters
            </button> 
          </div>
        )}
      </div>
    </div>
  )
}

export default CoursePage