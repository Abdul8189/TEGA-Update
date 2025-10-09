import React from 'react';

const AchievementsSection = ({ data, heading, className, headingClassName }) => {
  if (!data || data.length === 0) return null;

  return (
    <section className={`mb-6 ${className}`} style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}>
      <h2 className={headingClassName || 'text-xl font-bold text-gray-800 mb-3 border-b border-gray-300 pb-1'}>{heading || 'Achievements'}</h2>
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {data.map((achievement, index) => {
          // Handle different data formats robustly
          let achievementText = '';
          
          if (typeof achievement === 'string') {
            achievementText = achievement;
          } else if (achievement && typeof achievement === 'object') {
            achievementText = achievement.description || achievement.text || achievement.title || '';
          } else {
            achievementText = String(achievement || '');
          }
          
          return (
            <li key={achievement?.id || index}>{achievementText}</li>
          );
        })}
      </ul>
    </section>
  );
};

export default AchievementsSection;
