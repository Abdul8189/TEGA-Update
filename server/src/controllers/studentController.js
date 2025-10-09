import Student from '../models/Student.js';
import { inMemoryUsers } from './authController.js';

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    const studentId = req.studentId;
    console.log('🔍 getStudentProfile called for studentId:', studentId);
    
    let student = null;
    
    // Check if studentId is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(studentId)) {
      console.log('🔍 StudentId is valid ObjectId, looking in MongoDB');
      student = await Student.findById(studentId).select('-password');
      console.log('🔍 MongoDB lookup result:', student ? 'found' : 'not found');
    }
    
    // If not found in MongoDB or not a valid ObjectId, check in-memory storage
    if (!student) {
      console.log('🔍 Looking in in-memory storage...');
      student = inMemoryUsers.find(user => user._id === studentId);
      console.log('🔍 In-memory lookup result:', student ? 'found' : 'not found');
    }
    
    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }
    
    // Debug: Log family and state fields being retrieved
    console.log('📖 Family and state fields being retrieved:', {
      fatherName: student.fatherName,
      fatherOccupation: student.fatherOccupation,
      motherName: student.motherName,
      motherOccupation: student.motherOccupation,
      state: student.state
    });
    
    res.json({
      success: true,
      data: student
    });
  } catch (err) {
    console.error('Get student profile error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error while fetching profile' 
    });
  }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
  try {
    const studentId = req.studentId;
    console.log('🔍 updateStudentProfile called for studentId:', studentId);
    
    let student = null;
    
    // Check if studentId is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(studentId)) {
      console.log('🔍 StudentId is valid ObjectId, looking in MongoDB');
      student = await Student.findById(studentId);
      console.log('🔍 MongoDB lookup result:', student ? 'found' : 'not found');
    }
    
    // If not found in MongoDB or not a valid ObjectId, check in-memory storage
    if (!student) {
      console.log('🔍 Looking in in-memory storage...');
      student = inMemoryUsers.find(user => user._id === studentId);
      console.log('🔍 In-memory lookup result:', student ? 'found' : 'not found');
    }

    if (!student) {
      return res.status(404).json({ 
        success: false,
        message: 'Student not found' 
      });
    }

    // Build a sanitized payload to avoid validation issues
    const src = req.body || {};
    const cleaned = { ...src };

    // Normalize gender
    if (cleaned.gender !== undefined) {
      const g = String(cleaned.gender).toLowerCase();
      cleaned.gender = g === 'male' ? 'Male' : g === 'female' ? 'Female' : g === 'other' ? 'Other' : undefined;
    }

    // Normalize numeric/date fields
    if (cleaned.yearOfStudy !== undefined && cleaned.yearOfStudy !== null && cleaned.yearOfStudy !== '') {
      const n = parseInt(cleaned.yearOfStudy, 10);
      cleaned.yearOfStudy = Number.isNaN(n) ? undefined : n;
    }
    if (cleaned.dob) {
      const d = new Date(cleaned.dob);
      cleaned.dob = isNaN(d.getTime()) ? undefined : d;
    }

    // Normalize ids/strings
    if (cleaned.studentId !== undefined) {
      cleaned.studentId = String(cleaned.studentId || '').trim();
      if (cleaned.studentId === '') cleaned.studentId = undefined;
    }

    // Normalize phone numbers to last 10 digits
    const sanitizePhone = (v) => (v ? String(v).replace(/\D/g, '').slice(-10) : undefined);
    if (cleaned.phone !== undefined) cleaned.phone = sanitizePhone(cleaned.phone);
    if (cleaned.contactNumber !== undefined) cleaned.contactNumber = sanitizePhone(cleaned.contactNumber);

    // Normalize arrays: accept comma-separated strings or arrays of strings
    const toArray = (v) => Array.isArray(v) ? v : (typeof v === 'string' && v.trim() ? v.split(',').map(s => s.trim()).filter(Boolean) : []);

    if (cleaned.skills && !Array.isArray(cleaned.skills.filter ? cleaned.skills : [])) {
      const arr = toArray(cleaned.skills);
      cleaned.skills = arr.map(name => ({ name, level: 'Intermediate' }));
    }

    if (cleaned.certifications && !Array.isArray(cleaned.certifications.filter ? cleaned.certifications : [])) {
      const arr = toArray(cleaned.certifications);
      cleaned.certifications = arr.map(name => ({ name, issuer: 'Not specified', date: new Date(), url: '' }));
    }

    if (cleaned.languages && !Array.isArray(cleaned.languages.filter ? cleaned.languages : [])) {
      const arr = toArray(cleaned.languages);
      cleaned.languages = arr.map(name => ({ name, proficiency: 'Conversational' }));
    }

    // Ensure other optional array fields are arrays
    const arrayFields = ['projects','achievements','education','experience','hobbies','volunteerExperience','extracurricularActivities'];
    arrayFields.forEach(f => {
      if (cleaned[f] === '' || cleaned[f] === null || cleaned[f] === undefined) cleaned[f] = [];
    });

    // Remove fields that resolved to undefined/empty to avoid enum/validation errors
    ['gender','yearOfStudy','dob','phone','contactNumber','studentId'].forEach((f) => {
      if (cleaned[f] === undefined || cleaned[f] === '') delete cleaned[f];
    });

    // Apply sanitized values
    Object.assign(student, cleaned);
    
    // Debug: Log family and state fields
    console.log('📝 Family and state fields being saved:', {
      fatherName: student.fatherName,
      fatherOccupation: student.fatherOccupation,
      motherName: student.motherName,
      motherOccupation: student.motherOccupation,
      state: student.state
    });

    // Ensure enum-safe value for gender on the document itself
    const validGender = ['Male', 'Female', 'Other'];
    if (student.gender && !validGender.includes(student.gender)) {
      student.gender = undefined;
    }

    // Check if this is a MongoDB user or in-memory user
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(studentId);
    
    if (isValidObjectId) {
      // MongoDB user - save to database
      await student.save();
    } else {
      // In-memory user - update in memory
      const userIndex = inMemoryUsers.findIndex(user => user._id === studentId);
      if (userIndex !== -1) {
        inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...student };
        console.log('🔍 Updated in-memory user:', inMemoryUsers[userIndex]);
      }
    }
    
    res.json({
      success: true,
      data: student,
      message: 'Profile updated successfully'
    });
  } catch (err) {
    console.error('Update student profile error:', err);
    // Send more helpful messages for common issues
    if (err && err.name === 'ValidationError') {
      const details = Object.values(err.errors || {}).map(e => e.message).join('; ');
      return res.status(400).json({ success: false, message: `Validation failed: ${details}` });
    }
    if (err && err.code === 11000) {
      const fields = Object.keys(err.keyPattern || {});
      return res.status(409).json({ success: false, message: `Duplicate value for field(s): ${fields.join(', ')}` });
    }
    return res.status(500).json({ success: false, message: 'Server error while updating profile' });
  }
};

