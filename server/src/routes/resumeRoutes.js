import express from 'express';
import { 
  getResume, 
  saveResume, 
  getTemplates, 
  downloadResume 
} from '../controllers/resumeController.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Get or create resume for the current user
router.get('/', authRequired, getResume);

// Save resume data
router.post('/', authRequired, saveResume);

// Get available templates
router.get('/templates', authRequired, getTemplates);

// Download resume as PDF using template name
router.post('/download/:templateName', authRequired, downloadResume);

export default router;
