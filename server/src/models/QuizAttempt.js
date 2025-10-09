import mongoose from 'mongoose';

const quizAttemptSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  moduleIndex: {
    type: Number,
    required: true
  },
  moduleTitle: {
    type: String,
    required: true
  },
  quizId: {
    type: String,
    required: true
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'abandoned'],
    default: 'in_progress'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  answeredQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  score: {
    type: Number, // percentage
    default: 0
  },
  passingScore: {
    type: Number,
    required: true
  },
  isPassed: {
    type: Boolean,
    default: false
  },
  answers: [{
    questionId: {
      type: String,
      required: true
    },
    questionText: {
      type: String,
      required: true
    },
    selectedAnswer: {
      type: String
    },
    correctAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    timeSpent: {
      type: Number, // in seconds
      default: 0
    }
  }],
  // Track which questions were visited
  visitedQuestions: [{
    questionId: String,
    visitedAt: Date
  }],
  // Track current question position
  currentQuestionIndex: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
quizAttemptSchema.index({ studentId: 1, courseId: 1, moduleIndex: 1 });
quizAttemptSchema.index({ studentId: 1, courseId: 1, status: 1 });

// Method to calculate score
quizAttemptSchema.methods.calculateScore = function() {
  if (this.totalQuestions === 0) return 0;
  this.score = Math.round((this.correctAnswers / this.totalQuestions) * 100);
  this.isPassed = this.score >= this.passingScore;
  return this.score;
};

// Method to update time spent
quizAttemptSchema.methods.updateTimeSpent = function() {
  if (this.endTime) {
    const timeDiff = this.endTime.getTime() - this.startTime.getTime();
    this.timeSpent = Math.round(timeDiff / (1000 * 60)); // Convert to minutes
  }
};

// Method to check if attempt is expired
quizAttemptSchema.methods.isExpired = function(timeLimit) {
  if (!timeLimit) return false;
  const currentTime = new Date();
  const timeDiff = currentTime.getTime() - this.startTime.getTime();
  const timeSpentMinutes = timeDiff / (1000 * 60);
  return timeSpentMinutes > timeLimit;
};

// Static method to get user's quiz attempts for a course
quizAttemptSchema.statics.getUserQuizAttempts = function(studentId, courseId) {
  return this.find({ studentId, courseId }).sort({ createdAt: -1 });
};

// Static method to get user's completed quizzes for a course
quizAttemptSchema.statics.getUserCompletedQuizzes = function(studentId, courseId) {
  return this.find({ 
    studentId, 
    courseId, 
    status: 'completed' 
  }).sort({ createdAt: -1 });
};

// Static method to check if user can attempt quiz
quizAttemptSchema.statics.canAttemptQuiz = async function(studentId, courseId, moduleIndex, maxAttempts = 1) {
  const attempts = await this.find({ 
    studentId, 
    courseId, 
    moduleIndex 
  });
  
  const completedAttempts = attempts.filter(attempt => attempt.status === 'completed');
  return completedAttempts.length < maxAttempts;
};

export default mongoose.model('QuizAttempt', quizAttemptSchema);

