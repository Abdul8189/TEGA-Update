import React from 'react';
import { fontOptions } from '../fontConfig';

const CSFresherTemplate = ({ formData, selectedFont = 'sansSerif' }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Priya Sharma',
      title: 'Computer Science Graduate',
      email: 'priya.sharma@email.com',
      phone: '(555) 987-6543',
      location: 'Mumbai, India',
      linkedin: 'linkedin.com/in/priyasharma',
      summary: 'Recent Computer Science graduate with expertise in software development, data structures, and algorithms. Strong problem-solving skills and passion for creating efficient software solutions. Completed multiple projects and internships in web development and mobile applications.'
    },
    education: [
      {
        degree: 'Bachelor of Engineering',
        field: 'Computer Science',
        institution: 'Mumbai University',
        startDate: '2020-08-01',
        endDate: '2024-05-01',
        current: false,
        percentage: '85%'
      }
    ],
    projects: [
      {
        name: 'Social Media Analytics Dashboard',
        description: 'Real-time analytics dashboard for social media metrics with data visualization using Chart.js and React.',
        technologies: 'React, Node.js, MongoDB, Chart.js, Socket.io',
        github: 'github.com/priyasharma/social-analytics'
      },
      {
        name: 'Mobile Expense Tracker',
        description: 'Cross-platform mobile app for expense tracking with budget management and expense categorization.',
        technologies: 'React Native, Firebase, Redux',
        github: 'github.com/priyasharma/expense-tracker'
      },
      {
        name: 'Online Learning Platform',
        description: 'E-learning platform with video streaming, quizzes, and progress tracking for students.',
        technologies: 'Django, PostgreSQL, AWS S3, HTML5 Video',
        github: 'github.com/priyasharma/learning-platform'
      }
    ],
    experience: [
      {
        position: 'Frontend Development Intern',
        company: 'StartupXYZ',
        startDate: '2023-12-01',
        endDate: '2024-02-29',
        current: false,
        description: 'Developed responsive web interfaces using React and TypeScript. Collaborated with design team to implement UI/UX designs. Participated in code reviews and agile development process.'
      }
    ],
    skills: [
      { name: 'Programming Languages', items: ['Java', 'Python', 'JavaScript', 'TypeScript', 'C++'] },
      { name: 'Frontend', items: ['React', 'HTML5', 'CSS3', 'Bootstrap', 'Material-UI'] },
      { name: 'Backend', items: ['Node.js', 'Express.js', 'Django', 'REST APIs'] },
      { name: 'Databases', items: ['MySQL', 'MongoDB', 'PostgreSQL', 'Redis'] },
      { name: 'Mobile Development', items: ['React Native', 'Flutter'] },
      { name: 'Cloud & DevOps', items: ['AWS', 'Docker', 'Git', 'Linux'] }
    ],
    certifications: [
      { name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024' },
      { name: 'Google IT Support Professional Certificate', issuer: 'Google', date: '2023' },
      { name: 'React Developer Certification', issuer: 'Meta', date: '2023' }
    ],
    achievements: [
      'Secured 2nd position in national coding competition',
      'Published 2 research papers in international journals',
      'Led college tech club and organized 5+ technical workshops',
      'Maintained 85%+ aggregate throughout academic career'
    ]
  };

  const selectedFontConfig = fontOptions[selectedFont] || fontOptions.sansSerif;
  
  return (
    <div
      className="w-full p-[8mm] bg-white text-black mx-2 my-2"
      style={{ 
        fontFamily: selectedFontConfig.fontFamily, 
        minHeight: '297mm',
        maxWidth: '595px',
        width: '595px',
        margin: '0 auto',
        boxSizing: 'border-box',
        pageBreakInside: 'avoid'
      }}
    >
      {/* Header */}
      <header className="mb-8 border-b-2 border-green-600 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-green-600 font-semibold mb-4">{data.personalInfo.title}</p>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>Email:</strong> {data.personalInfo.email}</p>
            <p><strong>Phone:</strong> {data.personalInfo.phone}</p>
          </div>
          <div>
            <p><strong>Location:</strong> {data.personalInfo.location}</p>
            {data.personalInfo.linkedin && <p><strong>LinkedIn:</strong> {data.personalInfo.linkedin}</p>}
          </div>
        </div>
      </header>

       <div style={{ paddingLeft: '4px', paddingRight: '20px' }}>
        {/* Summary */}
        {data.personalInfo.summary && (
          <section className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-green-600 pl-3">PROFESSIONAL SUMMARY</h2>
            <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
          </section>
        )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-3">EDUCATION</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-700 font-medium">{edu.institution}</p>
                  {(edu.cgpa || edu.percentage) && <p className="text-gray-600">{edu.cgpa ? `CGPA: ${edu.cgpa}` : `Percentage: ${edu.percentage}`}</p>}
                </div>
                <p className="text-gray-600 text-sm">
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-3">PROJECTS</h2>
          {data.projects.map((project, index) => (
             <div key={index} className="mb-5">
               <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
               {project.description && <p className="text-gray-700 mb-2">{typeof project.description === 'string' ? project.description : JSON.stringify(project.description)}</p>}
               {project.technologies && <p className="text-gray-600 text-sm mb-1"><strong>Technologies:</strong> {typeof project.technologies === 'string' ? project.technologies : JSON.stringify(project.technologies)}</p>}
               {project.github && <p className="text-green-600 text-sm"><strong>GitHub:</strong> {typeof project.github === 'string' ? project.github : JSON.stringify(project.github)}</p>}
             </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-3">EXPERIENCE</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{job.position}</h3>
                  <p className="text-gray-700 font-medium">{job.company}</p>
                </div>
                <p className="text-gray-600 text-sm">
                  {job.startDate ? new Date(job.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {job.current ? 'Present' : job.endDate ? new Date(job.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
               {job.description && (
                 <div className="text-gray-700">
                   {typeof job.description === 'string' ? 
                     job.description.split('\n').map((line, i) => (
                       <p key={i} className="mb-1">{line}</p>
                     )) :
                     <p className="mb-1">{JSON.stringify(job.description)}</p>
                   }
                 </div>
               )}
            </div>
          ))}
        </section>
      )}

       {/* Technical Skills */}
       {data.skills && data.skills.length > 0 && (
         <section className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
           <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-3">TECHNICAL SKILLS</h2>
           <div className="grid grid-cols-2 gap-4">
             {data.skills.map((skill, index) => (
               <div key={index} className="mb-3">
                 <p className="font-semibold text-gray-900 mb-1">
                   {skill.name || skill}
                 </p>
               </div>
             ))}
           </div>
         </section>
       )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mb-6" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-3">CERTIFICATIONS</h2>
          {data.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <span className="font-semibold text-gray-900">{cert.name}</span>
              {cert.issuer && <span className="text-gray-700"> - {cert.issuer}</span>}
              {cert.date && <span className="text-gray-600 text-sm"> ({cert.date})</span>}
            </div>
          ))}
        </section>
      )}

      {/* Achievements */}
      {data.achievements && data.achievements.length > 0 && (
        <section className="mb-6" style={{ 
          pageBreakInside: 'avoid', 
          breakInside: 'avoid',
          pageBreakBefore: 'auto',
          pageBreakAfter: 'avoid',
          display: 'block'
        }}>
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-green-600 pl-3">ACHIEVEMENTS</h2>
          <ul className="list-disc list-inside text-gray-700">
            {data.achievements.map((achievement, index) => (
              <li key={index} className="mb-1" style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
                {typeof achievement === 'string' ? achievement : 
                 typeof achievement === 'object' && achievement.description ? achievement.description :
                 JSON.stringify(achievement)}
              </li>
            ))}
          </ul>
        </section>
      )}
      </div>
    </div>
  );
};

export default CSFresherTemplate;
