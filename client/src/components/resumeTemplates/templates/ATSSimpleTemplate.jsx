import React from 'react';

const ATSSimpleTemplate = ({ formData }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Emily Davis',
      title: 'Project Manager',
      email: 'emily.davis@email.com',
      phone: '(555) 234-5678',
      location: 'Chicago, IL',
      linkedin: 'linkedin.com/in/emilydavis',
      summary: 'Detail-oriented project manager with 4+ years of experience leading cross-functional teams and delivering projects on time and within budget. Strong background in Agile methodologies and stakeholder management.'
    },
    experience: [
      {
        position: 'Project Manager',
        company: 'Global Solutions Inc.',
        startDate: '2021-01-01',
        endDate: '',
        current: true,
        description: 'Managed multiple projects simultaneously with budgets ranging from $50K to $500K. Led teams of 5-15 members and ensured 95% on-time delivery rate.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Business Administration',
        field: 'Project Management',
        institution: 'Northwestern University',
        startDate: '2016-09-01',
        endDate: '2020-05-01',
        current: false
      }
    ],
    skills: [
      { name: 'Project Management' },
      { name: 'Agile/Scrum' },
      { name: 'Microsoft Project' },
      { name: 'Risk Management' }
    ]
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white text-black font-sans">
      {/* Header - Simple Inline Style */}
      <header className="mb-6 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{data.personalInfo.fullName}</h1>
        <p className="text-gray-700 mb-3">{data.personalInfo.title}</p>
        <div className="text-sm text-gray-600 flex flex-wrap gap-4">
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-2">Summary</h2>
          <p className="text-gray-700 text-sm leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{job.position}</h3>
                  <p className="text-gray-700 text-sm">{job.company}</p>
                </div>
                <p className="text-gray-600 text-xs">
                  {job.startDate ? new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
              {job.description && (
                <div className="text-gray-700 text-sm">
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
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-700 text-sm">{edu.institution}</p>
                </div>
                <p className="text-gray-600 text-xs">
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Skills</h2>
          <div className="text-gray-700 text-sm">
            {data.skills.map((skill, index) => (
              <span key={index} className="inline-block mr-3 mb-1">
                {skill.name || skill}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <h3 className="text-base font-semibold text-gray-900">{project.name}</h3>
              {project.description && <p className="text-gray-700 text-sm mb-1">{project.description}</p>}
              {project.technologies && <p className="text-gray-600 text-xs">Technologies: {project.technologies}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-5">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-1">
              <span className="font-semibold text-gray-900 text-sm">{cert.name}</span>
              {cert.issuer && <span className="text-gray-700 text-sm"> - {cert.issuer}</span>}
              {cert.date && <span className="text-gray-600 text-xs"> ({cert.date})</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ATSSimpleTemplate;
