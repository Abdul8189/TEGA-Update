import React from 'react';

const ClassicTemplate = ({ formData }) => {
  const { personalInfo, experience, education, skills } = formData;

  return (
    <div className="p-8 bg-white font-serif">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold">{personalInfo.fullName}</h1>
        <p className="text-md">{personalInfo.email} | {personalInfo.phone} | {personalInfo.location}</p>
      </header>

      <section className="mb-8">
        <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">Summary</h2>
        <p>{personalInfo.summary}</p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">Experience</h2>
        {experience.map(exp => (
          <div key={exp.id} className="mb-4">
            <h3 className="text-xl font-semibold">{exp.position} at {exp.company}</h3>
            <p className="text-sm text-gray-600">{exp.startDate} - {exp.endDate}</p>
            <p>{exp.description}</p>
          </div>
        ))}
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">Education</h2>
        {education.map(edu => (
          <div key={edu.id} className="mb-4">
            <h3 className="text-xl font-semibold">{edu.degree} in {edu.field}</h3>
            <p className="text-lg">{edu.institution}</p>
            <p className="text-sm text-gray-600">{edu.startDate} - {edu.endDate}</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-2xl font-bold border-b-2 border-black pb-2 mb-4">Skills</h2>
        <ul className="list-disc list-inside grid grid-cols-3 gap-2">
          {skills.map((skill, index) => (
            <li key={index}>{skill}</li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default ClassicTemplate;
