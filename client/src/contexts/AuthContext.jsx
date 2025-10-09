import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const navigate = useNavigate();

  // Check for existing session on initial load
  useEffect(() => {
    console.log('🔍 AuthContext: Checking for existing sessions...');
    // Check for any existing user session
    const userData = localStorage.getItem('user');
    const adminUser = localStorage.getItem('adminUser');
    const principalUser = localStorage.getItem('principalUser');
    
    console.log('🔍 AuthContext: Found sessions:', {
      user: !!userData,
      adminUser: !!adminUser,
      principalUser: !!principalUser
    });
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        const token = localStorage.getItem('token');
        // Ensure both id and _id are available
        const userWithId = { 
          ...user, 
          token: token,
          id: user._id || user.id,
          _id: user._id || user.id
        };
        setUser(userWithId);
        console.log('User session restored:', user.username || user.email);
        console.log('User ID:', userWithId.id);
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    } else if (adminUser) {
      try {
        console.log('🔍 AuthContext: Restoring admin session...');
        const admin = JSON.parse(adminUser);
        const adminToken = localStorage.getItem('adminToken');
        const adminWithId = { 
          ...admin, 
          token: adminToken, 
          role: 'admin',
          id: admin._id || admin.id,
          _id: admin._id || admin.id
        };
        console.log('🔍 AuthContext: Admin data to restore:', adminWithId);
        setUser(adminWithId);
        console.log('✅ AuthContext: Admin session restored:', admin.username || admin.email);
        console.log('✅ AuthContext: Admin ID:', adminWithId.id);
      } catch (error) {
        console.error('Failed to parse admin data', error);
        localStorage.removeItem('adminUser');
        localStorage.removeItem('adminToken');
      }
    } else if (principalUser) {
      try {
        const principal = JSON.parse(principalUser);
        const principalToken = localStorage.getItem('principalToken');
        const principalWithId = { 
          ...principal, 
          token: principalToken, 
          role: 'principal',
          id: principal._id || principal.id,
          _id: principal._id || principal.id
        };
        setUser(principalWithId);
        console.log('Principal session restored:', principal.principalName || principal.email);
        console.log('Principal ID:', principalWithId.id);
        console.log('Principal token restored:', principalToken ? 'Yes' : 'No');
        console.log('Principal userData restored:', principal);
      } catch (error) {
        console.error('Failed to parse principal data', error);
        localStorage.removeItem('principalUser');
        localStorage.removeItem('principalToken');
      }
    }
    
    // Set loading to false after session check is complete
    console.log('🔍 AuthContext: Setting loading to false');
    setLoading(false);
  }, []);
  
  // Handle pending navigation after user state is set
  useEffect(() => {
    if (pendingNavigation && user) {
      console.log('🔍 AuthContext: Executing pending navigation to:', pendingNavigation);
      navigate(pendingNavigation, { replace: true });
      setPendingNavigation(null);
    }
  }, [user, pendingNavigation, navigate]);

  const login = (userData, userType = 'user') => {
    console.log('=== LOGIN FUNCTION CALLED ===');
    console.log('User Data:', userData);
    console.log('User Type:', userType);
    console.log('Token present:', !!userData.token);
    
    // Clear any existing sessions first (but do this more selectively)
    setUser(null);
    
    // Clear all localStorage items
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('principalUser');
    localStorage.removeItem('principalToken');
    
    // Set user data with proper role and ensure both id and _id are available
    const userWithRole = { 
      ...userData, 
      role: userType,
      id: userData._id || userData.id,
      _id: userData._id || userData.id
    };
    
    console.log('🔍 AuthContext: Setting user state with:', userWithRole);
    setUser(userWithRole);
    
    // Verify state was set
    setTimeout(() => {
      console.log('🔍 AuthContext: User state after setting:', user);
    }, 50);
    
    // Store in appropriate localStorage key
    if (userType === 'admin') {
      localStorage.setItem('adminUser', JSON.stringify(userWithRole));
      localStorage.setItem('adminToken', userData.token);
      console.log('Admin login successful:', userData.username || userData.email);
      console.log('Admin ID:', userWithRole.id);
      console.log('Admin token stored:', userData.token);
      console.log('Admin token verification:', localStorage.getItem('adminToken'));
    } else if (userType === 'principal') {
      localStorage.setItem('principalUser', JSON.stringify(userWithRole));
      localStorage.setItem('principalToken', userData.token);
      console.log('Principal login successful:', userData.principalName || userData.email);
      console.log('Principal ID:', userWithRole.id);
      console.log('Principal token stored:', userData.token);
      console.log('Principal userData:', userData);
      console.log('Principal token verification:', localStorage.getItem('principalToken'));
    } else {
      // Handle both 'user' and 'student' roles as regular users
      localStorage.setItem('user', JSON.stringify(userWithRole));
      localStorage.setItem('token', userData.token);
      console.log('User/Student login successful:', userData.username || userData.email);
      console.log('User role:', userType);
      console.log('User ID:', userWithRole.id);
      console.log('User token stored:', userData.token);
      console.log('User token verification:', localStorage.getItem('token'));
      console.log('User data verification:', localStorage.getItem('user'));
    }
    
    // Verify storage immediately
    console.log('=== STORAGE VERIFICATION ===');
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('localStorage adminToken:', localStorage.getItem('adminToken'));
    console.log('localStorage principalToken:', localStorage.getItem('principalToken'));
    console.log('localStorage user:', localStorage.getItem('user'));
    console.log('localStorage adminUser:', localStorage.getItem('adminUser'));
    console.log('localStorage principalUser:', localStorage.getItem('principalUser'));
    
    // Get the intended path or default based on role
    const getDefaultPath = (role) => {
      switch(role) {
        case 'admin': return '/admin/dashboard';
        case 'principal': return '/principal/dashboard';
        case 'student':
        case 'user':
        default: return '/dashboard';
      }
    };
    
    // Get the intended path from location state or use default
    // Using navigate's state instead of window.location.state
    const redirectPath = getDefaultPath(userType);
    
    console.log('🔍 AuthContext: Redirecting to:', redirectPath);
    
    // Set pending navigation to be executed after user state is set
    console.log('🔍 AuthContext: Setting pending navigation to:', redirectPath);
    setPendingNavigation(redirectPath);
    
    return userWithRole;
  };

  const logout = () => {
    setUser(null);
    // Clear all authentication data
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('principalUser');
    localStorage.removeItem('principalToken');
    navigate('/');
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
    // Also update localStorage if it's a regular user
    if (updatedUserData.role === 'admin') {
      localStorage.setItem('adminUser', JSON.stringify(updatedUserData));
    } else if (updatedUserData.role === 'principal') {
      localStorage.setItem('principalUser', JSON.stringify(updatedUserData));
    } else {
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
