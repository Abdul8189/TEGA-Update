import React from 'react';

const LanguagesSection = ({ data, heading, className }) => {
  if (!data || data.length === 0) return null;

  return (
    <section className={`mb-6 ${className}`} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h2 className="text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1">{heading || 'Languages'}</h2>
      <div className="flex flex-wrap gap-4">
        {data.map((lang, index) => {
          const languageName = typeof lang === 'string' ? lang : (lang?.name || lang?.language || '');
          const proficiency = lang?.proficiency || lang?.level || '';
          return (
            <div key={lang?.id || index}>
              <span className="font-semibold">{languageName}:</span>
              <span className="text-gray-700 ml-1">{proficiency}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LanguagesSection;
