import React from 'react';
import templateConfig from './templateConfig';

const TemplateRegistry = ({ templateId, formData, sectionOrder, selectedFont }) => {
  const TemplateComponent = templateConfig[templateId]?.component;

  if (!TemplateComponent) {
    // Return a default template or a message if the template is not found
    return <div>Template not found for ID: {templateId}</div>;
  }

  return <TemplateComponent formData={formData} sectionOrder={sectionOrder} selectedFont={selectedFont} />;
};

export default TemplateRegistry;
