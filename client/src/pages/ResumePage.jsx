import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock, CheckCircle } from 'lucide-react';
import { api } from '../utils/api';

const ResumePage = () => {
  const [templates, setTemplates] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [templatesRes, resumeRes] = await Promise.all([
          api('/api/resume/templates'),
          api('/api/resume'),
        ]);

        // The API returns templates directly, not wrapped in a success property
        setTemplates(templatesRes);

        // The API returns the resume data directly
        setResumeData(resumeRes);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('Failed to load page data.');
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSelectTemplate = (template) => {
    if (template.isLocked) {
      toast.info('You must be enrolled in a course to use this template.');
    } else {
      navigate('/resume-builder', { state: { templateId: template.id } });
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading templates...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">Choose Your Resume Template</h1>
      <p className="text-center text-gray-600 mb-8">Select a template to start building your professional resume.</p>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {templates.map((template) => (
          <div 
            key={template.id} 
            className={`relative border rounded-lg overflow-hidden shadow-lg group transition-transform transform hover:scale-105 ${template.isLocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={() => handleSelectTemplate(template)}
          >
            <img src={template.imageUrl} alt={template.name} className="w-full h-auto object-cover bg-gray-50 aspect-[1/1.414]" />
            {template.isLocked && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Lock className="text-white h-12 w-12" />
              </div>
            )}
            <div className="p-4 bg-white">
              <h3 className="font-semibold text-lg">{template.name}</h3>
              <button 
                className={`w-full mt-2 py-2 px-4 rounded-md text-white font-semibold ${template.isLocked ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={template.isLocked}
              >
                {template.isLocked ? 'Locked' : 'Use Template'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResumePage;