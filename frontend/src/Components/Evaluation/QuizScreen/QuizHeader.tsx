import React from 'react';
import { useSelector } from 'react-redux';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import SignalCellularConnectedNoInternet0BarIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0Bar';
import styles from '../QuizScreen.module.css';

const QuizHeader: React.FC = () => {
  const currentQuestionIndex = useSelector((state: any) => state.evaluation.currentQuestionIndex);
  const questions = useSelector((state: any) => state.evaluation.questions);
  const timeRemainingSeconds = useSelector((state: any) => state.evaluation.timeRemainingSeconds);
  const isOnline = useSelector((state: any) => state.evaluation.isOnline);

  const formatTimer = (seconds: number) => {
    if (typeof seconds !== 'number' || isNaN(seconds) || seconds < 0) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#0a0a0a] px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <span className="text-white/50 text-xs font-medium uppercase tracking-widest hidden md:inline">Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
        <span className="text-white/50 text-xs font-medium md:hidden">{currentQuestionIndex + 1} / {questions.length}</span>
      </div>

      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-md border transition-colors ${
        timeRemainingSeconds <= 60
          ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
          : timeRemainingSeconds <= 300
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          : 'bg-white/5 border-white/10 text-white'
      }`}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span className="font-mono font-medium tracking-wide">{formatTimer(timeRemainingSeconds)}</span>
      </div>

      <div className="flex items-center gap-2">
        {isOnline ? (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-white/50 text-xs font-medium hidden sm:inline">Conectado</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-white/50 text-xs font-medium hidden sm:inline">Desconectado</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizHeader;

