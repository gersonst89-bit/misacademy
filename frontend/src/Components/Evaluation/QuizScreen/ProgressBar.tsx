import React from 'react';
import { useSelector } from 'react-redux';
import styles from '../QuizScreen.module.css';

const ProgressBar: React.FC = () => {
  const answeredCount = useSelector((state: any) => state.evaluation.answeredCount);
  const questions = useSelector((state: any) => state.evaluation.questions);

  // Progreso solo avanza con preguntas respondidas
  const percentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className={styles['progress-bar']}>
      <div
        className={styles['progress-fill']}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
