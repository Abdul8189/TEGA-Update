import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';

const ExecutiveTemplate = ({ formData, renderMainContent, renderSidebar }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Olivia Chen',
      title: 'Chief Executive Officer',
      email: 'olivia.chen@example.com',
      phone: '(123) 555-0101',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/oliviachenceo',
      summary: 'Visionary and results-driven CEO with over 20 years of experience leading technology companies through periods of rapid growth and transformation. Expert in strategic planning, market expansion, and corporate finance. Recognized for building high-performance executive teams and fostering a culture of innovation.'
    },
    experience: [
      {
        position: 'Chief Executive Officer',
        company: 'Innovatech Solutions',
        location: 'New York, NY',
        startDate: '2015-01-01',
        endDate: '',
        current: true,
        description: 'Led the company to a 300% growth in revenue and successful IPO. Oversaw the acquisition of two key competitors, expanding market share by 25%. Championed the development of a new flagship product line, now accounting for 60% of annual sales.'
      },
      {
        position: 'Chief Operating Officer',
        company: 'TechForward Inc.',
        location: 'San Francisco, CA',
        startDate: '2008-01-01',
        endDate: '2014-12-31',
        current: false,
        description: 'Managed global operations across 15 countries, improving operational efficiency by 40%. Restructured the supply chain, resulting in a 20% cost reduction. Implemented a company-wide digital transformation initiative.'
      }
    ],
    education: [
      {
        degree: 'MBA, Finance',
        institution: 'Harvard Business School',
        location: 'Boston, MA',
        startDate: '2006-09-01',
        endDate: '2008-05-01'
      },
      {
        degree: 'B.S. in Computer Science',
        institution: 'Stanford University',
        location: 'Stanford, CA',
        startDate: '2002-09-01',
        endDate: '2006-05-01'
      }
    ],
    skills: [
      { id: 1, name: 'Strategic Leadership' },
      { id: 2, name: 'P&L Management' },
      { id: 3, name: 'Mergers & Acquisitions' },
      { id: 4, name: 'Venture Capital' },
      { id: 5, name: 'Board Relations' },
      { id: 6, name: 'Corporate Governance' },
      { id: 7, name: 'Public Speaking' }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Mandarin', proficiency: 'Professional' }
    ],
    volunteerExperience: [
      {
        organization: 'Tech for All',
        role: 'Board Member',
        startDate: '2018-01-01',
        endDate: '',
        current: true,
        description: 'Provide strategic guidance to a non-profit dedicated to improving digital literacy in underserved communities.'
      }
    ],
    hobbies: ['Golf', 'Sailing', 'Angel Investing'],
    certifications: [],
    extracurricularActivities: []
  };

  return (
    <div className="executive-template bg-white font-serif p-10 min-h-[842px] w-full shadow-lg mx-2 my-2">
      {renderMainContent('header')}
      <main>
        <div className="grid grid-cols-4 gap-10">
          <div className="col-span-3 space-y-8" style={{ paddingLeft: '4px', paddingRight: '80px' }}>
            {renderMainContent('summary')}
            {renderMainContent('experience')}
            {renderMainContent('education')}
          </div>
          <aside className="col-span-1 space-y-8">
            {renderSidebar('contact')}
            {renderSidebar('skills')}
            {renderSidebar('languages')}
            {renderSidebar('volunteerExperience')}
            {renderSidebar('certifications')}
            {renderSidebar('extracurricularActivities')}
            {renderSidebar('hobbies')}
          </aside>
        </div>
      </main>
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => ({
    header: () => (
      <header className="text-center mb-10 border-b-4 border-gray-700 pb-6">
        <h1 className="text-5xl font-bold text-gray-800 tracking-wider">{data.personalInfo.fullName}</h1>
        <p className="text-2xl text-gray-600 mt-2">{data.personalInfo.title}</p>
      </header>
    ),
    summary: () => (
      data.personalInfo.summary && (
        <section>
          <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Executive Summary</h2>
          <p className="text-gray-600 text-lg leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Professional Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800">{job.position}</h3>
              <p className="text-lg text-gray-600 font-medium">{job.company} | {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
              <p className="text-gray-500 mt-2 text-base">{job.description}</p>
            </div>
          ))}
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">{edu.institution}</h3>
              <p className="text-lg text-gray-600">{edu.degree} | {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ''}</p>
              {edu.gpa && <p className="text-base text-gray-500">GPA: {edu.gpa}</p>}
            </div>
          ))}
        </section>
      )
    ),
    contact: () => (
      <section>
        <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Contact</h2>
        <div className="text-lg text-gray-600 space-y-2">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          <p>{data.personalInfo.linkedin}</p>
        </div>
      </section>
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Core Competencies</h2>
          <ul className="text-lg text-gray-600 space-y-2">
            {data.skills.map((skill, index) => (
              <li key={index}>{skill.name || skill}</li>
            ))}
          </ul>
        </section>
      )
    ),
    languages: () => <LanguagesSection data={data.languages} headingClassName="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4" />,
    volunteerExperience: () => <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4" />,
    certifications: () => (
      data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Certifications</h2>
          <div className="text-lg text-gray-600 space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-800">{cert.name}</h3>
                <p>{cert.issuer}, {cert.date}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    extracurricularActivities: () => (
      data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4">Extracurriculars</h2>
          <div className="text-lg text-gray-600 space-y-2">
            {data.extracurricularActivities.map((activity, index) => (
              <div key={index}>
                <h3 className="font-semibold text-gray-800">{activity.role} at {activity.organization}</h3>
                <p>{activity.description}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    hobbies: () => <HobbiesSection data={data.hobbies} headingClassName="text-2xl font-bold text-gray-700 border-b-2 border-gray-300 pb-2 mb-4" />,
  }),
  mainContentSections: ['header', 'summary', 'experience', 'education'],
  sidebarSections: ['contact', 'skills', 'languages', 'volunteerExperience', 'certifications', 'extracurricularActivities', 'hobbies'],
};

export default withDynamicSections(ExecutiveTemplate, sectionConfig);