// Upload profile photo
export const uploadProfilePhoto = async (req, res) => {
  try {
    const studentId = req.studentId;
    console.log('🔍 uploadProfilePhoto called for studentId:', studentId);
    
    let student = null;
    
    // Check if studentId is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(studentId)) {
      console.log('🔍 StudentId is valid ObjectId, looking in MongoDB');
      student = await Student.findById(studentId);
      console.log('🔍 MongoDB lookup result:', student ? 'found' : 'not found');
    }
    
    // If not found in MongoDB or not a valid ObjectId, check in-memory storage
    if (!student) {
      console.log('🔍 Looking in in-memory storage...');
      student = inMemoryUsers.find(user => user._id === studentId);
      console.log('🔍 In-memory lookup result:', student ? 'found' : 'not found');
    }
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    if (req.file) {
      // Convert buffer to Base64 Data URI
      const photoDataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      student.profilePhoto = photoDataUri;
    }

    // Check if this is a MongoDB user or in-memory user
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(studentId);
    
    if (isValidObjectId) {
      // MongoDB user - save to database
      await student.save();
    } else {
      // In-memory user - update in memory
      const userIndex = inMemoryUsers.findIndex(user => user._id === studentId);
      if (userIndex !== -1) {
        inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...student };
        console.log('🔍 Updated in-memory user profile photo:', inMemoryUsers[userIndex]);
      }
    }
    // Return only the necessary fields
    res.json({ profilePhoto: student.profilePhoto });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Remove profile photo
export const removeProfilePhoto = async (req, res) => {
  try {
    const studentId = req.studentId;
    console.log('🔍 removeProfilePhoto called for studentId:', studentId);
    
    let student = null;
    
    // Check if studentId is a valid MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(studentId)) {
      console.log('🔍 StudentId is valid ObjectId, looking in MongoDB');
      student = await Student.findById(studentId);
      console.log('🔍 MongoDB lookup result:', student ? 'found' : 'not found');
    }
    
    // If not found in MongoDB or not a valid ObjectId, check in-memory storage
    if (!student) {
      console.log('🔍 Looking in in-memory storage...');
      student = inMemoryUsers.find(user => user._id === studentId);
      console.log('🔍 In-memory lookup result:', student ? 'found' : 'not found');
    }
    
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }

    student.profilePhoto = undefined;

    // Check if this is a MongoDB user or in-memory user
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(studentId);
    
    if (isValidObjectId) {
      // MongoDB user - save to database
      await student.save();
    } else {
      // In-memory user - update in memory
      const userIndex = inMemoryUsers.findIndex(user => user._id === studentId);
      if (userIndex !== -1) {
        inMemoryUsers[userIndex] = { ...inMemoryUsers[userIndex], ...student };
        console.log('🔍 Removed in-memory user profile photo:', inMemoryUsers[userIndex]);
      }
    }
    res.json({ profilePhoto: undefined });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

