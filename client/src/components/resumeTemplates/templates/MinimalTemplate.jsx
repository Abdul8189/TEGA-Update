import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import CertificatesSection from '../common/CertificatesSection';
import AchievementsSection from '../common/AchievementsSection';
import ExtraCurricularActivitiesSection from '../common/ExtraCurricularActivitiesSection';

const MinimalTemplate = ({ formData, renderMainContent }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'David Kim',
      title: 'Senior Frontend Engineer',
      email: 'david.kim@email.com',
      phone: '(555) 369-2580',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/davidkim-frontend',
      summary: 'Passionate frontend engineer with 5+ years of experience building scalable, accessible web applications. Expert in modern JavaScript frameworks and performance optimization. Committed to creating inclusive digital experiences that work for everyone.'
    },
    experience: [
      {
        position: 'Senior Frontend Engineer',
        company: 'Netflix',
        startDate: '2022-03-01',
        endDate: '',
        current: true,
        description: 'Lead development of streaming platform UI components serving 230M+ global subscribers\nArchitected and implemented micro-frontend architecture improving development velocity by 50%\nOptimized React application bundle size reducing initial load time by 35% and improving Core Web Vitals\nMentored 4 junior developers and established frontend development best practices and coding standards\nCollaborated with UX designers to implement design system components used across 15+ product teams'
      },
      {
        position: 'Frontend Engineer',
        company: 'Spotify',
        startDate: '2020-08-01',
        endDate: '2022-02-28',
        current: false,
        description: 'Developed responsive web applications using React, Redux, and TypeScript for 400M+ users\nImplemented real-time features using WebSocket technology for collaborative playlist functionality\nImproved application performance by 45% through code splitting, lazy loading, and bundle optimization\nBuilt comprehensive testing suite with Jest and React Testing Library achieving 90% code coverage\nParticipated in agile development process and contributed to technical architecture decisions'
      },
      {
        position: 'Frontend Developer',
        company: 'Shopify',
        startDate: '2019-06-01',
        endDate: '2020-07-31',
        current: false,
        description: 'Built and maintained merchant dashboard interfaces using React and GraphQL\nCollaborated with designers to implement pixel-perfect, accessible user interfaces\nDeveloped reusable component library improving development consistency across 20+ teams\nOptimized database queries and API calls reducing page load times by 30%\nContributed to open-source projects and maintained internal documentation'
      }
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        institution: 'University of Texas at Austin',
        startDate: '2015-09-01',
        endDate: '2019-05-01',
        current: false,
        gpa: '3.7'
      }
    ],
    skills: [
      { id: 1, name: 'HTML5' },
      { id: 2, name: 'CSS3' },
      { id: 3, name: 'JavaScript' },
      { id: 4, name: 'TypeScript' },
      { id: 5, name: 'React' },
      { id: 6, name: 'Redux' },
      { id: 7, name: 'Next.js' },
      { id: 8, name: 'GraphQL' },
      { id: 9, name: 'Webpack' },
      { id: 10, name: 'Jest' },
      { id: 11, name: 'Git' },
      { id: 12, name: 'Accessibility' }
    ],
    projects: [
      {
        name: 'Real-time Collaboration Editor',
        description: 'Built a collaborative text editor similar to Google Docs using WebSocket technology and operational transformation algorithms',
        technologies: 'React, TypeScript, Socket.io, Node.js, MongoDB',
        link: 'https://github.com/davidkim/collaborative-editor'
      },
      {
        name: 'Performance Monitoring Dashboard',
        description: 'Developed a comprehensive dashboard for monitoring web application performance metrics and Core Web Vitals',
        technologies: 'React, D3.js, Web APIs, Service Workers',
        link: 'https://github.com/davidkim/performance-dashboard'
      }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Korean', proficiency: 'Fluent' }
    ],
    volunteerExperience: [
      {
        role: 'Frontend Development Mentor',
        organization: 'Code for America',
        startDate: '2022-01-01',
        endDate: '',
        current: true,
        description: 'Mentor 10+ aspiring developers from underrepresented communities, helping them build their first React applications and secure tech internships.'
      }
    ],
    hobbies: ['Rock Climbing', 'Photography', 'Open Source Contributing', 'Coffee Roasting'],
    certificates: [
      {
        name: 'Advanced React Patterns',
        issuer: 'Frontend Masters',
        date: '2023-03-15'
      },
      {
        name: 'Web Performance Optimization',
        issuer: 'Google Developers',
        date: '2022-11-20'
      }
    ],
    achievements: [
      {
        description: 'Maintainer of popular open-source React component library with 15K+ GitHub stars'
      },
      {
        description: 'Speaker at React Conf 2023, presenting on "Building Accessible Web Applications"'
      },
      {
        description: 'Contributed to React core library and helped fix critical accessibility issues'
      }
    ],
    extraCurricularActivities: [
      {
        title: 'Co-founder',
        organization: 'Austin Frontend Developers',
        startDate: '2021-06-01',
        endDate: '',
        current: true,
        description: 'Co-founded local developer community with 500+ members. Organize monthly meetups, workshops, and hackathons focused on frontend technologies.'
      }
    ]
  };

  return (
    <div className="minimal-template bg-white min-h-[842px] w-full shadow-lg font-sans" style={{
      padding: '20px',
      margin: '0 auto',
      maxWidth: '595px', // A4 width in pixels for PDF compatibility
      boxSizing: 'border-box'
    }}>
      {/* Header - Super minimal */}
      <header className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-1">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-gray-600">{data.personalInfo.title}</p>
        <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 text-sm text-gray-600">
          <div>{data.personalInfo.email}</div>
          <div>{data.personalInfo.phone}</div>
          <div>{data.personalInfo.location}</div>
          {data.personalInfo.linkedin && <div>{data.personalInfo.linkedin}</div>}
        </div>
      </header>

       <div style={{ paddingLeft: '4px', paddingRight: '80px' }}>
        {renderMainContent('summary')}
        {renderMainContent('experience')}
        {renderMainContent('projects')}
        {renderMainContent('skills')}
        {renderMainContent('education')}
        {renderMainContent('languages')}
        {renderMainContent('volunteerExperience')}
        {renderMainContent('hobbies')}
        {renderMainContent('certificates')}
        {renderMainContent('achievements')}
        {renderMainContent('extraCurricularActivities')}
      </div>
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => ({
    summary: () => (
      data.personalInfo.summary && (
        <section className="mb-8">
          <p className="text-gray-700">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider">Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between mb-1">
                <h3 className="text-base font-medium text-gray-900">{job.position} · {job.company}</h3>
                <p className="text-sm text-gray-600">
                  {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}
                </p>
              </div>
              <ul className="list-disc list-outside ml-4 text-sm text-gray-700">
                {job.description && job.description.split('\n').map((achievement, i) => (
                  <li key={i} className="mb-1">{achievement}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )
    ),
    projects: () => (
      data.projects && data.projects.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider">Projects</h2>
          {data.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <h3 className="text-base font-medium text-gray-900">{project.name}</h3>
              <p className="text-sm text-gray-700">{project.description}</p>
            </div>
          ))}
        </section>
      )
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={skill.id || index} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                {skill.name || skill}
              </span>
            ))}
          </div>
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex flex-col sm:flex-row justify-between">
                <h3 className="text-base font-medium text-gray-900">{edu.degree} in {edu.field}</h3>
                <p className="text-sm text-gray-600">
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ''}
                </p>
              </div>
              <p className="text-sm text-gray-700">{edu.institution}</p>
            </div>
          ))}
        </section>
      )
    ),
    languages: () => (data.languages && data.languages.length > 0 && <LanguagesSection data={data.languages} className="mb-8" headingClassName="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider" />),
    volunteerExperience: () => (data.volunteerExperience && data.volunteerExperience.length > 0 && <VolunteerExperienceSection data={data.volunteerExperience} className="mb-8" headingClassName="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider" />),
    hobbies: () => (data.hobbies && data.hobbies.length > 0 && <HobbiesSection data={data.hobbies} className="mb-8" headingClassName="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider" />),
    certifications: () => (data.certifications && data.certifications.length > 0 && <CertificatesSection data={data.certifications} className="mb-8" headingClassName="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider" />),
    achievements: () => (data.achievements && data.achievements.length > 0 && <AchievementsSection data={data.achievements} className="mb-8" headingClassName="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider" />),
    extracurricularActivities: () => (data.extracurricularActivities && data.extracurricularActivities.length > 0 && <ExtraCurricularActivitiesSection data={data.extracurricularActivities} className="mb-8" headingClassName="text-lg font-medium text-gray-900 mb-4 uppercase tracking-wider" />),
  }),
  mainContentSections: ['summary', 'experience', 'projects', 'skills', 'education', 'languages', 'volunteerExperience', 'hobbies', 'certifications', 'achievements', 'extracurricularActivities'],
  sidebarSections: [],
};

export default withDynamicSections(MinimalTemplate, sectionConfig);