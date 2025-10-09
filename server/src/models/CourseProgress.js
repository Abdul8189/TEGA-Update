import mongoose from 'mongoose';

const courseProgressSchema = new mongoose.Schema({
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
  modules: [{
    moduleIndex: {
      type: Number,
      required: true
    },
    moduleTitle: {
      type: String,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    videosWatched: [{
      videoId: String,
      videoTitle: String,
      watchedAt: Date,
      watchTime: Number // in seconds
    }],
    materialsDownloaded: [{
      materialId: String,
      materialTitle: String,
      downloadedAt: Date
    }],
    quizAttempts: [{
      attemptId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'QuizAttempt'
      },
      score: Number,
      isPassed: Boolean,
      attemptedAt: Date
    }],
    completionCriteria: {
      videosRequired: {
        type: Number,
        default: 0
      },
      videosWatched: {
        type: Number,
        default: 0
      },
      quizRequired: {
        type: Boolean,
        default: false
      },
      quizPassed: {
        type: Boolean,
        default: false
      }
    }
  }],
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalModules: {
    type: Number,
    default: 0
  },
  completedModules: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better query performance
courseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
courseProgressSchema.index({ studentId: 1 });
courseProgressSchema.index({ courseId: 1 });

// Method to calculate overall progress
courseProgressSchema.methods.calculateProgress = function() {
  if (this.totalModules === 0) {
    this.overallProgress = 0;
    return 0;
  }
  
  this.overallProgress = Math.round((this.completedModules / this.totalModules) * 100);
  return this.overallProgress;
};

// Method to update module completion
courseProgressSchema.methods.updateModuleCompletion = function(moduleIndex) {
  const module = this.modules.find(m => m.moduleIndex === moduleIndex);
  if (!module) return false;

  // Check if module meets completion criteria
  const isVideosComplete = module.completionCriteria.videosWatched >= module.completionCriteria.videosRequired;
  const isQuizComplete = !module.completionCriteria.quizRequired || module.completionCriteria.quizPassed;

  if (isVideosComplete && isQuizComplete && !module.isCompleted) {
    module.isCompleted = true;
    module.completedAt = new Date();
    this.completedModules += 1;
    this.calculateProgress();
    return true;
  }

  return false;
};

// Method to mark video as watched
courseProgressSchema.methods.markVideoWatched = function(moduleIndex, videoId, videoTitle, watchTime = 0) {
  const module = this.modules.find(m => m.moduleIndex === moduleIndex);
  if (!module) return false;

  // Check if video already watched
  const existingVideo = module.videosWatched.find(v => v.videoId === videoId);
  if (!existingVideo) {
    module.videosWatched.push({
      videoId,
      videoTitle,
      watchedAt: new Date(),
      watchTime
    });
    module.completionCriteria.videosWatched += 1;
    this.updateModuleCompletion(moduleIndex);
    return true;
  }

  return false;
};

// Method to mark material as downloaded
courseProgressSchema.methods.markMaterialDownloaded = function(moduleIndex, materialId, materialTitle) {
  const module = this.modules.find(m => m.moduleIndex === moduleIndex);
  if (!module) return false;

  // Check if material already downloaded
  const existingMaterial = module.materialsDownloaded.find(m => m.materialId === materialId);
  if (!existingMaterial) {
    module.materialsDownloaded.push({
      materialId,
      materialTitle,
      downloadedAt: new Date()
    });
    return true;
  }

  return false;
};

// Method to update quiz attempt
courseProgressSchema.methods.updateQuizAttempt = function(moduleIndex, attemptId, score, isPassed) {
  const module = this.modules.find(m => m.moduleIndex === moduleIndex);
  if (!module) return false;

  module.quizAttempts.push({
    attemptId,
    score,
    isPassed,
    attemptedAt: new Date()
  });

  if (isPassed) {
    module.completionCriteria.quizPassed = true;
  }

  this.updateModuleCompletion(moduleIndex);
  return true;
};

// Static method to get or create progress for student and course
courseProgressSchema.statics.getOrCreateProgress = async function(studentId, courseId) {
  let progress = await this.findOne({ studentId, courseId });
  
  if (!progress) {
    // Get course details to initialize progress
    const Course = mongoose.model('Course');
    const course = await Course.findById(courseId);
    
    if (!course) {
      throw new Error('Course not found');
    }

    // Initialize modules array
    const modules = course.modules.map((module, index) => ({
      moduleIndex: index,
      moduleTitle: module.title,
      isCompleted: false,
      videosWatched: [],
      materialsDownloaded: [],
      quizAttempts: [],
      completionCriteria: {
        videosRequired: module.videos ? module.videos.length : 0,
        videosWatched: 0,
        quizRequired: module.quiz && module.quiz.isEnabled,
        quizPassed: false
      }
    }));

    progress = new this({
      studentId,
      courseId,
      modules,
      totalModules: course.modules.length,
      completedModules: 0,
      overallProgress: 0
    });

    await progress.save();
  }

  return progress;
};

// Static method to get student's progress for all courses
courseProgressSchema.statics.getStudentProgress = function(studentId) {
  return this.find({ studentId }).populate('courseId', 'courseName description thumbnail');
};

export default mongoose.model('CourseProgress', courseProgressSchema);
