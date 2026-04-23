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
    <div className={styles['quiz-header']}>
      <span>Pregunta {currentQuestionIndex + 1} de {questions.length}</span>
      <span className={
        timeRemainingSeconds <= 60
          ? `${styles['timer']} ${styles['critical']}`
          : timeRemainingSeconds <= 300
          ? `${styles['timer']} ${styles['warning']}`
          : styles['timer']
      }>
        Tiempo restante: {formatTimer(timeRemainingSeconds)}
      </span>
      <span>
        {isOnline ? (
          <SignalCellularAltIcon style={{ color: '#4caf50', verticalAlign: 'middle' }} titleAccess="Conectado" />
        ) : (
          <SignalCellularConnectedNoInternet0BarIcon style={{ color: '#ef5350', verticalAlign: 'middle' }} titleAccess="Sin conexión" />
        )}
      </span>
    </div>
  );
};

export default QuizHeader;
