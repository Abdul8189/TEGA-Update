import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

const adminAuth = async (req, res, next) => {
  try {
    console.log('🔍 adminAuth middleware called for:', req.path);
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided for admin route:', req.path);
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    console.log('JWT_SECRET used for verification:', process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    console.log('Decoded admin token:', decoded);

    // Role-based access control
    if (decoded.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Access denied. User is not an admin.'
      });
    }

    const admin = await Admin.findById(decoded.id);

    req.adminId = decoded.id; // Attach adminId to the request
    
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or admin account deactivated.'
      });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

export { adminAuth };
