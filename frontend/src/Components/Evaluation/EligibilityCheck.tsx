
import React, { useEffect } from 'react';
import { LoadingSpinner } from '../../reseñas/page';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { evaluationService } from '../../services/evaluationService';
import { setEligibility, setConfiguration, setCurrentScreen } from '../../store/evaluationSlice';
import NoAttemptsLeft from './NoAttemptsLeft';

const EligibilityCheck: React.FC = () => {
  const dispatch = useDispatch();
  const isEligible = useSelector((state: any) => state.evaluation.isEligible);
  const eligibilityData = useSelector((state: any) => state.evaluation.eligibilityData);
  const { courseId } = useParams();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!courseId) return;
    setLoading(true);
    evaluationService.checkEligibility(courseId).then(result => {
      dispatch(setEligibility(result));
      if (result.eligible) {
        dispatch(setConfiguration(result.configuration));
        // Mantener el spinner visible durante 1 segundo mientras InstructionsScreen carga
        setTimeout(() => {
          dispatch(setCurrentScreen('instructions'));
          setLoading(false);
        }, 1000);
      } else {
        setLoading(false);
      }
    }).catch(error => {
      setLoading(false);
    });
  }, [courseId, dispatch]);

  if (loading) return <LoadingSpinner />;
  
  // Si es elegible, no renderizar nada (dejar que otro componente maneje)
  if (isEligible) return null;

  // Si no tiene intentos disponibles, mostrar la calificación del último intento
  // Esto aplica para cualquier razón de inelegibilidad, no solo falta de intentos
  if (eligibilityData?.lastAttempt) {
    return (
      <NoAttemptsLeft 
        puntos_obtenidos={eligibilityData.lastAttempt.puntos_obtenidos}
        puntaje_maximo={eligibilityData.lastAttempt.puntaje_maximo}
        porcentaje={eligibilityData.lastAttempt.porcentaje}
        puntaje_requerido={eligibilityData.lastAttempt.puntaje_requerido}
        fecha_finalizacion={eligibilityData.lastAttempt.fecha_finalizacion}
        intento_numero={eligibilityData.lastAttempt.intento_numero}
        reason={eligibilityData.reason}
        calificacion={eligibilityData.lastAttempt.calificacion}
      />
    );
  }

  // Caso general: mostrar mensaje de ineligibilidad
  return (
    <div className="eligibility-check" style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: '500px' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#f44336' }}>No puedes tomar la evaluación</h2>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>{eligibilityData?.reason || 'No tienes acceso a esta evaluación en este momento'}</p>
      </div>
    </div>
  );
};

export default EligibilityCheck;
