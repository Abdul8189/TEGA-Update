import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';

const FunctionalTemplate = ({ formData, renderMainContent }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Liam Gallagher',
      title: 'Project Manager & Career Changer',
      email: 'liam.gallagher@example.com',
      phone: '(123) 555-0112',
      location: 'Chicago, IL',
      linkedin: 'linkedin.com/in/liamgallagherpm',
      summary: 'A highly motivated and adaptable professional transitioning from a successful career in sales to project management. Leverages a strong foundation in client relations, strategic planning, and team leadership to drive project success. Eager to apply a decade of experience in a new context, focusing on delivering projects on time and within budget.'
    },
        skills: [
      { name: 'Agile & Scrum Methodologies', category: 'Project Management' },
      { name: 'Risk Management', category: 'Project Management' },
      { name: 'Stakeholder Communication', category: 'Project Management' },
      { name: 'Budgeting & Forecasting', category: 'Project Management' },
      { name: 'Team Leadership', category: 'Leadership & Communication' },
      { name: 'Cross-functional Collaboration', category: 'Leadership & Communication' },
      { name: 'Client Relationship Management', category: 'Leadership & Communication' },
      { name: 'Public Speaking', category: 'Leadership & Communication' },
      { name: 'Strategic Planning', category: 'Sales & Business Acumen' },
      { name: 'Market Analysis', category: 'Sales & Business Acumen' },
      { name: 'Negotiation', category: 'Sales & Business Acumen' },
      { name: 'Salesforce CRM', category: 'Sales & Business Acumen' },
    ],
    experience: [
      {
        position: 'Senior Sales Executive',
        company: 'Innovate Corp',
        location: 'Chicago, IL',
        startDate: '2015-06-01',
        endDate: '2023-01-01',
        current: false,
        description: 'Managed a portfolio of key accounts, consistently exceeding sales targets. Developed and executed strategic sales plans that expanded market share by 15%.'
      }
    ],
    education: [
      {
        degree: 'Certified Associate in Project Management (CAPM)',
        institution: 'Project Management Institute',
        location: 'Online',
        startDate: '2023-02-01',
        endDate: '2023-05-01'
      },
      {
        degree: 'B.A. in Business Administration',
        institution: 'University of Illinois',
        location: 'Urbana-Champaign, IL',
        startDate: '2011-09-01',
        endDate: '2015-05-01'
      }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Conversational' }
    ],
        volunteerExperience: [],
    hobbies: ['Guitar', 'Hiking', 'Home Brewing'],
    certifications: [],
    extracurricularActivities: []
  };

  return (
    <div className="functional-template bg-gray-100 p-8 font-sans">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-800">{data.personalInfo.fullName}</h1>
        <p className="text-xl text-gray-600 mt-1">{data.personalInfo.title}</p>
      </header>

            <main>
        {renderMainContent('summary')}
        {renderMainContent('skills')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderMainContent('experience')}
          {renderMainContent('education')}
        </div>
        {renderMainContent('languages')}
        {renderMainContent('volunteerExperience')}
        {renderMainContent('hobbies')}
        {renderMainContent('certifications')}
        {renderMainContent('extracurricularActivities')}
      </main>
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => {
    const skillsByCategory = (data?.skills || []).reduce((acc, skill) => {
      const category = skill.category || 'General';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(skill.name || skill);
      return acc;
    }, {});

    return {
      header: () => (
        <header className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-800">{data.personalInfo.fullName}</h1>
          <p className="text-xl text-gray-600 mt-1">{data.personalInfo.title}</p>
        </header>
      ),
      summary: () => (
        data.personalInfo.summary && (
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Summary</h2>
            <p className="text-gray-600 leading-relaxed">{data.personalInfo.summary}</p>
          </section>
        )
      ),
      skills: () => (
        data.skills && data.skills.length > 0 && (
          <section className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Core Competencies</h2>
            <div className="flex flex-wrap gap-2">
              {data.skills.map(skill => (
                <span key={skill.id || skill.name} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {skill.name || skill}
                </span>
              ))}
            </div>
          </section>
        )
      ),
      experience: () => (
        data.experience && data.experience.length > 0 && (
          <section className="bg-white p-6 rounded-lg shadow-md h-full">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Professional Experience</h2>
            {data.experience.map((job, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-800">{job.position}</h3>
                <p className="text-md text-gray-600">{job.company} | {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
                <p className="text-gray-500 mt-1">{job.description}</p>
              </div>
            ))}
          </section>
        )
      ),
      education: () => (
        data.education && data.education.length > 0 && (
          <section className="bg-white p-6 rounded-lg shadow-md h-full">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Education & Certifications</h2>
            {data.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                <p className="text-md text-gray-600">{edu.institution}</p>
              </div>
            ))}
          </section>
        )
      ),
      languages: () => (
        <section className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <LanguagesSection data={data.languages} headingClassName="text-2xl font-bold text-gray-700 mb-4" />
        </section>
      ),
      volunteerExperience: () => (
        <section className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-2xl font-bold text-gray-700 mb-4" />
        </section>
      ),
      hobbies: () => (
        <section className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <HobbiesSection data={data.hobbies} headingClassName="text-2xl font-bold text-gray-700 mb-4" />
        </section>
      ),
      certifications: () => (
        data.certifications && data.certifications.length > 0 && (
          <section className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Certifications</h2>
            {data.certifications.map((cert, index) => (
              <div key={index} className="mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{cert.name}</h3>
                <p className="text-md text-gray-600">{cert.issuer} - {cert.date}</p>
              </div>
            ))}
          </section>
        )
      ),
      extracurricularActivities: () => (
        data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
          <section className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">Extracurricular Activities</h2>
            {data.extracurricularActivities.map((activity, index) => (
              <div key={index} className="mb-3">
                <h3 className="text-lg font-semibold text-gray-800">{activity.role}, {activity.organization}</h3>
                <p className="text-md text-gray-600">{activity.description}</p>
              </div>
            ))}
          </section>
        )
      ),
    };
  },
  mainContentSections: ['header', 'summary', 'skills', 'experience', 'education', 'languages', 'volunteerExperience', 'hobbies', 'certifications', 'extracurricularActivities'],
  sidebarSections: [],
};

export default withDynamicSections(FunctionalTemplate, sectionConfig);
