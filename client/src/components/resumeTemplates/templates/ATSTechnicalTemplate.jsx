import React from 'react';

const ATSTechnicalTemplate = ({ formData }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'David Rodriguez',
      title: 'Software Engineer',
      email: 'david.rodriguez@email.com',
      phone: '(555) 345-6789',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/davidrodriguez',
      summary: 'Full-stack software engineer with 5+ years of experience developing scalable web applications. Proficient in modern JavaScript frameworks, cloud technologies, and DevOps practices. Passionate about clean code and agile development methodologies.'
    },
    experience: [
      {
        position: 'Senior Software Engineer',
        company: 'Tech Innovations Corp.',
        startDate: '2020-08-01',
        endDate: '',
        current: true,
        description: 'Developed and maintained microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Led code reviews and mentored junior developers.'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of Texas at Austin',
        startDate: '2014-09-01',
        endDate: '2018-05-01',
        current: false
      }
    ],
    skills: [
      { name: 'JavaScript' },
      { name: 'TypeScript' },
      { name: 'React' },
      { name: 'Node.js' },
      { name: 'AWS' },
      { name: 'Docker' }
    ]
  };

  return (
    <div className="w-full p-[8mm] bg-white text-black font-mono mx-2 my-2" style={{ minHeight: '297mm', pageBreakInside: 'avoid' }}>
      {/* Header - Technical Style */}
      <header className="mb-6 border-l-4 border-gray-800" style={{ paddingLeft: '16px', paddingRight: '80px' }}>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-xl text-gray-700 mb-3">{data.personalInfo.title}</p>
        <div className="text-base text-gray-600 space-y-1">
          <p><span className="font-semibold">EMAIL:</span> {data.personalInfo.email}</p>
          <p><span className="font-semibold">PHONE:</span> {data.personalInfo.phone}</p>
          <p><span className="font-semibold">LOCATION:</span> {data.personalInfo.location}</p>
          {data.personalInfo.linkedin && <p><span className="font-semibold">LINKEDIN:</span> {data.personalInfo.linkedin}</p>}
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className="mb-5" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', paddingLeft: '16px', paddingRight: '80px' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-l-4 border-gray-400 pl-3">PROFESSIONAL SUMMARY</h2>
          <p className="text-lg text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-5" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', paddingLeft: '16px', paddingRight: '80px' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-l-4 border-gray-400 pl-3">TECHNICAL EXPERIENCE</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{job.position}</h3>
                  <p className="text-lg text-gray-700 font-medium">{job.company}</p>
                </div>
                <p className="text-gray-600 text-base">
                  {job.startDate ? new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
              {job.description && (
                <div className="text-lg text-gray-700">
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
        <section className="mb-5" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', paddingLeft: '16px', paddingRight: '80px' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-l-4 border-gray-400 pl-3">EDUCATION</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-lg text-gray-700">{edu.institution}</p>
                </div>
                <p className="text-gray-600 text-base">
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mb-5" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', paddingLeft: '16px', paddingRight: '80px' }}>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-l-4 border-gray-400 pl-3">TECHNICAL SKILLS</h2>
          <div className="grid grid-cols-3 gap-4 text-lg text-gray-700">
            {data.skills.map((skill, index) => (
              <div key={index}>
                • {skill.name || skill}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-l-4 border-gray-400 pl-3">PROJECTS</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
              {project.description && <p className="text-lg text-gray-700 mb-2">{project.description}</p>}
              {project.technologies && <p className="text-base text-gray-600">Technologies: {project.technologies}</p>}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-5">
          <h2 className="text-2xl font-bold text-gray-900 mb-3 border-l-4 border-gray-400 pl-3">CERTIFICATIONS</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <span className="text-lg font-semibold text-gray-900">{cert.name}</span>
              {cert.issuer && <span className="text-lg text-gray-700"> - {cert.issuer}</span>}
              {cert.date && <span className="text-base text-gray-600"> ({cert.date})</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default ATSTechnicalTemplate;
