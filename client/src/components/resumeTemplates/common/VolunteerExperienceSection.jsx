import React from 'react';
import { safeRenderText } from '../utils/safeRender.jsx';

const VolunteerExperienceSection = ({ data, heading, className }) => {
  if (!data || data.length === 0 || !data[0]?.organization) return null;

  return (
    <section className={`mb-6 ${className}`} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">{heading || 'Volunteer Experience'}</h2>
      {data.map((vol, index) => (
        <div key={index} className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{vol.role}</h3>
              <p className="text-gray-700 font-medium">{vol.organization}</p>
            </div>
            <p className="text-gray-600 text-sm">
              {vol.startDate ? new Date(vol.startDate).toLocaleDateString() : ''} - {vol.current ? 'Present' : vol.endDate ? new Date(vol.endDate).toLocaleDateString() : ''}
            </p>
          </div>
          <p className="text-gray-700 mt-1">{safeRenderText(vol.description)}</p>
        </div>
      ))}
    </section>
  );
};

export default VolunteerExperienceSection;
