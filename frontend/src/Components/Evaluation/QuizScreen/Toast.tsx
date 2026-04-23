import React, { useEffect } from 'react';
import styles from '../QuizScreen.module.css';

interface ToastProps {
  message: string;
  type?: 'info' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles['toast']} ${type !== 'info' ? styles[type] : ''}`}>
      {message}
    </div>
  );
};

export default Toast;
