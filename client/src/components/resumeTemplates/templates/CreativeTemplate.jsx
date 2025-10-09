import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import CertificatesSection from '../common/CertificatesSection';
import AchievementsSection from '../common/AchievementsSection';
import ExtraCurricularActivitiesSection from '../common/ExtraCurricularActivitiesSection';

const CreativeTemplate = ({ formData, renderMainContent, renderSidebar }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Aria Montgomery',
      title: 'Digital Artist & Illustrator',
      email: 'aria.montgomery@example.com',
      phone: '(123) 555-0107',
      location: 'Los Angeles, CA',
      portfolio: 'artstation.com/aria',
      instagram: 'instagram.com/aria_draws',
      summary: 'A passionate and imaginative digital artist with a flair for storytelling through illustration. Specializes in character design and concept art for games and animation. Thrives in collaborative environments, bringing creative visions to life with a unique artistic style.'
    },
    experience: [
      {
        position: 'Character Designer',
        company: 'DreamWeaver Studios',
        location: 'Los Angeles, CA',
        startDate: '2018-05-01',
        endDate: '',
        current: true,
        description: 'Designed memorable characters for several successful mobile games. Collaborated with writers and animators to develop character personalities and story arcs. Created detailed concept art and turnarounds for 3D modelers.'
      },
      {
        position: 'Freelance Illustrator',
        company: 'Self-Employed',
        location: 'Remote',
        startDate: '2016-01-01',
        endDate: '',
        current: true,
        description: 'Worked with a diverse range of clients on projects including book covers, editorial illustrations, and branding. Managed all aspects of the freelance business, from client communication to final delivery.'
      }
    ],
    education: [
      {
        degree: 'B.F.A. in Illustration',
        institution: 'ArtCenter College of Design',
        location: 'Pasadena, CA',
        startDate: '2012-09-01',
        endDate: '2016-05-01'
      }
    ],
    skills: [
      { id: 1, name: 'Character Design' },
      { id: 2, name: 'Concept Art' },
      { id: 3, name: 'Digital Painting' },
      { id: 4, name: 'Adobe Photoshop' },
      { id: 5, name: 'Procreate' },
      { id: 6, name: 'Storyboarding' },
      { id: 7, name: 'Color Theory' },
      { id: 8, name: 'Anatomy' }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Japanese', proficiency: 'Basic' }
    ],
    volunteerExperience: [],
    hobbies: ['Sketching', 'Creative Writing', 'Video Games'],
        certifications: [
      {
        name: 'Adobe Certified Expert - Photoshop',
        issuer: 'Adobe',
        date: '2022-03-15'
      }
    ],
    achievements: [
      'Featured Artist, "Digital Dreams" Gallery, 2023',
      'Winner, "Create a Character" Contest, ArtStation'
    ],
    extraCurricularActivities: [
      {
        title: 'Workshop Host',
        organization: 'LA Art Collective',
        startDate: '2022-01-01',
        endDate: '',
        current: true,
        description: 'Hosted monthly workshops on digital painting techniques.'
      }
    ]
  };

  return (
    <div className="creative-template bg-gray-50 min-h-[842px] w-full shadow-lg p-8 font-sans mx-2 my-2">
            {renderMainContent('header')}
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3 space-y-6">
          {renderSidebar('contact')}
          {renderSidebar('skills')}
          {renderSidebar('languages')}
          {renderSidebar('volunteerExperience')}
          {renderSidebar('hobbies')}
          {renderSidebar('certifications')}
          {renderSidebar('achievements')}
          {renderSidebar('extraCurricularActivities')}
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
    header: () => (
      <header className="text-center mb-8 relative">
        <div className="inline-block bg-purple-500 text-white rounded-full p-4 shadow-lg">
          <h1 className="text-4xl font-bold">{data.personalInfo.fullName}</h1>
        </div>
        <p className="text-xl text-gray-700 mt-4 italic">{data.personalInfo.title}</p>
      </header>
    ),
    contact: () => (
      <section className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-purple-600 mb-2">Contact</h2>
        <div className="text-gray-600 text-sm space-y-1">
          <p>{data.personalInfo.email}</p>
          <p>{data.personalInfo.phone}</p>
          <p>{data.personalInfo.location}</p>
          <p>{data.personalInfo.portfolio}</p>
          <p>{data.personalInfo.instagram}</p>
        </div>
      </section>
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-purple-600 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{skill.name || skill}</span>
            ))}
          </div>
        </section>
      )
    ),
    languages: () => <LanguagesSection data={data.languages} className="bg-white p-4 rounded-lg shadow" headingClassName="text-lg font-semibold text-purple-600 mb-2" />,
    volunteerExperience: () => <VolunteerExperienceSection data={data.volunteerExperience} className="bg-white p-4 rounded-lg shadow" headingClassName="text-lg font-semibold text-purple-600 mb-2" />,
    hobbies: () => <HobbiesSection data={data.hobbies} className="bg-white p-4 rounded-lg shadow" headingClassName="text-lg font-semibold text-purple-600 mb-2" />,
    certifications: () => data.certifications && data.certifications.length > 0 && <CertificatesSection data={data.certifications} className="bg-white p-4 rounded-lg shadow" headingClassName="text-lg font-semibold text-purple-600 mb-2" />,
    achievements: () => data.achievements && data.achievements.length > 0 && <AchievementsSection data={data.achievements} className="bg-white p-4 rounded-lg shadow" headingClassName="text-lg font-semibold text-purple-600 mb-2" />,
    extracurricularActivities: () => data.extracurricularActivities && data.extracurricularActivities.length > 0 && <ExtraCurricularActivitiesSection data={data.extracurricularActivities} className="bg-white p-4 rounded-lg shadow" headingClassName="text-lg font-semibold text-purple-600 mb-2" />,
    summary: () => (
      data.personalInfo.summary && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">About Me</h2>
          <p className="text-gray-700 leading-relaxed bg-white p-4 rounded-lg shadow">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Experience</h2>
          <div className="space-y-4">
            {data.experience.map((job, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-xl font-semibold text-gray-900">{job.position}</h3>
                <p className="text-md text-gray-600">{job.company} | {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
                <p className="text-gray-500 mt-2">{job.description}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Education</h2>
          <div className="bg-white p-4 rounded-lg shadow">
            {data.education.map((edu, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-gray-900">{edu.institution}</h3>
                <p className="text-md text-gray-600">{edu.degree}</p>
              </div>
            ))}
          </div>
        </section>
      )
    ),
  }),
  mainContentSections: ['header', 'summary', 'experience', 'education'],
  sidebarSections: ['contact', 'skills', 'languages', 'volunteerExperience', 'hobbies', 'certifications', 'achievements', 'extracurricularActivities'],
};

export default withDynamicSections(CreativeTemplate, sectionConfig);
