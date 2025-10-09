import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import AchievementsSection from '../common/AchievementsSection';

const ChronologicalTemplate = ({ formData, renderMainContent }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'James Anderson',
      title: 'Civil Engineer',
      email: 'james.anderson@example.com',
      phone: '(123) 555-0113',
      location: 'Houston, TX',
      linkedin: 'linkedin.com/in/jamesandersonce',
      summary: 'A licensed Civil Engineer with 10 years of experience in infrastructure projects, including highway design and water resource management. Proficient in AutoCAD, Civil 3D, and project management software. Committed to delivering high-quality, sustainable, and cost-effective engineering solutions.'
    },
    experience: [
      {
        position: 'Senior Civil Engineer',
        company: 'Innova Engineering',
        location: 'Houston, TX',
        startDate: '2018-02-01',
        endDate: '',
        current: true,
        description: 'Led the design and management of large-scale transportation projects. Conducted site inspections and ensured compliance with safety and regulatory standards. Mentored junior engineers.'
      },
      {
        position: 'Civil Engineer',
        company: 'TerraBuild Corp',
        location: 'Dallas, TX',
        startDate: '2013-06-01',
        endDate: '2018-01-31',
        current: false,
        description: 'Assisted in the design and analysis of various civil engineering projects. Prepared technical reports and construction documents. Collaborated with multidisciplinary teams.'
      }
    ],
    education: [
      {
        degree: 'M.S. in Civil Engineering',
        institution: 'Texas A&M University',
        location: 'College Station, TX',
        startDate: '2011-08-01',
        endDate: '2013-05-01'
      },
      {
        degree: 'B.S. in Civil Engineering',
        institution: 'University of Houston',
        location: 'Houston, TX',
        startDate: '2007-08-01',
        endDate: '2011-05-01'
      }
    ],
    skills: ['Highway Design', 'AutoCAD Civil 3D', 'Project Management', 'Stormwater Management', 'Structural Analysis', 'Geotechnical Engineering'],
    certifications: [
      { name: 'Professional Engineer (PE)', issuer: 'Texas Board of Professional Engineers', date: '2015' }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Basic' }
    ],
    volunteerExperience: [],
    hobbies: ['Woodworking', 'Fishing', 'Reading History'],
    extracurricularActivities: []
  };

  return (
    <div className="chronological-template bg-white min-h-[842px] w-[595px] mx-auto shadow-lg p-8 font-serif">
      <header className="text-center mb-6 pb-4 border-b-2 border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800">{data.personalInfo.fullName}</h1>
        <p className="text-xl text-gray-600 mt-1">{data.personalInfo.title}</p>
        <div className="text-sm text-gray-500 mt-2">
          <span>{data.personalInfo.email}</span> | <span>{data.personalInfo.phone}</span> | <span>{data.personalInfo.linkedin}</span>
        </div>
      </header>

      <main className="space-y-6">
        {renderMainContent('summary')}
        {renderMainContent('experience')}
        {renderMainContent('education')}
        {renderMainContent('skills')}
        {renderMainContent('certifications')}
        {renderMainContent('extracurricularActivities')}
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
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-2">Summary</h2>
          <p className="text-gray-600 leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-3">Work Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-semibold text-gray-800">{job.position}</h3>
                <p className="text-sm text-gray-500">{job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
              </div>
              <p className="text-md text-gray-600">{job.company}, {job.location}</p>
              <p className="text-gray-500 mt-1">{typeof job.description === 'string' ? job.description : JSON.stringify(job.description)}</p>
            </div>
          ))}
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-3">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-2">
               <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                <p className="text-sm text-gray-500">{edu.startDate ? new Date(edu.startDate).toLocaleDateString() : ''} - {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : ''}</p>
              </div>
              <p className="text-md text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </section>
      )
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-3">Skills</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {data.skills.map((skill, index) => <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm">{skill.name || skill}</span>)}
          </div>
        </section>
      )
    ),
    certifications: () => (
      data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-3">Certifications</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{cert.name}</h3>
              <p className="text-md text-gray-600">{cert.issuer}, {cert.date}</p>
            </div>
          ))}
        </section>
      )
    ),
    achievements: () => (
      data.achievements && data.achievements.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-3">Achievements</h2>
          {data.achievements.map((achievement, index) => (
            <div key={index} className="mb-2">
              <p className="text-gray-700">{typeof achievement.description === 'string' ? achievement.description : JSON.stringify(achievement.description)}</p>
            </div>
          ))}
        </section>
      )
    ),
    extracurricularActivities: () => (
      data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-700 mb-3">Extracurricular Activities</h2>
          {data.extracurricularActivities.map((activity, index) => (
            <div key={index} className="mb-2">
              <h3 className="text-lg font-semibold text-gray-800">{activity.role} at {activity.organization}</h3>
              <p className="text-gray-500 mt-1">{typeof activity.description === 'string' ? activity.description : JSON.stringify(activity.description)}</p>
            </div>
          ))}
        </section>
      )
    ),
    languages: () => (
      data.languages && data.languages.length > 0 && (
        <LanguagesSection data={data.languages} headingClassName="text-xl font-bold text-gray-700 mb-3" />
      )
    ),
    volunteerExperience: () => (
      data.volunteerExperience && data.volunteerExperience.length > 0 && (
        <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-xl font-bold text-gray-700 mb-3" />
      )
    ),
    hobbies: () => (
      data.hobbies && data.hobbies.length > 0 && (
        <HobbiesSection data={data.hobbies} headingClassName="text-xl font-bold text-gray-700 mb-3" />
      )
    ),
  }),
  mainContentSections: ['summary', 'experience', 'education', 'skills', 'certifications', 'achievements', 'extracurricularActivities', 'languages', 'volunteerExperience', 'hobbies'],
  sidebarSections: [],
};

export default withDynamicSections(ChronologicalTemplate, sectionConfig);
