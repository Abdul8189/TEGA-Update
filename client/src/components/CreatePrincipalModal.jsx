import React, { useState } from 'react';
import toast from 'react-hot-toast';
import MessageDisplay from './ui/MessageDisplay';
import { useMessage } from '../hooks/useMessage';
import { getMessage } from '../utils/messages';
import { api } from '../utils/api';
import CollegeDropdown from './CollegeDropdown';

const CreatePrincipalModal = ({ isOpen, onClose, onPrincipalCreated }) => {
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const [formData, setFormData] = useState({
    principalName: '',
    email: '',
    university: '',
    password: '',
    gender: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear any existing messages when user starts typing
    if (message.show) clearMessage();
  };

  const handleCollegeChange = (value) => {
    setFormData({ ...formData, university: value });
    if (errors.university) {
      setErrors({ ...errors, university: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    const { principalName, email, university, password, gender } = formData;

    if (!principalName) newErrors.principalName = 'Principal name is required.';
    if (!university) newErrors.university = 'University is required.';
    if (!gender) newErrors.gender = 'Gender is required.';

    // Email validation
    const emailRegex = /\S+@\S+\.\S+/;
    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please provide a valid email address.';
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showError('Please fix the validation errors before submitting.', 'Validation Error');
      return;
    }
    
    setLoading(true);
    clearMessage();
    
    try {
      const response = await api('/api/admin/register-principal', {
        method: 'POST',
        body: formData
      });

      if (response.success) {
        showSuccess('Principal account created successfully and is now available in the system.', 'Principal Created');
        onPrincipalCreated(response.principal);
        // Close modal after a short delay to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        showError(response.message || 'Failed to create principal account. Please try again.', 'Creation Failed');
      }
    } catch (error) {
      console.error('Create principal error:', error);
      const errorMessage = getMessage('user', 'create', error.message, { userType: 'Principal' });
      showError(errorMessage, 'Creation Failed');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Create New Principal</h2>
        
        {/* Professional Message Display */}
        <MessageDisplay
          show={message.show}
          type={message.type}
          title={message.title}
          message={message.message}
          onClose={clearMessage}
          className="mb-4"
        />
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Principal Name</label>
            <input
              type="text"
              name="principalName"
              value={formData.principalName}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.principalName && <p className="text-red-500 text-xs mt-1">{errors.principalName}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
          </div>
                    <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">University</label>
            <CollegeDropdown
              id="university"
              value={formData.university}
              onChange={handleCollegeChange}
              error={errors.university}
            />
            {errors.university && <p className="text-red-500 text-xs mt-1">{errors.university}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300"
            >
              {loading ? 'Creating...' : 'Create Principal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrincipalModal;
