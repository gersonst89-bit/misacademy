import React from 'react';
import { useSelector } from 'react-redux';
import styles from '../QuizScreen.module.css';

const ProgressBar: React.FC = () => {
  const answeredCount = useSelector((state: any) => state.evaluation.answeredCount);
  const questions = useSelector((state: any) => state.evaluation.questions);

  // Progreso solo avanza con preguntas respondidas
  const percentage = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  return (
    <div className="w-full h-[1px] bg-white/10 relative z-20">
      <div
        className="h-full bg-white transition-all duration-500 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

export default ProgressBar;
