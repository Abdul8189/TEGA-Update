import React from 'react';

const ModernTemplate = ({ formData }) => {
  const { personalInfo, experience, education, skills } = formData;

  return (
    <div className="p-8 bg-gray-100 font-sans">
      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 bg-blue-800 text-white p-6 rounded-lg">
          <h1 className="text-3xl font-bold mb-2">{personalInfo.fullName}</h1>
          <p className="text-blue-200 mb-6">{personalInfo.title}</p>

          <div className="mb-6">
            <h2 className="text-xl font-semibold border-b-2 border-blue-400 pb-2 mb-2">Contact</h2>
            <p>{personalInfo.email}</p>
            <p>{personalInfo.phone}</p>
            <p>{personalInfo.location}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold border-b-2 border-blue-400 pb-2 mb-2">Skills</h2>
            <ul className="list-disc list-inside">
              {skills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-span-2">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-gray-300 pb-2 mb-4">Summary</h2>
            <p className="text-gray-700">{personalInfo.summary}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-gray-300 pb-2 mb-4">Experience</h2>
            {experience.map(exp => (
              <div key={exp.id} className="mb-4">
                <h3 className="text-xl font-semibold">{exp.position}</h3>
                <p className="font-bold text-gray-800">{exp.company}</p>
                <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
                <p className="text-gray-700">{exp.description}</p>
              </div>
            ))}
          </section>

          <section>
            <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-gray-300 pb-2 mb-4">Education</h2>
            {education.map(edu => (
              <div key={edu.id} className="mb-4">
                <h3 className="text-xl font-semibold">{edu.degree} in {edu.field}</h3>
                <p className="font-bold text-gray-800">{edu.institution}</p>
                <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
};

export default ModernTemplate;
