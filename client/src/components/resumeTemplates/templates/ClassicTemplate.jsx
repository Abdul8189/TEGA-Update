import React from 'react';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import CertificatesSection from '../common/CertificatesSection';
import AchievementsSection from '../common/AchievementsSection';
import ExtraCurricularActivitiesSection from '../common/ExtraCurricularActivitiesSection';

const ClassicTemplate = ({ formData }) => {
  // Always use the formData passed from the resume builder
  const data = formData || {
    personalInfo: {
      fullName: 'Sarah Chen',
      title: 'Senior Full Stack Developer',
      email: 'sarah.chen@email.com',
      phone: '(555) 123-4567',
      location: 'Seattle, WA',
      linkedin: 'linkedin.com/in/sarahchen-dev',
      summary: 'Passionate full-stack developer with 6+ years of experience building scalable web applications. Expert in modern JavaScript frameworks and cloud technologies. Led development teams and delivered projects that improved user engagement by 40% and reduced system downtime by 60%.'
    },
    experience: [
      {
        position: 'Senior Full Stack Developer',
        company: 'Microsoft Corporation',
        startDate: '2021-03-01',
        endDate: '',
        current: true,
        description: 'Lead development of Azure-based microservices architecture serving 2M+ daily active users\nArchitected and implemented real-time collaboration features using WebSocket and SignalR\nMentored 5 junior developers and established code review processes improving code quality by 35%\nReduced API response time by 45% through database optimization and caching strategies\nCollaborated with product managers to define technical requirements and project timelines'
      },
      {
        position: 'Full Stack Developer',
        company: 'Amazon Web Services',
        startDate: '2019-06-01',
        endDate: '2021-02-28',
        current: false,
        description: 'Developed and maintained React-based dashboard for AWS service monitoring\nBuilt RESTful APIs using Node.js and Express, handling 100K+ requests per day\nImplemented automated testing suite increasing code coverage from 60% to 90%\nOptimized database queries and implemented Redis caching, reducing load times by 30%\nParticipated in agile development process and contributed to sprint planning sessions'
      },
      {
        position: 'Frontend Developer',
        company: 'Google LLC',
        startDate: '2017-08-01',
        endDate: '2019-05-31',
        current: false,
        description: 'Developed responsive web applications using React, Redux, and TypeScript\nCollaborated with UX designers to implement pixel-perfect user interfaces\nIntegrated third-party APIs and payment processing systems\nImproved application performance by 25% through code splitting and lazy loading\nContributed to open-source projects and maintained internal component library'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of Washington',
        startDate: '2013-09-01',
        endDate: '2017-06-01',
        current: false,
        gpa: '3.8'
      }
    ],
    skills: [
      { id: '1', name: 'JavaScript' },
      { id: '2', name: 'TypeScript' },
      { id: '3', name: 'React' },
      { id: '4', name: 'Node.js' },
      { id: '5', name: 'Python' },
      { id: '6', name: 'AWS' },
      { id: '7', name: 'Docker' },
      { id: '8', name: 'Kubernetes' },
      { id: '9', name: 'MongoDB' },
      { id: '10', name: 'PostgreSQL' },
      { id: '11', name: 'Redis' },
      { id: '12', name: 'Git' }
    ],
    projects: [
      {
        name: 'Real-time Collaboration Platform',
        description: 'Built a real-time document collaboration platform similar to Google Docs using WebSocket technology',
        technologies: 'React, Node.js, Socket.io, MongoDB, Redis, AWS',
        link: 'https://github.com/sarahchen/collab-platform'
      },
      {
        name: 'E-commerce Analytics Dashboard',
        description: 'Developed a comprehensive analytics dashboard for e-commerce businesses with real-time data visualization',
        technologies: 'React, D3.js, Python, FastAPI, PostgreSQL, Docker',
        link: 'https://github.com/sarahchen/ecommerce-analytics'
      }
    ],
    certifications: [
      {
        name: 'AWS Certified Solutions Architect - Professional',
        issuer: 'Amazon Web Services',
        date: '2023-03-15'
      },
      {
        name: 'Google Cloud Professional Developer',
        issuer: 'Google Cloud',
        date: '2022-11-20'
      },
      {
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation',
        date: '2022-08-10'
      }
    ],
    achievements: [
      {
        description: 'Led cross-functional team of 8 developers to deliver critical system migration 2 weeks ahead of schedule'
      },
      {
        description: 'Received "Innovation Award" for developing automated deployment pipeline that reduced release time by 70%'
      },
      {
        description: 'Contributed to open-source project with 10K+ GitHub stars and 500+ contributors'
      }
    ],
    extracurricularActivities: [
      {
        title: 'Tech Meetup Organizer',
        organization: 'Seattle JavaScript Developers',
        startDate: '2020-01-01',
        endDate: '',
        current: true,
        description: 'Organize monthly meetups for 200+ local developers, featuring industry speakers and networking events'
      }
    ],
  };

  return (
    <div className="classic-template bg-white w-full" style={{ 
      pageBreakInside: 'avoid', 
      wordWrap: 'break-word', 
      overflowWrap: 'break-word',
      padding: '20px',
      margin: '0 auto',
      maxWidth: '595px', // Standard A4 width
      width: '595px', // Fixed A4 width
      boxSizing: 'border-box'
    }}>
      <header className="text-center mb-4 pb-2" style={{ marginBottom: '16px', paddingBottom: '8px' }}>
        <div className="flex flex-col items-center justify-center mb-2" style={{ marginBottom: '8px' }}>
          {data.personalInfo.profileImage && (
            <img 
              src={data.personalInfo.profileImage} 
              alt="Profile" 
              className="w-20 h-20 rounded-full object-cover border-4 border-gray-300 mb-2"
              style={{ marginBottom: '8px' }}
            />
          )}
          <div className="text-center" style={{ textAlign: 'center' }}>
            <h1 className="text-2xl font-bold text-gray-800 mb-1" style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              marginBottom: '4px',
              textAlign: 'center'
            }}>
              {data.personalInfo.fullName}
            </h1>
            <p className="text-lg text-gray-600" style={{ 
              fontSize: '16px', 
              color: '#4b5563',
              textAlign: 'center'
            }}>
              {data.personalInfo.title}
            </p>
          </div>
        </div>
        <div className="flex justify-center flex-wrap gap-4 text-sm text-gray-600" style={{ 
          justifyContent: 'center', 
          flexWrap: 'wrap', 
          gap: '16px',
          fontSize: '14px',
          color: '#4b5563'
        }}>
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
        </div>
      </header>

       <div className="space-y-2" style={{ 
         wordWrap: 'break-word', 
         overflowWrap: 'break-word',
         marginTop: '8px',
         marginBottom: '20px' // Add bottom margin for white space
       }}>
        {/* Professional Summary */}
        {data.personalInfo?.summary && (
        <section className="mb-3" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
          marginBottom: '12px'
        }}>
          <h2 className="text-lg font-bold text-gray-800 mb-1 pb-1" style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '4px',
            paddingBottom: '2px'
          }}>
            Professional Summary
          </h2>
          <p className="text-gray-700" style={{
            color: '#374151',
            lineHeight: '1.5',
            margin: '0'
          }}>
            {data.personalInfo.summary}
          </p>
        </section>
        )}

        {/* Professional Experience */}
        {data.experience && data.experience.length > 0 && (
        <section className="mb-3" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
          pageBreakBefore: 'auto',
          pageBreakAfter: 'avoid',
          marginBottom: '12px',
          display: 'block'
        }}>
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1" style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px',
            paddingBottom: '2px'
          }}>
            Professional Experience
          </h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-3" style={{ marginBottom: '12px' }}>
              <div className="flex justify-between items-start" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '4px',
                gap: '8px'
              }}>
                <div style={{ flex: '1', minWidth: '0', maxWidth: '450px' }}>
                  <h3 className="text-sm font-semibold text-gray-800" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 2px 0',
                    lineHeight: '1.2'
                  }}>
                    {job.position}
                  </h3>
                  <p className="text-gray-700 font-medium" style={{
                    color: '#374151',
                    fontWeight: '500',
                    margin: '0',
                    fontSize: '13px',
                    lineHeight: '1.2'
                  }}>
                    {job.company}
                  </p>
                </div>
                <p className="text-gray-600" style={{
                  color: '#4b5563',
                  fontSize: '9px',
                  margin: '0',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  maxWidth: '80px'
                }}>
                  {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}
                </p>
              </div>
              <ul className="list-disc list-inside mt-1 text-gray-700" style={{
                listStyleType: 'disc',
                listStylePosition: 'inside',
                marginTop: '4px',
                color: '#374151',
                paddingLeft: '0',
                marginLeft: '0'
              }}>
                {job.description && job.description.split('\n').map((achievement, i) => (
                  <li key={i} className="ml-4" style={{
                    marginLeft: '12px',
                    marginBottom: '2px',
                    lineHeight: '1.3'
                  }}>
                    {achievement}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
        <section className="mb-3" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
          pageBreakBefore: 'auto',
          pageBreakAfter: 'avoid',
          marginBottom: '12px',
          display: 'block'
        }}>
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1" style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px',
            paddingBottom: '2px'
          }}>
            Education
          </h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-2" style={{ marginBottom: '8px' }}>
              <div className="flex justify-between items-start" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '4px',
                gap: '4px'
              }}>
                <div style={{ flex: '1', minWidth: '0', maxWidth: '450px' }}>
                  <h3 className="text-sm font-semibold text-gray-800" style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1f2937',
                    margin: '0 0 2px 0',
                    lineHeight: '1.2'
                  }}>
                    {edu.degree} in {edu.field}
                  </h3>
                  <p className="text-gray-700 font-medium" style={{
                    color: '#374151',
                    fontWeight: '500',
                    margin: '0',
                    fontSize: '13px',
                    lineHeight: '1.2'
                  }}>
                    {edu.institution}
                  </p>
                </div>
                <p className="text-gray-600" style={{
                  color: '#4b5563',
                  fontSize: '9px',
                  margin: '0',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  maxWidth: '80px'
                }}>
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ''}
                </p>
              </div>
              {edu.gpa && (
                <p className="text-gray-600 text-xs mt-1" style={{
                  color: '#4b5563',
                  fontSize: '12px',
                  marginTop: '2px',
                  margin: '2px 0 0 0'
                }}>
                  GPA: {edu.gpa}
                </p>
              )}
            </div>
          ))}
        </section>
        )}

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
        <section className="mb-3" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
          pageBreakBefore: 'auto',
          pageBreakAfter: 'avoid',
          marginBottom: '12px',
          display: 'block'
        }}>
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1" style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px',
            paddingBottom: '2px'
          }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-1" style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px'
          }}>
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm" style={{
                backgroundColor: '#f3f4f6',
                color: '#374151',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '12px',
                display: 'inline-block',
                margin: '1px'
              }}>
                {skill.name || skill}
              </span>
            ))}
          </div>
        </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section className="mb-3" style={{ 
            pageBreakInside: 'avoid', 
            breakInside: 'avoid',
            pageBreakBefore: 'auto',
            pageBreakAfter: 'avoid',
            marginBottom: '12px',
            display: 'block'
          }}>
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1" style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px',
            paddingBottom: '2px'
          }}>
            Projects
          </h2>
            {data.projects.map((project, index) => (
            <div key={index} className="mb-3" style={{ marginBottom: '12px' }}>
                <h3 className="text-base font-semibold text-gray-800" style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {project.name}
                </h3>
                <p className="text-gray-700 mb-1" style={{
                  color: '#374151',
                  marginBottom: '4px',
                  lineHeight: '1.4'
                }}>
                  {project.description}
                </p>
                {project.technologies && (
                  <p className="text-gray-600 text-sm" style={{
                    color: '#4b5563',
                    fontSize: '14px',
                    margin: '4px 0'
                  }}>
                    Technologies: {project.technologies}
                  </p>
                )}
                {project.link && (
                  <p className="text-blue-600 text-sm" style={{
                    color: '#2563eb',
                    fontSize: '14px',
                    margin: '4px 0'
                  }}>
                    Link: {project.link}
                  </p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section className="mb-4" style={{ 
            pageBreakInside: 'avoid', 
            breakInside: 'avoid',
            marginBottom: '20px'
          }}>
            <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1" style={{
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1f2937',
              marginBottom: '12px',
              paddingBottom: '4px'
            }}>
              Certifications
            </h2>
            {data.certifications.map((cert, index) => (
              <div key={index} className="mb-2" style={{ marginBottom: '8px' }}>
                <h3 className="text-lg font-semibold text-gray-800" style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937',
                  margin: '0 0 4px 0'
                }}>
                  {cert.name}
                </h3>
                <p className="text-gray-700" style={{
                  color: '#374151',
                  margin: '0'
                }}>
                  {cert.issuer} - {cert.date}
                </p>
            </div>
          ))}
        </section>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <LanguagesSection data={data.languages} headingClassName="text-xl font-bold text-gray-800 mb-3 pb-1" />
        )}

        {/* Volunteer Experience */}
        {data.volunteerExperience && data.volunteerExperience.length > 0 && (
          <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-xl font-bold text-gray-800 mb-3 pb-1" />
        )}

        {/* Hobbies */}
        {data.hobbies && data.hobbies.length > 0 && (
          <HobbiesSection data={data.hobbies} headingClassName="text-xl font-bold text-gray-800 mb-3 pb-1" />
        )}

        {/* Achievements - Always show section */}
        <section className="mb-3" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
          marginBottom: '12px'
        }}>
          <h2 className="text-lg font-bold text-gray-800 mb-2 pb-1" style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1f2937',
            marginBottom: '8px',
            paddingBottom: '2px'
          }}>
            Achievements
          </h2>
          {data.achievements && data.achievements.length > 0 ? (
            <ul className="list-disc list-inside space-y-1 text-gray-700" style={{
              listStyleType: 'disc',
              listStylePosition: 'inside',
              color: '#374151',
              paddingLeft: '0',
              marginLeft: '0'
            }}>
              {data.achievements.map((achievement, index) => {
                let achievementText = '';
                if (typeof achievement === 'string') {
                  achievementText = achievement;
                } else if (achievement && typeof achievement === 'object') {
                  achievementText = achievement.description || achievement.text || achievement.title || '';
                } else {
                  achievementText = String(achievement || '');
                }
                return (
                  <li key={achievement?.id || index} style={{
                    marginBottom: '2px',
                    lineHeight: '1.3'
                  }}>
                    {achievementText}
                  </li>
                );
              })}
            </ul>
          ) : (
            <ul className="list-disc list-inside space-y-1 text-gray-700" style={{
              listStyleType: 'disc',
              listStylePosition: 'inside',
              color: '#374151',
              paddingLeft: '0',
              marginLeft: '0'
            }}>
              <li style={{ marginBottom: '2px', lineHeight: '1.3' }}>
                Led cross-functional team of 8 developers to deliver critical system migration 2 weeks ahead of schedule
              </li>
              <li style={{ marginBottom: '2px', lineHeight: '1.3' }}>
                Received "Innovation Award" for developing automated deployment pipeline that reduced release time by 70%
              </li>
              <li style={{ marginBottom: '2px', lineHeight: '1.3' }}>
                Contributed to open-source project with 10K+ GitHub stars and 500+ contributors
              </li>
            </ul>
          )}
        </section>

        {/* Extracurricular Activities */}
        {data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
          <ExtraCurricularActivitiesSection data={data.extracurricularActivities} headingClassName="text-xl font-bold text-gray-800 mb-3 pb-1" />
        )}
      </div>
    </div>
  );
};

export default ClassicTemplate;