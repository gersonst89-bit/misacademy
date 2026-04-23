import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentQuestion, nextQuestion, previousQuestion } from '../../../store/evaluationSlice';
import styles from '../QuizScreen.module.css';

interface Props {
  onFinish: () => void;
}

const QuestionMiniMap: React.FC<Props> = ({ onFinish }) => {
  const dispatch = useDispatch();
  const questions = useSelector((state: any) => state.evaluation.questions);
  const currentQuestionIndex = useSelector((state: any) => state.evaluation.currentQuestionIndex);
  const answers = useSelector((state: any) => state.evaluation.answers);

  const miniMap = questions.map((q: any, idx: number) => {
    const ans = answers[q.id_pregunta];
    let status: 'answered' | 'marked' | 'unanswered' | 'current' = 'unanswered';
    if (idx === currentQuestionIndex) status = 'current';
    else if (ans?.markedForReview) status = 'marked';
    else if (ans?.selectedOptions?.length) status = 'answered';
    return { questionId: q.id_pregunta, index: idx, status };
  });

  return (
    <div className={styles['mini-map']}>
      <h4>Navegación Rápida</h4>
      <div className={styles['grid']}>
        {miniMap.map((item: any, idx: number) => (
          <div
            key={item.questionId}
            className={
              `${styles['mini-map-item']} ${styles[item.status]}`
            }
            onClick={() => dispatch(setCurrentQuestion(item.index))}
          >
            {idx + 1}
          </div>
        ))}
      </div>
      <div className={styles['legend']}>
        <span className={styles['legend-item']}><span className={styles['circle']} style={{background:'#2196f3'}}></span>Respondida</span>
        <span className={styles['legend-item']}><span className={styles['circle']} style={{background:'#607d8b'}}></span>Marcada</span>
        <span className={styles['legend-item']}><span className={styles['circle']} style={{background:'#fff'}}></span>Actual</span>
        <span className={styles['legend-item']}><span className={styles['circle']} style={{background:'#1a2f42', borderColor: '#455a64', borderWidth: 2, borderStyle: 'solid'}}></span>Sin responder</span>
      </div>
      <div className={styles['mini-map-actions']}>
        <button onClick={() => dispatch(previousQuestion())} disabled={currentQuestionIndex === 0}>Anterior</button>
        <button onClick={() => dispatch(nextQuestion())} disabled={currentQuestionIndex === questions.length - 1}>Siguiente</button>
        <button onClick={onFinish} className={styles['finish-button']}>Finalizar</button>
      </div>
    </div>
  );
};

export default QuestionMiniMap;
