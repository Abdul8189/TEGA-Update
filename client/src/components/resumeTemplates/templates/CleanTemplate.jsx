import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import AchievementsSection from '../common/AchievementsSection';

const CleanTemplate = ({ formData, renderMainContent, renderSidebar }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Sophia Rodriguez',
      title: 'Software Engineer',
      email: 'sophia.rodriguez@example.com',
      phone: '(123) 555-0106',
      location: 'Seattle, WA',
      linkedin: 'linkedin.com/in/sophiarodriguezdev',
      github: 'github.com/sophia-dev',
      summary: 'A results-oriented Software Engineer with 5 years of experience in full-stack web development. Passionate about writing clean, efficient, and maintainable code. Skilled in JavaScript, React, and Node.js. A collaborative team player dedicated to building high-quality software solutions.'
    },
    experience: [
      {
        position: 'Software Engineer',
        company: 'Tech Solutions LLC',
        location: 'Seattle, WA',
        startDate: '2019-06-01',
        endDate: '',
        current: true,
        description: 'Developed and maintained features for a large-scale SaaS application using React and Node.js. Collaborated with a team of engineers to improve application performance and scalability. Wrote unit and integration tests to ensure code quality.'
      },
      {
        position: 'Junior Developer',
        company: 'Web Innovators',
        location: 'Seattle, WA',
        startDate: '2017-05-01',
        endDate: '2019-05-31',
        current: false,
        description: 'Assisted in the development of client websites using HTML, CSS, and JavaScript. Gained experience with version control (Git) and agile development methodologies. Provided technical support to clients.'
      }
    ],
    education: [
      {
        degree: 'B.S. in Computer Science',
        institution: 'University of Washington',
        location: 'Seattle, WA',
        startDate: '2013-09-01',
        endDate: '2017-06-01'
      }
    ],
    skills: ['JavaScript (ES6+)', 'React', 'Node.js', 'Express', 'MongoDB', 'HTML & CSS', 'Git', 'Agile/Scrum'],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Conversational' }
    ],
    volunteerExperience: [],
    hobbies: ['Bouldering', 'Playing Guitar', 'Baking'],
    certifications: [],
    extracurricularActivities: []
  };

  return (
    <div className="clean-template bg-white min-h-[842px] w-full shadow-lg font-sans" style={{
      padding: '20px',
      margin: '0 auto',
      maxWidth: '595px', // A4 width in pixels for PDF compatibility
      boxSizing: 'border-box'
    }}>
      <header className="mb-8">
        <h1 className="text-4xl font-light text-gray-800 tracking-wider">{data.personalInfo.fullName}</h1>
        <p className="text-xl text-gray-500 mt-1">{data.personalInfo.title}</p>
      </header>

            <div className="grid grid-cols-12 gap-8">
        <aside className="col-span-3 space-y-6">
          {renderSidebar('contact')}
          {renderSidebar('skills')}
          {renderSidebar('languages')}
          {renderSidebar('volunteerExperience')}
          {renderSidebar('certifications')}
          {renderSidebar('extracurricularActivities')}
          {renderSidebar('hobbies')}
        </aside>
        <main className="col-span-9 space-y-6" style={{ paddingLeft: '4px', paddingRight: '80px' }}>
          {renderMainContent('summary')}
          {renderMainContent('experience')}
          {renderMainContent('education')}
        </main>
      </div>
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => ({
    contact: () => (
      <section>
        <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3">Contact</h2>
        <div className="text-gray-600 space-y-1">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          <p>{data.personalInfo.linkedin}</p>
          <p>{data.personalInfo.github}</p>
        </div>
      </section>
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3">Skills</h2>
          <ul className="text-gray-600 space-y-1">
            {data.skills.map((skill, index) => <li key={index}>{skill.name || skill}</li>)}
          </ul>
        </section>
      )
    ),
    languages: () => (
      data.languages && data.languages.length > 0 && (
        <LanguagesSection data={data.languages} headingClassName="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3" />
      )
    ),
    volunteerExperience: () => (
      data.volunteerExperience && data.volunteerExperience.length > 0 && (
        <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3" />
      )
    ),
    certifications: () => (
      data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3">Certifications</h2>
          <div className="text-gray-600 space-y-1">
            {data.certifications.map((cert, index) => (
              <div key={index} className="mb-2">
                <h3 className="font-medium text-gray-800">{cert.name}</h3>
                <p className="text-sm">{cert.issuer}, {cert.date}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    achievements: () => (
      data.achievements && data.achievements.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3">Achievements</h2>
          <div className="text-gray-600 space-y-1">
            {data.achievements.map((achievement, index) => (
              <div key={index} className="mb-2">
                <p className="text-sm">{typeof achievement.description === 'string' ? achievement.description : JSON.stringify(achievement.description)}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    extracurricularActivities: () => (
      data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3">Extracurriculars</h2>
          <div className="text-gray-600 space-y-1">
            {data.extracurricularActivities.map((activity, index) => (
              <div key={index} className="mb-2">
                <h3 className="font-medium text-gray-800">{activity.role} at {activity.organization}</h3>
                <p className="text-sm">{typeof activity.description === 'string' ? activity.description : JSON.stringify(activity.description)}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    hobbies: () => (
      data.hobbies && data.hobbies.length > 0 && (
        <HobbiesSection data={data.hobbies} headingClassName="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3" />
      )
    ),
    summary: () => (
      data.personalInfo.summary && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3">Summary</h2>
          <p className="text-gray-600 leading-relaxed">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3">Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-5">
              <h3 className="text-xl font-medium text-gray-800">{job.position}</h3>
              <p className="text-md text-gray-600">{job.company} | {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
              <p className="text-gray-500 mt-1">{typeof job.description === 'string' ? job.description : JSON.stringify(job.description)}</p>
            </div>
          ))}
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-700 uppercase tracking-widest mb-3">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index}>
              <h3 className="text-xl font-medium text-gray-800">{edu.institution}</h3>
              <p className="text-md text-gray-600">{edu.degree}</p>
            </div>
          ))}
        </section>
      )
    ),
  }),
  mainContentSections: ['summary', 'experience', 'education'],
  sidebarSections: ['contact', 'skills', 'languages', 'volunteerExperience', 'certifications', 'achievements', 'extracurricularActivities', 'hobbies'],
};

export default withDynamicSections(CleanTemplate, sectionConfig);
