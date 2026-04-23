import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { nextQuestion, previousQuestion, setCurrentScreen } from '../../../store/evaluationSlice';
import styles from '../QuizScreen.module.css';

interface Props {
  onFinish: () => void;
}

const QuestionNavigation: React.FC<Props> = ({ onFinish }) => {
  const dispatch = useDispatch();
  const currentQuestionIndex = useSelector((state: any) => state.evaluation.currentQuestionIndex);
  const questions = useSelector((state: any) => state.evaluation.questions);

  return (
    <div className={styles['question-navigation']}>
      <button onClick={() => dispatch(previousQuestion())} disabled={currentQuestionIndex === 0}>Anterior</button>
      <button onClick={() => dispatch(nextQuestion())} disabled={currentQuestionIndex === questions.length - 1}>Siguiente</button>
      <button onClick={onFinish}>Finalizar evaluación</button>
    </div>
  );
};

export default QuestionNavigation;
