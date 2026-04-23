import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAnswer, toggleMarkForReview } from '../../../store/evaluationSlice';
import styles from '../QuizScreen.module.css';

interface Props {
  question: any;
  currentAnswer: any;
}

const QuestionCard: React.FC<Props> = ({ question, currentAnswer }) => {
  const dispatch = useDispatch();

  const handleOptionChange = (optionId: string) => {
    let newSelected: string[] = [];
    if (question.allowMultipleAnswers) {
      newSelected = currentAnswer?.selectedOptions || [];
      if (newSelected.includes(optionId)) {
        newSelected = newSelected.filter(id => id !== optionId);
      } else {
        newSelected = [...newSelected, optionId];
      }
    } else {
      newSelected = [optionId];
    }
    dispatch(setAnswer({
      questionId: question.id_pregunta,
      answer: {
        selectedOptions: newSelected,
        markedForReview: currentAnswer?.markedForReview || false,
        answeredAt: new Date().toISOString(),
      },
    }));
  };

  const handleMarkForReview = () => {
    dispatch(toggleMarkForReview(question.id_pregunta));
  };

  return (
    <div className={styles['question-card']}>
      <div className={styles['question-number']}>Pregunta {question.orden || question.index || question.id_pregunta}</div>
      <div className={styles['question-text']}>{question.texto_pregunta}</div>
      <div className={styles['options']}>
        {question.opciones?.map((op: any) => (
          <div
            key={op.id_opcion}
            className={
              `${styles['option']}${currentAnswer?.selectedOptions?.includes(op.id_opcion) ? ' ' + styles['selected'] : ''}`
            }
            onClick={() => handleOptionChange(op.id_opcion)}
          >
            {op.texto_opcion}
          </div>
        ))}
      </div>
      <button onClick={handleMarkForReview}>
        {currentAnswer?.markedForReview ? 'Quitar marca de revisión' : 'Marcar para revisar'}
      </button>
    </div>
  );
};

export default QuestionCard;
