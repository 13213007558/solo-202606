import React, { useState, useCallback } from 'react';

interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, duration = 3000, onClose }) => {
  const [leaving, setLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setLeaving(true);
    setTimeout(() => {
      onClose();
    }, 300);
  }, [onClose]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  return (
    <div className={`toast ${leaving ? 'toast--leaving' : ''}`}>{message}</div>
  );
};

export default Toast;
