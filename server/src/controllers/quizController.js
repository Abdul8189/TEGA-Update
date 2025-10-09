import QuizAttempt from '../models/QuizAttempt.js';
import Course from '../models/Course.js';
import CourseProgress from '../models/CourseProgress.js';
import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';

// Check if user can attempt quiz
export const checkQuizAttempt = async (req, res) => {
  try {
    const { courseId, moduleIndex } = req.params;
    const studentId = req.studentId;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const moduleIdx = parseInt(moduleIndex);
    if (moduleIdx < 0 || moduleIdx >= course.modules.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module index'
      });
    }

    const module = course.modules[moduleIdx];
    
    // Check existing attempts first (even if quiz is deleted)
    const existingAttempts = await QuizAttempt.find({
      studentId,
      courseId,
      moduleIndex: moduleIdx,
      status: 'completed'
    });

    const hasAttempted = existingAttempts.length > 0;
    
    // If quiz is deleted or not available, but user has attempts, show results
    if (!module.quiz || !module.quiz.isEnabled) {
      if (hasAttempted) {
        return res.json({
          success: true,
          hasAttempted: true,
          maxAttempts: 1,
          attemptsUsed: existingAttempts.length,
          canAttempt: false,
          quizDeleted: true,
          message: 'Quiz has been removed, but you can view your previous results'
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Quiz not available for this module'
        });
      }
    }

    // Quiz is available, check if user can attempt
    const canAttempt = existingAttempts.length < module.quiz.maxAttempts;

    res.json({
      success: true,
      hasAttempted,
      maxAttempts: module.quiz.maxAttempts,
      attemptsUsed: existingAttempts.length,
      canAttempt,
      quizDeleted: false
    });

  } catch (error) {
    console.error('Error checking quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check quiz attempt'
    });
  }
};

// Get quiz questions
export const getQuizQuestions = async (req, res) => {
  try {
    const { courseId, moduleIndex } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const moduleIdx = parseInt(moduleIndex);
    if (moduleIdx < 0 || moduleIdx >= course.modules.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module index'
      });
    }

    const module = course.modules[moduleIdx];
    if (!module.quiz || !module.quiz.isEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Quiz not available for this module'
      });
    }

    // Read questions from Excel file
    const filePath = module.quiz.questionPaperPath;
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Quiz file not found'
      });
    }

    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    // Transform data to quiz format
    const questions = data.map((row, index) => ({
      id: `q${index + 1}`,
      question: row.Question || row.question || '',
      options: [
        row.OptionA || row.Option1 || row.option1 || row.A || '',
        row.OptionB || row.Option2 || row.option2 || row.B || '',
        row.OptionC || row.Option3 || row.option3 || row.C || '',
        row.OptionD || row.Option4 || row.option4 || row.D || ''
      ].filter(option => option.trim() !== ''),
      correctAnswer: row.CorrectAnswer || row.correctAnswer || row.Answer || row.answer || '',
      explanation: row.Explanation || row.explanation || ''
    }));

    res.json({
      success: true,
      questions
    });

  } catch (error) {
    console.error('Error getting quiz questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load quiz questions'
    });
  }
};

// Start quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { courseId, moduleIndex, moduleTitle, totalQuestions, timeLimit, passingScore } = req.body;
    const studentId = req.studentId;

    console.log('🎯 QUIZ START DEBUG:');
    console.log('- Request studentId:', studentId);
    console.log('- Request studentId type:', typeof studentId);
    console.log('- CourseId:', courseId);
    console.log('- ModuleIndex:', moduleIndex);

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const moduleIdx = parseInt(moduleIndex);
    if (moduleIdx < 0 || moduleIdx >= course.modules.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid module index'
      });
    }

    const module = course.modules[moduleIdx];
    if (!module.quiz || !module.quiz.isEnabled) {
      return res.status(400).json({
        success: false,
        message: 'Quiz not available for this module'
      });
    }

    // Check if user can attempt quiz
    const existingAttempts = await QuizAttempt.find({
      studentId,
      courseId,
      moduleIndex: moduleIdx,
      status: 'completed'
    });

    if (existingAttempts.length >= module.quiz.maxAttempts) {
      return res.status(400).json({
        success: false,
        message: 'Maximum attempts reached for this quiz'
      });
    }

    // Create new quiz attempt
    const quizAttempt = new QuizAttempt({
      studentId,
      courseId,
      moduleIndex: moduleIdx,
      moduleTitle,
      quizId: `${courseId}-${moduleIdx}`,
      attemptNumber: existingAttempts.length + 1,
      status: 'in_progress',
      totalQuestions,
      passingScore
    });

    console.log('🎯 QUIZ ATTEMPT CREATED:');
    console.log('- Quiz attempt studentId:', quizAttempt.studentId);
    console.log('- Quiz attempt _id:', quizAttempt._id);

    await quizAttempt.save();

    console.log('🎯 QUIZ ATTEMPT SAVED:');
    console.log('- Saved quiz attempt ID:', quizAttempt._id);
    console.log('- Saved studentId:', quizAttempt.studentId);

    res.json({
      success: true,
      attempt: quizAttempt
    });

  } catch (error) {
    console.error('Error starting quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start quiz attempt'
    });
  }
};

