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

  let typeClasses = 'bg-[#111] text-white border-white/20';
  let Icon = null;
  
  if (type === 'warning') {
    typeClasses = 'bg-amber-500/10 text-amber-500 border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.1)]';
    Icon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
  } else if (type === 'error') {
    typeClasses = 'bg-red-500/10 text-red-500 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.1)]';
    Icon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  } else {
    typeClasses = 'bg-white/10 text-white border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)]';
    Icon = <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
  }

  return (
    <div className={`flex items-center gap-3 px-6 py-3 rounded-full border backdrop-blur-xl animate-[pulse_2s_ease-in-out_infinite] ${typeClasses}`}>
      {Icon}
      <span className="text-xs font-bold tracking-widest uppercase">{message}</span>
    </div>
  );
};

export default Toast;
