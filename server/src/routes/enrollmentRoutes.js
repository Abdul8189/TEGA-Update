import express from 'express';
import { studentAuth } from '../middleware/studentAuth.js';
import {
  enrollInCourse,
  checkEnrollment,
  getStudentEnrollments,
  checkLectureAccess,
  unenrollFromCourse
} from '../controllers/enrollmentController.js';

const router = express.Router();

// All routes require student authentication
router.use(studentAuth);

// Enrollment routes - Universal access for all institutes
router.post('/:courseId/enroll', enrollInCourse);
router.get('/:courseId/check', checkEnrollment);
router.get('/student/enrollments', getStudentEnrollments);
router.get('/:courseId/lectures/:lectureId/access', checkLectureAccess);
router.delete('/:courseId/unenroll', unenrollFromCourse);

export default router;
