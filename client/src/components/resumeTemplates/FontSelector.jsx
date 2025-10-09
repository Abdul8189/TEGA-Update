import React, { useState } from 'react';
import { fontOptions, defaultFont } from './fontConfig';

const FontSelector = ({ selectedFont, onFontChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFontSelect = (fontKey) => {
    onFontChange(fontKey);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white/90 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-lg hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:shadow-xl"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {fontOptions[selectedFont]?.displayName || 'Select Font'}
            </div>
            <div className="text-xs text-gray-500">
              {fontOptions[selectedFont]?.description || 'Choose a font style'}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-sm border-2 border-gray-200 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto">
          {Object.entries(fontOptions).map(([fontKey, font]) => (
            <button
              key={fontKey}
              onClick={() => handleFontSelect(fontKey)}
              className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-all duration-200 first:rounded-t-xl last:rounded-b-xl ${
                selectedFont === fontKey ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-all duration-200 ${
                  selectedFont === fontKey ? 'border-blue-500 bg-blue-500' : 'border-gray-300 hover:border-blue-400'
                }`}>
                  {selectedFont === fontKey && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div>
                  <div 
                    className="text-sm font-semibold text-gray-900"
                    style={{ fontFamily: font.fontFamily }}
                  >
                    {font.displayName}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {font.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FontSelector;
