import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Principal from '../models/Principal.js';
import Student from '../models/Student.js';

// Ensure environment variables are loaded
dotenv.config();

const router = express.Router();

// Store OTPs temporarily (in production, use Redis)
const otpStore = new Map();

// Email transporter setup with optimized settings
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  rateLimit: 10
});



// Principal Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find principal
    const principal = await Principal.findOne({ email });
    if (!principal) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, principal.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: principal._id, email: principal.email, university: principal.university, role: 'principal' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      principal: {
        id: principal._id,
        principalName: principal.principalName,
        email: principal.email,
        gender: principal.gender,
        university: principal.university
      }
    });

  } catch (error) {
    console.error('Principal login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if principal exists
    const principal = await Principal.findOne({ email });
    if (!principal) {
      return res.status(404).json({
        success: false,
        message: 'Principal not found with this email'
      });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP with expiration (5 minutes)
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      principalId: principal._id
    });

    // Send OTP email with optimized settings
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset OTP - TEGA Principal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">TEGA Principal Password Reset</h2>
          <p>Your OTP for password reset is:</p>
          <div style="background-color: #f0fdf4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #16a34a; border-radius: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
      priority: 'high'
    };

    // Use Promise with timeout for faster failure detection
    const emailPromise = transporter.sendMail(mailOptions);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Email timeout after 15 seconds')), 15000)
    );
    
    try {
      await Promise.race([emailPromise, timeoutPromise]);
      console.log('✅ Principal OTP email sent successfully');
      console.log('✅ Password reset OTP sent successfully to:', email);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      
      // Return OTP in development for testing
      return res.json({
        success: true,
        message: 'OTP generated (email failed - check console)',
        otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        emailError: emailError.message
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email'
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Verify OTP and Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if OTP exists and is valid
    const storedOTP = otpStore.get(email);
    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'OTP not found or expired'
      });
    }

    if (Date.now() > storedOTP.expires) {
      otpStore.delete(email);
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP'
      });
    }

    // Get principal details
    const principal = await Principal.findById(storedOTP.principalId);
    if (!principal) {
      return res.status(404).json({
        success: false,
        message: 'Principal not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update principal password
    await Principal.findByIdAndUpdate(principal._id, { password: hashedPassword });

    // Clear OTP
    otpStore.delete(email);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Principal Dashboard Data (College-specific)
router.get('/dashboard', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;
    
    console.log('Principal dashboard - Auth header:', authHeader);
    console.log('Principal dashboard - Token:', token ? 'Present' : 'Missing');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Principal dashboard - Decoded token:', decoded);
    
    console.log('Principal dashboard - Looking for principal with ID:', decoded.id);
    const principal = await Principal.findById(decoded.id);
    console.log('Principal dashboard - Found principal:', principal ? 'Yes' : 'No');
    if (principal) {
      console.log('Principal dashboard - Principal details:', {
        id: principal._id,
        name: principal.principalName,
        email: principal.email,
        university: principal.university
      });
    } else {
      console.log('Principal dashboard - No principal found with ID:', decoded.id);
      // Let's also try to find by email as a fallback
      const principalByEmail = await Principal.findOne({ email: decoded.email });
      console.log('Principal dashboard - Fallback search by email:', principalByEmail ? 'Found' : 'Not found');
      if (principalByEmail) {
        console.log('Principal dashboard - Fallback principal ID:', principalByEmail._id);
      }
    }
    
    if (!principal) {
      return res.status(401).json({
        success: false,
        message: 'Principal not found.'
      });
    }

    if (!principal.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Principal account deactivated.'
      });
    }

    // Get college-specific user data (users from the same university)
    const collegeStudents = await Student.find({ institute: principal.university })
      .select('username firstName lastName email institute course year createdAt')
      .sort({ createdAt: -1 })
      .limit(100);

    // Get statistics for this college only
    const totalCollegeStudents = await Student.countDocuments({ institute: principal.university });
    const recentCollegeRegistrations = await Student.countDocuments({
      institute: principal.university,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    res.json({
      success: true,
      principal: {
        id: principal._id,
        principalName: principal.principalName,
        email: principal.email,
        university: principal.university
      },
      stats: {
        totalCollegeUsers: totalCollegeStudents,
        recentCollegeRegistrations
      },
      students: collegeStudents
    });

  } catch (error) {
    console.error('Principal dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


// Get students for the principal's college
router.get('/students', async (req, res) => {
  try {
    const authHeader = req.header('Authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const university = decoded.university;

    if (!university) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token: university not found.'
        });
    }

    const students = await Student.find({ institute: university })
      .select('studentName email studentId yearOfStudy major')
      .sort({ studentName: 1 });

    res.json({
      success: true,
      students
    });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load student data'
    });
  }
});

export default router;
