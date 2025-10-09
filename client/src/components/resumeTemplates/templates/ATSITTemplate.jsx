import React from 'react';

const ATSITTemplate = ({ formData }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Kevin Park',
      title: 'IT Support Specialist',
      email: 'kevin.park@email.com',
      phone: '(555) 123-4567',
      location: 'Phoenix, AZ',
      linkedin: 'linkedin.com/in/kevinpark',
      summary: 'IT support specialist with 4+ years of experience in technical support, system administration, and network troubleshooting. Skilled in resolving complex technical issues and providing excellent customer service to end users.'
    },
    experience: [
      {
        position: 'IT Support Specialist',
        company: 'Tech Solutions Group',
        startDate: '2020-07-01',
        endDate: '',
        current: true,
        description: 'Provided technical support to 200+ users across multiple locations. Troubleshot hardware and software issues, managed user accounts, and maintained IT documentation. Implemented new systems and trained end users on new technologies.'
      }
    ],
    education: [
      {
        degree: 'Associate of Applied Science',
        field: 'Information Technology',
        institution: 'Phoenix College',
        startDate: '2018-09-01',
        endDate: '2020-05-01',
        current: false
      }
    ],
    skills: [
      { name: 'Technical Support' },
      { name: 'System Administration' },
      { name: 'Network Troubleshooting' },
      { name: 'Help Desk' }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white text-black font-sans">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-gray-700 mb-4">{data.personalInfo.title}</p>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>Email:</strong> {data.personalInfo.email}</p>
            <p><strong>Phone:</strong> {data.personalInfo.phone}</p>
          </div>
          <div>
            <p><strong>Location:</strong> {data.personalInfo.location}</p>
            {data.personalInfo.linkedin && <p><strong>LinkedIn:</strong> {data.personalInfo.linkedin}</p>}
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

export default ATSITTemplate;
