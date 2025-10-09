/**
 * Safely renders text content that might be a string or object
 * @param {any} content - The content to render
 * @returns {string} - Safe string representation
 */
export const safeRenderText = (content) => {
  if (content === null || content === undefined) {
    return '';
  }
  
  if (typeof content === 'string') {
    return content;
  }
  
  if (typeof content === 'number') {
    return content.toString();
  }
  
  if (Array.isArray(content)) {
    return content.join(', ');
  }
  
  if (typeof content === 'object') {
    return JSON.stringify(content);
  }
  
  return String(content);
};

/**
 * Safely renders description content with line breaks
 * @param {any} description - The description to render
 * @returns {JSX.Element[]} - Array of paragraph elements
 */
export const safeRenderDescription = (description) => {
  const text = safeRenderText(description);
  
  if (!text) {
    return null;
  }
  
  return text.split('\n').map((line, i) => (
    <p key={i} className="mb-1">{line}</p>
  ));
};
