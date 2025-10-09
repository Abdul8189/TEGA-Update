import { useState, useEffect } from 'react'
import { Filter, Calendar, Users, BookOpen, Camera, Grid3X3, GraduationCap, Calendar as CalendarIcon, UserCheck } from 'lucide-react'

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState('All')
  const [selectedImage, setSelectedImage] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const galleryImages = [
    {
      id: 1,
      src: 'https://live.staticflickr.com/65535/54731083594_a90c52c332.jpg',
      alt: 'Woman lighting traditional lamp at TEGA event',
      category: 'Events',
      title: 'TEGA Mega Launch Ceremony',
      date: '2024-01-15',
      height: 'tall',
      featured: true
    },
    {
      id: 2,
      src: 'https://live.staticflickr.com/65535/54731068878_56d399c16b_n.jpg',
      alt: 'Group with certificates in front of TEGA screen',
      category: 'Events',
      title: 'Certificate Distribution Ceremony',
      date: '2024-01-20',
      height: 'medium',
      featured: true
    },
    {
      id: 3,
      src: 'https://live.staticflickr.com/65535/54730026297_11e91259d4.jpg',
      alt: 'Certificate ceremony at TEGA',
      category: 'Events',
      title: 'Tega Awards',
      date: '2024-02-10',
      height: 'short',
      featured: true
    },
    {
      id: 4,
      src: 'https://live.staticflickr.com/65535/54731211770_017e5f4d47.jpg',
      alt: 'Team celebration',
      category: 'Events',
      title: 'Team Building Event',
      date: '2024-02-25',
      height: 'tall'
    },
    {
      id: 5,
      src: 'https://live.staticflickr.com/65535/54730026327_cb01cc76d0.jpg',
      alt: 'Formal group photo with balloons',
      category: 'Events',
      title: 'Tega Celebration',
      date: '2024-03-05',
      height: 'medium'
    },
    {
      id: 6,
      src: 'https://live.staticflickr.com/65535/54731211770_017e5f4d47.jpg',
      alt: 'Professional team ',
      category: 'Events',
      title: 'Professional Team',
      date: '2024-03-15',
      height: 'short'
    },
    {
      id: 7,
      src: 'https://live.staticflickr.com/65535/54731068893_7eb28254c3_z.jpg',
      alt: 'Students working on computers in classroom',
      category: 'Workshops',
      title: 'Full Stack Development Workshop',
      date: '2024-01-30',
      height: 'tall'
    },
    {
      id: 8,
      src: 'https://live.staticflickr.com/65535/54731083159_63ed65fbeb_z.jpg',
      alt: 'Interactive classroom with students',
      category: 'Workshops',
      title: 'Cybersecurity Award Session',
      date: '2024-02-15',
      height: 'medium'
    },
    {
      id: 9,
      src: 'https://live.staticflickr.com/65535/54730858786_4758ae3842.jpg',
      alt: 'Classroom with projector screen',
      category: 'Workshops',
      title: 'Digital Marketing Workshop',
      date: '2024-02-28',
      height: 'short'
    },
    {
      id: 10,
      src: 'https://live.staticflickr.com/65535/54731211290_e64966d375_b.jpg',
      alt: 'Students at computers with instructor',
      category: 'Workshops',
      title: 'Python Programming Session',
      date: '2024-03-10',
      height: 'tall'
    },
    {
      id: 11,
      src: 'https://live.staticflickr.com/65535/54731211345_c4bd5db8d7_z.jpg',
      alt: 'Guest lecture in progress',
      category: 'Guest-Lectures',
      title: 'Industry Expert Lecture',
      date: '2024-01-25',
      height: 'medium'
    },
    {
      id: 12,
      src: 'https://live.staticflickr.com/65535/54731211240_577f513928.jpg',
      alt: 'Guest speaker addressing students',
      category: 'Guest-Lectures',
      title: 'Career Guidance Session',
      date: '2024-03-01',
      height: 'short'
    }
  ]

  const filters = ['All', 'Events', 'Workshops', 'Guest-Lectures']

  const filteredImages = activeFilter === 'All' 
    ? galleryImages 
    : galleryImages.filter(image => image.category === activeFilter)


  const openModal = (image) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') closeModal()
    }
    if (isModalOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isModalOpen])

  return (
    <div className="min-h-screen bg-white">
      {/* Filter Sidebar */}
      <div className="fixed left-0 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
        <div className="flex flex-col space-y-4 p-2">
          {/* All */}
          <div className="group relative">
            <button
              onClick={() => setActiveFilter('All')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl group-hover:translate-x-4 group-hover:scale-110 ${
                activeFilter === 'All' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110 shadow-xl' 
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title="View All Images"
            >
              <Grid3X3 size={20} />
            </button>
            {/* Hover Label */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
              All Images
            </div>
          </div>
          
          {/* Events */}
          <div className="group relative">
            <button
              onClick={() => setActiveFilter('Events')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl group-hover:translate-x-4 group-hover:scale-110 ${
                activeFilter === 'Events' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110 shadow-xl' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
              title="View Events"
            >
              <CalendarIcon size={20} />
            </button>
            {/* Hover Label */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
              Events
            </div>
          </div>
          
          {/* Workshops */}
          <div className="group relative">
            <button
              onClick={() => setActiveFilter('Workshops')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl group-hover:translate-x-4 group-hover:scale-110 ${
                activeFilter === 'Workshops' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110 shadow-xl' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
              title="View Workshops"
            >
              <GraduationCap size={20} />
            </button>
            {/* Hover Label */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
              Workshops
            </div>
          </div>
          
          {/* Guest Lectures */}
          <div className="group relative">
            <button
              onClick={() => setActiveFilter('Guest-Lectures')}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg hover:shadow-xl group-hover:translate-x-4 group-hover:scale-110 ${
                activeFilter === 'Guest-Lectures' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110 shadow-xl' 
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
              title="View Guest Lectures"
            >
              <UserCheck size={20} />
            </button>
            {/* Hover Label */}
            <div className="absolute left-16 top-1/2 transform -translate-y-1/2 bg-gray-800 text-white px-3 py-1 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
              Guest Lectures
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 lg:hidden">
        <div className="flex justify-center space-x-4 py-3 px-4">
          <button
            onClick={() => setActiveFilter('All')}
            className={`group w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 ${
              activeFilter === 'All' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110' 
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
            title="All"
          >
            <Grid3X3 size={16} />
          </button>
          <button
            onClick={() => setActiveFilter('Events')}
            className={`group w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 ${
              activeFilter === 'Events' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110' 
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            title="Events"
          >
            <CalendarIcon size={16} />
          </button>
          <button
            onClick={() => setActiveFilter('Workshops')}
            className={`group w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 ${
              activeFilter === 'Workshops' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            title="Workshops"
          >
            <GraduationCap size={16} />
          </button>
          <button
            onClick={() => setActiveFilter('Guest-Lectures')}
            className={`group w-10 h-10 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all duration-300 ${
              activeFilter === 'Guest-Lectures' 
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 scale-110' 
                : 'bg-orange-600 hover:bg-orange-700'
            }`}
            title="Guest Lectures"
          >
            <UserCheck size={16} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-20 bg-white text-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50/50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Camera size={48} className="text-blue-600 mr-4" />
            <h1 className="text-5xl md:text-6xl font-bold animate-fade-in">
              OUR GALLERY
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-delay">
            Several Events Happen at TEGA for our Employees and Trainees. Explore our journey through these memorable moments.
          </p>
        </div>
      </section>



      {/* Gallery */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {activeFilter !== 'All' && (
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {activeFilter} Gallery
              </h2>
              <p className="text-lg text-gray-600">
                Explore our collection of {activeFilter.toLowerCase()} images
              </p>
            </div>
          )}
          
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {filteredImages.map((image, index) => (
              <div 
                key={image.id} 
                className="break-inside-avoid mb-6 group cursor-pointer transform transition-all duration-700 hover:scale-105 hover:rotate-1"
                style={{ 
                  animationDelay: `${index * 150}ms`,
                  animation: 'fadeInUp 0.8s ease-out forwards'
                }}
                onClick={() => openModal(image)}
              >
                <div className={`relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 bg-white ${
                  image.height === 'tall' ? 'h-96' : 
                  image.height === 'medium' ? 'h-80' : 'h-64'
                }`}>
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                      <p className="text-sm text-gray-200 mb-3">{image.alt}</p>
                    </div>
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 transform -translate-x-2 group-hover:translate-x-0 transition-transform duration-500">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      {image.category}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredImages.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Filter size={32} className="text-gray-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No images found
              </h3>
              <p className="text-gray-600">
                No images available for the selected category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Calendar size={24} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">50+</div>
              <div className="text-gray-600">Events Organized</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users size={24} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">1000+</div>
              <div className="text-gray-600">Participants</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <BookOpen size={24} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">25+</div>
              <div className="text-gray-600">Workshops Conducted</div>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <Filter size={24} className="text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">3</div>
              <div className="text-gray-600">Categories</div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {isModalOpen && selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-full overflow-auto">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              className="w-full h-auto rounded-lg shadow-2xl"
            />
            
            <div className="mt-4 text-center text-white">
              <h3 className="text-2xl font-bold mb-2">{selectedImage.title}</h3>
              <p className="text-gray-300 mb-2">{selectedImage.alt}</p>
              <p className="text-sm text-gray-400">
                {selectedImage.category} • {new Date(selectedImage.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fadeInUp 1s ease-out forwards;
        }
        
        .animate-fade-in-delay {
          animation: fadeInUp 1s ease-out 0.3s forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  )
}

export default GalleryPage