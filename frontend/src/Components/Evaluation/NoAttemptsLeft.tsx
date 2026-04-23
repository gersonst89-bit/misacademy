import React from 'react';
import styles from './ResultsScreen.module.css';

interface NoAttemptsLeftProps {
  puntos_obtenidos?: number;
  puntaje_maximo?: number;
  porcentaje?: number;
  puntaje_requerido?: number;
  fecha_finalizacion?: string;
  intento_numero?: number;
  reason?: string;
  // Mantener compatibilidad con calificacion legacy
  calificacion?: number | string;
}

const NoAttemptsLeft: React.FC<NoAttemptsLeftProps> = ({ 
  puntos_obtenidos,
  puntaje_maximo,
  porcentaje,
  puntaje_requerido,
  fecha_finalizacion, 
  intento_numero,
  reason,
  calificacion
}) => {
  // Calcular valores - usar los nuevos campos o fallback a calificacion legacy
  const puntosObtenidos = Number(puntos_obtenidos ?? (typeof calificacion === 'string' ? parseFloat(calificacion) : calificacion ?? 0)) || 0;
  const puntajeMaximo = Number(puntaje_maximo ?? 100) || 100;
  const puntajeRequerido = Number(puntaje_requerido ?? 60) || 60;
  const porcentajeCalculado = Number(porcentaje ?? (puntajeMaximo > 0 ? (puntosObtenidos / puntajeMaximo) * 100 : 0)) || 0;
  const isPassed = puntosObtenidos >= puntajeRequerido;

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className={styles['results-dashboard']}>
      <div className={styles['results-card']}>
        {reason && (
          <div style={{ 
            padding: '1rem', 
            marginBottom: '1rem', 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '8px',
            color: '#856404'
          }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>{reason}</p>
          </div>
        )}
        <div className={styles['results-card-icon']}>
          {isPassed ? (
            <svg xmlns="http://www.w3.org/2000/svg" height="56" viewBox="0 0 24 24" width="56" fill="#4caf50">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" height="56" viewBox="0 0 24 24" width="56" fill="#f44336">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
          )}
        </div>
        <div className={styles['results-card-row']}>
          <div className={styles['results-card-status']}>
            Resultado de tu último intento
          </div>
          <div className={styles['results-card-score']}>
            {(porcentajeCalculado || 0).toFixed(0)}%
          </div>
        </div>
        <div style={{ marginBottom: '1.2rem', color: isPassed ? '#388e3c' : '#b71c1c', fontWeight: 500 }}>
          {isPassed
            ? '¡Felicidades! Has aprobado la evaluación.'
            : `No alcanzaste el puntaje requerido (${puntajeRequerido.toFixed(2)} puntos).`}
        </div>
        <div className={styles['results-card-stats']}>
          <div className={styles['results-stat']}>
            <span className={styles['stat-icon']}>
              <span className="material-icons" style={{ fontSize: 22, color: '#555' }}>grade</span>
            </span>
            <span>Puntaje: {(puntosObtenidos || 0).toFixed(2)} / {(puntajeMaximo || 100).toFixed(2)} puntos</span>
          </div>
          <div className={styles['results-stat']}>
            <span className={styles['stat-icon']}>
              <span className="material-icons" style={{ fontSize: 22, color: '#555' }}>percent</span>
            </span>
            <span>Porcentaje: {(porcentajeCalculado || 0).toFixed(2)}%</span>
          </div>
          <div className={styles['results-stat']}>
            <span className={styles['stat-icon']}>
              <span className="material-icons" style={{ fontSize: 22, color: '#555' }}>check_circle</span>
            </span>
            <span>Puntaje requerido: {puntajeRequerido.toFixed(2)} puntos</span>
          </div>
          {intento_numero && (
            <div className={styles['results-stat']}>
              <span className={styles['stat-icon']}>
                <span className="material-icons" style={{ fontSize: 22, color: '#555' }}>format_list_numbered</span>
              </span>
              <span>Intento número: {intento_numero}</span>
            </div>
          )}
        </div>
        <div className={styles['results-card-actions']}>
          <button onClick={handleGoHome} className={isPassed ? styles['btn-passed'] : styles['btn-failed']}>
            <span className={styles['btn-icon']}>
              <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" fill="#fff">
                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
              </svg>
            </span>
            {isPassed ? 'Descargar Certificado' : 'Volver al Inicio'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoAttemptsLeft;
