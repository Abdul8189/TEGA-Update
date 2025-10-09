import React from 'react';

const HobbiesSection = ({ data, heading, className }) => {
  if (!data || data.length === 0) return null;

  return (
    <section className={className} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">{heading || 'Hobbies & Interests'}</h2>
      <div className="flex flex-wrap gap-2">
        {data.map((hobby, index) => {
          const hobbyName = typeof hobby === 'string' ? hobby : (hobby?.name || hobby?.title || '');
          return (
            <span key={hobby?.id || index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
              {hobbyName}
            </span>
          );
        })}
      </div>
    </section>
  );
};

export default HobbiesSection;
