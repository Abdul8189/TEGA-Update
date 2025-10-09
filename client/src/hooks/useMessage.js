import { useState, useCallback } from 'react';

export const useMessage = () => {
  const [message, setMessage] = useState({
    show: false,
    type: 'error',
    title: '',
    message: '',
    persistent: false
  });

  const showMessage = useCallback((options) => {
    setMessage({
      show: true,
      type: options.type || 'error',
      title: options.title || '',
      message: options.message || '',
      persistent: options.persistent || false
    });
  }, []);

  const showSuccess = useCallback((message, title = 'Success') => {
    showMessage({ type: 'success', message, title });
  }, [showMessage]);

  const showError = useCallback((message, title = 'Error') => {
    showMessage({ type: 'error', message, title });
  }, [showMessage]);

  const showWarning = useCallback((message, title = 'Warning') => {
    showMessage({ type: 'warning', message, title });
  }, [showMessage]);

  const showInfo = useCallback((message, title = 'Information') => {
    showMessage({ type: 'info', message, title });
  }, [showMessage]);

  const hideMessage = useCallback(() => {
    setMessage(prev => ({ ...prev, show: false }));
  }, []);

  const clearMessage = useCallback(() => {
    setMessage({
      show: false,
      type: 'error',
      title: '',
      message: '',
      persistent: false
    });
  }, []);

  return {
    message,
    showMessage,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideMessage,
    clearMessage
  };
};
