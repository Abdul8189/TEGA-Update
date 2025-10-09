import express from 'express';
import { 
  uploadSingleCourse, 
  uploadBulkCourses, 
  getAllCourses, 
  getAllCoursesForAdmin,
  getAdminCourses, 
  updateCourse, 
  deleteCourse,
  getCourseWithContent,
  createCourse,
  bulkImportCourses,
  addVideoToCourse,
  diagnoseExcelFile,
  testCreateCourse,
  uploadCourseMaterial,
  uploadCourseQuiz,
  downloadCourseMaterial,
  fixCourseModules,
  upload 
} from '../controllers/courseController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { studentAuth } from '../middleware/studentAuth.js';

const router = express.Router();

// Public routes (for users) - Universal access for all institutes
router.get('/', studentAuth, getAllCourses); // Handle /api/courses (all courses)
router.get('/all', studentAuth, getAllCourses);

// Test endpoint (must come before /:courseId)
router.get('/test', (req, res) => {
  res.json({ message: 'Course API is working', timestamp: new Date().toISOString() });
});

// Fix course modules endpoint
router.post('/:courseId/fix-modules', adminAuth, fixCourseModules);

// Test endpoint with student auth but no college access
router.get('/test-auth', studentAuth, (req, res) => {
  res.json({ 
    message: 'Course API with auth is working', 
    timestamp: new Date().toISOString(),
    student: req.student ? 'Student found' : 'No student'
  });
});

// More specific routes to avoid conflicts
router.get('/download/:courseId/:moduleIndex/:materialIndex', (req, res, next) => {
  console.log('🎯 DOWNLOAD ROUTE HIT (new structure)!');
  console.log('📋 Params:', req.params);
  console.log('🔍 Query:', req.query);
  console.log('📡 Headers:', req.headers);
  
  // Support token in query parameter for file downloads
  if (req.query.token && !req.header('Authorization')) {
    req.headers.authorization = `Bearer ${req.query.token}`;
    console.log('✅ Token added from query parameter');
  }
  
  next();
}, studentAuth, downloadCourseMaterial);

// Test route with new structure
router.get('/test/:courseId/:moduleIndex/:materialIndex', (req, res) => {
  console.log('🧪 TEST ROUTE HIT (new structure)!');
  console.log('📋 Params:', req.params);
  res.json({ 
    success: true, 
    message: 'Test route reached successfully',
    params: req.params 
  });
});

// Course access for all users (universal access)
router.get('/:courseId', studentAuth, (req, res, next) => {
  console.log('🎯 Course route hit for courseId:', req.params.courseId);
  console.log('🎯 No college access middleware - universal access enabled');
  next();
}, getCourseWithContent);

// Admin routes (protected)
router.post('/', adminAuth, createCourse);
router.post('/upload', adminAuth, uploadSingleCourse);
router.post('/bulk-upload', adminAuth, upload.single('file'), uploadBulkCourses);
router.post('/bulk-import', adminAuth, upload.single('file'), bulkImportCourses);
router.post('/diagnose-excel', adminAuth, upload.single('file'), diagnoseExcelFile);
router.post('/test-create', adminAuth, testCreateCourse);
router.get('/admin/all', adminAuth, getAdminCourses);
router.get('/admin/all-courses', adminAuth, getAllCoursesForAdmin);
router.put('/:courseId', adminAuth, updateCourse);
router.put('/:courseId/add-video', adminAuth, addVideoToCourse);
router.delete('/:courseId', adminAuth, deleteCourse);

// Material and Quiz upload routes
router.post('/:courseId/upload-material', adminAuth, upload.single('file'), uploadCourseMaterial);
router.post('/:courseId/upload-quiz', adminAuth, upload.single('file'), uploadCourseQuiz);

export default router;
