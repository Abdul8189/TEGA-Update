import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';

const ContemporaryTemplate = ({ formData, renderMainContent, renderSidebar }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Chloe Decker',
      title: 'Marketing Manager',
      email: 'chloe.decker@example.com',
      phone: '(123) 555-0111',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/chloedecker',
      summary: 'A results-driven Marketing Manager with over 8 years of experience in digital marketing, brand strategy, and campaign management. Proven ability to develop and execute successful marketing strategies that increase brand awareness, drive lead generation, and boost sales. Adept at leveraging data analytics to optimize campaign performance.'
    },
    experience: [
      {
        position: 'Marketing Manager',
        company: 'Innovatech Solutions',
        location: 'San Francisco, CA',
        startDate: '2018-03-01',
        endDate: '',
        current: true,
        description: 'Led a team of 5 marketing professionals. Developed and executed a multi-channel digital marketing strategy that resulted in a 40% increase in qualified leads. Managed a $1M annual marketing budget.'
      },
      {
        position: 'Digital Marketing Specialist',
        company: 'MarketPro Agency',
        location: 'San Francisco, CA',
        startDate: '2015-06-01',
        endDate: '2018-02-28',
        current: false,
        description: 'Managed SEO, SEM, and social media campaigns for various clients. Analyzed campaign performance and provided actionable insights for optimization. Contributed to a 25% average increase in client ROI.'
      }
    ],
    education: [
      {
        degree: 'MBA in Marketing',
        institution: 'Stanford University',
        location: 'Stanford, CA',
        startDate: '2013-09-01',
        endDate: '2015-06-01'
      }
    ],
    skills: ['Digital Marketing', 'Brand Strategy', 'Campaign Management', 'SEO/SEM', 'Data Analytics', 'Team Leadership', 'Budget Management'],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'German', proficiency: 'Conversational' }
    ],
    volunteerExperience: [],
    hobbies: ['Photography', 'Hiking', 'Cooking'],
    certifications: [],
    extracurricularActivities: []
  };

  return (
    <div className="contemporary-template bg-white p-8 w-full font-sans mx-2 my-2">
            <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-3 bg-gray-100 p-6 rounded-lg space-y-8">
          {renderSidebar('header')}
          {renderSidebar('contact')}
          {renderSidebar('skills')}
          {renderSidebar('certifications')}
          {renderSidebar('extracurricularActivities')}
          {renderSidebar('languages')}
          {renderSidebar('volunteerExperience')}
          {renderSidebar('hobbies')}
        </aside>
        <main className="col-span-9 py-6 space-y-8" style={{ paddingLeft: '4px', paddingRight: '80px' }}>
          {renderMainContent('summary')}
          {renderMainContent('experience')}
          {renderMainContent('education')}
          {renderMainContent('achievements')}
        </main>
      </div>
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => ({
    header: () => (
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-indigo-600 mt-1">{data.personalInfo.title}</p>
      </header>
    ),
    contact: () => (
      <section>
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Contact</h2>
        <div className="text-gray-600 space-y-2">
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
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">{skill.name || skill}</span>
            ))}
          </div>
        </section>
      )
    ),
    certifications: () => (
      data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Certifications</h2>
          <div className="space-y-2">
            {data.certifications.map((cert, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-800">{cert.name}</h3>
                <p className="text-gray-600">{cert.issuer}, {cert.date}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    extracurricularActivities: () => (
      data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-700 mb-3">Extracurricular Activities</h2>
          <div className="space-y-2">
            {data.extracurricularActivities.map((activity, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-800">{activity.role} at {activity.organization}</h3>
                <p className="text-gray-600 mt-1">{activity.description}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    languages: () => <LanguagesSection data={data.languages} headingClassName="text-xl font-semibold text-gray-700 mb-3" />,
    volunteerExperience: () => <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-xl font-semibold text-gray-700 mb-3" />,
    hobbies: () => <HobbiesSection data={data.hobbies} headingClassName="text-xl font-semibold text-gray-700 mb-3" />,
    summary: () => (
      data.personalInfo.summary && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-4">Summary</h2>
          <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-4">Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-semibold text-gray-800">{job.position}</h3>
              <p className="text-md text-gray-600">{job.company} | {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
              <p className="text-gray-500 mt-2">{job.description}</p>
            </div>
          ))}
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-4">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index}>
              <h3 className="text-xl font-semibold text-gray-800">{edu.institution}</h3>
              <p className="text-md text-gray-600">{edu.degree}</p>
            </div>
          ))}
        </section>
      )
    ),
    achievements: () => (
      data.achievements && data.achievements.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-indigo-500 pb-2 mb-4">Achievements</h2>
          <ul className="list-disc list-inside space-y-2">
            {data.achievements.map((ach, index) => (
              <li key={index} className="text-gray-700 leading-relaxed">{ach.description}</li>
            ))}
          </ul>
        </section>
      )
    ),
  }),
  mainContentSections: ['summary', 'experience', 'education', 'achievements'],
  sidebarSections: ['header', 'contact', 'skills', 'certifications', 'extracurricularActivities', 'languages', 'volunteerExperience', 'hobbies'],
};

export default withDynamicSections(ContemporaryTemplate, sectionConfig);
