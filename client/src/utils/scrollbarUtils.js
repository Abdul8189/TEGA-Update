// Utility to force hide all scrollbars
export const hideAllScrollbars = () => {
  // Add CSS to document head to force hide scrollbars
  const style = document.createElement('style');
  style.textContent = `
    /* Force hide all scrollbars */
    * {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
    }
    
    *::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
    
    html, body, #root {
      -ms-overflow-style: none !important;
      scrollbar-width: none !important;
      overflow-x: hidden !important;
    }
    
    html::-webkit-scrollbar,
    body::-webkit-scrollbar,
    #root::-webkit-scrollbar {
      display: none !important;
      width: 0 !important;
      height: 0 !important;
    }
  `;
  
  // Remove any existing scrollbar hiding styles
  const existingStyle = document.getElementById('scrollbar-hide-style');
  if (existingStyle) {
    existingStyle.remove();
  }
  
  style.id = 'scrollbar-hide-style';
  document.head.appendChild(style);
  
  // Also try to hide scrollbars on all elements
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    element.style.setProperty('-ms-overflow-style', 'none', 'important');
    element.style.setProperty('scrollbar-width', 'none', 'important');
  });
};

// Call this function to ensure scrollbars are hidden
export const ensureScrollbarsHidden = () => {
  // Call immediately
  hideAllScrollbars();
  
  // Call again after a short delay to catch any dynamically added elements
  setTimeout(hideAllScrollbars, 100);
  setTimeout(hideAllScrollbars, 500);
  setTimeout(hideAllScrollbars, 1000);
  
  // Also call when DOM changes
  const observer = new MutationObserver(() => {
    hideAllScrollbars();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};
