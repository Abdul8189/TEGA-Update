import React from 'react';
import withDynamicSections from '../common/withDynamicSections';
import LanguagesSection from '../common/LanguagesSection';
import VolunteerExperienceSection from '../common/VolunteerExperienceSection';
import HobbiesSection from '../common/HobbiesSection';
import CertificatesSection from '../common/CertificatesSection';
import ExtraCurricularActivitiesSection from '../common/ExtraCurricularActivitiesSection';

const TechnicalTemplate = ({ formData, renderMainContent }) => {
  const data = formData || {
    personalInfo: {
      fullName: 'Marcus Chen',
      title: 'DevOps Engineer',
      email: 'marcus.chen@example.com',
      phone: '(123) 555-0108',
      location: 'Austin, TX',
      linkedin: 'linkedin.com/in/marcuschen-devops',
      github: 'github.com/marcuschen'
    },
    summary: 'A detail-oriented DevOps Engineer with a strong background in cloud infrastructure and automation. Proficient in building and maintaining CI/CD pipelines, managing containerized applications with Kubernetes, and leveraging infrastructure as code (IaC) to ensure scalable and reliable systems. Committed to bridging the gap between development and operations.',
    experience: [
      {
        position: 'DevOps Engineer',
        company: 'CloudNet Solutions',
        location: 'Austin, TX',
        startDate: '2019',
        endDate: 'Present',
        description: 'Designed and implemented a CI/CD pipeline using Jenkins and GitLab CI, reducing deployment times by 60%. Managed a large-scale Kubernetes cluster on AWS, improving application uptime to 99.99%. Automated infrastructure provisioning with Terraform and Ansible.'
      },
      {
        position: 'Systems Administrator',
        company: 'DataCorp',
        location: 'Austin, TX',
        startDate: '2016',
        endDate: '2019',
        description: 'Managed a hybrid cloud environment (AWS and on-premise). Provided support for Linux and Windows servers. Implemented monitoring and alerting solutions using Prometheus and Grafana.'
      }
    ],
    education: [
      {
        degree: 'B.S. in Information Technology',
        institution: 'University of Texas at Austin',
        location: 'Austin, TX',
        startDate: '2012',
        endDate: '2016'
      }
    ],
    skills: [
      { id: 1, name: 'AWS' },
      { id: 2, name: 'Azure' },
      { id: 3, name: 'Docker' },
      { id: 4, name: 'Kubernetes' },
      { id: 5, name: 'Jenkins' },
      { id: 6, name: 'GitLab CI' },
      { id: 7, name: 'Terraform' },
      { id: 8, name: 'Ansible' },
      { id: 9, name: 'Bash' },
      { id: 10, name: 'Python' },
      { id: 11, name: 'Prometheus' },
      { id: 12, name: 'Grafana' }
    ],
    languages: [
      { name: 'English', proficiency: 'Native' },
      { name: 'Mandarin', proficiency: 'Conversational' }
    ],
    volunteerExperience: [],
    hobbies: ['Building PCs', '3D Printing', 'Home Lab Projects'],
    certifications: [],
    extracurricularActivities: []
  };

  return (
    <div className="technical-template bg-white min-h-[842px] w-[595px] mx-auto shadow-lg p-8 font-mono">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{data.personalInfo.fullName}</h1>
        <p className="text-lg text-blue-600">{data.personalInfo.title}</p>
        <div className="text-sm text-gray-500 mt-2 flex space-x-4">
          <span>{data.personalInfo.email}</span>
          <span>{data.personalInfo.phone}</span>
          <span>{data.personalInfo.linkedin}</span>
          <span>{data.personalInfo.github}</span>
        </div>
      </header>

      {renderMainContent('summary')}
      {renderMainContent('skills')}
      {renderMainContent('experience')}
      {renderMainContent('education')}
      {renderMainContent('languages')}
      {renderMainContent('volunteerExperience')}
      {renderMainContent('hobbies')}
      {renderMainContent('certifications')}
      {renderMainContent('extracurricularActivities')}
    </div>
  );
};

const sectionConfig = {
  sectionRenderers: (data) => ({
    summary: () => (
      data.personalInfo.summary && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2">Summary</h2>
          <p className="text-gray-600">{data.personalInfo.summary}</p>
        </section>
      )
    ),
    skills: () => (
      data.skills && data.skills.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2">Technical Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, index) => (
              <span key={index} className="bg-gray-200 text-gray-800 text-xs font-medium px-2 py-1 rounded">{skill.name || skill}</span>
            ))}
          </div>
        </section>
      )
    ),
    experience: () => (
      data.experience && data.experience.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2">Experience</h2>
          {data.experience.map((job, index) => (
            <div key={index} className="mb-4">
              <h3 className="text-lg font-bold text-gray-800">{job.position}</h3>
              <p className="text-md text-gray-600">{job.company} | {job.startDate} - {job.endDate}</p>
              <p className="text-gray-500 mt-1">{typeof job.description === 'string' ? job.description : JSON.stringify(job.description)}</p>
            </div>
          ))}
        </section>
      )
    ),
    education: () => (
      data.education && data.education.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2">Education</h2>
          {data.education.map((edu, index) => (
            <div key={index}>
              <h3 className="text-lg font-bold text-gray-800">{edu.institution}</h3>
              <p className="text-md text-gray-600">{edu.degree}</p>
            </div>
          ))}
        </section>
      )
    ),
    languages: () => (data.languages && data.languages.length > 0 && <LanguagesSection data={data.languages} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2" />),
    volunteerExperience: () => (data.volunteerExperience && data.volunteerExperience.length > 0 && <VolunteerExperienceSection data={data.volunteerExperience} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2" />),
    hobbies: () => (data.hobbies && data.hobbies.length > 0 && <HobbiesSection data={data.hobbies} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2" />),
    certifications: () => (data.certifications && data.certifications.length > 0 && <CertificatesSection data={data.certifications} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2" />),
    extracurricularActivities: () => (data.extracurricularActivities && data.extracurricularActivities.length > 0 && <ExtraCurricularActivitiesSection data={data.extracurricularActivities} className="mb-6" headingClassName="text-xl font-semibold text-gray-700 border-b-2 border-gray-200 pb-1 mb-2" />),
  }),
  mainContentSections: ['summary', 'skills', 'experience', 'education', 'languages', 'volunteerExperience', 'hobbies', 'certifications', 'extracurricularActivities'],
  sidebarSections: [],
};

export default withDynamicSections(TechnicalTemplate, sectionConfig);