// Submit quiz attempt
export const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId, answers, score, isPassed, timeSpent, endTime } = req.body;
    const studentId = req.studentId;

    console.log('🎯 QUIZ SUBMIT DEBUG:');
    console.log('- Request studentId:', studentId);
    console.log('- Request attemptId:', attemptId);
    console.log('- Request body keys:', Object.keys(req.body));

    const quizAttempt = await QuizAttempt.findById(attemptId);
    if (!quizAttempt) {
      console.log('❌ Quiz attempt not found:', attemptId);
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    console.log('- Quiz attempt studentId:', quizAttempt.studentId);
    console.log('- Quiz attempt studentId type:', typeof quizAttempt.studentId);
    console.log('- Request studentId type:', typeof studentId);
    console.log('- StudentId match:', quizAttempt.studentId.toString() === studentId.toString());

    if (quizAttempt.studentId.toString() !== studentId.toString()) {
      console.log('❌ StudentId mismatch:');
      console.log('  - Stored:', quizAttempt.studentId.toString());
      console.log('  - Request:', studentId);
      
      // If this is an orphaned attempt, delete it and return a helpful message
      if (quizAttempt.status === 'in_progress') {
        console.log('🧹 Deleting orphaned quiz attempt');
        await QuizAttempt.findByIdAndDelete(attemptId);
        return res.status(400).json({
          success: false,
          message: 'Quiz session expired. Please start a new quiz.'
        });
      }
      
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to quiz attempt'
      });
    }

    if (quizAttempt.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Quiz attempt already submitted'
      });
    }

    // Update quiz attempt
    quizAttempt.status = 'completed';
    quizAttempt.endTime = new Date(endTime);
    quizAttempt.timeSpent = timeSpent;
    quizAttempt.answeredQuestions = answers.length;
    quizAttempt.correctAnswers = answers.filter(answer => answer.isCorrect).length;
    quizAttempt.score = score;
    quizAttempt.isPassed = isPassed;
    quizAttempt.answers = answers;

    console.log('🎯 QUIZ SUBMISSION DATA:');
    console.log('- Total answers:', answers.length);
    console.log('- Correct answers:', quizAttempt.correctAnswers);
    console.log('- Score:', score);
    console.log('- Is passed:', isPassed);
    console.log('- Time spent:', timeSpent);
    console.log('- Answer details:', answers.map(a => ({ 
      questionId: a.questionId, 
      selected: a.selectedAnswer, 
      correct: a.correctAnswer, 
      isCorrect: a.isCorrect 
    })));

    await quizAttempt.save();

    console.log('✅ Quiz attempt saved successfully');

    // Update course progress
    try {
      console.log('🔄 Updating course progress...');
      const progress = await CourseProgress.getOrCreateProgress(studentId, quizAttempt.courseId);
      console.log('- Progress found/created:', progress._id);
      console.log('- Module index:', quizAttempt.moduleIndex);
      console.log('- Score:', score);
      console.log('- Is passed:', isPassed);
      
      const updateResult = progress.updateQuizAttempt(quizAttempt.moduleIndex, quizAttempt._id, score, isPassed);
      console.log('- Update result:', updateResult);
      
      await progress.save();
      console.log('✅ Course progress updated successfully');
    } catch (progressError) {
      console.error('❌ Error updating course progress:', progressError);
      // Don't fail the quiz submission if progress update fails
    }

    res.json({
      success: true,
      message: 'Quiz submitted successfully',
      result: {
        score,
        isPassed,
        correctAnswers: quizAttempt.correctAnswers,
        totalQuestions: quizAttempt.totalQuestions,
        timeSpent
      }
    });

  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit quiz attempt'
    });
  }
};

// Get user's quiz attempts for a course
export const getUserQuizAttempts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.studentId;

    console.log('🔍 GETTING QUIZ ATTEMPTS:');
    console.log('- CourseId:', courseId);
    console.log('- StudentId:', studentId);

    const attempts = await QuizAttempt.find({
      studentId,
      courseId
    }).sort({ createdAt: -1 });

    console.log('- Found attempts:', attempts.length);
    attempts.forEach((attempt, index) => {
      console.log(`  Attempt ${index + 1}:`, {
        id: attempt._id,
        moduleIndex: attempt.moduleIndex,
        status: attempt.status,
        score: attempt.score,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions
      });
    });

    res.json({
      success: true,
      attempts
    });

  } catch (error) {
    console.error('Error getting user quiz attempts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz attempts'
    });
  }
};

// Get quiz results
export const getQuizResults = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const studentId = req.studentId;

    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found'
      });
    }

    if (attempt.studentId.toString() !== studentId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to quiz results'
      });
    }

    res.json({
      success: true,
      attempt
    });

  } catch (error) {
    console.error('Error getting quiz results:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get quiz results'
    });
  }
};

