import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';

const CompactTemplate = ({ formData, renderMainContent, renderSidebar }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Chloe Davis',
      title: 'UX/UI Designer',
      email: 'chloe.davis@example.com',
      phone: '(123) 555-0103',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/chloedavisux',
      summary: 'Creative and detail-oriented UX/UI Designer with a passion for creating intuitive and engaging user experiences. Proficient in all stages of the design process, from user research to high-fidelity prototyping. Strong collaborator with a knack for translating complex requirements into simple, elegant solutions.'
    },
    experience: [
      {
        position: 'UX/UI Designer',
        company: 'Digital Creations',
        location: 'Austin, TX',
        startDate: '2019-07-01',
        endDate: '',
        current: true,
        description: 'Led the redesign of a major e-commerce platform, resulting in a 25% increase in conversion rates. Conducted user research and usability testing to inform design decisions. Created wireframes, mockups, and interactive prototypes.'
      },
      {
        position: 'Junior Web Designer',
        company: 'Creative Agency',
        location: 'Austin, TX',
        startDate: '2017-06-01',
        endDate: '2019-06-30',
        current: false,
        description: 'Designed and developed websites for a variety of clients. Collaborated with developers to ensure seamless implementation of designs. Assisted with branding and graphic design projects.'
      }
    ],
    education: [
      {
        degree: 'B.A. in Graphic Design',
        institution: 'Texas State University',
        location: 'San Marcos, TX',
        startDate: '2013-09-01',
        endDate: '2017-05-01'
      }
    ],
    skills: ['User Research', 'Wireframing', 'Prototyping', 'Figma', 'Sketch', 'Adobe XD', 'HTML/CSS', 'Agile Methodologies'],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'French', proficiency: 'Basic' }
    ],
    volunteerExperience: [],
    hobbies: ['Illustration', 'Pottery', 'Yoga']
  };

  return (
    <div className="compact-template bg-white min-h-[842px] w-[595px] mx-auto shadow-lg p-6 font-sans text-sm">
      <header className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{data.personalInfo.fullName}</h1>
          <p className="text-md text-gray-600">{data.personalInfo.title}</p>
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          <p>{data.personalInfo.linkedin}</p>
        </div>
      </header>

            {renderMainContent('summary')}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">
          {renderMainContent('experience')}
          {renderMainContent('education')}
        </div>
        <div className="space-y-4">
          {renderSidebar('skills')}
          {renderSidebar('languages')}
          {renderSidebar('volunteerExperience')}
          {renderSidebar('certifications')}
          {renderSidebar('extracurricularActivities')}
          {renderSidebar('hobbies')}
        </div>
      </div>
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => ({
    summary: () => (
      data.personalInfo.summary && (
        <section className="mb-4">
          <p className="text-gray-700">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-2">Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-semibold text-gray-900">{job.position} at {job.company}</h3>
              <p className="text-xs text-gray-500">{job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
              <p className="text-gray-600 mt-1">{job.description}</p>
            </div>
          ))}
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-2">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index}>
              <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
              <p className="text-gray-600">{edu.degree}</p>
            </div>
          ))}
        </section>
      )
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-2">Skills</h2>
          <ul className="list-disc list-inside">
            {data.skills.map((skill, index) => <li key={index} className="text-gray-700">{skill.name || skill}</li>)}
          </ul>
        </section>
      )
    ),
    languages: () => (
      data.languages && data.languages.length > 0 && (
        <LanguagesSection data={data.languages} headingClassName="text-lg font-bold text-gray-800 border-b pb-1 mb-2" />
      )
    ),
    volunteerExperience: () => (
      data.volunteerExperience && data.volunteerExperience.length > 0 && (
        <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-lg font-bold text-gray-800 border-b pb-1 mb-2" />
      )
    ),
    certifications: () => (
      data.certifications && data.certifications.length > 0 && data.certifications[0].name && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-2">Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <h3 className="font-semibold text-gray-900">{cert.name}</h3>
              <p className="text-xs text-gray-500">{cert.issuer}, {cert.date}</p>
            </div>
          ))}
        </section>
      )
    ),
    extracurricularActivities: () => (
      data.extracurricularActivities && data.extracurricularActivities.length > 0 && data.extracurricularActivities[0].organization && (
        <section>
          <h2 className="text-lg font-bold text-gray-800 border-b pb-1 mb-2">Extracurriculars</h2>
          {data.extracurricularActivities.map((activity, index) => (
            <div key={index} className="mb-2">
              <h3 className="font-semibold text-gray-900">{activity.role} at {activity.organization}</h3>
              <p className="text-xs text-gray-500">{activity.description}</p>
            </div>
          ))}
        </section>
      )
    ),
    hobbies: () => (
      data.hobbies && data.hobbies.length > 0 && (
        <HobbiesSection data={data.hobbies} headingClassName="text-lg font-bold text-gray-800 border-b pb-1 mb-2" />
      )
    ),
  }),
  mainContentSections: ['summary', 'experience', 'education'],
  sidebarSections: ['skills', 'languages', 'volunteerExperience', 'certifications', 'extracurricularActivities', 'hobbies'],
};

export default withDynamicSections(CompactTemplate, sectionConfig);
