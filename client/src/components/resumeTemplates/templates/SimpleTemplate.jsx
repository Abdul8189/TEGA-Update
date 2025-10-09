import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import CertificatesSection from '../common/CertificatesSection';
import ExtraCurricularActivitiesSection from '../common/ExtraCurricularActivitiesSection';
import { safeRenderText } from '../utils/safeRender.jsx';

const SimpleTemplate = ({ formData, renderMainContent }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Emily White',
      title: 'Graphic Designer',
      email: 'emily.white@example.com',
      phone: '(123) 555-0104',
      location: 'Portland, OR',
      linkedin: 'linkedin.com/in/emilywhitecreative',
      summary: 'A creative and versatile Graphic Designer with a strong foundation in visual communication and branding. Passionate about crafting clean, effective designs that resonate with audiences. Eager to contribute to a dynamic team and grow as a designer.'
    },
    experience: [
      {
        position: 'Freelance Graphic Designer',
        company: 'Self-Employed',
        location: 'Portland, OR',
        startDate: '2020',
        endDate: 'Present',
        description: 'Collaborated with various clients on branding projects, including logo design, marketing materials, and social media graphics. Managed projects from concept to completion, ensuring client satisfaction.'
      },
      {
        position: 'Design Intern',
        company: 'Portland Creative Co.',
        location: 'Portland, OR',
        startDate: '2019',
        endDate: '2020',
        description: 'Assisted senior designers with a variety of projects. Gained experience in client communication, project management, and industry-standard design software.'
      }
    ],
    education: [
      {
        degree: 'B.F.A. in Graphic Design',
        institution: 'Oregon State University',
        location: 'Corvallis, OR',
        startDate: '2015',
        endDate: '2019'
      }
    ],
    skills: [
      { id: 1, name: 'Adobe Creative Suite' },
      { id: 2, name: 'Branding & Identity' },
      { id: 3, name: 'Typography' },
      { id: 4, name: 'Layout Design' },
      { id: 5, name: 'Illustration' },
      { id: 6, name: 'Project Management' }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' }
    ],
    volunteerExperience: [],
    hobbies: ['Painting', 'Hiking', 'Photography'],
    certifications: [],
    extracurricularActivities: []
  };

  return (
    <div className="simple-template bg-white font-sans w-full" style={{
      padding: '20px',
      margin: '0 auto',
      maxWidth: '595px', // A4 width in pixels for PDF compatibility
      boxSizing: 'border-box'
    }}>
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-gray-600">{data.personalInfo.title}</p>
        <div className="text-sm text-gray-500 mt-2">
          <span>{data.personalInfo.email}</span> | 
          <span>{data.personalInfo.phone}</span> | 
          <span>{data.personalInfo.location}</span> | 
          <span>{data.personalInfo.linkedin}</span>
        </div>
      </header>

       <div style={{ paddingLeft: '4px', paddingRight: '80px' }}>
        {renderMainContent('summary')}
        {renderMainContent('experience')}
        {renderMainContent('education')}
        {renderMainContent('skills')}
        {renderMainContent('languages')}
        {renderMainContent('volunteerExperience')}
        {renderMainContent('hobbies')}
        {renderMainContent('certifications')}
        {renderMainContent('extracurricularActivities')}
      </div>
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => ({
    summary: () => (
      data.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Summary</h2>
          <p className="text-gray-600">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">{job.position}</h3>
              <p className="text-md text-gray-600">{job.company} | {job.startDate} - {job.endDate}</p>
              <p className="text-gray-500 mt-1">{safeRenderText(job.description)}</p>
            </div>
          ))}
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold text-gray-800">{edu.institution}</h3>
              <p className="text-md text-gray-600">{edu.degree}</p>
            </div>
          ))}
        </section>
      )
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Skills</h2>
          <p className="text-gray-600">{data.skills.map(skill => skill.name || skill).join(', ')}</p>
        </section>
      )
    ),
    languages: () => (data.languages && data.languages.length > 0 && <LanguagesSection data={data.languages} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 mb-2" />),
    volunteerExperience: () => (data.volunteerExperience && data.volunteerExperience.length > 0 && <VolunteerExperienceSection data={data.volunteerExperience} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 mb-2" />),
    hobbies: () => (data.hobbies && data.hobbies.length > 0 && <HobbiesSection data={data.hobbies} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 mb-2" />),
    certifications: () => (data.certifications && data.certifications.length > 0 && <CertificatesSection data={data.certifications} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 mb-2" />),
    extracurricularActivities: () => (data.extracurricularActivities && data.extracurricularActivities.length > 0 && <ExtraCurricularActivitiesSection data={data.extracurricularActivities} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 mb-2" />),
  }),
  mainContentSections: ['summary', 'experience', 'education', 'skills', 'languages', 'volunteerExperience', 'hobbies', 'certifications', 'extracurricularActivities'],
  sidebarSections: [],
};

export default withDynamicSections(SimpleTemplate, sectionConfig);
