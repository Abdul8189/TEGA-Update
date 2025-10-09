import express from 'express';
import {
  checkQuizAttempt,
  getQuizQuestions,
  startQuizAttempt,
  submitQuizAttempt,
  getUserQuizAttempts,
  getQuizResults
} from '../controllers/quizController.js';
import { studentAuth } from '../middleware/studentAuth.js';

const router = express.Router();

// Quiz routes (all require student authentication)
router.get('/check-attempt/:courseId/:moduleIndex', studentAuth, checkQuizAttempt);
router.get('/questions/:courseId/:moduleIndex', studentAuth, getQuizQuestions);
router.post('/start-attempt', studentAuth, startQuizAttempt);
router.post('/submit-attempt', studentAuth, submitQuizAttempt);
router.get('/attempts/:courseId', studentAuth, getUserQuizAttempts);
router.get('/results/:attemptId', studentAuth, getQuizResults);

export default router;

