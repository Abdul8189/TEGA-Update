import React from 'react';

const ATSModernTemplate = ({ formData }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Sarah Johnson',
      title: 'Marketing Manager',
      email: 'sarah.johnson@email.com',
      phone: '(555) 987-6543',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/sarahjohnson',
      summary: 'Results-driven marketing professional with 7+ years of experience in digital marketing, brand management, and team leadership. Proven track record of increasing brand awareness and driving revenue growth.'
    },
    experience: [
      {
        position: 'Marketing Manager',
        company: 'Digital Solutions Inc.',
        startDate: '2019-03-01',
        endDate: '',
        current: true,
        description: 'Developed and executed comprehensive marketing strategies resulting in 35% increase in lead generation. Managed a team of 5 marketing specialists and oversaw $2M annual marketing budget.'
      }
    ],
    education: [
      {
        degree: 'Master of Business Administration',
        field: 'Marketing',
        institution: 'Columbia Business School',
        startDate: '2017-09-01',
        endDate: '2019-05-01',
        current: false
      }
    ],
    skills: [
      { name: 'Digital Marketing' },
      { name: 'SEO/SEM' },
      { name: 'Google Analytics' },
      { name: 'Social Media Marketing' }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black font-sans">
      {/* Header - Two Column Layout */}
      <header className="mb-8 border-b-2 border-blue-500 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
            <p className="text-xl text-blue-600 font-semibold mb-4">{data.personalInfo.title}</p>
          </div>
          <div className="text-right text-sm text-gray-600">
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
            <p>{data.personalInfo.location}</p>
            {data.personalInfo.linkedin && <p>{data.personalInfo.linkedin}</p>}
          </div>
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 uppercase tracking-wide">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Work Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.position}</h3>
                  <p className="text-gray-700 font-medium">{job.company}</p>
                </div>
                <p className="text-gray-600 text-sm">
                  {job.startDate ? new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
              {job.description && (
                <div className="text-gray-700">
                  {job.description.split('\n').map((line, i) => (
                    <p key={i} className="mb-1">{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                </div>
                <p className="text-gray-600 text-sm">
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Core Competencies</h2>
          <div className="text-gray-700">
            {data.skills.map((skill, index) => (
              <span key={index} className="inline-block mr-4 mb-2">
                {skill.name || skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Key Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
              {project.description && <p className="text-gray-700 mb-2">{project.description}</p>}
              {project.technologies && <p className="text-gray-600 text-sm">Technologies: {project.technologies}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <span className="font-semibold text-gray-900">{cert.name}</span>
              {cert.issuer && <span className="text-gray-700"> - {cert.issuer}</span>}
              {cert.date && <span className="text-gray-600 text-sm"> ({cert.date})</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ATSModernTemplate;
