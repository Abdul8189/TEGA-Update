import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Section from '../models/Section.js';
import Lecture from '../models/Lecture.js';
import StudentProgress from '../models/StudentProgress.js';

// Enroll student in course
export const enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.studentId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Student authentication required'
      });
    }

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      studentId,
      courseId
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = new Enrollment({
      studentId,
      courseId,
      isPaid: course.isFree || course.price === 0
    });

    await enrollment.save();

    // Initialize progress for all lectures in the course
    const sections = await Section.find({ courseId });
    const lectures = await Lecture.find({
      sectionId: { $in: sections.map(s => s._id) }
    });

    for (const lecture of lectures) {
      const progress = new StudentProgress({
        studentId,
        courseId,
        sectionId: lecture.sectionId,
        lectureId: lecture._id
      });
      await progress.save();
    }

    res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      enrollment
    });

  } catch (error) {
    console.error('Enroll in course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check enrollment status
export const checkEnrollment = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.studentId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Student authentication required'
      });
    }

    const enrollment = await Enrollment.findOne({
      studentId,
      courseId
    });

    res.json({
      success: true,
      enrolled: !!enrollment,
      enrollment: enrollment || null
    });

  } catch (error) {
    console.error('Check enrollment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check enrollment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get student's enrollments
export const getStudentEnrollments = async (req, res) => {
  try {
    const studentId = req.studentId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Student authentication required'
      });
    }

    const enrollments = await Enrollment.getStudentEnrollments(studentId);

    res.json({
      success: true,
      enrollments
    });

  } catch (error) {
    console.error('Get student enrollments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get enrollments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Check lecture access
export const checkLectureAccess = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const studentId = req.studentId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Student authentication required'
      });
    }

    // Get course and lecture
    const course = await Course.findById(courseId);
    const lecture = await Lecture.findById(lectureId);

    if (!course || !lecture) {
      return res.status(404).json({
        success: false,
        message: 'Course or lecture not found'
      });
    }

    // Check if it's the first lecture (always free)
    const sections = await Section.find({ courseId }).sort({ order: 1 });
    const firstSection = sections[0];
    const firstLecture = firstSection ? await Lecture.findOne({ sectionId: firstSection._id }).sort({ order: 1 }) : null;
    const isFirstLecture = firstLecture && firstLecture._id.toString() === lectureId;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId
    });

    let hasAccess = false;
    let reason = '';

    if (isFirstLecture) {
      hasAccess = true;
      reason = 'First lecture is free';
    } else if (course.isFree || course.price === 0) {
      hasAccess = true;
      reason = 'Course is free';
    } else if (enrollment && enrollment.status === 'active') {
      hasAccess = true;
      reason = 'Enrolled in course';
    } else {
      hasAccess = false;
      reason = 'Enrollment required';
    }

    res.json({
      success: true,
      hasAccess,
      reason,
      isFirstLecture,
      course: {
        title: course.title,
        price: course.price,
        isFree: course.isFree
      },
      enrollment: enrollment || null
    });

  } catch (error) {
    console.error('Check lecture access error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check lecture access',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Unenroll from course
export const unenrollFromCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.studentId;

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Student authentication required'
      });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { studentId, courseId },
      { status: 'cancelled' },
      { new: true }
    );

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      });
    }

    res.json({
      success: true,
      message: 'Successfully unenrolled from course'
    });

  } catch (error) {
    console.error('Unenroll from course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unenroll from course',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
