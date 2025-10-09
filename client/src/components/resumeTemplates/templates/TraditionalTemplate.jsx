import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';

const TraditionalTemplate = ({ formData, renderMainContent }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Eleanor Vance',
      title: 'Librarian & Archivist',
      email: 'eleanor.vance@example.com',
      phone: '(123) 555-0117',
      location: 'Boston, MA'
    },
    summary: 'A meticulous and knowledgeable archivist with over 15 years of experience. Dedicated to the preservation, organization, and accessibility of historical records. Proficient in cataloging systems and digital archiving.',
    experience: [
      {
        position: 'Head Archivist',
        company: 'Boston Public Library',
        startDate: '2010-08-01',
        endDate: '',
        current: true,
        description: 'Managed the library’s special collections, including rare books and historical manuscripts.\nDeveloped and implemented digital archiving projects.\nProvided research assistance to patrons and scholars.'
      },
      {
        position: 'Assistant Librarian',
        company: 'Harvard University Library',
        startDate: '2005-06-01',
        endDate: '2010-07-31',
        current: false,
        description: 'Cataloged new acquisitions and maintained the library’s database.\nAssisted with collection development and management.'
      }
    ],
    education: [
      {
        degree: 'M.S. in Library and Information Science',
        field: '',
        institution: 'Simmons University',
        startDate: '2003-09-01',
        endDate: '2005-05-01',
        current: false
      }
    ],
    skills: ['Archival Management', 'Digital Archiving', 'Cataloging', 'Preservation', 'Research Assistance'],
    projects: [
      {
        name: 'Digital Commonwealth Archive',
        description: 'Led a regional project to digitize and provide online access to historical records from various institutions across Massachusetts.',
        technologies: 'DSpace, CONTENTdm, ArchivesSpace',
        link: ''
      }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Latin', proficiency: 'Reading Knowledge' }
    ],
    volunteerExperience: [],
    hobbies: ['Calligraphy', 'Bookbinding', 'Genealogy']
  };

  return (
    <div className="traditional-template bg-white p-10 font-serif text-gray-800 w-full mx-2 my-2">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-wider">{data.personalInfo.fullName}</h1>
        <p className="text-lg italic mt-1">{data.personalInfo.title}</p>
        <div className="mt-3 text-sm">
          {data.personalInfo.location} | {data.personalInfo.phone} | {data.personalInfo.email}
        </div>
      </header>

      <hr className="my-6"/>

       <main style={{ paddingLeft: '4px', paddingRight: '80px' }}>
        {renderMainContent('summary')}
        {renderMainContent('experience')}
        {renderMainContent('education')}
        {renderMainContent('skills')}
        {renderMainContent('projects')}
        {renderMainContent('languages')}
        {renderMainContent('volunteerExperience')}
        {renderMainContent('hobbies')}
      </main>
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => ({
    summary: () => (
      data.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold uppercase tracking-widest mb-3">Objective</h2>
          <p className="leading-relaxed text-justify">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience[0]?.company && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold uppercase tracking-widest mb-4">Professional Experience</h2>
          <div className="space-y-5">
            {data.experience.map((job, index) => (
              <div key={index}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-bold">{job.position}</h3>
                  <p className="text-sm font-light">
                    {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}
                  </p>
                </div>
                <p className="text-md italic">{job.company}</p>
                <ul className="mt-1 text-sm leading-normal list-disc list-inside">
                  {job.description && typeof job.description === 'string' ? 
                    job.description.split('\n').map((item, i) => <li key={i}>{item}</li>) :
                    <li>{JSON.stringify(job.description)}</li>
                  }
                </ul>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    education: () => (
      data.education && data.education[0]?.institution && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold uppercase tracking-widest mb-4">Education</h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold">{edu.institution}</h3>
                <p className="text-md">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</p>
                <p className="text-sm font-light">
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold uppercase tracking-widest mb-3">Skills</h2>
          <p className="leading-relaxed">{data.skills.map(skill => skill.name || skill).join(', ')}.</p>
        </section>
      )
    ),
    projects: () => (
      data.projects && data.projects[0]?.name && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold uppercase tracking-widest mb-4">Projects</h2>
          <div className="space-y-5">
            {data.projects.map((proj, index) => (
              <div key={index}>
                <h3 className="text-lg font-bold">{proj.name}</h3>
                {proj.technologies && <p className="text-md italic">{proj.technologies}</p>}
                <p className="mt-1 text-sm leading-normal">{proj.description}</p>
                {proj.link && <a href={proj.link} className="text-blue-600 hover:underline text-sm">{proj.link}</a>}
              </div>
            ))}
          </div>
        </section>
      )
    ),
    languages: () => (data.languages && data.languages.length > 0 && <LanguagesSection data={data.languages} className="mb-6" headingClassName="text-xl font-semibold uppercase tracking-widest mb-3" />),
    volunteerExperience: () => (data.volunteerExperience && data.volunteerExperience.length > 0 && <VolunteerExperienceSection data={data.volunteerExperience} className="mb-6" headingClassName="text-xl font-semibold uppercase tracking-widest mb-4" />),
    hobbies: () => (data.hobbies && data.hobbies.length > 0 && <HobbiesSection data={data.hobbies} className="mb-6" headingClassName="text-xl font-semibold uppercase tracking-widest mb-3" />),
  }),
  mainContentSections: ['summary', 'experience', 'education', 'skills', 'projects', 'languages', 'volunteerExperience', 'hobbies'],
  sidebarSections: [],
};

export default withDynamicSections(TraditionalTemplate, sectionConfig);
