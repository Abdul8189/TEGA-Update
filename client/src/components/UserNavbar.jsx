import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, ChevronDown, BookOpen, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
// ✅ Import TEGA logo
import logo from '../assets/tegalog.png';
import { calculateProfileProgress, getProgressStatus, getProgressColor } from '../utils/profileProgress';

const UserNavbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  // Use shared progress calculation
  useEffect(() => {
    if (user) {
      const userProgress = calculateProfileProgress(user);
      setProgress(userProgress);
    }
  }, [user]);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = (event) => {
      const updatedUserData = event.detail.userData;
      const newProgress = calculateProfileProgress(updatedUserData);
      setProgress(newProgress);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleProfileClick = () => {
    navigate('/dashboard');
    setIsMenuOpen(false);
  };

  // Circular progress bar component with auto-disable at 100%
  const CircularProgress = ({ percentage, size = 40, strokeWidth = 3 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const isComplete = percentage >= 100;

    return (
      <div className="relative">
        {isComplete ? (
          // Show completion checkmark when progress is 100%
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        ) : (
          // Show progress circle when not complete
          <>
            <svg width={size} height={size} className="transform -rotate-90">
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#e5e7eb"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={getProgressColor(percentage)}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-gray-700">
                {Math.round(percentage)}%
              </span>
            </div>
          </>
        )}
      </div>
    );
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Left side - Logo + Brand */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
            <img
              src={logo}
              alt="TEGA Logo"
              className="h-12 w-12 object-contain drop-shadow-sm"
            />
            <div className="flex flex-col justify-center">
              <h1 className="text-xl font-bold text-gray-900 leading-none">TEGA</h1>
              <p className="text-xs text-gray-500 leading-tight">
                Training and Employment Generation Activity
              </p>
            </div>
          </Link>

          {/* Right side - Progress Bar + User Menu */}
          <div className="flex items-center space-x-3">
            {/* Progress Bar */}
            <div className="flex items-center space-x-2">
              <CircularProgress percentage={progress} size={36} strokeWidth={3} />
              <div className="text-left">
                <p className="text-xs text-gray-600 font-medium">Profile Progress</p>
                <p className="text-xs text-gray-500">
                  {getProgressStatus(progress)}
                </p>
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role || 'Student'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    {/* User Info Header */}
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName ? `${user.firstName} ${user.lastName}` : 'User'}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                          <p className="text-xs text-blue-600 capitalize">{user.role || 'Student'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span>Dashboard</span>
                      </button>
                      
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-green-500" />
                        <span>Profile</span>
                      </button>

                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Logout */}
                    <div className="px-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors rounded-md"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </nav>
  );
};

export default UserNavbar;
