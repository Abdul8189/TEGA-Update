import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  // Safely get location, but don't use it directly in the effect
  // This is just to trigger the effect when the path changes
  const location = useLocation();

  useEffect(() => {
    // Force scroll to top on route change
    const scrollToTop = () => {
      // Multiple methods to ensure compatibility
      if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      
      // Smooth scroll to top
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      
      // Fallback for older browsers
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(scrollToTop, 100);
    
    return () => clearTimeout(timer);
  }, [location]); // Use location in the dependency array to trigger on route change

  return null;
};

export default ScrollToTop;
