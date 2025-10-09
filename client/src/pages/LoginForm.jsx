import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { api } from "../utils/api.js";
import toast from "react-hot-toast";
import ForgotPassword from "./ForgotPassword";
import MessageDisplay from "../components/ui/MessageDisplay";
import { getMessage } from "../utils/messages";

export default function LoginForm() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState('');
  const { login, user } = useAuth();



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      console.log('=== STARTING LOGIN REQUEST ===');
      console.log('Login form data:', formData);
      
      const response = await api('/api/auth/login', {
        method: 'POST',
        body: formData
      });
      
      console.log('=== LOGIN RESPONSE RECEIVED ===');
      console.log("Full response:", response);
      console.log("Response token:", response.token);
      console.log("Response user:", response.user);
      console.log("Token exists:", !!response.token);
      console.log("User exists:", !!response.user);
      
      toast.success("Login successful!");
      
      // Reset form
      setFormData({
        email: "",
        password: "",
      });
      
      // Use centralized login function with token
      const userWithToken = { ...response.user, token: response.token };
      console.log('🔍 LoginForm: PREPARING USER WITH TOKEN');
      console.log("🔍 LoginForm: userWithToken:", userWithToken);
      console.log("🔍 LoginForm: userWithToken.token:", userWithToken.token);
      console.log("🔍 LoginForm: userWithToken.role from server:", userWithToken.role);
      
      // Use the role from server response, or default to 'user'
      const userRole = userWithToken.role || 'user';
      console.log("🔍 LoginForm: Using role:", userRole);
      
      console.log("🔍 LoginForm: About to call login function");
      login(userWithToken, userRole);
      console.log("🔍 LoginForm: Login function called");
      
    } catch (error) {
      console.error('=== LOGIN ERROR ===');
      console.error("Login error:", error);
      const errorMessage = getMessage('auth', 'login', error.message);
      setError(errorMessage);
    }
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Animated Profile Section */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl animate-bounce">🔐</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white animate-ping"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mt-2">Welcome Back!</h3>
        <p className="text-sm text-gray-500 mt-1">Login with your email and password</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="group">
        <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full border-2 border-gray-200 p-3 rounded-lg transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none hover:border-gray-300 transform hover:scale-[1.02]"
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="group">
        <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-purple-600">Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full border-2 border-gray-200 p-3 rounded-lg transition-all duration-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 focus:outline-none hover:border-gray-300 transform hover:scale-[1.02]"
          placeholder="Enter your password"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
      >
        <span className="group-hover:animate-pulse">🔐</span>
        Sign In
        <span className="group-hover:translate-x-1 transition-transform">→</span>
      </button>

      {/* Forgot Password Link */}
      <div className="text-center mt-4">
        <button
          type="button"
          onClick={() => setShowForgotPassword(true)}
          className="text-purple-600 hover:text-purple-700 underline text-sm font-medium transition-colors"
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
}
