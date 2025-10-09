// refreshHandler.js
// Utility to handle page refreshes and redirect to splash screen

/**
 * This function checks if the page was refreshed and redirects to the splash screen
 * It uses sessionStorage to track page loads
 */
export const handlePageRefresh = () => {
  // Check if this is a page refresh by looking at the performance navigation type
  // or by using a session storage flag
  const isPageRefresh = (
    window.performance && 
    window.performance.navigation && 
    window.performance.navigation.type === 1
  ) || !sessionStorage.getItem('pageLoaded');
  
  // Set the flag indicating the page has been loaded
  sessionStorage.setItem('pageLoaded', 'true');
  
  // If this is a page refresh, redirect to the splash screen
  if (isPageRefresh) {
    // Clear the flag so the splash screen will show again
    sessionStorage.removeItem('pageLoaded');
    
    // Redirect to splash screen
    window.location.href = '/splash';
    return true;
  }
  
  return false;
};

/**
 * This function should be called when the splash screen is shown
 * to prevent infinite redirects
 */
export const markSplashScreenShown = () => {
  sessionStorage.setItem('splashShown', 'true');
};

/**
 * Check if the splash screen has already been shown in this session
 */
export const hasSplashBeenShown = () => {
  return sessionStorage.getItem('splashShown') === 'true';
};