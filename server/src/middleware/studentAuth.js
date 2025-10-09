import jwt from 'jsonwebtoken';
import Student from '../models/Student.js';
import { inMemoryUsers } from '../controllers/authController.js';

const studentAuth = async (req, res, next) => {
  try {
    console.log('🔐 STUDENT AUTH MIDDLEWARE CALLED');
    console.log('🔍 Request URL:', req.url);
    console.log('🔍 Request method:', req.method);
    
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    console.log('🔍 StudentAuth Debug:');
    console.log('- Token received:', token ? token.substring(0, 20) + '...' : 'null');
    console.log('- JWT_SECRET used for verification:', process.env.JWT_SECRET ? 'present' : 'missing');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
    console.log('- Decoded JWT payload:', decoded);
    
    // Check for both 'id' and 'userId' in the decoded token
    const studentId = decoded.id || decoded.userId;
    console.log('- Extracted studentId:', studentId);
    
    if (!studentId) {
      console.log('❌ No studentId found in token');
      return res.status(401).json({
        success: false,
        message: 'Invalid token structure.'
      });
    }
    
    let student;
    
    // Check if it's a valid MongoDB ObjectId format (24 hex characters)
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(studentId);
    console.log('- Is valid ObjectId format:', isValidObjectId);
    
    if (isValidObjectId) {
      console.log('- Looking up student in MongoDB...');
      // Try to find in MongoDB
      student = await Student.findById(studentId);
      console.log('- MongoDB lookup result:', student ? 'found' : 'not found');
    }
    
    // If not found in MongoDB or not a valid ObjectId, check in-memory storage
    if (!student) {
      console.log('- Looking up student in in-memory storage...');
      console.log('- In-memory users count:', inMemoryUsers.size);
      
      // Find user in in-memory storage by ID
      for (const [email, user] of inMemoryUsers) {
        console.log(`- Checking user ${email} with ID: ${user._id}`);
        if (user._id === studentId) {
          student = user;
          console.log('- Found student in in-memory storage!');
          break;
        }
      }
    }
    
    if (!student) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token or student account not found.'
      });
    }

    req.student = student;
    req.studentId = student._id;
    
    console.log('✅ StudentAuth: Setting req.studentId to:', student._id);
    console.log('✅ StudentAuth: Student object:', { id: student._id, email: student.email });
    
    next();
  } catch (error) {
    console.error('Student auth error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

export { studentAuth };
