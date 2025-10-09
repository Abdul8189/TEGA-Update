// Utility functions for scroll behavior

/**
 * Smoothly scroll to top of page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

/**
 * Scroll to top instantly (no animation)
 */
export const scrollToTopInstant = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};

/**
 * Scroll to a specific element by ID
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      left: 0,
      behavior: 'smooth'
    });
  }
};

/**
 * Scroll to a specific element by selector
 */
export const scrollToSelector = (selector, offset = 0) => {
  const element = document.querySelector(selector);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      left: 0,
      behavior: 'smooth'
    });
  }
};
