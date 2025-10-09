import React from 'react';
import { fontOptions } from '../fontConfig';

const ITFresherTemplate = ({ formData, selectedFont = 'sansSerif' }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Rahul Singh',
      title: 'Information Technology Graduate',
      email: 'rahul.singh@email.com',
      phone: '(555) 456-7890',
      location: 'Delhi, India',
      linkedin: 'linkedin.com/in/rahulsingh',
      summary: 'Recent IT graduate with strong foundation in system administration, network management, and software development. Passionate about cybersecurity and cloud technologies. Completed internships in IT support and system administration roles.'
    },
    education: [
      {
        degree: 'Bachelor of Technology',
        field: 'Information Technology',
        institution: 'Delhi Technological University',
        startDate: '2020-08-01',
        endDate: '2024-05-01',
        current: false,
        cgpa: '8.2/10'
      }
    ],
    projects: [
      {
        name: 'Network Monitoring System',
        description: 'Real-time network monitoring tool with alert system and performance analytics dashboard.',
        technologies: 'Python, Flask, MySQL, SNMP, JavaScript',
        github: 'github.com/rahulsingh/network-monitor'
      },
      {
        name: 'Secure File Transfer Application',
        description: 'Encrypted file transfer system with user authentication and access control.',
        technologies: 'Java, Spring Boot, PostgreSQL, AES Encryption',
        github: 'github.com/rahulsingh/secure-transfer'
      }
    ],
    experience: [
      {
        position: 'IT Support Intern',
        company: 'TechSupport Solutions',
        startDate: '2023-07-01',
        endDate: '2023-09-30',
        current: false,
        description: 'Provided technical support to 100+ users. Troubleshot hardware and software issues, managed user accounts, and maintained IT documentation. Gained experience in Windows and Linux system administration.'
      }
    ],
    skills: [
      { name: 'Programming Languages', items: ['Java', 'Python', 'C++', 'JavaScript', 'SQL'] },
      { name: 'System Administration', items: ['Windows Server', 'Linux', 'Active Directory', 'DNS', 'DHCP'] },
      { name: 'Networking', items: ['TCP/IP', 'Routing', 'Switching', 'Firewalls', 'VPN'] },
      { name: 'Databases', items: ['MySQL', 'PostgreSQL', 'MongoDB', 'Oracle'] },
      { name: 'Cloud Technologies', items: ['AWS', 'Azure', 'Google Cloud', 'Docker'] },
      { name: 'Security', items: ['Cybersecurity', 'Network Security', 'Encryption', 'Penetration Testing'] }
    ],
    certifications: [
      { name: 'CompTIA A+', issuer: 'CompTIA', date: '2024' },
      { name: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2023' },
      { name: 'Cisco CCNA', issuer: 'Cisco', date: '2023' }
    ],
    achievements: [
      'Won 1st place in college cybersecurity competition',
      'Completed 3-month cybersecurity bootcamp',
      'Led IT infrastructure setup for college tech fest',
      'Maintained 8.2+ CGPA throughout academic career'
    ]
  };

  const selectedFontConfig = fontOptions[selectedFont] || fontOptions.sansSerif;
  
  return (
    <div
      className="w-full p-[8mm] bg-white text-black mx-2 my-2"
      style={{ fontFamily: selectedFontConfig.fontFamily, minHeight: '297mm' }}
    >
      {/* Header */}
      <header className="mb-8 border-b-2 border-orange-600 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-orange-600 font-semibold mb-4">{data.personalInfo.title}</p>
        <div className="flex justify-between text-sm text-gray-600">
          <div>
            <p>{data.personalInfo.email}</p>
            <p>{data.personalInfo.phone}</p>
          </div>
          <div>
            <p>{data.personalInfo.location}</p>
            {data.personalInfo.linkedin && <p>{data.personalInfo.linkedin}</p>}
          </div>
        </div>
      </header>

       <div style={{ paddingLeft: '4px', paddingRight: '80px' }}>
        {/* Summary */}
        {data.personalInfo.summary && (
          <section className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-3 border-l-4 border-orange-600 pl-3">PROFESSIONAL SUMMARY</h2>
            <p className="text-gray-700 leading-relaxed">{data.personalInfo.summary}</p>
          </section>
        )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-orange-600 pl-3">EDUCATION</h2>
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
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-orange-600 pl-3">PROJECTS</h2>
          {data.projects.map((project, index) => (
             <div key={index} className="mb-5">
               <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
               {project.description && <p className="text-gray-700 mb-2">{typeof project.description === 'string' ? project.description : JSON.stringify(project.description)}</p>}
               {project.technologies && <p className="text-gray-600 text-sm mb-1"><strong>Technologies:</strong> {typeof project.technologies === 'string' ? project.technologies : JSON.stringify(project.technologies)}</p>}
               {project.github && <p className="text-orange-600 text-sm"><strong>GitHub:</strong> {typeof project.github === 'string' ? project.github : JSON.stringify(project.github)}</p>}
             </div>
          ))}
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-orange-600 pl-3">EXPERIENCE</h2>
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
           <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-orange-600 pl-3">TECHNICAL SKILLS</h2>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-orange-600 pl-3">CERTIFICATIONS</h2>
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
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-l-4 border-orange-600 pl-3">ACHIEVEMENTS</h2>
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

export default ITFresherTemplate;
