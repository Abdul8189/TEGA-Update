import CourseProgress from '../models/CourseProgress.js';
import Course from '../models/Course.js';

// Get or create course progress for student
export const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.studentId;

    const progress = await CourseProgress.getOrCreateProgress(studentId, courseId);
    
    res.json({
      success: true,
      progress
    });

  } catch (error) {
    console.error('Error getting course progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course progress'
    });
  }
};

// Mark video as watched
export const markVideoWatched = async (req, res) => {
  try {
    const { courseId, moduleIndex, videoId } = req.params;
    const { videoTitle, watchTime } = req.body;
    const studentId = req.studentId;

    const progress = await CourseProgress.getOrCreateProgress(studentId, courseId);
    const updated = progress.markVideoWatched(parseInt(moduleIndex), videoId, videoTitle, watchTime);

    if (updated) {
      await progress.save();
      res.json({
        success: true,
        message: 'Video marked as watched',
        progress: progress.overallProgress,
        moduleCompleted: progress.modules.find(m => m.moduleIndex === parseInt(moduleIndex))?.isCompleted || false
      });
    } else {
      res.json({
        success: true,
        message: 'Video already watched',
        progress: progress.overallProgress
      });
    }

  } catch (error) {
    console.error('Error marking video as watched:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark video as watched'
    });
  }
};

// Mark material as downloaded
export const markMaterialDownloaded = async (req, res) => {
  try {
    const { courseId, moduleIndex, materialId } = req.params;
    const { materialTitle } = req.body;
    const studentId = req.studentId;

    const progress = await CourseProgress.getOrCreateProgress(studentId, courseId);
    const updated = progress.markMaterialDownloaded(parseInt(moduleIndex), materialId, materialTitle);

    if (updated) {
      await progress.save();
      res.json({
        success: true,
        message: 'Material download recorded'
      });
    } else {
      res.json({
        success: true,
        message: 'Material download already recorded'
      });
    }

  } catch (error) {
    console.error('Error marking material as downloaded:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record material download'
    });
  }
};

// Update quiz attempt in progress
export const updateQuizProgress = async (req, res) => {
  try {
    const { courseId, moduleIndex } = req.params;
    const { attemptId, score, isPassed } = req.body;
    const studentId = req.studentId;

    const progress = await CourseProgress.getOrCreateProgress(studentId, courseId);
    const updated = progress.updateQuizAttempt(parseInt(moduleIndex), attemptId, score, isPassed);

    if (updated) {
      await progress.save();
      res.json({
        success: true,
        message: 'Quiz progress updated',
        progress: progress.overallProgress,
        moduleCompleted: progress.modules.find(m => m.moduleIndex === parseInt(moduleIndex))?.isCompleted || false
      });
    } else {
      res.json({
        success: true,
        message: 'Quiz progress already recorded'
      });
    }

  } catch (error) {
    console.error('Error updating quiz progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update quiz progress'
    });
  }
};

// Get student's overall progress across all courses
export const getStudentOverallProgress = async (req, res) => {
  try {
    const studentId = req.studentId;

    const progressList = await CourseProgress.getStudentProgress(studentId);
    
    const overallStats = {
      totalCourses: progressList.length,
      completedCourses: progressList.filter(p => p.overallProgress === 100).length,
      averageProgress: progressList.length > 0 
        ? Math.round(progressList.reduce((sum, p) => sum + p.overallProgress, 0) / progressList.length)
        : 0,
      totalModules: progressList.reduce((sum, p) => sum + p.totalModules, 0),
      completedModules: progressList.reduce((sum, p) => sum + p.completedModules, 0)
    };

    res.json({
      success: true,
      progressList,
      overallStats
    });

  } catch (error) {
    console.error('Error getting student overall progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get overall progress'
    });
  }
};

// Update last accessed time
export const updateLastAccessed = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.studentId;

    const progress = await CourseProgress.getOrCreateProgress(studentId, courseId);
    progress.lastAccessedAt = new Date();
    await progress.save();

    res.json({
      success: true,
      message: 'Last accessed time updated'
    });

  } catch (error) {
    console.error('Error updating last accessed time:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update last accessed time'
    });
  }
};
