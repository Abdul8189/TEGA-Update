// Shared utility for calculating profile completion progress
export const calculateProfileProgress = (userData) => {
  if (!userData) return 0;

  // Define the fields that contribute to profile completion
  const requiredFields = [
    'firstName', 'lastName', 'certificateName', 'contactNumber', 
    'personalEmail', 'fatherName', 'motherName', 'addressLine1', 
    'city', 'state', 'zipCode', 'skills', 'certifications', 
    'jobType', 'preferredLocation', 'email', 'phone', 'institute',
    'course', 'major', 'yearOfStudy', 'studentId', 'dob', 'gender',
    'title', 'summary', 'linkedin', 'website', 'github'
  ];
  
  let completedCount = 0;
  
  // Check required fields
  requiredFields.forEach(field => {
    if (userData[field] && String(userData[field]).trim() !== '') {
      completedCount++;
    }
  });
  
  // Check array fields
  const arrayFields = ['projects', 'achievements', 'education', 'experience', 'languages', 'hobbies', 'volunteerExperience', 'extracurricularActivities'];
  arrayFields.forEach(field => {
    if (userData[field] && userData[field].length > 0) {
      completedCount++;
    }
  });

  const totalFields = requiredFields.length + arrayFields.length;
  if (totalFields === 0) return 0;
  
  const percentage = Math.round((completedCount / totalFields) * 100);
  return Math.min(percentage, 100); // Ensure it doesn't exceed 100%
};

// Get progress status text based on percentage
export const getProgressStatus = (percentage) => {
  if (percentage >= 100) return 'Profile Complete!';
  if (percentage >= 80) return 'Excellent!';
  if (percentage >= 60) return 'Good Progress';
  if (percentage >= 40) return 'Keep Going';
  if (percentage >= 20) return 'Getting Started';
  return 'Just Started';
};

// Get progress color based on percentage
export const getProgressColor = (percentage) => {
  if (percentage >= 100) return '#10b981'; // Green
  if (percentage >= 80) return '#10b981'; // Green
  if (percentage >= 60) return '#3b82f6'; // Blue
  if (percentage >= 40) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};
