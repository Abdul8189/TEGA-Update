import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api.js";
import toast from "react-hot-toast";
import CollegeDropdown from "../components/CollegeDropdown";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Eye, EyeOff, AlertCircle } from "lucide-react";
import MessageDisplay from "../components/ui/MessageDisplay";
import { getMessage } from "../utils/messages";

function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    institute: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [error, setError] = useState('');
  
  // Validation states
  const [validation, setValidation] = useState({
    firstName: { isValid: false, message: '', isTouched: false },
    lastName: { isValid: false, message: '', isTouched: false },
    institute: { isValid: false, message: '', isTouched: false },
    email: { isValid: false, message: '', isTouched: false, isChecking: false },
    password: { isValid: false, message: '', isTouched: false, strength: 0 },
    confirmPassword: { isValid: false, message: '', isTouched: false }
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (otpTimer > 0 && otpSent) {
      interval = setInterval(() => {
        setOtpTimer(prevTime => prevTime - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer, otpSent]);

  // Removed courses/years and other non-required fields

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
    
    // Validate field on change
    if (name !== 'otp') {
      validateField(name, value);
    }
  };

  const handleCollegeChange = (value) => {
    setFormData({ ...formData, institute: value });
    validateField('institute', value);
  };

  // Validation functions
  const validateField = (fieldName, value) => {
    let isValid = false;
    let message = '';
    let strength = 0;

    switch (fieldName) {
      case 'firstName':
        isValid = value.length >= 2;
        message = isValid ? '' : 'First name must be at least 2 characters';
        break;
      
      case 'lastName':
        isValid = value.length >= 2;
        message = isValid ? '' : 'Last name must be at least 2 characters';
        break;
      
      case 'institute':
        isValid = value.length > 0;
        message = isValid ? '' : 'Please select an institute';
        break;
      
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
        message = isValid ? '' : 'Please enter a valid email address';
        break;
      
      case 'password':
        const hasLower = /[a-z]/.test(value);
        const hasUpper = /[A-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(value);
        const hasLength = value.length >= 8;
        
        strength = [hasLower, hasUpper, hasNumber, hasSpecial, hasLength].filter(Boolean).length;
        isValid = strength >= 4;
        message = isValid ? '' : 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
        break;
      
      case 'confirmPassword':
        isValid = value === formData.password && value.length > 0;
        message = isValid ? '' : 'Passwords do not match';
        break;
      
      default:
        break;
    }

    setValidation(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        isValid,
        message,
        strength: fieldName === 'password' ? strength : prev[fieldName].strength,
        isTouched: true
      }
    }));

    return isValid;
  };

  // Check email availability
  const checkEmailAvailability = async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    
    setValidation(prev => ({
      ...prev,
      email: { ...prev.email, isChecking: true }
    }));

    try {
      // Simulate API call to check email availability
      // In real implementation, you'd call your backend API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // For demo purposes, let's assume some emails are taken
      const isEmailTaken = ['test@example.com', 'admin@tega.com'].includes(email);
      
      if (isEmailTaken) {
        setValidation(prev => ({
          ...prev,
          email: {
            ...prev.email,
            isValid: false,
            message: 'This email is already registered',
            isChecking: false
          }
        }));
      } else {
        setValidation(prev => ({
          ...prev,
          email: {
            ...prev.email,
            isValid: true,
            message: 'Email is available',
            isChecking: false
          }
        }));
      }
    } catch (error) {
      setValidation(prev => ({
        ...prev,
        email: {
          ...prev.email,
          isChecking: false
        }
      }));
    }
  };

  // Debounced email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && validation.email.isTouched) {
        checkEmailAvailability(formData.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Check if all fields are valid
  const isFormValid = () => {
    return Object.values(validation).every(field => 
      field.isValid || field.name === 'otp' // OTP is not required for initial validation
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.institute) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsLoading(true);
    try {
      if (!otpSent) {
        // First step: Send OTP
        console.log("Sending OTP request for:", formData.email);
        await api('/api/auth/register/send-otp', {
          method: 'POST',
          body: {
            firstName: formData.firstName,
            lastName: formData.lastName,
            institute: formData.institute,
            email: formData.email,
            password: formData.password,
          }
        });
        setOtpSent(true);
        setOtpTimer(60); // Set 60 seconds timer for resend OTP
        toast.success('OTP sent to your email. Please check your inbox and spam folder.');
      } else {
        // Second step: Verify OTP
        if (!otp || otp.trim() === '') {
          toast.error("Please enter the OTP sent to your email");
          setIsLoading(false);
          return;
        }
        
        console.log("Verifying OTP for:", formData.email);
        // Ensure OTP is a string and remove any whitespace
        const cleanOtp = String(otp).trim();
        console.log("OTP length:", cleanOtp.length, "OTP value:", cleanOtp);
        await api('/api/auth/register/verify-otp', {
          method: 'POST',
          body: { email: formData.email, otp: cleanOtp }
        });
        
        toast.success('Registration successful!');
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          institute: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setOtp("");
        setOtpSent(false);
        
        // Show success animation before redirecting
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }
    } catch (error) {
      // More detailed error handling
      console.error("Registration error details:", {
        message: error.message,
        error: error,
        formData: { ...formData, password: '***', confirmPassword: '***' } // Log form data without passwords
      });
      
      // Show more specific error message using professional messaging
      const errorMessage = getMessage('auth', 'register', error.message);
      
      if (error.message === "Email already registered" || 
          error.message === "This email is already registered. Please try logging in." || 
          error.message === "An account with this email already exists. Please try logging in.") {
        setError(errorMessage);
        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else if (error.message === "OTP not found or expired") {
        setError(errorMessage);
        // Reset OTP state to allow requesting a new one
        setOtpSent(false);
        setOtp("");
      } else if (error.message === "Invalid OTP") {
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (otpTimer > 0) return;
    
    setIsLoading(true);
    try {
      await api('/api/auth/register/send-otp', {
        method: 'POST',
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          institute: formData.institute,
          email: formData.email,
          password: formData.password,
        }
      });
      setOtpTimer(60); // Reset timer
      toast.success('OTP resent to your email');
    } catch (error) {
      toast.error(error.message || "Failed to resend OTP");
      console.error("Resend OTP error:", error);
    } finally {
      setIsLoading(false);
    }
  };


  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        type: "spring",
        stiffness: 100,
        damping: 10,
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.4 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const inputVariants = {
    focus: { scale: 1.02, borderColor: '#6366f1', boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)' },
    blur: { scale: 1, borderColor: '#e5e7eb', boxShadow: 'none' }
  };
  
  const buttonVariants = {
    hover: { scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    tap: { scale: 0.97 },
    initial: { scale: 1 }
  };

  // Password strength indicator component
  const PasswordStrengthIndicator = ({ strength }) => {
    const getStrengthText = () => {
      if (strength === 0) return 'Very Weak';
      if (strength === 1) return 'Weak';
      if (strength === 2) return 'Fair';
      if (strength === 3) return 'Good';
      if (strength === 4) return 'Strong';
      if (strength === 5) return 'Very Strong';
    };

    const getStrengthColor = () => {
      if (strength <= 1) return 'bg-red-500';
      if (strength === 2) return 'bg-yellow-500';
      if (strength === 3) return 'bg-blue-500';
      if (strength >= 4) return 'bg-green-500';
    };

    return (
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-600">Password Strength:</span>
          <span className={`font-medium ${getStrengthColor().replace('bg-', 'text-')}`}>
            {getStrengthText()}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                level <= strength ? getStrengthColor() : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full overflow-hidden">
      <motion.form 
        onSubmit={handleSubmit} 
        className="flex h-full"
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={formVariants}
      >
        <div className="flex-1 p-4 bg-white overflow-y-auto">

        {/* Error Display */}
        {error && (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div className="grid grid-cols-2 gap-3 mb-3" variants={itemVariants}>
          <div className="relative">
            <motion.input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`border p-2 rounded-lg focus:outline-none text-sm shadow-sm w-full pr-10 transition-all duration-200 ${
                validation.firstName.isTouched
                  ? validation.firstName.isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="First Name"
              whileFocus="focus"
              initial="blur"
              variants={inputVariants}
              transition={{ duration: 0.2 }}
            />
            {/* Validation Icon */}
            {validation.firstName.isTouched && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {validation.firstName.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
            {/* Validation Message */}
            {validation.firstName.isTouched && validation.firstName.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {validation.firstName.message}
              </motion.p>
            )}
            <motion.span 
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0"
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{ zIndex: -1 }}
            />
          </div>
          <div className="relative">
            <motion.input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`border p-2 rounded-lg focus:outline-none text-sm shadow-sm w-full pr-10 transition-all duration-200 ${
                validation.lastName.isTouched
                  ? validation.lastName.isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Last Name"
              whileFocus="focus"
              initial="blur"
              variants={inputVariants}
              transition={{ duration: 0.2 }}
            />
            {/* Validation Icon */}
            {validation.lastName.isTouched && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {validation.lastName.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
            {/* Validation Message */}
            {validation.lastName.isTouched && validation.lastName.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {validation.lastName.message}
              </motion.p>
            )}
            <motion.span 
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0"
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 2, delay: 0.3, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{ zIndex: -1 }}
            />
          </div>
        </motion.div>
        <motion.div 
          className="mb-3 relative"
          variants={itemVariants}
        >
          <label className="block text-xs text-gray-600 mb-1 font-medium">Institute Name</label>
          <div className="relative">
            <CollegeDropdown
              id="institute"
              value={formData.institute}
              onChange={handleCollegeChange}
            />
            {/* Validation Icon */}
            {validation.institute.isTouched && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10">
                {validation.institute.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
            {/* Validation Message */}
            {validation.institute.isTouched && validation.institute.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {validation.institute.message}
              </motion.p>
            )}
            <motion.span 
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0"
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 2, delay: 0.6, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{ zIndex: -1 }}
            />
          </div>
        </motion.div>
        <motion.div 
          className="mb-3 relative"
          variants={itemVariants}
        >
          <label className="block text-xs mb-1 font-medium">Your Email</label>
          <div className="relative">
            <motion.input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full border p-2 rounded-lg focus:outline-none text-sm shadow-sm pr-10 transition-all duration-200 ${
                validation.email.isTouched
                  ? validation.email.isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="example@gmail.com"
              whileFocus="focus"
              initial="blur"
              variants={inputVariants}
              transition={{ duration: 0.2 }}
            />
            {/* Validation Icon */}
            {validation.email.isTouched && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {validation.email.isChecking ? (
                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : validation.email.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
            {/* Validation Message */}
            {validation.email.isTouched && validation.email.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`text-xs mt-1 flex items-center gap-1 ${
                  validation.email.isValid ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {validation.email.isValid ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <AlertCircle className="w-3 h-3" />
                )}
                {validation.email.message}
              </motion.p>
            )}
            <motion.span 
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0"
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 2, delay: 0.9, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{ zIndex: -1 }}
            />
          </div>
        </motion.div>

        {otpSent && (
          <motion.div 
            className="mb-3 relative"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            variants={itemVariants}
          >
            <label className="block text-xs mb-1 font-medium">Enter OTP</label>
            <div className="relative">
              <motion.input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength="6"
                value={otp}
                onChange={(e) => {
                  // Only allow numeric input
                  const numericValue = e.target.value.replace(/[^0-9]/g, '');
                  setOtp(numericValue);
                  // Clear error when user starts typing
                  if (error) setError('');
                }}
                className="w-full border border-gray-300 p-2 rounded-lg focus:border-blue-500 focus:outline-none text-sm shadow-sm"
                placeholder="6-digit code"
                whileFocus="focus"
                initial="blur"
                variants={inputVariants}
                transition={{ duration: 0.2 }}
              />
              <motion.span 
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0"
                animate={{ opacity: [0, 0.1, 0] }}
                transition={{ duration: 2, delay: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                style={{ zIndex: -1 }}
              />
              <div className="mt-2 flex justify-between items-center">
                <motion.button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpTimer > 0 || isLoading}
                  className={`text-xs relative group ${otpTimer > 0 ? 'text-gray-400' : 'text-indigo-600 hover:text-indigo-800'}`}
                  whileHover={{ scale: otpTimer > 0 ? 1 : 1.05 }}
                  whileTap={{ scale: otpTimer > 0 ? 1 : 0.98 }}
                >
                  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Resend OTP'}
                  {otpTimer === 0 && <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-indigo-600 group-hover:w-full transition-all duration-300"></span>}
                </motion.button>
                <motion.div 
                  className="text-xs text-gray-500 flex items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <svg className="w-3 h-3 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                  </svg>
                  Check your email inbox
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="grid grid-cols-2 gap-3 mb-3"
          variants={itemVariants}
        >
          <div className="relative">
            <motion.input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`border p-2 rounded-lg focus:outline-none text-sm shadow-sm w-full pr-20 transition-all duration-200 ${
                validation.password.isTouched
                  ? validation.password.isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Password"
              whileFocus="focus"
              initial="blur"
              variants={inputVariants}
              transition={{ duration: 0.2 }}
            />
            {/* Show/Hide Password Button */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {/* Validation Icon */}
            {validation.password.isTouched && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {validation.password.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
            {/* Password Strength Indicator */}
            {validation.password.isTouched && (
              <PasswordStrengthIndicator strength={validation.password.strength} />
            )}
            {/* Validation Message */}
            {validation.password.isTouched && validation.password.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {validation.password.message}
              </motion.p>
            )}
            <motion.span 
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0"
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 2, delay: 1.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{ zIndex: -1 }}
            />
          </div>
          <div className="relative">
            <motion.input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`border p-2 rounded-lg focus:outline-none text-sm shadow-sm w-full pr-20 transition-all duration-200 ${
                validation.confirmPassword.isTouched
                  ? validation.confirmPassword.isValid
                    ? 'border-green-500 focus:border-green-500'
                    : 'border-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Confirm Password"
              whileFocus="focus"
              initial="blur"
              variants={inputVariants}
              transition={{ duration: 0.2 }}
            />
            {/* Show/Hide Confirm Password Button */}
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {/* Validation Icon */}
            {validation.confirmPassword.isTouched && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {validation.confirmPassword.isValid ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
              </div>
            )}
            {/* Validation Message */}
            {validation.confirmPassword.isTouched && validation.confirmPassword.message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-500 mt-1 flex items-center gap-1"
              >
                <AlertCircle className="w-3 h-3" />
                {validation.confirmPassword.message}
              </motion.p>
            )}
            <motion.span 
              className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-400 to-purple-500 opacity-0"
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 2, delay: 1.8, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{ zIndex: -1 }}
            />
          </div>
        </motion.div>
        <motion.button
          type="submit"
          className={`w-full py-3 px-4 rounded-lg transition-all duration-300 font-semibold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2 relative overflow-hidden ${
            isFormValid() 
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={isFormValid() ? buttonVariants.hover : {}}
          whileTap={isFormValid() ? buttonVariants.tap : {}}
          initial={buttonVariants.initial}
          disabled={isLoading || !isFormValid()}
          variants={itemVariants}
        >
          <span className="relative z-10">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                {otpSent ? 'Verify OTP' : 'Register'}
                <motion.span 
                  className="ml-1"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </>
            )}
          </span>
          
          {/* Button shine effect */}
          <motion.div 
            className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0"
            animate={{ 
              x: ['-100%', '100%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{ 
              repeat: Infinity, 
              repeatType: "loop", 
              duration: 2,
              repeatDelay: 3
            }}
          />
        </motion.button>
        </div>
      </motion.form>
    </div>
  );
};

export default RegisterForm;
