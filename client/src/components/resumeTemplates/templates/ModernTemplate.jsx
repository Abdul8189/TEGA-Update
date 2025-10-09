import React from 'react';
import { fontOptions } from '../fontConfig';

const ModernTemplate = ({ formData, selectedFont = 'sansSerif' }) => {
  // Always use the formData passed from the resume builder
  const data = formData || {
    personalInfo: {
      fullName: 'Marcus Rodriguez',
      title: 'Senior UX/UI Designer',
      email: 'marcus.rodriguez@email.com',
      phone: '(555) 987-6543',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/marcusrodriguez-ux',
      summary: 'Award-winning UX/UI designer with 7+ years of experience creating exceptional digital experiences for Fortune 500 companies. Expert in user research, design systems, and leading cross-functional teams. Passionate about accessibility and inclusive design practices.'
    },
    experience: [
      {
        position: 'Senior UX/UI Designer',
        company: 'Meta (Facebook)',
        startDate: '2021-08-01',
        endDate: '',
        current: true,
        description: 'Lead design for Instagram Stories features used by 500M+ daily active users\nConducted extensive user research including interviews, surveys, and A/B testing with 10,000+ participants\nEstablished comprehensive design system reducing design inconsistencies by 70% across 15+ product teams\nMentored 3 junior designers and established design review processes improving team efficiency by 40%\nCollaborated with product managers and engineers to define user stories and technical requirements'
      },
      {
        position: 'UX Designer',
        company: 'Airbnb',
        startDate: '2019-03-01',
        endDate: '2021-07-31',
        current: false,
        description: 'Redesigned host onboarding flow increasing host conversion rate by 35%\nCreated user journey maps and service blueprints for complex booking experiences\nDesigned mobile-first interfaces for iOS and Android apps serving 150M+ users\nConducted usability testing sessions and synthesized findings into actionable design recommendations\nCollaborated with data science team to implement analytics tracking for design decisions'
      },
      {
        position: 'UI/UX Designer',
        company: 'Uber Technologies',
        startDate: '2017-06-01',
        endDate: '2019-02-28',
        current: false,
        description: 'Designed driver app interfaces improving driver satisfaction scores by 25%\nCreated wireframes, prototypes, and high-fidelity mockups for 20+ features\nImproved app performance metrics through optimized user flows and reduced cognitive load\nParticipated in design sprints and rapid prototyping sessions with cross-functional teams\nContributed to design system documentation and component library maintenance'
      }
    ],
    education: [
      {
        degree: 'Master of Fine Arts',
        field: 'Interaction Design',
        institution: 'Stanford University',
        startDate: '2015-09-01',
        endDate: '2017-06-01',
        current: false,
        gpa: '3.9'
      },
      {
        degree: 'Bachelor of Arts',
        field: 'Graphic Design',
        institution: 'Art Center College of Design',
        startDate: '2011-09-01',
        endDate: '2015-05-01',
        current: false,
        gpa: '3.7'
      }
    ],
    skills: [
      { id: 1, name: 'User Research' },
      { id: 2, name: 'Wireframing' },
      { id: 3, name: 'Prototyping' },
      { id: 4, name: 'Figma' },
      { id: 5, name: 'Adobe XD' },
      { id: 6, name: 'Sketch' },
      { id: 7, name: 'InVision' },
      { id: 8, name: 'Principle' },
      { id: 9, name: 'Design Systems' },
      { id: 10, name: 'Accessibility' },
      { id: 11, name: 'A/B Testing' },
      { id: 12, name: 'HTML/CSS' }
    ],
    projects: [
      {
        name: 'Social Media Analytics Dashboard',
        description: 'Designed comprehensive analytics dashboard for social media managers, improving data comprehension by 50% and reducing task completion time by 30%',
        technologies: 'Figma, Principle, React, D3.js',
        link: 'https://dribbble.com/marcusrodriguez/analytics-dashboard'
      },
      {
        name: 'Accessibility-First Mobile Banking App',
        description: 'Led design for inclusive banking app with WCAG 2.1 AA compliance, serving 2M+ users including those with visual and motor impairments',
        technologies: 'Figma, VoiceOver Testing, Screen Reader Testing',
        link: 'https://behance.net/marcusrodriguez/banking-app'
      }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Fluent' },
      { name: 'French', proficiency: 'Conversational' }
    ],
    volunteerExperience: [
      {
        role: 'Design Mentor',
        organization: 'Design for Good',
        startDate: '2022-01-01',
        endDate: '',
        current: true,
        description: 'Mentoring 15+ junior designers from underrepresented communities, providing portfolio reviews and career guidance. Helped 12 mentees secure their first design roles.'
      },
      {
        role: 'UX Consultant',
        organization: 'Non-Profit Tech Solutions',
        startDate: '2020-06-01',
        endDate: '2022-12-31',
        current: false,
        description: 'Provided pro-bono UX consulting for 5 non-profit organizations, improving their digital presence and user engagement by an average of 40%.'
      }
    ],
    hobbies: ['Photography', 'Rock Climbing', 'Cooking', 'Traveling'],
    certifications: [
      {
        name: 'Certified Usability Analyst (CUA)',
        issuer: 'Human Factors International',
        date: '2023-01-15'
      },
      {
        name: 'Accessibility Specialist Certification',
        issuer: 'Deque University',
        date: '2022-09-20'
      },
      {
        name: 'Google UX Design Certificate',
        issuer: 'Google',
        date: '2021-05-10'
      }
    ],
    achievements: [
      {
        description: 'Winner, 2023 Webby Award for Best User Experience Design'
      },
      {
        description: 'Featured speaker at UX Week 2023, presenting on "Inclusive Design in the Digital Age"'
      },
      {
        description: 'Published 3 articles in UX Collective on Medium with 50K+ total views'
      },
      {
        description: 'Led design team that increased user satisfaction scores by 45% across Meta products'
      }
    ],
    extraCurricularActivities: [
      {
        title: 'Board Member',
        organization: 'AIGA San Francisco',
        startDate: '2021-01-01',
        endDate: '',
        current: true,
        description: 'Organize monthly design talks and workshops for 500+ local designers. Led initiative to increase diversity in design leadership roles.'
      }
    ]
  };

    
  const selectedFontConfig = fontOptions[selectedFont] || fontOptions.sansSerif;
  
  return (
    <div
      className="modern-template bg-white w-full shadow-lg"
      style={{ 
        fontFamily: selectedFontConfig.fontFamily, 
        display: 'flex', 
        minHeight: '297mm', 
        pageBreakInside: 'avoid',
        padding: '20px',
        margin: '0 auto',
        maxWidth: '595px', // A4 width in pixels for PDF compatibility
        boxSizing: 'border-box'
      }}
    >
      {/* Sidebar */}
      <aside className="bg-gradient-to-b from-gray-800 to-gray-900 text-white p-4" style={{ width: '25%', minHeight: '297mm' }}>
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-1 text-white">{data.personalInfo.fullName}</h1>
          <p className="text-blue-300 font-light">{data.personalInfo.title}</p>
          <div className="w-16 h-1 bg-blue-400 mx-auto mt-3"></div>
        </div>

        {/* Contact */}
        <div>
          <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-600">Contact</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
              <span className="text-sm">{data.personalInfo.email}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
              <span className="text-sm">{data.personalInfo.phone}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
              <span className="text-sm">{data.personalInfo.location}</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-1.005-.02-2.298-1.39-2.298-1.397 0-1.61 1.09-1.61 2.23v4.246H7.997V7.183h2.56v1.18h.035c.358-.674 1.228-1.387 2.528-1.387 2.7 0 3.208 1.778 3.208 4.091v5.271zM4.003 6.003a1.585 1.585 0 110-3.17 1.585 1.585 0 010 3.17zm1.288 10.335H2.722V7.183h2.57v9.155z" clipRule="evenodd" /></svg>
              <span className="text-sm">{data.personalInfo.linkedin}</span>
            </div>
          </div>
        </div>

        {/* Skills */}
        {data.skills && data.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-600">Skills</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span key={index} className="bg-gray-700 px-2 py-1 rounded text-xs text-white">
                  {skill.name || skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education && data.education.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 pb-2 border-b border-gray-600">Education</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-base font-medium">{edu.degree} in {edu.field}</h3>
                <p className="text-sm text-gray-300">{edu.institution}</p>
                <p className="text-xs text-gray-400">
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </aside>
      
      {/* Main Content */}
         <main className="p-4 bg-gray-50" style={{ width: '75%', paddingLeft: '4px', paddingRight: '80px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingLeft: '4px', paddingRight: '8px' }}>
        {/* Summary */}
        {data.personalInfo.summary && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b-2 border-blue-500">Summary</h2>
            <p className="text-gray-700">{data.personalInfo.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience && data.experience.length > 0 && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b-2 border-blue-500">Experience</h2>
            {data.experience.map((job, index) => (
              <div key={index} className="mb-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{job.position}</h3>
                    <p className="text-gray-600">{job.company}</p>
                  </div>
                  <p className="text-gray-500 text-sm mt-1 md:mt-0">
                    {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}
                  </p>
                </div>
                <ul className="list-disc list-inside text-gray-700 ml-2">
                  {job.description && job.description.split('\n').map((achievement, i) => (
                    <li key={i} className="mb-1 text-sm">{achievement}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        )}

        {/* Projects */}
        {data.projects && data.projects.length > 0 && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b-2 border-blue-500">Projects</h2>
            {data.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
                <p className="text-gray-700 text-sm italic">{project.technologies}</p>
                <p className="text-gray-700 mt-1">{project.description}</p>
                {project.link && <a href={project.link} className="text-blue-600 hover:underline text-sm">{project.link}</a>}
              </div>
            ))}
          </section>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b-2 border-gray-300">Languages</h2>
            <div className="flex flex-wrap gap-4">
              {data.languages.map((lang, index) => {
                const languageName = typeof lang === 'string' ? lang : (lang?.name || lang?.language || '');
                const proficiency = lang?.proficiency || lang?.level || '';
                return (
                  <div key={lang?.id || index}>
                    <span className="font-semibold">{languageName}:</span>
                    <span className="text-gray-700 ml-1">{proficiency}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Volunteer Experience */}
        {data.volunteerExperience && data.volunteerExperience.length > 0 && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-1 border-b-2 border-gray-300">Volunteer Experience</h2>
            {data.volunteerExperience.map((vol, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{vol.role}</h3>
                    <p className="text-gray-700 font-medium">{vol.organization}</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {vol.startDate ? new Date(vol.startDate).toLocaleDateString() : ''} - {vol.current ? 'Present' : vol.endDate ? new Date(vol.endDate).toLocaleDateString() : ''}
                  </p>
                </div>
                <p className="text-gray-700 mt-1">{typeof vol.description === 'string' ? vol.description : JSON.stringify(vol.description)}</p>
              </div>
            ))}
          </section>
        )}

        {/* Hobbies */}
        {data.hobbies && data.hobbies.length > 0 && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-1 border-b-2 border-gray-300">Hobbies & Interests</h2>
            <div className="flex flex-wrap gap-2">
              {data.hobbies.map((hobby, index) => {
                const hobbyName = typeof hobby === 'string' ? hobby : (hobby?.name || hobby?.title || '');
                return (
                  <span key={hobby?.id || index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    {hobbyName}
                  </span>
                );
              })}
            </div>
          </section>
        )}

        {/* Certifications */}
        {data.certifications && data.certifications.length > 0 && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-1 border-b-2 border-gray-300">Certificates</h2>
            <div className="space-y-2">
              {data.certifications.map((certificate, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-gray-800">{certificate.name}</h3>
                  <p className="text-sm text-gray-600">{certificate.issuer} - {certificate.date ? new Date(certificate.date).toLocaleDateString() : ''}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {data.achievements && data.achievements.length > 0 && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-1 border-b-2 border-gray-300">Achievements</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
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
                  <li key={achievement?.id || index}>{achievementText}</li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Extracurricular Activities */}
        {data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
          <section style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-1 border-b-2 border-gray-300">Extra-Curricular Activities</h2>
            {data.extracurricularActivities.map((activity, index) => (
              <div key={activity.id || index} className="mb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{activity.name || activity.title}</h3>
                    <p className="text-gray-700 font-medium">{activity.role || activity.organization}</p>
                  </div>
                  <p className="text-gray-600 text-sm">
                    {activity.startDate ? new Date(activity.startDate).toLocaleDateString() : ''} - {activity.current ? 'Present' : activity.endDate ? new Date(activity.endDate).toLocaleDateString() : ''}
                  </p>
                </div>
                <p className="text-gray-700 mt-1">{typeof activity.description === 'string' ? activity.description : JSON.stringify(activity.description)}</p>
              </div>
            ))}
          </section>
        )}
        </div>
      </main>
    </div>
  );
};


export default ModernTemplate;