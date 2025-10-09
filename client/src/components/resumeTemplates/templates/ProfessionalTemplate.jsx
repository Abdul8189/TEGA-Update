import React from 'react';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import CertificatesSection from '../common/CertificatesSection';
import AchievementsSection from '../common/AchievementsSection';
import ExtraCurricularActivitiesSection from '../common/ExtraCurricularActivitiesSection';

const ProfessionalTemplate = ({ formData }) => {
  // Always use the formData passed from the resume builder
  const data = formData || {
    personalInfo: {
      fullName: 'Dr. Emily Watson',
      title: 'Senior Marketing Director',
      email: 'emily.watson@email.com',
      phone: '(555) 246-8135',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/emilywatson-marketing',
      summary: 'Results-driven marketing executive with 12+ years of experience leading global marketing initiatives for Fortune 500 companies. Expert in brand strategy, digital transformation, and cross-functional team leadership. Proven track record of increasing revenue by 150% and market share by 40% through innovative marketing campaigns.'
    },
    experience: [
      {
        position: 'Senior Marketing Director',
        company: 'Procter & Gamble',
        startDate: '2020-04-01',
        endDate: '',
        current: true,
        description: 'Lead global marketing strategy for $2B+ consumer goods portfolio across 50+ markets\nDeveloped and executed integrated marketing campaigns generating $500M+ in incremental revenue\nManaged cross-functional team of 25+ marketing professionals across digital, brand, and content marketing\nEstablished data-driven marketing framework improving campaign ROI by 60% and customer acquisition cost by 35%\nSpearheaded digital transformation initiative modernizing marketing technology stack and processes'
      },
      {
        position: 'Marketing Director',
        company: 'Unilever',
        startDate: '2017-06-01',
        endDate: '2020-03-31',
        current: false,
        description: 'Led brand repositioning for flagship product line increasing market share by 25% in competitive category\nDeveloped and launched successful influencer marketing program reaching 10M+ consumers across social platforms\nImplemented marketing automation platform increasing lead conversion rates by 45% and reducing cost per acquisition by 30%\nCollaborated with R&D team to launch 8 new products, generating $150M in first-year revenue\nManaged $50M annual marketing budget with 95% accuracy in forecasting and budget allocation'
      },
      {
        position: 'Senior Brand Manager',
        company: 'Coca-Cola Company',
        startDate: '2014-08-01',
        endDate: '2017-05-31',
        current: false,
        description: 'Managed brand portfolio worth $800M+ in annual revenue across North American markets\nDeveloped and executed seasonal marketing campaigns increasing brand awareness by 40% and sales by 20%\nLed cross-functional teams including creative, media, and sales to deliver integrated marketing solutions\nConducted comprehensive market research and competitive analysis informing strategic business decisions\nEstablished key performance indicators and reporting systems improving marketing measurement and optimization'
      }
    ],
    education: [
      {
        degree: 'Master of Business Administration',
        field: 'Marketing & Strategy',
        institution: 'Harvard Business School',
        startDate: '2012-09-01',
        endDate: '2014-05-01',
        current: false,
        gpa: '3.9'
      },
      {
        degree: 'Bachelor of Science',
        field: 'Business Administration',
        institution: 'University of Pennsylvania, Wharton School',
        startDate: '2008-09-01',
        endDate: '2012-05-01',
        current: false,
        gpa: '3.8'
      }
    ],
    skills: [
      { id: 1, name: 'Strategic Planning' },
      { id: 2, name: 'Brand Development' },
      { id: 3, name: 'Digital Marketing' },
      { id: 4, name: 'Team Leadership' },
      { id: 5, name: 'Market Research' },
      { id: 6, name: 'Content Strategy' },
      { id: 7, name: 'Social Media Marketing' },
      { id: 8, name: 'SEO/SEM' },
      { id: 9, name: 'Marketing Analytics' },
      { id: 10, name: 'CRM Management' },
      { id: 11, name: 'Budget Management' },
      { id: 12, name: 'Stakeholder Relations' }
    ],
    projects: [
      {
        name: 'Global Brand Transformation Initiative',
        description: 'Led comprehensive brand transformation for P&G\'s flagship product line, resulting in 40% increase in brand equity and 25% growth in market share across 30+ countries',
        technologies: 'Brand Strategy, Market Research, Digital Marketing, Creative Development',
        link: 'https://www.pg.com/brand-transformation-case-study'
      },
      {
        name: 'AI-Powered Marketing Automation Platform',
        description: 'Spearheaded development and implementation of AI-driven marketing automation system, improving campaign personalization by 70% and customer engagement by 50%',
        technologies: 'Marketing Automation, AI/ML, Data Analytics, CRM Integration',
        link: 'https://www.unilever.com/ai-marketing-automation'
      }
    ],
    languages: [
        { name: 'English', proficiency: 'Native' },
        { name: 'Spanish', proficiency: 'Fluent' },
        { name: 'French', proficiency: 'Professional' }
    ],
    volunteerExperience: [
      {
        role: 'Marketing Strategy Advisor',
        organization: 'Women in Marketing Foundation',
        startDate: '2021-01-01',
        endDate: '',
        current: true,
        description: 'Provide strategic marketing guidance to 20+ women-led startups, helping them develop go-to-market strategies and secure $5M+ in funding. Mentored 15+ junior marketing professionals.'
      },
      {
        role: 'Board Member',
        organization: 'Marketing for Good',
        startDate: '2019-06-01',
        endDate: '',
        current: true,
        description: 'Serve on board of non-profit organization providing pro-bono marketing services to social impact organizations. Led initiatives that helped 50+ organizations increase their reach by 200%.'
      }
    ],
    hobbies: ['Marathon Running', 'Wine Tasting', 'Travel Photography', 'Chess'],
    certifications: [
      {
        name: 'Certified Marketing Management Professional (CMMP)',
        issuer: 'American Marketing Association',
        date: '2023-02-15'
      },
      {
        name: 'Google Analytics Certified',
        issuer: 'Google',
        date: '2022-11-20'
      },
      {
        name: 'HubSpot Marketing Software Certification',
        issuer: 'HubSpot',
        date: '2022-08-10'
      }
    ],
    achievements: [
      {
        description: 'Keynote Speaker at 2023 Global Marketing Innovation Summit, presenting to 2,000+ industry professionals'
      },
      {
        description: 'Forbes 30 Under 30 in Marketing & Advertising (2022)'
      },
      {
        description: 'Marketing Excellence Award from American Marketing Association for outstanding campaign performance'
      },
      {
        description: 'Led team that won 3 Cannes Lions awards for creative marketing campaigns'
      }
    ],
    extraCurricularActivities: [
      {
        title: 'President',
        organization: 'New York Marketing Association',
        startDate: '2021-01-01',
        endDate: '',
        current: true,
        description: 'Lead strategic planning and event organization for 1,000+ member professional association. Organized 12+ annual conferences and networking events.'
      },
      {
        title: 'Advisory Board Member',
        organization: 'Columbia Business School Marketing Program',
        startDate: '2020-09-01',
        endDate: '',
        current: true,
        description: 'Provide industry insights and guidance to MBA students. Mentor 20+ students annually and participate in curriculum development.'
      }
    ]
  };

  return (
    <div className="professional-template bg-white min-h-[842px] w-full shadow-lg" style={{
      padding: '20px',
      margin: '0 auto',
      maxWidth: '595px', // A4 width in pixels for PDF compatibility
      boxSizing: 'border-box'
    }}>
      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{data.personalInfo.fullName}</h1>
            <p className="text-xl text-gray-600 mt-1">{data.personalInfo.title}</p>
          </div>
          <div className="mt-3 md:mt-0 text-right">
            <div className="text-sm text-gray-600">{data.personalInfo.email}</div>
            <div className="text-sm text-gray-600">{data.personalInfo.phone}</div>
            <div className="text-sm text-gray-600">{data.personalInfo.location}</div>
            <div className="text-sm text-gray-600">{data.personalInfo.linkedin}</div>
          </div>
        </div>
      </header>

      {/* Two-column layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Main content */}
        <div className="md:w-2/3" style={{ paddingLeft: '4px', paddingRight: '80px' }}>
          <div className="space-y-6">
            {/* Summary */}
            {data.personalInfo.summary && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
              </section>
            )}

            {/* Experience */}
            {data.experience && data.experience.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider">Professional Experience</h2>
                <div className="space-y-4">
                  {data.experience.map((exp, index) => (
                    <div key={exp.id || index} className="border-l-4 border-gray-800 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{exp.position}</h3>
                          <p className="text-gray-600 font-medium">{exp.company}</p>
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {exp.startDate && exp.endDate && ' - '}
                          {exp.current ? 'Present' : (exp.endDate && new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Education */}
            {data.education && data.education.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider">Education</h2>
                <div className="space-y-4">
                  {data.education.map((edu, index) => (
                    <div key={edu.id || index} className="border-l-4 border-gray-800 pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800">{edu.degree} in {edu.field}</h3>
                          <p className="text-gray-600 font-medium">{edu.institution}</p>
                          {edu.gpa && <p className="text-gray-500 text-sm">GPA: {edu.gpa}</p>}
                        </div>
                        <div className="text-sm text-gray-500 text-right">
                          {edu.startDate && new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          {edu.startDate && edu.endDate && ' - '}
                          {edu.current ? 'Present' : (edu.endDate && new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:w-1/3">
          <div className="space-y-6">
            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, index) => (
                    <span key={skill.id || index} className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                      {skill.name}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Languages */}
            {data.languages && data.languages.length > 0 && (
              <LanguagesSection data={data.languages} headingClassName="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider" />
            )}

            {/* Volunteer Experience */}
            {data.volunteerExperience && data.volunteerExperience.length > 0 && (
              <VolunteerExperienceSection data={data.volunteerExperience} headingClassName="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider" />
            )}

            {/* Hobbies */}
            {data.hobbies && data.hobbies.length > 0 && (
              <HobbiesSection data={data.hobbies} headingClassName="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider" />
            )}

            {/* Certifications */}
            {data.certifications && data.certifications.length > 0 && (
              <CertificatesSection data={data.certifications} headingClassName="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider" />
            )}

            {/* Achievements */}
            {data.achievements && data.achievements.length > 0 && (
              <AchievementsSection data={data.achievements} headingClassName="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider" />
            )}

            {/* Extracurricular Activities */}
            {data.extracurricularActivities && data.extracurricularActivities.length > 0 && (
              <ExtraCurricularActivitiesSection data={data.extracurricularActivities} headingClassName="text-xl font-bold text-gray-800 mb-3 uppercase tracking-wider" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default ProfessionalTemplate;