import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  UserCheck, 
  Bell, 
  CreditCard, 
  TestTube, 
  Calendar, 
  Briefcase, 
  LogOut,
  Building2,
  FileText,
  BarChart3,
  Award,
  Percent
} from 'lucide-react';

const Sidebar = ({ role }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Use the AuthContext logout function which handles everything properly
    logout();
    toast.success('Logged out successfully');
  };

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/courses', label: 'Courses & Payments', icon: BookOpen },
    { to: '/admin/offers', label: 'Offer Management', icon: Percent },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/principals', label: 'Principals', icon: UserCheck },
    { to: '/admin/notifications', label: 'Notifications', icon: Bell },
    { to: '/admin/schedule-assessment', label: 'Schedule Assessment', icon: Calendar },
    { to: '/admin/jobs', label: 'Job Dashboard', icon: Briefcase },
  ];

  const principalLinks = [
    { to: '/principal/dashboard', label: 'Dashboard' },
    { to: '/principal/profile', label: 'Profile' },
  ];

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/courses', label: 'My Courses', icon: BookOpen },
    { to: '/exams', label: 'Exams', icon: TestTube },
    { to: '/my-exam-results', label: 'My Results', icon: BarChart3 },
    { to: '/jobs', label: 'Jobs', icon: Briefcase },
    { to: '/resume-builder', label: 'Resume Builder', icon: FileText },
    { to: '/notifications', label: 'Notifications', icon: Bell },
  ];

  const links = role === 'admin' ? adminLinks : role === 'principal' ? principalLinks : studentLinks;

  return (
    <div className="w-64 bg-gray-50 h-full shadow-md flex flex-col">
      <div className="p-5 border-b border-gray-200"> 
        <h2 className="text-2xl font-bold text-indigo-600">
          {role === 'admin' ? 'Admin Panel' : role === 'principal' ? 'Principal Portal' : 'Student Portal'}
        </h2>
      </div>
      <nav className="flex-grow pt-4">
        <ul>
          {links.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <li key={index}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-2 mx-3 my-1 rounded-md text-gray-600 transition-colors duration-200 ease-in-out hover:bg-gray-200 hover:text-gray-900 ${
                      isActive ? 'bg-indigo-500 text-white font-semibold shadow-sm hover:bg-indigo-600 hover:text-white' : ''
                    }`
                  }
                >
                  {IconComponent && <IconComponent size={18} className="mr-3" />}
                  {link.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-5 mt-auto border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
