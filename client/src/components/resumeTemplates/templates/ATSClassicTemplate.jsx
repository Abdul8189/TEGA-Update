import React from 'react';

const ATSClassicTemplate = ({ formData }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'John Smith',
      title: 'Software Engineer',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/johnsmith',
      summary: 'Experienced software engineer with 5+ years of experience in full-stack development. Proven track record of delivering high-quality software solutions and leading development teams.'
    },
    experience: [
      {
        position: 'Senior Software Engineer',
        company: 'Tech Corp',
        startDate: '2020-01-01',
        endDate: '',
        current: true,
        description: 'Led development of web applications using React and Node.js. Improved system performance by 40% and reduced bugs by 60%.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of California',
        startDate: '2015-09-01',
        endDate: '2019-06-01',
        current: false
      }
    ],
    skills: [
      { name: 'JavaScript' },
      { name: 'React' },
      { name: 'Node.js' },
      { name: 'Python' }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black font-sans">
      {/* Header */}
      <header className="text-center mb-8 border-b-2 border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-gray-700 mb-4">{data.personalInfo.title}</p>
        <div className="flex justify-center space-x-6 text-sm">
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-300 pb-1">PROFESSIONAL SUMMARY</h2>
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">PROFESSIONAL EXPERIENCE</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-4">
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">EDUCATION</h2>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">TECHNICAL SKILLS</h2>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">PROJECTS</h2>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-300 pb-1">CERTIFICATIONS</h2>
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

export default ATSClassicTemplate;
