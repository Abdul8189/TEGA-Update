import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';

const ElegantTemplate = ({ formData, renderMainContent, renderSidebar }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Isabella Rossi',
      title: 'Event Planner & Coordinator',
      email: 'isabella.rossi@example.com',
      phone: '(123) 555-0109',
      location: 'Paris, France',
      linkedin: 'linkedin.com/in/isabellarossievents',
      summary: 'A highly organized and creative Event Planner with a passion for creating unforgettable experiences. With over 7 years of experience managing a wide range of events, from corporate conferences to luxury weddings, Isabella excels at bringing a client\'s vision to life. Known for her impeccable attention to detail, calm demeanor under pressure, and a flair for sophisticated design.'
    },
    experience: [
      {
        position: 'Lead Event Planner',
        company: 'Prestige Events',
        location: 'Paris, France',
        startDate: '2017-03-01',
        endDate: '',
        current: true,
        description: 'Managed end-to-end planning and execution of high-profile corporate events and luxury weddings. Cultivated strong relationships with vendors to ensure seamless execution. Consistently received outstanding client feedback.'
      },
      {
        position: 'Event Coordinator',
        company: 'Chic Gatherings',
        location: 'Milan, Italy',
        startDate: '2014-06-01',
        endDate: '2017-02-28',
        current: false,
        description: 'Assisted in the planning and coordination of various events. Managed event logistics, including venue selection, catering, and entertainment. Gained valuable experience in budget management and client relations.'
      }
    ],
    education: [
      {
        degree: 'Diploma in Event Management',
        institution: 'Swiss Hotel Management School',
        location: 'Montreux, Switzerland',
        startDate: '2013-09-01',
        endDate: '2014-07-01'
      }
    ],
    skills: ['Event Planning & Management', 'Vendor Negotiation', 'Budget Management', 'Client Relations', 'Creative Design', 'Logistics Coordination', 'Problem Solving'],
    languages: [
      { name: 'Italian', proficiency: 'Native' },
      { name: 'English', proficiency: 'Fluent' },
      { name: 'French', proficiency: 'Professional' }
    ],
    volunteerExperience: [],
    hobbies: ['Classical Music', 'Art History', 'Wine Tasting'],
    certifications: [],
    extracurricularActivities: []
  };

  return (
    <div className="elegant-template bg-gray-50 p-10 font-serif w-full mx-2 my-2">
            {renderMainContent('header')}
      <main>
        {renderMainContent('summary')}
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-9 space-y-8" style={{ paddingLeft: '4px', paddingRight: '80px' }}>
            {renderMainContent('experience')}
            {renderMainContent('education')}
          </div>
          <aside className="col-span-3 space-y-8">
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
      <header className="text-center mb-10 pb-4 border-b border-gray-300">
        <h1 className="text-4xl font-bold text-gray-800 tracking-widest">{data.personalInfo.fullName}</h1>
        <p className="text-xl text-gray-500 mt-2 italic">{data.personalInfo.title}</p>
      </header>
    ),
    summary: () => (
      data.personalInfo.summary && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 text-center mb-4">- Summary -</h2>
          <p className="text-gray-600 text-center leading-relaxed max-w-2xl mx-auto">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-6">
              <h3 className="text-xl font-bold text-gray-800">{job.position}</h3>
              <p className="text-lg text-gray-600">{job.company} | {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
              <p className="text-gray-500 mt-2">{job.description}</p>
            </div>
          ))}
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index}>
              <h3 className="text-xl font-bold text-gray-800">{edu.institution}</h3>
              <p className="text-lg text-gray-600">{edu.degree}</p>
            </div>
          ))}
        </section>
      )
    ),
    contact: () => (
      <section>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Contact</h2>
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Skills</h2>
          <ul className="text-gray-600 space-y-2">
            {data.skills.map((skill, index) => (
              <li key={index}>{skill.name || skill}</li>
            ))}
          </ul>
        </section>
      )
    ),
    languages: () => <LanguagesSection data={data.languages} headingClassName="text-2xl font-semibold text-gray-700 mb-4" />,
    volunteerExperience: () => <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-2xl font-semibold text-gray-700 mb-4" />,
    certifications: () => (
      data.certifications && data.certifications.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Certifications</h2>
          <div className="text-gray-600 space-y-2">
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
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Extracurriculars</h2>
          <div className="text-gray-600 space-y-2">
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
    hobbies: () => <HobbiesSection data={data.hobbies} headingClassName="text-2xl font-semibold text-gray-700 mb-4" />,
  }),
  mainContentSections: ['header', 'summary', 'experience', 'education'],
  sidebarSections: ['contact', 'skills', 'languages', 'volunteerExperience', 'certifications', 'extracurricularActivities', 'hobbies'],
};

export default withDynamicSections(ElegantTemplate, sectionConfig);
