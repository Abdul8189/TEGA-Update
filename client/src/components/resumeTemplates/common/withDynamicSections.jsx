import React from 'react';

const withDynamicSections = (WrappedComponent, sectionConfig) => {
  return (props) => {
    const { formData } = props;
    const { sectionRenderers, mainContentSections = [], sidebarSections = [] } = sectionConfig;

    const defaultFormData = {
      personalInfo: {},
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      achievements: [],
      extracurricularActivities: [],
      languages: [],
      volunteerExperience: [],
      hobbies: []
    };

    const renderers = sectionRenderers(formData || defaultFormData);

    const renderSection = (sectionKey) => {
      const renderer = renderers[sectionKey];
      return renderer ? <div key={sectionKey}>{renderer()}</div> : null;
    };

    const renderMainContent = (sectionKey) => {
      if (mainContentSections.includes(sectionKey)) {
        return renderSection(sectionKey);
      }
      return null;
    };

    const renderSidebar = (sectionKey) => {
      if (sidebarSections.includes(sectionKey)) {
        return renderSection(sectionKey);
      }
      return null;
    };

    return (
      <WrappedComponent
        {...props}
        renderMainContent={renderMainContent}
        renderSidebar={renderSidebar}
      />
    );
  };
};

export default withDynamicSections;
