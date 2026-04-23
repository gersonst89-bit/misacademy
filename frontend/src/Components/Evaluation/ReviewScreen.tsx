import React, { useEffect, useState } from 'react';
import styles from './ReviewScreen.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { evaluationService } from '../../services/evaluationService';
import { setCurrentScreen } from '../../store/evaluationSlice';

const ReviewScreen: React.FC = () => {
  const dispatch = useDispatch();
  const attemptId = useSelector((state: any) => state.evaluation.attemptId);
  const [detailedResults, setDetailedResults] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  useEffect(() => {
    if (!detailedResults && attemptId) {
      evaluationService.getResults(attemptId).then(res => {
        setDetailedResults(res.intento);
      });
    }
  }, [attemptId, detailedResults]);

  if (!detailedResults) return <div className={styles.reviewScreen}>Cargando revisión...</div>;

  const filteredQuestions = detailedResults.respuestas.filter((q: any) => {
    if (filter === 'correct') return q.puntos_obtenidos > 0;
    if (filter === 'incorrect') return q.puntos_obtenidos === 0;
    return true;
  });

  return (
    <div className={styles.reviewScreen}>
      <div className={styles.headerSticky}>
        <h2>Revisión Detallada</h2>
        <button onClick={() => dispatch(setCurrentScreen('results'))}>Volver a Resultados</button>
      </div>
      <div className={styles.filters}>
        <button onClick={() => setFilter('all')}>Todas</button>
        <button onClick={() => setFilter('correct')}>Correctas</button>
        <button onClick={() => setFilter('incorrect')}>Incorrectas</button>
      </div>
      <div className={styles.questionsList}>
        {filteredQuestions.map((q: any, idx: number) => (
          <div key={idx} className={`${styles.reviewCard} ${q.puntos_obtenidos > 0 ? styles.correct : styles.incorrect}`}>
            <div className={styles.cardHeader}>Pregunta {idx + 1}</div>
            <div className={styles.questionText}>{q.pregunta?.texto_pregunta}</div>
            <div className={styles.options}>
              {/* Opciones y respuesta del usuario */}
              <div>
                Tu respuesta: {
                  q.opcion?.texto_opcion
                  ? q.opcion.texto_opcion
                  : (q.respuesta_texto ?? <span className="muted">(Sin respuesta)</span>)
                }
              </div>
              <div>Puntos: {q.puntos_obtenidos}</div>
            </div>
            {q.pregunta?.explicacion && (
              <div className={styles.explanation}>Explicación: {q.pregunta.explicacion}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewScreen;
