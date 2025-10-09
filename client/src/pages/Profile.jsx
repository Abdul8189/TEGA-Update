import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Camera, 
  User as UserIcon, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap,
  Briefcase,
  Award,
  Edit3,
  Save,
  X,
  Calendar,
  Globe,
  Linkedin,
  Github,
  ExternalLink
} from 'lucide-react';
import Sidebar1 from '../components/Sidebar1';
import UserNavbar from '../components/UserNavbar';
import CollegeDropdown from '../components/CollegeDropdown';
import { useAuth } from '../contexts/AuthContext';
import { calculateProfileProgress, getProgressStatus, getProgressColor } from '../utils/profileProgress';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSelfieCapture, setShowSelfieCapture] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    // Basic Information
    username: '',
    studentName: '',
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    certificateName: '',
    
    // Contact Information
    email: '',
    phone: '',
    contactNumber: '',
    alternateNumber: '',
    personalEmail: '',
    
    // Educational Information
    institute: '',
    course: '',
    major: '',
    yearOfStudy: '',
    studentId: '',
    
    // Address Information
    address: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    city: '',
    district: '',
    state: '',
    zipcode: '',
    zipCode: '',
    
    // Family Information
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    motherOccupation: '',
    
    // Profile Information
    profilePhoto: '',
    title: '',
    summary: '',
    linkedin: '',
    website: '',
    github: '',
    
    // Skills and Preferences
    skills: '',
    certifications: '',
    jobType: '',
    preferredLocation: '',
    
    // Dynamic Arrays
    projects: [],
    achievements: [],
    education: [],
    experience: [],
    skillsArray: [],
    certificationsArray: [],
    languages: [],
    hobbies: [],
    volunteerExperience: [],
    extracurricularActivities: [],
  });

  // Progress calculation state
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    if (user && !hasUnsavedChanges) {
      // Check if user has a valid token
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, redirecting to login');
        window.location.href = '/auth';
        return;
      }

      // Refresh profile data from database to get the latest information
      console.log('🔄 Refreshing profile data from database...');
      console.log('📊 Current user institute from context:', user.institute);
      refreshProfileData();

      // Also set form data from user context as fallback
      setFormData({
        username: user.username || '',
        studentName: user.studentName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dob: user.dob || '',
        gender: user.gender || '',
        certificateName: user.certificateName || '',
        email: user.email || '',
        phone: user.phone || user.contactNumber || '',
        contactNumber: user.phone || user.contactNumber || '',
        alternateNumber: user.alternateNumber || '',
        personalEmail: user.personalEmail || '',
        institute: user.institute || '',
        course: user.course || '',
        major: user.major || '',
        yearOfStudy: user.yearOfStudy || '',
        studentId: user.studentId || '',
        address: user.address || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        landmark: user.landmark || '',
        city: user.city || '',
        district: user.district || '',
        state: user.state || '',
        zipcode: user.zipcode || user.zipCode || '',
        zipCode: user.zipcode || user.zipCode || '',
        fatherName: user.fatherName || '',
        fatherOccupation: user.fatherOccupation || '',
        motherName: user.motherName || '',
        motherOccupation: user.motherOccupation || '',
        profilePhoto: user.profilePhoto || '',
        title: user.title || '',
        summary: user.summary || '',
        linkedin: user.linkedin || '',
        website: user.website || '',
        github: user.github || '',
        skills: user.skills || '',
        certifications: user.certifications || '',
        jobType: user.jobType || '',
        preferredLocation: user.preferredLocation || '',
        projects: user.projects || [],
        achievements: user.achievements || [],
        education: user.education || [],
        experience: user.experience || [],
        skillsArray: user.skillsArray || [],
        certificationsArray: user.certificationsArray || [],
        languages: user.languages || [],
        hobbies: user.hobbies || [],
        volunteerExperience: user.volunteerExperience || [],
        extracurricularActivities: user.extracurricularActivities || [],
      });
      setLoading(false);
    } else if (!user) {
      // Redirect to login if no user
      console.log('No user found, redirecting to login');
      window.location.href = '/auth';
    }
  }, [user, hasUnsavedChanges]);

  // Calculate completion whenever formData changes
  useEffect(() => {
    const newCompletion = calculateProfileProgress(formData);
    setCompletion(newCompletion);
  }, [formData]);



  // Warn user before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
  };

  const handleCollegeChange = (value) => {
    setFormData(prev => ({
      ...prev,
      institute: value
    }));
    setHasUnsavedChanges(true);
  };

  // Function to convert skills array to display string
  const getSkillsDisplayValue = (skills) => {
    if (!skills) return '';
    if (Array.isArray(skills)) {
      return skills.map(skill => skill.name || skill).join(', ');
    }
    return skills;
  };

  // Function to convert certifications array to display string
  const getCertificationsDisplayValue = (certifications) => {
    if (!certifications) return '';
    if (Array.isArray(certifications)) {
      return certifications.map(cert => cert.name || cert).join(', ');
    }
    return certifications;
  };



  // Function to refresh profile data from database
  const refreshProfileData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return;
      }

      const response = await api('/api/student/profile');
      
      if (response && response.success && response.data) {
        const freshUserData = response.data;
        console.log('✅ Fresh profile data received from API:', freshUserData);
        console.log('🏫 Institute from API:', freshUserData.institute);
        // Update the user context with fresh data
        updateUser(freshUserData);
      
      // Update form data with fresh data, handling skills and certifications properly
      const newFormData = {
        username: freshUserData.username || '',
        studentName: freshUserData.studentName || '',
        firstName: freshUserData.firstName || '',
        lastName: freshUserData.lastName || '',
        dob: freshUserData.dob || '',
        gender: freshUserData.gender || '',
        certificateName: freshUserData.certificateName || '',
        email: freshUserData.email || '',
        phone: freshUserData.phone || freshUserData.contactNumber || '',
        contactNumber: freshUserData.phone || freshUserData.contactNumber || '',
        alternateNumber: freshUserData.alternateNumber || '',
        personalEmail: freshUserData.personalEmail || '',
        institute: freshUserData.institute || '',
        course: freshUserData.course || '',
        major: freshUserData.major || '',
        yearOfStudy: freshUserData.yearOfStudy || '',
        studentId: freshUserData.studentId || '',
        address: freshUserData.address || '',
        addressLine1: freshUserData.addressLine1 || '',
        addressLine2: freshUserData.addressLine2 || '',
        landmark: freshUserData.landmark || '',
        city: freshUserData.city || '',
        district: freshUserData.district || '',
        state: freshUserData.state || '',
        zipcode: freshUserData.zipcode || freshUserData.zipCode || '',
        zipCode: freshUserData.zipcode || freshUserData.zipCode || '',
        fatherName: freshUserData.fatherName || '',
        fatherOccupation: freshUserData.fatherOccupation || '',
        motherName: freshUserData.motherName || '',
        motherOccupation: freshUserData.motherOccupation || '',
        profilePhoto: freshUserData.profilePhoto || '',
        title: freshUserData.title || '',
        summary: freshUserData.summary || '',
        linkedin: freshUserData.linkedin || '',
        website: freshUserData.website || '',
        github: freshUserData.github || '',
        skills: getSkillsDisplayValue(freshUserData.skills) || '',
        certifications: getCertificationsDisplayValue(freshUserData.certifications) || '',
        jobType: freshUserData.jobType || '',
        preferredLocation: freshUserData.preferredLocation || '',
        projects: freshUserData.projects || [],
        achievements: freshUserData.achievements || [],
        education: freshUserData.education || [],
        experience: freshUserData.experience || [],
        skillsArray: freshUserData.skillsArray || [],
        certificationsArray: freshUserData.certificationsArray || [],
        languages: freshUserData.languages || [],
        hobbies: freshUserData.hobbies || [],
        volunteerExperience: freshUserData.volunteerExperience || [],
        extracurricularActivities: freshUserData.extracurricularActivities || [],
      };
      
      console.log('📝 Setting new form data with institute:', newFormData.institute);
      setFormData(newFormData);
    }
  } catch (error) {
    console.error('❌ Error refreshing profile data:', error);
    console.log('🔄 Falling back to user context data...');
    // Fallback to user context data if API fails
    setFormData(prev => ({
      ...prev,
      institute: user?.institute || prev.institute
    }));
  }
};

    const handleSave = async () => {
    setIsSaving(true);
    try {
      // Check if user has a valid token before making the API call
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required. Please log in again.');
        window.location.href = '/auth';
        return;
      }

      // Clean up form data before sending to API
      const cleanedFormData = { ...formData };

      // Normalize common fields to match schema
      const normalizeGender = (g) => {
        const v = (g || '').toString().toLowerCase();
        if (v === 'male') return 'Male';
        if (v === 'female') return 'Female';
        if (v === 'other') return 'Other';
        return '';
      };
      if (cleanedFormData.gender) {
        cleanedFormData.gender = normalizeGender(cleanedFormData.gender);
      }
      if (cleanedFormData.yearOfStudy !== undefined && cleanedFormData.yearOfStudy !== null && cleanedFormData.yearOfStudy !== '') {
        const n = parseInt(cleanedFormData.yearOfStudy, 10);
        if (!Number.isNaN(n)) cleanedFormData.yearOfStudy = n;
      }
      if (cleanedFormData.dob) {
        cleanedFormData.dob = new Date(cleanedFormData.dob);
      }
      const sanitizePhone = (v) => (v || '').toString().replace(/\D/g, '').slice(-10);
      if (cleanedFormData.phone) cleanedFormData.phone = sanitizePhone(cleanedFormData.phone);
      if (cleanedFormData.contactNumber) cleanedFormData.contactNumber = sanitizePhone(cleanedFormData.contactNumber);
      
      // Convert empty strings to proper arrays for skills and certifications
      if (cleanedFormData.skills === '') {
        cleanedFormData.skills = [];
      } else if (typeof cleanedFormData.skills === 'string' && cleanedFormData.skills.trim() !== '') {
        // Convert comma-separated string to array of skill objects
        cleanedFormData.skills = cleanedFormData.skills.split(',').map(skill => skill.trim()).filter(skill => skill).map(skill => ({
          name: skill,
          level: 'Intermediate' // Default level
        }));
      }
      
      if (cleanedFormData.certifications === '') {
        cleanedFormData.certifications = [];
      } else if (typeof cleanedFormData.certifications === 'string' && cleanedFormData.certifications.trim() !== '') {
        // Convert comma-separated string to array of certification objects
        cleanedFormData.certifications = cleanedFormData.certifications.split(',').map(cert => cert.trim()).filter(cert => cert).map(cert => ({
          name: cert,
          issuer: 'Not specified',
          date: new Date(),
          url: ''
        }));
      }
      
      // Clean up other array fields to prevent validation errors
      const arrayFields = ['projects', 'achievements', 'education', 'experience', 'languages', 'hobbies', 'volunteerExperience', 'extracurricularActivities'];
      arrayFields.forEach(field => {
        if (cleanedFormData[field] === '' || cleanedFormData[field] === null || cleanedFormData[field] === undefined) {
          cleanedFormData[field] = [];
        }
      });
      
      // Update via supported student profile endpoint only
      const response = await api('/api/student/profile', {
        method: 'PUT',
        body: cleanedFormData
      });

            if (response && response.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setHasUnsavedChanges(false);
        
        // Update the user context with new data
        if (user && user._id) {
          // Create updated user object with new form data
          const updatedUser = { ...user, ...cleanedFormData };
          
          // Update the user context to prevent form reset
          updateUser(updatedUser);
          
          // Update the local form data to reflect the saved changes
          setFormData(prevData => ({
            ...prevData,
            ...cleanedFormData
          }));
          
          // Dispatch a custom event to notify UserNavbar to update
          window.dispatchEvent(new CustomEvent('profileUpdated', { 
            detail: { userData: updatedUser } 
          }));
          
          // Immediately refresh profile data from database
          await refreshProfileData();
          
          // Also do a delayed refresh as backup
          setTimeout(async () => {
            await refreshProfileData();
          }, 1000); // Backup refresh after 1 second
        }
      } else {
        toast.error(response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error.message.includes('Route not found')) {
        toast.error('Profile update service unavailable. Please try again later.');
      } else if (error.message.includes('Access denied')) {
        toast.error('Authentication failed. Please log in again.');
        window.location.href = '/auth';
      } else if (error.message.toLowerCase().includes('validation')) {
        toast.error(error.message);
      } else if (error.message.includes('validation failed')) {
        toast.error('Profile validation failed. Please check your input data and try again.');
        console.error('Validation error details:', error);
      } else {
        toast.error('Failed to update profile. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setHasUnsavedChanges(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        username: user.username || '',
        studentName: user.studentName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        dob: user.dob || '',
        gender: user.gender || '',
        certificateName: user.certificateName || '',
        email: user.email || '',
        phone: user.phone || user.contactNumber || '',
        contactNumber: user.phone || user.contactNumber || '',
        alternateNumber: user.alternateNumber || '',
        personalEmail: user.personalEmail || '',
        institute: user.institute || '',
        course: user.course || '',
        major: user.major || '',
        yearOfStudy: user.yearOfStudy || '',
        studentId: user.studentId || '',
        address: user.address || '',
        addressLine1: user.addressLine1 || '',
        addressLine2: user.addressLine2 || '',
        landmark: user.landmark || '',
        city: user.city || '',
        district: user.district || '',
        state: user.state || '',
        zipcode: user.zipcode || user.zipCode || '',
        zipCode: user.zipcode || user.zipCode || '',
        fatherName: user.fatherName || '',
        fatherOccupation: user.fatherOccupation || '',
        motherName: user.motherName || '',
        motherOccupation: user.motherOccupation || '',
        profilePhoto: user.profilePhoto || '',
        title: user.title || '',
        summary: user.summary || '',
        linkedin: user.linkedin || '',
        website: user.website || '',
        github: user.github || '',
        skills: user.skills || '',
        certifications: user.certifications || '',
        jobType: user.jobType || '',
        preferredLocation: user.preferredLocation || '',
        projects: user.projects || [],
        achievements: user.achievements || [],
        education: user.education || [],
        experience: user.experience || [],
        skillsArray: user.skillsArray || [],
        certificationsArray: user.certificationsArray || [],
        languages: user.languages || [],
        hobbies: user.hobbies || [],
        volunteerExperience: user.volunteerExperience || [],
        extracurricularActivities: user.extracurricularActivities || [],
      });
    }
  };

  const handleProfilePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          profilePhoto: e.target.result
        }));
      };
      reader.readAsDataURL(file);
      
      toast.success('Profile photo updated!');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar1 />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  const fullName = `${formData.firstName} ${formData.lastName}`.trim() || formData.studentName || 'Your Name';
  const role = formData.course || 'Student';

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar1 />
      
      <div className="flex-1 flex flex-col">
        <UserNavbar />
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header Card with Profile Picture */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
              <div className="relative bg-gradient-to-r from-blue-400 to-blue-600 p-8">
                {/* Abstract geometric shapes */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-blue-300 rounded-full opacity-30"></div>
                <div className="absolute bottom-4 left-4 w-16 h-16 bg-blue-200 rounded-full opacity-40"></div>
                <div className="absolute top-1/2 right-8 w-12 h-12 bg-blue-300 rounded-lg opacity-30 transform rotate-45"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  {/* Profile Picture */}
                  <div className="relative mb-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {formData.profilePhoto ? (
                        <img 
                          src={formData.profilePhoto} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                          <UserIcon className="w-12 h-12 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    {/* Camera Icon Overlay */}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-white" />
                    </button>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePhotoChange}
                      className="hidden"
                    />
                  </div>
                  
                  {/* Name and Role */}
                  <h1 className="text-3xl font-bold text-white mb-2">{fullName}</h1>
                  <p className="text-blue-100 text-lg">{role}</p>
                </div>
              </div>
            </div>

          {/* Profile Completion Card */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Your profile is {completion}% complete
            </h2>
            <p className="text-gray-600 mb-4">
              Complete your profile now to keep your TEGA account updated and get a better chance at getting into the referral pool
            </p>
            
                        {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full transition-all duration-500"
                style={{ 
                  width: `${completion}%`,
                  backgroundColor: getProgressColor(completion)
                }}
              ></div>
            </div>
            
                        {/* Progress Segments */}
            <div className="flex space-x-2">
              {[20, 40, 60, 80, 100].map((segment) => (
                <div
                  key={segment}
                  className="flex-1 h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: completion >= segment ? getProgressColor(completion) : '#e5e7eb'
                  }}
                ></div>
              ))}
            </div>
            
                        {/* Personal Details Section */}
            <div className="mt-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Personal Details</h3>
                <p className="text-gray-600 text-sm">
                  {completion >= 100 
                    ? '🎉 Congratulations! Your profile is complete and ready to go!' 
                    : 'Your personal details helps us identify you easily whenever you need any support'
                  }
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                completion >= 100 ? 'bg-green-500' : 'bg-gray-300'
              }`}>
                {completion >= 100 ? (
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <span className="text-xs text-gray-500">{completion}%</span>
                )}
              </div>
            </div>
          </div>

                    {/* Navigation Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Dashboard</span>
              </Link>
                                <h1 className="text-2xl font-bold text-gray-900">
                    My Profile
                    {hasUnsavedChanges && (
                      <span className="ml-2 text-sm text-orange-600 font-normal">
                        (Unsaved changes)
                      </span>
                    )}
                  </h1>
                  <button
                    onClick={refreshProfileData}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Refresh profile data from database"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
            </div>
          </div>



          {/* Profile Information Card */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Edit Profile</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                      hasUnsavedChanges 
                        ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes*' : 'Save Changes'}
                    </span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                    </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.username || 'Not provided'}</p>
                  )}
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.firstName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.lastName || 'Not provided'}</p>
                  )}
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                      onChange={(e) => handleInputChange('dob', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">
                      {formData.dob ? new Date(formData.dob).toLocaleDateString() : 'Not provided'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  {isEditing ? (
                    <select
                      value={formData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.gender || 'Not provided'}</p>
                  )}
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.email || 'Not provided'}</p>
                  )}
                </div>

                      <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.phone || 'Not provided'}</p>
                  )}
                      </div>
                    </div>

              {/* Educational Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-blue-500" />
                  Educational Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Institute</label>
                  <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.institute || 'Not provided'}</p>
                  <p className="text-xs text-gray-500 mt-1">Institute cannot be changed after registration</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.course}
                      onChange={(e) => handleInputChange('course', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.course || 'Not provided'}</p>
                  )}
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.major}
                      onChange={(e) => handleInputChange('major', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.major || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year of Study</label>
                  {isEditing ? (
                    <input
                      type="number"
                      value={formData.yearOfStudy}
                      onChange={(e) => handleInputChange('yearOfStudy', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.yearOfStudy || 'Not provided'}</p>
                  )}
                    </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                  <input
                    type="text"
                    value={formData.studentId}
                    disabled
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">Student ID cannot be changed after registration</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-blue-500" />
                Additional Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows="3"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.address || 'Not provided'}</p>
                  )}
                        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.city || 'Not provided'}</p>
                  )}
                      </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.district || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.state || 'Not provided'}</p>
                  )}
                        </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.zipcode || formData.zipCode}
                      onChange={(e) => {
                        handleInputChange('zipcode', e.target.value);
                        handleInputChange('zipCode', e.target.value);
                      }}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.zipcode || formData.zipCode || 'Not provided'}</p>
                  )}
                        </div>
                      </div>
            </div>

            {/* Family Information */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <UserIcon className="w-5 h-5 mr-2 text-blue-500" />
                Family Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => handleInputChange('fatherName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.fatherName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Father's Occupation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.fatherOccupation}
                      onChange={(e) => handleInputChange('fatherOccupation', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.fatherOccupation || 'Not provided'}</p>
                  )}
                          </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => handleInputChange('motherName', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.motherName || 'Not provided'}</p>
                  )}
                          </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mother's Occupation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.motherOccupation}
                      onChange={(e) => handleInputChange('motherOccupation', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.motherOccupation || 'Not provided'}</p>
                  )}
                        </div>
                    </div>
            </div>

            {/* Professional Information */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Award className="w-5 h-5 mr-2 text-blue-500" />
                Professional Information
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.title || 'Not provided'}</p>
                  )}
                          </div>

                                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={getSkillsDisplayValue(formData.skills)}
                        onChange={(e) => handleInputChange('skills', e.target.value)}
                        rows="3"
                        placeholder="Enter your skills (comma separated, e.g., JavaScript, React, Node.js)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter skills separated by commas. Each skill will be saved with an intermediate proficiency level.</p>
                    </div>
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{getSkillsDisplayValue(formData.skills) || 'Not provided'}</p>
                  )}
                </div>

                                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                  {isEditing ? (
                    <div>
                      <textarea
                        value={getCertificationsDisplayValue(formData.certifications)}
                        onChange={(e) => handleInputChange('certifications', e.target.value)}
                        rows="3"
                        placeholder="Enter your certifications (comma separated, e.g., AWS Certified Developer, Google Cloud Professional)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter certifications separated by commas. Each certification will be saved with today's date and 'Not specified' as issuer.</p>
                    </div>
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{getCertificationsDisplayValue(formData.certifications) || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type Preference</label>
                  {isEditing ? (
                    <select
                      value={formData.jobType}
                      onChange={(e) => handleInputChange('jobType', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Job Type</option>
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                      <option value="freelance">Freelance</option>
                    </select>
                  ) : (
                    <p className="p-3 bg-gray-50 rounded-lg text-gray-900">{formData.jobType || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Media & Links */}
            <div className="mt-8 space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-blue-500" />
                Social Media & Links
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.linkedin}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formData.linkedin ? (
                        <a href={formData.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center">
                          <Linkedin className="w-4 h-4 mr-2" />
                          View Profile
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  {isEditing ? (
                    <input
                      type="url"
                      value={formData.github}
                      onChange={(e) => handleInputChange('github', e.target.value)}
                      placeholder="https://github.com/username"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formData.github ? (
                        <a href={formData.github} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center">
                          <Github className="w-4 h-4 mr-2" />
                          View Profile
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Personal Website</label>
                  {isEditing ? (
                    <input 
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      {formData.website ? (
                        <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 flex items-center">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Visit Website
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};

export default Profile;