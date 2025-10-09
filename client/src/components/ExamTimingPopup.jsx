import React, { useState, useEffect } from 'react';
import { X, Clock, Calendar, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { getCountdownData } from '../utils/examTiming';

const ExamTimingPopup = ({ 
  isOpen, 
  onClose, 
  popupContent, 
  timingInfo, 
  onStartExam,
  exam 
}) => {
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (!isOpen || !timingInfo) return;

    const updateCountdown = () => {
      const countdownData = getCountdownData(timingInfo);
      setCountdown(countdownData);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isOpen, timingInfo]);

  if (!isOpen || !popupContent) return null;

  const getIcon = () => {
    switch (popupContent.type) {
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'info':
        return <Info className="w-8 h-8 text-blue-500" />;
      case 'warning':
        return <AlertCircle className="w-8 h-8 text-yellow-500" />;
      default:
        return <Clock className="w-8 h-8 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (popupContent.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = () => {
    switch (popupContent.type) {
      case 'success':
        return 'text-green-800';
      case 'info':
        return 'text-blue-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full border-2 ${getBgColor()}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <h3 className={`text-lg font-semibold ${getTextColor()}`}>
              {popupContent.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className={`text-sm mb-4 ${getTextColor()}`}>
            {popupContent.message}
          </p>

          {/* Details */}
          {popupContent.details && (
            <div className="space-y-2 mb-6">
              {popupContent.details.map((detail, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">{detail}</span>
                </div>
              ))}
            </div>
          )}

          {/* Countdown Timer */}
          {countdown && popupContent.showCountdown && (
            <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  {countdown.label}
                </p>
                <div className="flex justify-center space-x-4">
                  {countdown.days > 0 && (
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {countdown.days}
                      </div>
                      <div className="text-xs text-gray-500">Days</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {countdown.hours.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500">Hours</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {countdown.minutes.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500">Minutes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {countdown.seconds.toString().padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500">Seconds</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            {timingInfo?.canStart && onStartExam ? (
              <button
                onClick={() => {
                  onStartExam(exam);
                  onClose();
                }}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Start Exam Now
              </button>
            ) : (
              <button
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                Got It
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamTimingPopup;
