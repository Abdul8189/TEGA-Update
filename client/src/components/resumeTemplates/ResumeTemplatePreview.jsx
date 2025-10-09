import React from 'react';
import templateConfig from './templateConfig';

const ResumeTemplatePreview = ({ selectedTemplate, resumeData }) => {
  if (!selectedTemplate || !templateConfig[selectedTemplate]) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
        <p className="text-gray-500">Please select a template to preview</p>
      </div>
    );
  }

  const TemplateComponent = templateConfig[selectedTemplate].component;

  return (
    <div className="resume-preview-container overflow-auto max-h-screen bg-gray-100 p-4 rounded-lg">
      <div className="transform scale-75 origin-top">
        <TemplateComponent resumeData={resumeData} />
      </div>
    </div>
  );
};

export default ResumeTemplatePreview;