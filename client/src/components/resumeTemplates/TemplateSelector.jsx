import React, { useState, useRef, useEffect } from 'react';
import templateConfig from './templateConfig';
import * as templates from './templates';

// Import the actual template preview SVGs
import { templatePreviews } from './previewImages/templatePreviews';

const TemplateSelector = ({ selectedTemplate, formData, onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [colorFilter, setColorFilter] = useState('All');
  const scrollContainerRef = useRef(null);

  // Categories for filtering
  const categories = [
    'All',
    'Professional',
    'Creative',
    'Simple',
    'Academic',
    'Technical'
  ];

  // Color options based on actual template colors
  const colors = [
    { name: 'All', value: 'All', class: 'bg-gray-200' },
    { name: 'Dark Blue', value: 'Dark Blue', class: 'bg-blue-800' },
    { name: 'Blue', value: 'Blue', class: 'bg-blue-600' },
    { name: 'Navy Blue', value: 'Navy Blue', class: 'bg-blue-900' },
    { name: 'Red', value: 'Red', class: 'bg-red-600' },
    { name: 'Purple', value: 'Purple', class: 'bg-purple-600' },
    { name: 'Dark Gray', value: 'Dark Gray', class: 'bg-gray-700' },
    { name: 'Gray', value: 'Gray', class: 'bg-gray-500' },
    { name: 'Black', value: 'Black', class: 'bg-black' }
  ];

  // Get all 22 templates - no filtering, show all templates
  const allTemplates = Object.keys(templateConfig);
  
  // Filter templates based on search term, category, and color
  const filteredTemplates = allTemplates.filter(templateId => {
    const template = templateConfig[templateId];
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || 
      (categoryFilter === 'Professional' && ['professional', 'corporate', 'executive', 'traditional', 'professional2', 'classic'].includes(templateId)) ||
      (categoryFilter === 'Creative' && ['creative', 'modern', 'infographic', 'bold', 'elegant', 'contemporary'].includes(templateId)) ||
      (categoryFilter === 'Simple' && ['minimal', 'simple', 'clean', 'minimalist'].includes(templateId)) ||
      (categoryFilter === 'Academic' && ['academic', 'chronological', 'functional'].includes(templateId)) ||
      (categoryFilter === 'Technical' && ['technical', 'compact', 'hybrid'].includes(templateId));
    const matchesColor = colorFilter === 'All' || template.colorName === colorFilter;
    
    return matchesSearch && matchesCategory && matchesColor;
  });

  // Check if student has entered any data
  const hasStudentData = () => {
    if (!formData) return false;
    const hasPersonalInfo = Object.values(formData.personalInfo || {}).some(value => value && value.trim() !== '');
    const hasExperience = (formData.experience || []).length > 0;
    const hasEducation = (formData.education || []).length > 0;
    const hasSkills = (formData.skills || []).length > 0;
    const hasProjects = (formData.projects || []).length > 0;
    const hasCertifications = (formData.certifications || []).length > 0;
    const hasAchievements = (formData.achievements || []).length > 0;
    const hasExtracurricular = (formData.extracurricularActivities || []).length > 0;
    const hasLanguages = (formData.languages || []).length > 0;
    const hasVolunteer = (formData.volunteerExperience || []).length > 0;
    const hasHobbies = (formData.hobbies || []).length > 0;
    
    return hasPersonalInfo || hasExperience || hasEducation || hasSkills || hasProjects || 
           hasCertifications || hasAchievements || hasExtracurricular || hasLanguages || 
           hasVolunteer || hasHobbies;
  };

  // Function to generate dynamic preview using student's actual data
  const generateDynamicPreview = (templateId) => {
    // Simplified data for preview - only essential information to show template structure
    const data = {
      personalInfo: {
        fullName: 'John Smith',
        email: 'john.smith@email.com',
        phone: '(555) 123-4567',
        location: 'New York, NY',
        linkedin: 'linkedin.com/in/johnsmith',
        summary: 'Experienced professional with expertise in modern technologies and proven track record of delivering high-quality solutions.',
        title: 'Senior Professional'
      },
      experience: [
        {
          position: 'Senior Developer',
          company: 'Tech Solutions Inc.',
          startDate: '2020-01-01',
          endDate: '',
          current: true,
          description: 'Led development of scalable applications serving 100K+ users\nMentored junior developers and improved team efficiency\nImplemented best practices and code review processes'
        },
        {
          position: 'Full Stack Developer',
          company: 'Digital Innovations',
          startDate: '2018-06-01',
          endDate: '2019-12-31',
          current: false,
          description: 'Developed web applications using modern JavaScript frameworks\nCollaborated with design team to implement responsive UI\nOptimized database queries improving performance by 30%'
        }
      ],
      education: [
        {
          degree: 'Bachelor of Science',
          field: 'Computer Science',
          institution: 'University of Technology',
          startDate: '2016-09-01',
          endDate: '2020-05-01',
          current: false,
          gpa: '3.7'
        }
      ],
      skills: [
        { id: '1', name: 'JavaScript' },
        { id: '2', name: 'React' },
        { id: '3', name: 'Node.js' },
        { id: '4', name: 'Python' },
        { id: '5', name: 'AWS' },
        { id: '6', name: 'Docker' },
        { id: '7', name: 'TypeScript' },
        { id: '8', name: 'MongoDB' },
        { id: '9', name: 'Git' },
        { id: '10', name: 'Agile' }
      ],
      projects: [
        {
          name: 'E-Commerce Platform',
          description: 'Built a modern web application with responsive design and real-time features',
          technologies: 'React, Node.js, MongoDB',
          link: 'https://github.com/johnsmith/ecommerce'
        },
        {
          name: 'Mobile App',
          description: 'Developed cross-platform mobile application with offline capabilities',
          technologies: 'React Native, Firebase, Redux',
          link: 'https://github.com/johnsmith/mobileapp'
        }
      ],
      certifications: [
        {
          name: 'AWS Certified Developer',
          issuer: 'Amazon Web Services',
          date: '2023-01-15'
        },
        {
          name: 'Google Cloud Professional',
          issuer: 'Google Cloud',
          date: '2022-08-20'
        }
      ],
      achievements: [
        {
          description: 'Improved application performance by 40% through optimization'
        },
        {
          description: 'Led team of 5 developers in successful project delivery'
        }
      ],
      extracurricularActivities: [
        {
          title: 'Tech Club President',
          organization: 'University Tech Society',
          startDate: '2019-01-01',
          endDate: '2020-05-01',
          current: false,
          description: 'Organized monthly tech talks and coding workshops for 200+ students'
        }
      ],
      languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Conversational' },
        { name: 'French', proficiency: 'Basic' }
      ],
      volunteerExperience: [
        {
          role: 'Coding Mentor',
          organization: 'Code for Good',
          startDate: '2021-06-01',
          endDate: '',
          current: true,
          description: 'Teaching programming fundamentals to underprivileged youth'
        }
      ],
      hobbies: ['Photography', 'Reading', 'Traveling', 'Chess']
    };

    // Get the actual template component
    const TemplateComponent = templateConfig[templateId]?.component;
    
    if (!TemplateComponent) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-white">
          <div className="text-center text-gray-500">
            <div className="text-sm">Template Preview</div>
            <div className="text-xs mt-1">{templateId}</div>
          </div>
        </div>
      );
    }

    // Render the actual template component with simplified data
    return (
      <div className="w-full h-full bg-white overflow-hidden" style={{ transform: 'scale(0.6)', transformOrigin: 'top left', width: '167%', height: '167%' }}>
        <TemplateComponent formData={data} />
      </div>
    );
  };

  return (
    <div className="bg-gray-50 h-full flex flex-col">
      {/* Professional Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Templates</h1>
              <p className="text-gray-600 mt-1">Choose a professional template for your resume</p>
            </div>
            {selectedTemplate && (
              <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-700">
                  Selected: {templateConfig[selectedTemplate]?.name || selectedTemplate}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allTemplates.map((templateId) => {
              const template = templateConfig[templateId];
              const isSelected = selectedTemplate === templateId;
              
              return (
                <div
                  key={templateId}
                  className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${
                    isSelected 
                      ? 'border-blue-500 shadow-lg ring-2 ring-blue-200' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => onSelectTemplate(templateId)}
                >
                  {/* Template Preview */}
                  <div className="relative">
                    <div 
                      className="w-full h-64 bg-white rounded-t-lg overflow-hidden border border-gray-200"
                    >
                      {/* Actual Template Preview */}
                      <div className="w-full h-full transform scale-75 origin-top-left" style={{ width: '133%', height: '133%' }}>
                        {generateDynamicPreview(templateId)}
                      </div>
                      
                      {/* Overlay for better visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                    
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-3 right-3 bg-blue-500 text-white p-1.5 rounded-full shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                    
                    {/* Template Features */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full border border-gray-300"
                          style={{ backgroundColor: template.primaryColor }}
                        ></div>
                        <span className="text-xs text-gray-500">{template.colorName}</span>
                      </div>
                      
                      {hasStudentData() && (
                        <div className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">
                          Your Data
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
