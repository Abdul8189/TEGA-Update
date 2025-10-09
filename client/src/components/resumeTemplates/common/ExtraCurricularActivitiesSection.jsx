import React from 'react';
import { safeRenderText } from '../utils/safeRender.jsx';

const ExtraCurricularActivitiesSection = ({ data, heading, className, headingClassName }) => {
  if (!data || data.length === 0) return null;

  return (
    <section className={`mb-6 ${className}`} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h2 className={headingClassName || 'text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1'}>{heading || 'Extra-Curricular Activities'}</h2>
      {data.map((activity, index) => (
        <div key={activity.id || index} className="mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{activity.name || activity.title}</h3>
              <p className="text-gray-700 font-medium">{activity.role || activity.organization}</p>
            </div>
            <p className="text-gray-600 text-sm">
              {activity.startDate ? new Date(activity.startDate).toLocaleDateString() : ''} - {activity.current ? 'Present' : activity.endDate ? new Date(activity.endDate).toLocaleDateString() : ''}
            </p>
          </div>
          <p className="text-gray-700 mt-1">{safeRenderText(activity.description)}</p>
        </div>
      ))}
    </section>
  );
};

export default ExtraCurricularActivitiesSection;
