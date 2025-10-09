// Professional messaging utility for consistent user feedback

export const Messages = {
  // Authentication Messages
  auth: {
    loginSuccess: (userType) => `Welcome back! You have successfully logged in as ${userType}.`,
    loginError: (error) => {
      if (error.includes('credentials')) return 'Invalid email or password. Please check your credentials and try again.';
      if (error.includes('account')) return 'Account not found. Please verify your email address or register for a new account.';
      if (error.includes('blocked') || error.includes('suspended')) return 'Your account has been temporarily suspended. Please contact support for assistance.';
      return 'Login failed. Please try again or contact support if the problem persists.';
    },
    registerSuccess: 'Account created successfully! Please check your email for verification instructions.',
    registerError: (error) => {
      if (error.includes('email already')) return 'An account with this email address already exists. Please try logging in instead.';
      if (error.includes('password')) return 'Password does not meet security requirements. Please use a stronger password.';
      if (error.includes('email format')) return 'Please enter a valid email address.';
      return 'Registration failed. Please check your information and try again.';
    },
    logoutSuccess: 'You have been successfully logged out.',
    passwordResetSuccess: 'Password reset instructions have been sent to your email address.',
    passwordResetError: 'Failed to send password reset instructions. Please try again or contact support.',
  },

  // User Management Messages
  user: {
    createSuccess: (userType) => `${userType} account created successfully.`,
    createError: (userType, error) => {
      if (error.includes('email already')) return `A ${userType.toLowerCase()} with this email already exists.`;
      if (error.includes('username already')) return `A ${userType.toLowerCase()} with this username already exists.`;
      return `Failed to create ${userType.toLowerCase()} account. Please try again.`;
    },
    updateSuccess: (userType) => `${userType} information updated successfully.`,
    updateError: (userType, error) => {
      if (error.includes('email already')) return `A ${userType.toLowerCase()} with this email already exists.`;
      return `Failed to update ${userType.toLowerCase()} information. Please try again.`;
    },
    deleteSuccess: (userType) => `${userType} account deleted successfully.`,
    deleteError: (userType) => `Failed to delete ${userType.toLowerCase()} account. Please try again.`,
    bulkImportSuccess: (count) => `Successfully imported ${count} ${count === 1 ? 'user' : 'users'}.`,
    bulkImportError: (error) => {
      if (error.includes('duplicate')) return 'Some users already exist. Please check the data and try again.';
      if (error.includes('format')) return 'Invalid file format. Please use the correct template.';
      return 'Bulk import failed. Please check your data and try again.';
    },
  },

  // Course Management Messages
  course: {
    createSuccess: 'Course created successfully and is now available to students.',
    createError: (error) => {
      if (error.includes('title already')) return 'A course with this title already exists.';
      if (error.includes('invalid')) return 'Please provide valid course information.';
      return 'Failed to create course. Please try again.';
    },
    updateSuccess: 'Course information updated successfully.',
    updateError: 'Failed to update course. Please try again.',
    deleteSuccess: 'Course deleted successfully.',
    deleteError: 'Failed to delete course. Please try again.',
    enrollSuccess: 'Successfully enrolled in the course.',
    enrollError: 'Failed to enroll in the course. Please try again.',
    paymentSuccess: (amount, courseName) => `Payment of ₹${amount} for "${courseName}" completed successfully.`,
    paymentError: 'Payment failed. Please check your payment details and try again.',
  },

  // Exam Management Messages
  exam: {
    createSuccess: 'Exam created successfully and is now available to students.',
    createError: (error) => {
      if (error.includes('title already')) return 'An exam with this title already exists.';
      if (error.includes('invalid')) return 'Please provide valid exam information.';
      return 'Failed to create exam. Please try again.';
    },
    updateSuccess: 'Exam information updated successfully.',
    updateError: 'Failed to update exam. Please try again.',
    deleteSuccess: 'Exam deleted successfully.',
    deleteError: 'Failed to delete exam. Please try again.',
    startSuccess: 'Exam started successfully. Good luck!',
    startError: 'Failed to start exam. Please try again.',
    submitSuccess: 'Exam submitted successfully. Results will be available shortly.',
    submitError: 'Failed to submit exam. Please try again.',
  },

  // File Management Messages
  file: {
    uploadSuccess: (fileName) => `"${fileName}" uploaded successfully.`,
    uploadError: (fileName, error) => {
      if (error.includes('size')) return `File "${fileName}" is too large. Please choose a smaller file.`;
      if (error.includes('format')) return `File "${fileName}" format is not supported.`;
      return `Failed to upload "${fileName}". Please try again.`;
    },
    deleteSuccess: (fileName) => `"${fileName}" deleted successfully.`,
    deleteError: (fileName) => `Failed to delete "${fileName}". Please try again.`,
    downloadSuccess: 'File downloaded successfully.',
    downloadError: 'Failed to download file. Please try again.',
  },

  // System Messages
  system: {
    saveSuccess: 'Changes saved successfully.',
    saveError: 'Failed to save changes. Please try again.',
    loadError: 'Failed to load data. Please refresh the page and try again.',
    networkError: 'Network connection error. Please check your internet connection and try again.',
    serverError: 'Server error occurred. Please try again later or contact support.',
    unauthorized: 'You are not authorized to perform this action.',
    sessionExpired: 'Your session has expired. Please log in again.',
    maintenance: 'System is under maintenance. Please try again later.',
  },

  // Validation Messages
  validation: {
    required: (field) => `${field} is required.`,
    invalidEmail: 'Please enter a valid email address.',
    invalidPhone: 'Please enter a valid phone number.',
    passwordTooShort: 'Password must be at least 8 characters long.',
    passwordMismatch: 'Passwords do not match.',
    invalidFormat: (field, format) => `${field} must be in ${format} format.`,
    tooShort: (field, minLength) => `${field} must be at least ${minLength} characters long.`,
    tooLong: (field, maxLength) => `${field} must be no more than ${maxLength} characters long.`,
    invalidDate: 'Please enter a valid date.',
    futureDate: 'Date cannot be in the future.',
    pastDate: 'Date cannot be in the past.',
  },

  // Action Messages
  action: {
    confirm: (action) => `Are you sure you want to ${action}?`,
    cancel: 'Action cancelled.',
    processing: 'Processing your request...',
    completed: 'Operation completed successfully.',
    failed: 'Operation failed. Please try again.',
  }
};

// Helper function to get contextual messages
export const getMessage = (category, action, error = null, context = {}) => {
  const messageKey = `${action}${error ? 'Error' : 'Success'}`;
  const messageFunction = Messages[category]?.[messageKey];
  
  if (typeof messageFunction === 'function') {
    return messageFunction(error, context);
  }
  
  return messageFunction || Messages.system.serverError;
};

export default Messages;
