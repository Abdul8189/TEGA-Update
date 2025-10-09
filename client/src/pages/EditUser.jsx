import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/api';
import toast from 'react-hot-toast';

const EditUser = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 EditUser useEffect - Component loaded');
    console.log('📍 Current location state:', location.state);
    console.log('📍 Current pathname:', location.pathname);
    console.log('📍 User ID:', userId);
    
    const fetchUser = async () => {
      try {
        const response = await api(`/api/admin/users/${userId}`);
        if (response.success) {
          console.log('✅ User fetched successfully:', response.user);
          console.log('🔍 User type:', response.userType);
          console.log('🔍 User role:', response.user.role);
          
          setUser(response.user);
          
          // Initialize form data based on user type
          if (response.userType === 'principal' || response.user.role === 'principal') {
            // For principals, map the fields correctly
            const principalFormData = {
              email: response.user.email || '',
              principalName: response.user.principalName || '',
              university: response.user.university || '',
              gender: response.user.gender || '',
              role: 'principal'
            };
            console.log('🔍 Principal form data initialized:', principalFormData);
            setFormData(principalFormData);
          } else {
            // For students, use the original fields
            const studentFormData = {
              username: response.user.username || '',
              email: response.user.email || '',
              firstName: response.user.firstName || '',
              lastName: response.user.lastName || '',
              institute: response.user.institute || '',
              gender: response.user.gender || '',
              role: 'student'
            };
            console.log('🔍 Student form data initialized:', studentFormData);
            setFormData(studentFormData);
          }
        } else {
          console.log('❌ Failed to fetch user:', response.message);
          toast.error('Failed to fetch user data');
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        toast.error(error.message || 'An error occurred while fetching user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, location.state, location.pathname]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('🔍 EditUser Debug Info:');
    console.log('Location state:', location.state);
    console.log('User role:', user?.role);
    console.log('User type:', user?.userType);
    console.log('Current pathname:', location.pathname);
    console.log('Form data being submitted:', formData);
    console.log('User ID being updated:', userId);
    
    try {
      console.log('🚀 Making API call to update user...');
      
      // Prepare the data to send based on user type
      let dataToSend = { ...formData };
      
      if (user.role === 'principal' || user.userType === 'principal') {
        // For principals, ensure we're sending the correct field names
        dataToSend = {
          email: formData.email,
          principalName: formData.principalName,
          university: formData.university,
          gender: formData.gender,
          role: 'principal'
        };
        console.log('🔍 Sending principal data:', dataToSend);
      } else {
        // For students, use the original field names
        dataToSend = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          institute: formData.institute,
          gender: formData.gender,
          role: 'student'
        };
        console.log('🔍 Sending student data:', dataToSend);
      }
      
      const response = await api(`/api/admin/users/${userId}`, {
        method: 'PUT',
        body: dataToSend,
      });

      if (response.success) {
        const sourcePage = getSourcePage();
        console.log('✅ Update successful!');
        console.log('📍 Source page:', sourcePage);
        console.log('📍 Will redirect to:', location.state?.from || (user.role === 'principal' ? '/admin/principals' : '/admin/students'));
        console.log('🔍 Full API response:', response);
        console.log('🔍 Response user type:', response.userType);
        console.log('🔍 Response user role:', response.user?.role);
        
        toast.success(`User updated successfully! Redirecting back to ${sourcePage}...`);
        
        // IMMEDIATE redirect for students and principals (since we know the user type)
        console.log('🔍 User role check:', { 
          userRole: user.role, 
          userType: user.userType, 
          responseUserType: response.userType 
        });
        
        // Check both user.role and response.userType for immediate redirect
        if (user.role === 'student' || user.userType === 'student' || response.userType === 'student') {
          console.log('🚀 IMMEDIATE redirect to /admin/students for student user');
          navigate('/admin/students', { replace: true });
          return;
        }
        
        if (user.role === 'principal' || user.userType === 'principal' || response.userType === 'principal') {
          console.log('🚀 IMMEDIATE redirect to /admin/principals for principal user');
          navigate('/admin/principals', { replace: true });
          return;
        }
        
        // Redirect back to the page where the admin was editing from
        const goBackTo = () => {
          console.log('🚀 Executing redirect...');
          
          // Method 1: Try to use location state
          if (location.state?.from) {
            console.log('📍 Method 1: Redirecting to location.state.from:', location.state.from);
            navigate(location.state.from);
            return;
          }
          
          // Method 2: Try to use location state with previousPath
          if (location.state?.previousPath) {
            console.log('📍 Method 2: Redirecting to location.state.previousPath:', location.state.previousPath);
            navigate(location.state.previousPath);
            return;
          }
          
          // Method 3: Try to go back in browser history
          if (window.history.length > 1) {
            console.log('📍 Method 3: Going back in browser history');
            navigate(-1);
            return;
          }
          
          // Method 4: Fallback to appropriate admin page based on user role
          const fallbackPath = user.role === 'principal' ? '/admin/principals' : '/admin/students';
          console.log('📍 Method 4: Fallback redirect to:', fallbackPath);
          navigate(fallbackPath);
        };

        // Small delay to show the success message
        setTimeout(() => {
          goBackTo();
        }, 1000);
        
        // Force redirect as backup (in case the first one fails)
        setTimeout(() => {
          console.log('🔄 Force redirect backup executing...');
          const fallbackPath = user.role === 'principal' ? '/admin/principals' : '/admin/students';
          console.log('🔄 Backup redirecting to:', fallbackPath);
          navigate(fallbackPath, { replace: true });
        }, 2000);
        
        // Ultimate fallback - force redirect to appropriate admin page
        if (user.role === 'student' || user.userType === 'student') {
          setTimeout(() => {
            console.log('🚨 Ultimate fallback: Forcing redirect to /admin/students');
            navigate('/admin/students', { replace: true });
          }, 3000);
        }
        
        if (user.role === 'principal' || user.userType === 'principal') {
          setTimeout(() => {
            console.log('🚨 Ultimate fallback: Forcing redirect to /admin/principals');
            navigate('/admin/principals', { replace: true });
          }, 3000);
        }
      } else {
        toast.error(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('❌ Update error:', error);
      toast.error(error.message || 'An error occurred while updating the user');
    }
  };

  const handleCancel = () => {
    console.log('🚫 Cancel clicked, location state:', location.state);
    
    // Go back to the previous page or fallback
    if (location.state?.from) {
      console.log('📍 Cancel redirecting to:', location.state.from);
      navigate(location.state.from);
    } else if (location.state?.previousPath) {
      console.log('📍 Cancel redirecting to:', location.state.previousPath);
      navigate(location.state.previousPath);
    } else {
      // Try to go back in browser history
      if (window.history.length > 1) {
        console.log('📍 Cancel going back in browser history');
        navigate(-1);
      } else {
        // Fallback: go back to the appropriate admin page
        const fallbackPath = user?.role === 'principal' ? '/admin/principals' : '/admin/students';
        console.log('📍 Cancel fallback redirect to:', fallbackPath);
        navigate(fallbackPath);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  // Get the source page for breadcrumb
  const getSourcePage = () => {
    if (location.state?.from) {
      return location.state.from === '/admin/students' ? 'Students' : 'Principals';
    }
    return user.role === 'principal' ? 'Principals' : 'Students';
  };

  return (
    <div className="container mx-auto p-4">
      {/* Breadcrumb */}
      <div className="mb-4 text-sm text-gray-600">
        <span 
          className="cursor-pointer hover:text-blue-600"
          onClick={() => navigate(location.state?.from || (user.role === 'principal' ? '/admin/principals' : '/admin/students'))}
        >
          {getSourcePage()}
        </span>
        <span className="mx-2">→</span>
        <span className="text-gray-900">Edit {user.username}</span>
      </div>
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit User: {user.username}</h1>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          Cancel
        </button>
        </div>
      
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        {/* Common fields for both students and principals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Principal-specific fields */}
        {user.role === 'principal' ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Principal Name</label>
              <input
                type="text"
                name="principalName"
                value={formData.principalName || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
              <input
                type="text"
                name="university"
                value={formData.university || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </>
        ) : (
          <>
            {/* Student-specific fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username || ''}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName || ''}
            onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName || ''}
            onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                <input
                    type="text"
                    name="institute"
                    value={formData.institute || ''}
                    onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
          </>
        )}
        <div className="flex gap-4 pt-4">
          <button 
            type="submit" 
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
          Save Changes
        </button>
          <button 
            type="button"
            onClick={handleCancel}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded hover:bg-gray-400 transition focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
          <button 
            type="button"
            onClick={() => {
              console.log('🧪 Test redirect button clicked');
              console.log('📍 Current location state:', location.state);
              console.log('🔍 User info:', { 
                role: user.role, 
                userType: user.userType,
                username: user.username,
                institute: user.institute,
                university: user.university
              });
              const fallbackPath = user.role === 'principal' ? '/admin/principals' : '/admin/students';
              console.log('📍 Test redirecting to:', fallbackPath);
              navigate(fallbackPath);
            }}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Test Redirect
          </button>
          <button 
            type="button"
            onClick={() => {
              console.log('🔍 Debug User Info:');
              console.log('User object:', user);
              console.log('User role:', user.role);
              console.log('User type:', user.userType);
              console.log('Is principal check:', user.role === 'principal');
              console.log('Form data:', formData);
            }}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 transition focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
          >
            Debug User
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
