import React, { useState, useEffect } from 'react';
import { Clock, Calendar, Play } from 'lucide-react';

const ExamTimer = ({ exam, registration, onStartExam }) => {
  const [timeLeft, setTimeLeft] = useState(null);
  const [canStart, setCanStart] = useState(false);

  useEffect(() => {
    if (!exam || !registration) return;

    const updateTimer = () => {
      const now = new Date();
      const examDate = new Date(exam.examDate);
      const examDateStr = examDate.toISOString().split('T')[0];
      
      // Find the registered slot
      const registeredSlot = exam.slots.find(slot => slot.slotId === registration.slotId);
      if (!registeredSlot) return;

      const slotStartTime = new Date(`${examDateStr}T${registeredSlot.startTime}:00`);
      const slotEndTime = new Date(`${examDateStr}T${registeredSlot.endTime}:00`);
      
      // Calculate exam access window (10 minutes before slot start)
      const examAccessStart = new Date(slotStartTime.getTime() - (10 * 60 * 1000));
      
      let targetTime, label, canStartNow = false;
      
      if (now < examAccessStart) {
        // Before exam access window
        targetTime = examAccessStart;
        label = 'Exam starts in';
      } else if (now >= examAccessStart && now <= slotEndTime) {
        // Within exam access window
        targetTime = slotEndTime;
        label = 'Exam ends in';
        canStartNow = true;
      } else {
        // After exam window
        setTimeLeft(null);
        return;
      }
      
      const timeDiff = targetTime.getTime() - now.getTime();
      
      if (timeDiff <= 0) {
        setTimeLeft(null);
        return;
      }
      
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
      
      setTimeLeft({ days, hours, minutes, seconds, label });
      setCanStart(canStartNow);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [exam, registration]);

  if (!timeLeft) return null;

  const formatTime = (value) => value.toString().padStart(2, '0');

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {timeLeft.label}
          </span>
        </div>
        
        {canStart && (
          <button
            onClick={() => onStartExam(exam)}
            className="bg-green-600 text-white px-3 py-1 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center space-x-1"
          >
            <Play className="w-4 h-4" />
            <span>Start Now</span>
          </button>
        )}
      </div>
      
      <div className="mt-3">
        <div className="flex items-center space-x-4 text-center">
          {timeLeft.days > 0 && (
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {formatTime(timeLeft.days)}
              </div>
              <div className="text-xs text-blue-500">Days</div>
            </div>
          )}
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(timeLeft.hours)}
            </div>
            <div className="text-xs text-blue-500">Hours</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(timeLeft.minutes)}
            </div>
            <div className="text-xs text-blue-500">Minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(timeLeft.seconds)}
            </div>
            <div className="text-xs text-blue-500">Seconds</div>
          </div>
        </div>
        
        <div className="mt-2 text-xs text-blue-600">
          <Calendar className="w-3 h-3 inline mr-1" />
          Exam Date: {new Date(exam.examDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })} at {registration.slotId}
        </div>
      </div>
    </div>
  );
};

export default ExamTimer;
