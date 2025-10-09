import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogIn, LogOut, User } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { scrollToTop } from '../utils/scrollUtils.js'
import logo from '../assets/tegalog.png'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Courses', href: '/courses' },
    { name: 'Gallery', href: '/Gallery' },
    { name: 'Results', href: '/result' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg border-b border-gray-200 py-1' 
          : 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-1'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Brand with Logo */}
          <Link to="/" className="group flex items-center space-x-2">
            <div className="flex-shrink-0">
              <img 
                src={logo} 
                alt="Tega Logo" 
                className={`h-10 w-10 object-contain transition-all duration-300 group-hover:scale-105 ${
                  isScrolled ? 'opacity-90' : 'opacity-100'
                }`}
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className={`text-lg font-bold leading-none transition-colors duration-300 ${
                isScrolled ? 'text-gray-900' : 'text-white'
              }`}>TEGA</h1>
              <p className={`text-[9px] leading-tight transition-colors duration-300 ${
                isScrolled ? 'text-gray-600' : 'text-gray-200'
              } group-hover:opacity-80`}>
                Training and Employment Generation Activity
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={scrollToTop}
                className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? isScrolled 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-blue-300 bg-blue-900/30'
                    : isScrolled
                      ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                      : 'text-white hover:text-blue-300 hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className={`flex items-center space-x-2 transition-colors duration-300 ${
                  isScrolled ? 'text-gray-700' : 'text-white'
                }`}>
                  <User size={18} />
                  <span className="text-sm font-medium">
                    {user.username || user.email} ({user.role})
                  </span>
                </div>
                <button
                  onClick={logout}
                  className={`flex items-center space-x-2 transition-colors duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-red-600' 
                      : 'text-white hover:text-red-300'
                  }`}
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className={`flex items-center space-x-2 transition-colors duration-300 ${
                    isScrolled 
                      ? 'text-gray-700 hover:text-blue-600' 
                      : 'text-white hover:text-blue-300'
                  }`}
                >
                  <LogIn size={18} />
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link 
                  to="/register" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${
                    isScrolled
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                  }`}
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile / Tablet menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`transition-colors duration-300 ${
                isScrolled 
                  ? 'text-gray-700 hover:text-blue-600' 
                  : 'text-white hover:text-blue-300'
              }`}
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t transition-colors duration-300 ${
              isScrolled ? 'border-gray-200' : 'border-white/20'
            }`}>
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300 ${
                    isActive(item.href)
                      ? isScrolled 
                        ? 'text-blue-600 bg-blue-50' 
                        : 'text-blue-300 bg-blue-900/30'
                      : isScrolled
                        ? 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        : 'text-white hover:text-blue-300 hover:bg-white/10'
                  }`}
                  onClick={() => {
                    setIsMenuOpen(false);
                    scrollToTop();
                  }}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    <div className={`flex items-center space-x-2 px-3 py-2 transition-colors duration-300 ${
                      isScrolled ? 'text-gray-700' : 'text-white'
                    }`}>
                      <User size={18} />
                      <span>{user.username || user.email} ({user.role})</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 transition-colors duration-300 px-3 py-2 w-full ${
                        isScrolled 
                          ? 'text-gray-700 hover:text-red-600' 
                          : 'text-white hover:text-red-300'
                      }`}
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className={`flex items-center space-x-2 transition-colors duration-300 px-3 py-2 ${
                        isScrolled 
                          ? 'text-gray-700 hover:text-blue-600' 
                          : 'text-white hover:text-blue-300'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn size={18} />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/register"
                      className={`block w-full text-center py-2 px-3 rounded-md transition-colors duration-300 ${
                        isScrolled
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-white/20 text-white hover:bg-white/30 border border-white/30'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        </div>
      </header>
    </>
  )
}

export default Header
