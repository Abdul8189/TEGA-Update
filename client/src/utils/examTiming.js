// Exam timing utility functions

/**
 * Calculate exam timing status based on registration and exam details
 * @param {Object} exam - Exam object with slots and timing info
 * @param {Object} registration - Registration object with timing info
 * @returns {Object} Timing status and messages
 */
export const calculateExamTiming = (exam, registration) => {
  const now = new Date();
  const registrationTime = new Date(registration.registrationDate);
  const examDate = new Date(exam.examDate);
  
  // Find the registered slot
  const registeredSlot = exam.slots.find(slot => slot.slotId === registration.slotId);
  if (!registeredSlot) {
    return {
      status: 'error',
      message: 'Registered slot not found',
      canStart: false
    };
  }

  // Calculate slot start and end times
  const examDateStr = examDate.toISOString().split('T')[0]; // YYYY-MM-DD
  const slotStartTime = new Date(`${examDateStr}T${registeredSlot.startTime}:00`);
  const slotEndTime = new Date(`${examDateStr}T${registeredSlot.endTime}:00`);
  
  // Calculate time differences
  const timeUntilExam = slotStartTime.getTime() - now.getTime();
  const timeSinceRegistration = now.getTime() - registrationTime.getTime();
  const hoursUntilExam = timeUntilExam / (1000 * 60 * 60);
  const hoursSinceRegistration = timeSinceRegistration / (1000 * 60 * 60);
  
  // Calculate exam access window (10 minutes before slot start)
  const examAccessStart = new Date(slotStartTime.getTime() - (10 * 60 * 1000)); // 10 minutes before
  const examAccessEnd = slotEndTime;
  
  // Determine timing status
  let status, message, canStart, showPopup, popupType, timeRemaining;
  
  if (now < examAccessStart) {
    // Before exam access window
    if (hoursSinceRegistration < 12) {
      // Registered less than 12 hours ago
      status = 'registered_recent';
      message = `You have registered! You can write the exam within the time range.`;
      canStart = false;
      showPopup = true;
      popupType = 'recent_registration';
      timeRemaining = Math.ceil(hoursUntilExam);
    } else {
      // Registered more than 12 hours ago
      status = 'ready_for_exam';
      message = `Get ready for exam on ${formatExamDateTime(examDate, registeredSlot.startTime)}`;
      canStart = false;
      showPopup = true;
      popupType = 'exam_reminder';
      timeRemaining = Math.ceil(hoursUntilExam);
    }
  } else if (now >= examAccessStart && now <= examAccessEnd) {
    // Within exam access window
    status = 'can_start';
    message = `Exam is now available! You can start your exam.`;
    canStart = true;
    showPopup = false;
    popupType = null;
    timeRemaining = Math.ceil((examAccessEnd.getTime() - now.getTime()) / (1000 * 60 * 60));
  } else {
    // After exam window
    status = 'exam_ended';
    message = `Exam time has ended.`;
    canStart = false;
    showPopup = false;
    popupType = null;
    timeRemaining = 0;
  }
  
  return {
    status,
    message,
    canStart,
    showPopup,
    popupType,
    timeRemaining,
    slotStartTime,
    slotEndTime,
    examAccessStart,
    examAccessEnd,
    hoursUntilExam,
    hoursSinceRegistration,
    registeredSlot
  };
};

/**
 * Format exam date and time for display
 * @param {Date} examDate - Exam date
 * @param {string} startTime - Slot start time
 * @returns {string} Formatted date and time
 */
export const formatExamDateTime = (examDate, startTime) => {
  const date = new Date(examDate);
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const formattedDate = date.toLocaleDateString('en-US', options);
  return `${formattedDate} at ${startTime}`;
};

/**
 * Format time remaining for display
 * @param {number} hours - Hours remaining
 * @returns {string} Formatted time string
 */
export const formatTimeRemaining = (hours) => {
  if (hours < 1) {
    const minutes = Math.ceil(hours * 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (hours < 24) {
    return `${Math.ceil(hours)} hour${Math.ceil(hours) !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(hours / 24);
    const remainingHours = Math.ceil(hours % 24);
    if (remainingHours === 0) {
      return `${days} day${days !== 1 ? 's' : ''}`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''} and ${remainingHours} hour${remainingHours !== 1 ? 's' : ''}`;
    }
  }
};

/**
 * Get popup content based on timing status
 * @param {Object} timingInfo - Timing information from calculateExamTiming
 * @param {Object} exam - Exam object
 * @returns {Object} Popup content
 */
export const getPopupContent = (timingInfo, exam) => {
  const { popupType, timeRemaining, registeredSlot } = timingInfo;
  
  switch (popupType) {
    case 'recent_registration':
      return {
        title: '✅ You are already registered for this exam!',
        message: `You need to take the exam at the particular day and particular time.`,
        details: [
          `Exam Date: ${formatExamDateTime(exam.examDate, registeredSlot.startTime)}`,
          `Time Remaining: ${formatTimeRemaining(timeRemaining)}`,
          `You can start the exam 10 minutes before the scheduled time.`
        ],
        type: 'success',
        showCountdown: true
      };
      
    case 'exam_reminder':
      return {
        title: '🎯 Get Ready to Write Exam!',
        message: `Your exam is starting soon. Make sure you're prepared!`,
        details: [
          `Exam Date: ${formatExamDateTime(exam.examDate, registeredSlot.startTime)}`,
          `Time Remaining: ${formatTimeRemaining(timeRemaining)}`,
          `Make sure you have a stable internet connection and a quiet environment.`
        ],
        type: 'info',
        showCountdown: true
      };
      
    default:
      return null;
  }
};

/**
 * Check if user should be redirected to instructions
 * @param {Object} timingInfo - Timing information
 * @returns {boolean} Whether to redirect to instructions
 */
export const shouldRedirectToInstructions = (timingInfo) => {
  const now = new Date();
  const { examAccessStart, status } = timingInfo;
  
  // Redirect if we're within 10 minutes of exam start and exam is available
  return status === 'can_start' && now >= examAccessStart;
};

/**
 * Get countdown timer data
 * @param {Object} timingInfo - Timing information
 * @returns {Object} Countdown data
 */
export const getCountdownData = (timingInfo) => {
  const now = new Date();
  const { examAccessStart, slotEndTime, status } = timingInfo;
  
  let targetTime;
  let label;
  
  if (status === 'registered_recent' || status === 'ready_for_exam') {
    targetTime = examAccessStart;
    label = 'Exam starts in';
  } else if (status === 'can_start') {
    targetTime = slotEndTime;
    label = 'Exam ends in';
  } else {
    return null;
  }
  
  const timeDiff = targetTime.getTime() - now.getTime();
  
  if (timeDiff <= 0) {
    return null;
  }
  
  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
  
  return {
    label,
    days,
    hours,
    minutes,
    seconds,
    totalMs: timeDiff
  };
};
