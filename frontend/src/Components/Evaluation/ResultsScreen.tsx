import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../store/evaluationSlice';
import styles from './ResultsScreen.module.css';
import { API_URL } from "../../config/api";

const ResultsScreen: React.FC = () => {
  const results = useSelector((state: any) => state.evaluation.results);
  const configuration = useSelector((state: any) => state.evaluation.configuration);
  console.log('RESULTS:', results);
  console.log('CONFIGURATION:', configuration);
  const courseId = useSelector((state: any) => state.evaluation.courseId);
  const dispatch = useDispatch();

  if (!results) return <div>Cargando resultados...</div>;

  // Comparar puntos obtenidos contra el puntaje mínimo requerido
  const isPassed = results.puntos_obtenidos >= (configuration.passingPercentage || 0);
  const maxAttempts = results.intentos_permitidos ?? 3;
  const attemptsMade = results.intentos_realizados ?? 0;
  const isLastAttempt = attemptsMade >= maxAttempts;

  const handleCertificado = async () => {
    try {
      // Usar solo el courseId de Redux
      const idCurso = courseId;
      if (!idCurso) {
        alert('No se pudo determinar el curso para el certificado.');
        return;
      }
      // Solicita el certificado vía API
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/certificacion/solicitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ id_curso: idCurso })
      });
      if (res.ok) {
        window.location.href = '/certificado';
      } else {
        alert('No se pudo solicitar el certificado.');
      }
    } catch (err) {
      alert('Error al solicitar el certificado.');
    }
  };

  return (
    <div className={styles['results-dashboard']}>
      <div className={styles['results-card']}>
        <div className={styles['results-card-icon']}>
          {isPassed ? (
            <svg xmlns="http://www.w3.org/2000/svg" height="56" viewBox="0 0 24 24" width="56" fill="#4caf50"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" height="56" viewBox="0 0 24 24" width="56" fill="#f44336"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
          )}
        </div>
        <div className={styles['results-card-row']}>
          <div className={styles['results-card-status']}>
            {isPassed
              ? '¡Felicidades, has aprobado la evaluación!'
              : 'No has alcanzado el puntaje necesario'}
          </div>
          <div className={styles['results-card-score']}>
            {results.calificacion}%
          </div>
        </div>
        <div style={{ marginBottom: '1.2rem', color: isPassed ? '#388e3c' : '#b71c1c', fontWeight: 500 }}>
          {isPassed && isLastAttempt
            ? '¡Excelente trabajo! Puedes descargar tu certificado y seguir aprendiendo.'
            : !isPassed && isLastAttempt
            ? 'No te desanimes, revisa tus respuestas y vuelve a intentarlo. Cada intento te acerca más a tu meta.'
            : null}
        </div>
        <div className={styles['results-card-stats']}>
          <div className={styles['results-stat']}>
            <span className={styles['stat-icon']}>
              <span className="material-icons" style={{ fontSize: 22, color: '#555' }}>military_tech</span>
            </span>
            <span>Puntos obtenidos: {results.puntos_obtenidos}</span>
          </div>
          <div className={styles['results-stat']}>
            <span className={styles['stat-icon']}>
              <span className="material-icons" style={{ fontSize: 22, color: '#555' }}>bar_chart</span>
            </span>
            <span>Puntos máximos: {results.puntos_maximos}</span>
          </div>
        </div>
        <div className={styles['results-card-actions']}>
          {isPassed ? (
            <button onClick={handleCertificado} className={styles['btn-passed']}>
              <span className={styles['btn-icon']}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              </span>
              Solicitar certificado
            </button>
          ) : (
            <button onClick={() => dispatch(setCurrentScreen('eligibility'))} className={styles['btn-failed']}>
              <span className={styles['btn-icon']}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12z"/></svg>
              </span>
              Volver a Intentar
            </button>
          )}
          {(isPassed || isLastAttempt) && (
            <button onClick={() => dispatch(setCurrentScreen('review'))} className={styles['btn-secondary']}>
              <span className={styles['btn-icon']}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 6v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2zm2 0h14v12H5V6zm7 2v8h2V8h-2zm-4 0v8h2V8H8z"/></svg>
              </span>
              Revisar Respuestas
            </button>
          )}
          <button onClick={() => {/* Volver al curso */}} className={styles['btn-secondary']}>
            <span className={styles['btn-icon']}>
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#fff"><path d="M0 0h24v24H0z" fill="none"/><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
            </span>
            Volver al Curso
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultsScreen;
