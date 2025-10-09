import { Link, useLocation } from 'react-router-dom'
import { Menu, X, LogIn, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
// ✅ Import your logo
import logo from '../assets/tegalog.png'

const AltHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const { user, logout } = useAuth()

  const navigation = []

  const isActive = (path) => location.pathname === path

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo + Brand */}
          <Link to=" " className="flex items-center space-x-3">
            <img
              src={logo}
              alt="Tega Logo"
              className="h-[4.5rem] w-[4.5rem] object-contain max-w-full"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold text-gray-900 leading-none">TEGA</h1>
              <p className="text-xs text-gray-500 leading-tight">
                Training and Employment Generation Activity
              </p>
            </div>
          </Link>



          {/* Admin Panel Label */}
          <div className="hidden lg:flex items-center space-x-4">
            <span className="text-purple-600 font-semibold">Admin Panel</span>
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-gray-700">
                  <User size={18} />
                  <span className="text-sm font-medium">
                    {user.username || user.email} (admin)
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-200"
                >
                  <LogOut size={18} />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <LogIn size={18} />
                  <span className="text-sm font-medium">Login</span>
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile / Tablet menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <div className="pt-4 space-y-2">
                <div className="text-purple-600 font-semibold px-3 py-2">Admin Panel</div>
                {user ? (
                  <>
                    <div className="flex items-center space-x-2 text-gray-700 px-3 py-2">
                      <User size={18} />
                      <span>{user.username || user.email} (admin)</span>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors duration-200 px-3 py-2 w-full"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/auth"
                      className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 transition-colors duration-200 px-3 py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LogIn size={18} />
                      <span>Login</span>
                    </Link>
                    <Link
                      to="/register"
                      className="btn-primary block text-center"
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
  )
}

export default AltHeader;
