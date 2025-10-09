import React from 'react';

const ResultProgressBar = ({ percentage, size = 'large', showPercentage = true }) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'w-16 h-16',
          text: 'text-xs',
          stroke: 3
        };
      case 'medium':
        return {
          container: 'w-24 h-24',
          text: 'text-sm',
          stroke: 4
        };
      default:
        return {
          container: 'w-32 h-32',
          text: 'text-lg',
          stroke: 6
        };
    }
  };

  const sizeClasses = getSizeClasses();
  const radius = size === 'small' ? 26 : size === 'medium' ? 36 : 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = (percentage) => {
    if (percentage >= 80) return '#10B981'; // green-500
    if (percentage >= 60) return '#3B82F6'; // blue-500
    if (percentage >= 40) return '#F59E0B'; // yellow-500
    return '#EF4444'; // red-500
  };

  const color = getColor(percentage);

  return (
    <div className={`relative ${sizeClasses.container} mx-auto`}>
      <svg
        className="transform -rotate-90 w-full h-full"
        viewBox={`0 0 ${(radius + sizeClasses.stroke) * 2} ${(radius + sizeClasses.stroke) * 2}`}
      >
        {/* Background circle */}
        <circle
          cx={radius + sizeClasses.stroke}
          cy={radius + sizeClasses.stroke}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={sizeClasses.stroke}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={radius + sizeClasses.stroke}
          cy={radius + sizeClasses.stroke}
          r={radius}
          stroke={color}
          strokeWidth={sizeClasses.stroke}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-in-out"
        />
      </svg>
      
      {/* Percentage text */}
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${sizeClasses.text} text-gray-900`}>
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default ResultProgressBar;
