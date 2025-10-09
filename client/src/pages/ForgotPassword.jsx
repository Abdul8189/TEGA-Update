import { useState } from "react";
import { api } from "../utils/api.js";
import toast from "react-hot-toast";

export default function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api('/api/auth/forgot-password', {
        method: 'POST',
        body: { email: formData.email }
      });
      
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error) {
      toast.error(error.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await api('/api/auth/verify-otp', {
        method: 'POST',
        body: { 
          email: formData.email, 
          otp: formData.otp 
        }
      });
      
      toast.success("OTP verified successfully!");
      setStep(3);
    } catch (error) {
      toast.error(error.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setLoading(true);
    
    try {
      await api('/api/auth/reset-password', {
        method: 'POST',
        body: { 
          email: formData.email,
          otp: formData.otp,
          newPassword: formData.newPassword 
        }
      });
      
      toast.success("Password reset successfully!");
      onBack(); // Go back to login form
    } catch (error) {
      toast.error(error.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Animated Profile Section */}
      <div className="text-center mb-6">
        <div className="relative inline-block">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-red-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <span className="text-2xl animate-bounce">🔑</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-400 rounded-full border-2 border-white animate-ping"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mt-2">
          {step === 1 && "Reset Password"}
          {step === 2 && "Verify OTP"}
          {step === 3 && "New Password"}
        </h3>
      </div>

      {/* Step 1: Email Input */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-orange-600">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-3 rounded-lg transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none hover:border-gray-300 transform hover:scale-[1.02]"
              placeholder="Enter your email address"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:animate-pulse">📧</span>
            {loading ? "Sending..." : "Send OTP"}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">
              We've sent a 6-digit OTP to <strong>{formData.email}</strong>
            </p>
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-orange-600">
              Enter OTP
            </label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-3 rounded-lg transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none hover:border-gray-300 transform hover:scale-[1.02] text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength="6"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:animate-pulse">✅</span>
            {loading ? "Verifying..." : "Verify OTP"}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={handleSendOTP}
              className="text-orange-600 hover:text-orange-700 underline text-sm font-medium transition-colors"
            >
              Resend OTP
            </button>
          </div>
        </form>
      )}

      {/* Step 3: New Password */}
      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-orange-600">
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-3 rounded-lg transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none hover:border-gray-300 transform hover:scale-[1.02]"
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div className="group">
            <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-orange-600">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border-2 border-gray-200 p-3 rounded-lg transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none hover:border-gray-300 transform hover:scale-[1.02]"
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            <span className="group-hover:animate-pulse">🔒</span>
            {loading ? "Resetting..." : "Reset Password"}
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>
        </form>
      )}

      {/* Back to Login */}
      <div className="text-center mt-6">
        <button
          onClick={onBack}
          className="text-gray-600 hover:text-gray-700 underline text-sm font-medium transition-colors flex items-center justify-center gap-1"
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}
