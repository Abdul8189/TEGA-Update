import React from 'react';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import { fontOptions } from '../fontConfig';

const BoldTemplate = ({ formData, selectedFont = 'sansSerif' }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Liam Garcia',
      title: 'Marketing Director',
      email: 'liam.garcia@example.com',
      phone: '(123) 555-0105',
      location: 'Chicago, IL',
      linkedin: 'linkedin.com/in/liamgarciamarketing',
      summary: 'Dynamic and innovative Marketing Director with a proven track record of developing and executing successful marketing strategies that drive brand growth and revenue. Expert in digital marketing, campaign management, and market analysis. A natural leader who inspires teams to achieve outstanding results.'
    },
    experience: [
      {
        position: 'Marketing Director',
        company: 'Growth Solutions Inc.',
        location: 'Chicago, IL',
        startDate: '2017-03-01',
        endDate: '',
        current: true,
        description: 'Led a team of 15 marketing professionals to increase lead generation by 150% in two years. Launched a multi-channel brand awareness campaign that boosted market share by 10%. Oversaw a marketing budget of $5M, optimizing spend for maximum ROI.'
      },
      {
        position: 'Marketing Manager',
        company: 'Digital Drive Agency',
        location: 'Chicago, IL',
        startDate: '2014-06-01',
        endDate: '2017-02-28',
        current: false,
        description: 'Managed digital marketing campaigns across SEO, PPC, and social media. Analyzed campaign performance and provided data-driven recommendations for improvement. Grew website traffic by 80% through strategic content marketing.'
      }
    ],
    education: [
      {
        degree: 'B.S. in Marketing',
        institution: 'University of Illinois Urbana-Champaign',
        location: 'Champaign, IL',
        startDate: '2010-09-01',
        endDate: '2014-05-01'
      }
    ],
    skills: ['Digital Strategy', 'Brand Management', 'Lead Generation', 'SEO/SEM', 'Content Marketing', 'Marketing Analytics', 'Team Leadership'],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Spanish', proficiency: 'Professional Working Proficiency' }
    ],
    volunteerExperience: [],
    hobbies: ['Creative Writing', 'Urban Exploration', 'Film Photography'],
    certifications: [],
    extracurricularActivities: []
  };

  const selectedFontConfig = fontOptions[selectedFont] || fontOptions.sansSerif;
  
  return (
    <div 
      className="bold-template bg-gray-900 text-white min-h-[842px] w-full shadow-2xl p-8 border-4 border-yellow-400 mx-2 my-2"
      style={{ fontFamily: selectedFontConfig.fontFamily }}
    >
      <header className="text-center mb-8 border-b-2 border-yellow-400 pb-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-white mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-2xl text-yellow-400 font-bold">{data.personalInfo.title}</p>
        <div className="w-24 h-1 bg-yellow-400 mx-auto mt-4"></div>
      </header>

       <div className="grid grid-cols-1 md:grid-cols-4 gap-8" style={{ paddingLeft: '4px', paddingRight: '80px' }}>
        {/* Main Content - 3 columns */}
        <div className="md:col-span-3 space-y-6">
          {/* Summary */}
          {data.personalInfo.summary && (
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-3">Summary</h2>
              <p className="text-gray-300 leading-relaxed">{data.personalInfo.summary}</p>
            </section>
          )}

          {/* Experience */}
          {data.experience && data.experience.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-3">Experience</h2>
              {data.experience.map((job, index) => (
                <div key={index} className="mb-5">
                  <h3 className="text-xl font-semibold text-white">{job.position}</h3>
                  <p className="text-lg text-gray-400">{job.company} | {job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString() : ''}</p>
                  <p className="text-gray-300 mt-1">{job.description}</p>
                </div>
              ))}
            </section>
          )}

          {/* Education */}
          {data.education && data.education.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-3">Education</h2>
              {data.education.map((edu, index) => (
                <div key={index}>
                  <h3 className="text-xl font-semibold text-white">{edu.institution}</h3>
                  <p className="text-lg text-gray-400">{edu.degree}</p>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Sidebar - 1 column */}
        <div className="md:col-span-1 space-y-6">
          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-3">Contact</h2>
            <div className="text-gray-300 space-y-2">
              <p>{data.personalInfo.email}</p>
              <p>{data.personalInfo.phone}</p>
              <p>{data.personalInfo.location}</p>
              <p>{data.personalInfo.linkedin}</p>
            </div>
          </section>

          {/* Skills */}
          {data.skills && data.skills.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-3">Skills</h2>
              <ul className="space-y-2">
                {data.skills.map((skill, index) => (
                  <li key={index} className="bg-yellow-400 text-gray-900 font-semibold px-3 py-1 rounded">{skill.name || skill}</li>
                ))}
              </ul>
            </section>
          )}

          {/* Languages */}
          {data.languages && data.languages.length > 0 && (
            <LanguagesSection 
              data={data.languages} 
              headingClassName="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-3" 
            />
          )}

          {/* Volunteer Experience */}
          {data.volunteerExperience && data.volunteerExperience.length > 0 && (
            <VolunteerExperienceSection 
              data={data.volunteerExperience} 
              headingClassName="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-3" 
            />
          )}

          {/* Hobbies */}
          {data.hobbies && data.hobbies.length > 0 && (
            <HobbiesSection 
              data={data.hobbies} 
              headingClassName="text-2xl font-bold text-yellow-400 uppercase tracking-wider mb-3" 
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BoldTemplate;
