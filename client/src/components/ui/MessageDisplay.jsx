import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const MessageDisplay = ({ 
  type = 'error', 
  message, 
  title, 
  show = false, 
  onClose,
  persistent = false,
  className = '',
  size = 'default' // 'small', 'default', 'large'
}) => {
  if (!show || !message) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-800',
          icon: 'text-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-800',
          icon: 'text-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-800',
          icon: 'text-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-800',
          icon: 'text-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-800',
          icon: 'text-gray-500'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-3 text-sm';
      case 'large':
        return 'p-6 text-base';
      default:
        return 'p-4 text-sm';
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`
          ${colors.bg} ${colors.border} border rounded-lg shadow-sm
          ${getSizeClasses()}
          ${className}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h4 className={`font-medium ${colors.text} mb-1`}>
                {title}
              </h4>
            )}
            <p className={`${colors.text} ${title ? '' : 'font-medium'}`}>
              {message}
            </p>
          </div>
          {!persistent && onClose && (
            <div className="ml-3 flex-shrink-0">
              <button
                onClick={onClose}
                className={`${colors.icon} hover:opacity-70 transition-opacity`}
                aria-label="Close message"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageDisplay;
