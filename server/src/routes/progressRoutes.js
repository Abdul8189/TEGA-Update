import express from 'express';
import {
  getCourseProgress,
  markVideoWatched,
  markMaterialDownloaded,
  updateQuizProgress,
  getStudentOverallProgress,
  updateLastAccessed
} from '../controllers/progressController.js';
import { studentAuth } from '../middleware/studentAuth.js';

const router = express.Router();

// All routes require student authentication
router.get('/course/:courseId', studentAuth, getCourseProgress);
router.post('/course/:courseId/video/:moduleIndex/:videoId', studentAuth, markVideoWatched);
router.post('/course/:courseId/material/:moduleIndex/:materialId', studentAuth, markMaterialDownloaded);
router.post('/course/:courseId/quiz/:moduleIndex', studentAuth, updateQuizProgress);
router.get('/student/overall', studentAuth, getStudentOverallProgress);
router.put('/course/:courseId/last-accessed', studentAuth, updateLastAccessed);

export default router;
