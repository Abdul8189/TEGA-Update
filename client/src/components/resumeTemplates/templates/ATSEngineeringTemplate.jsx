import React from 'react';

const ATSEngineeringTemplate = ({ formData }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Dr. Sarah Williams',
      title: 'Senior Engineer',
      email: 'sarah.williams@email.com',
      phone: '(555) 234-5678',
      location: 'Boston, MA',
      linkedin: 'linkedin.com/in/sarahwilliams',
      summary: 'Senior engineer with 10+ years of experience in mechanical engineering, product development, and project management. Skilled in designing innovative solutions and leading engineering teams to deliver high-quality products.'
    },
    experience: [
      {
        position: 'Senior Mechanical Engineer',
        company: 'Innovation Engineering Corp.',
        startDate: '2018-06-01',
        endDate: '',
        current: true,
        description: 'Led mechanical engineering projects from concept to production. Designed and developed new products using CAD software and engineering analysis tools. Managed cross-functional teams and ensured projects met quality and performance standards.'
      }
    ],
    education: [
      {
        degree: 'Doctor of Philosophy',
        field: 'Mechanical Engineering',
        institution: 'Massachusetts Institute of Technology',
        startDate: '2014-09-01',
        endDate: '2018-05-01',
        current: false
      }
    ],
    skills: [
      { name: 'Mechanical Engineering' },
      { name: 'Product Development' },
      { name: 'CAD Design' },
      { name: 'Project Management' }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black font-sans">
      {/* Header */}
      <header className="mb-8 border-b border-gray-300 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-gray-700 mb-4">{data.personalInfo.title}</p>
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
          </div>
          <div>
            <p>{data.personalInfo.location}</p>
            {data.personalInfo.linkedin && <p>{data.personalInfo.linkedin}</p>}
          </div>
        </div>
      </header>

      {/* Summary */}
      {data.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">PROFESSIONAL SUMMARY</h2>
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">PROFESSIONAL EXPERIENCE</h2>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">EDUCATION</h2>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">TECHNICAL SKILLS</h2>
          <div className="text-gray-700">
            {data.skills.map((skill, index) => (
              <span key={index} className="inline-block mr-4 mb-2">
                {skill.name || skill}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ATSEngineeringTemplate;
