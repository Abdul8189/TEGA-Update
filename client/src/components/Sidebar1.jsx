import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  CreditCard, 
  FileText, 
  Briefcase, 
  GraduationCap, 
  FileSpreadsheet, 
  LogOut,
  Bell,
  History,
  User,
  BarChart3
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const Sidebar1 = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPinned, setIsPinned] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsCollapsed(false);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsCollapsed(true);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    if (isPinned) {
      setIsCollapsed(true);
    }
  };

  const allNavItems = [
    { to: '/dashboard', label: 'Home', icon: Home },
    { to: '/course-dashboard', label: 'Explore Courses', icon: BookOpen },
    { to: '/payment', label: 'Start Payment', icon: CreditCard },
    { to: '/exams', label: 'Exams', icon: FileText },
    { to: '/my-exam-results', label: 'My Results', icon: BarChart3 },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/internships', label: 'Internships', icon: GraduationCap },
    { to: '/resume-builder', label: 'Resume Builder', icon: FileSpreadsheet },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/history', label: 'History', icon: History },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  // Show all nav items without access restrictions
  const navItems = allNavItems;

  return (
    <div
      className={`fixed left-0 top-0 h-full bg-white shadow-lg transition-all duration-300 z-50 ${isCollapsed ? 'w-16' : 'w-64'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-semibold text-gray-800">Tega</span>
            </div>
          )}
          <button
            onClick={togglePin}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.to
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <Link 
            to="/profile" 
            className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            title="View Profile"
          >
            <User className="w-4 h-4 text-gray-600" />
          </Link>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || user?.name || user?.fullName || user?.email || 'User'}
              </p>
              <p className="text-xs text-gray-500">Student</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Sidebar1