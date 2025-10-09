import React from 'react';
import { fontOptions } from '../fontConfig';

const TechnicalFresherTemplate = ({ formData, selectedFont = 'sansSerif' }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Alex Kumar',
      title: 'Computer Science Graduate',
      email: 'alex.kumar@email.com',
      phone: '(555) 123-4567',
      location: 'Bangalore, India',
      linkedin: 'linkedin.com/in/alexkumar',
      summary: 'Recent Computer Science graduate with strong foundation in programming, data structures, and software development. Passionate about technology and eager to contribute to innovative projects. Completed multiple personal projects and internships during academic career.'
    },
    education: [
      {
        degree: 'Bachelor of Technology',
        field: 'Computer Science and Engineering',
        institution: 'Indian Institute of Technology',
        startDate: '2020-08-01',
        endDate: '2024-05-01',
        current: false,
        cgpa: '8.5/10'
      }
    ],
    projects: [
      {
        name: 'E-Commerce Web Application',
        description: 'Full-stack web application built with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, and payment integration.',
        technologies: 'React, Node.js, MongoDB, Express.js, JWT',
        github: 'github.com/alexkumar/ecommerce-app'
      },
      {
        name: 'Task Management System',
        description: 'Collaborative task management tool with real-time updates, team collaboration features, and progress tracking.',
        technologies: 'React, Socket.io, PostgreSQL, Redis',
        github: 'github.com/alexkumar/task-manager'
      }
    ],
    experience: [
      {
        position: 'Software Development Intern',
        company: 'TechCorp Solutions',
        startDate: '2023-06-01',
        endDate: '2023-08-31',
        current: false,
        description: 'Worked on frontend development using React and TypeScript. Contributed to bug fixes and feature development. Gained experience in agile development methodologies.'
      }
    ],
    skills: [
      { name: 'Programming Languages', items: ['Java', 'Python', 'JavaScript', 'C++'] },
      { name: 'Web Technologies', items: ['React', 'Node.js', 'HTML5', 'CSS3', 'Express.js'] },
      { name: 'Databases', items: ['MySQL', 'MongoDB', 'PostgreSQL'] },
      { name: 'Tools & Technologies', items: ['Git', 'Docker', 'AWS', 'Linux'] }
    ],
    certifications: [
      { name: 'AWS Cloud Practitioner', issuer: 'Amazon Web Services', date: '2024' },
      { name: 'Google Cloud Fundamentals', issuer: 'Google Cloud', date: '2023' }
    ],
    achievements: [
      'Won 1st place in college hackathon for innovative mobile app',
      'Published research paper on Machine Learning algorithms',
      'Maintained 8.5+ CGPA throughout academic career'
    ]
  };

  const selectedFontConfig = fontOptions[selectedFont] || fontOptions.sansSerif;
  
  return (
    <div
      className="w-full p-[8mm] bg-white text-black mx-2 my-2"
      style={{ fontFamily: selectedFontConfig.fontFamily, minHeight: '297mm' }}
    >
      {/* Header */}
      <header className="text-center mb-8 border-b-2 border-blue-600 pb-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-xl text-blue-600 font-semibold mb-4">{data.personalInfo.title}</p>
        <div className="flex justify-center space-x-6 text-sm text-gray-600">
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.location}</span>
          {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
        </div>
      </header>

       <div style={{ paddingLeft: '4px', paddingRight: '80px' }}>
        {/* Summary */}
        {data.personalInfo.summary && (
          <section className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-blue-600 pl-3">OBJECTIVE</h2>
            <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
          </section>
        )}

      {/* Education - Prominent for freshers */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">EDUCATION</h2>
          {data.education.map((edu, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{edu.degree} in {edu.field}</h3>
                  <p className="text-gray-700 font-medium">{edu.institution}</p>
                  {edu.cgpa && <p className="text-gray-600">CGPA: {edu.cgpa}</p>}
                </div>
                <p className="text-gray-600 text-sm">
                  {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} - {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                </p>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Projects - Very important for freshers */}
      {data.projects && data.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">PROJECTS</h2>
          {data.projects.map((project, index) => (
             <div key={index} className="mb-5">
               <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
               {project.description && <p className="text-gray-700 mb-2">{typeof project.description === 'string' ? project.description : JSON.stringify(project.description)}</p>}
               {project.technologies && <p className="text-gray-600 text-sm mb-1"><strong>Technologies:</strong> {typeof project.technologies === 'string' ? project.technologies : JSON.stringify(project.technologies)}</p>}
               {project.github && <p className="text-blue-600 text-sm"><strong>GitHub:</strong> {typeof project.github === 'string' ? project.github : JSON.stringify(project.github)}</p>}
             </div>
          ))}
        </section>
      )}

      {/* Experience - Internships and part-time work */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">EXPERIENCE</h2>
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
         <section className="mb-6">
           <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">TECHNICAL SKILLS</h2>
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
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">CERTIFICATIONS</h2>
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
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-blue-600 pl-3">ACHIEVEMENTS</h2>
          <ul className="list-disc list-inside text-gray-700">
            {data.achievements.map((achievement, index) => (
              <li key={index} className="mb-1">
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

export default TechnicalFresherTemplate;
