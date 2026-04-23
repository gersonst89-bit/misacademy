
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../../reseñas/page';
import './instructions-screen.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { evaluationService } from '../../services/evaluationService';
import { setConfiguration, startSession, setEligibility } from '../../store/evaluationSlice';
import NoAttemptsLeft from './NoAttemptsLeft';

const InstructionsScreen: React.FC = () => {
    // Setear el id del curso en Redux al montar el componente
    const dispatch = useDispatch();
    const configuration = useSelector((state: any) => state.evaluation.configuration);
    const eligibilityData = useSelector((state: any) => state.evaluation.eligibilityData);
    const [acceptedRules, setAcceptedRules] = useState(false);
    const [starting, setStarting] = useState(false);
    const [info, setInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { courseId } = useParams();

    useEffect(() => {
      if (courseId) {
        dispatch({ type: 'evaluation/setCourseId', payload: courseId });
      }
    }, [courseId, dispatch]);
  // ...existing code...

  useEffect(() => {
    if (!courseId) return;
    
    const sessionId = sessionStorage.getItem('sessionId');
    if (sessionId) {
      // Si hay intento en progreso, reanudar automáticamente
      evaluationService.resumeSession(sessionId).then(data => {
        dispatch(setConfiguration(data.session?.evaluacion?.configuration || {}));
        dispatch({ type: 'evaluation/resumeSession', payload: data });
      });
      return;
    }
    
    // Primero verificar elegibilidad
    evaluationService.checkEligibility(courseId).then(result => {
      if (!result.eligible) {
        // Si no es elegible, actualizar el estado
        dispatch(setEligibility(result));
        setLoading(false);
        return;
      }
      
      // Si es elegible, cargar información de la evaluación
      evaluationService.getEvaluationInfo(courseId).then(data => {
        setInfo(data);
        dispatch(setConfiguration(data.configuration));
        setLoading(false);
      });
    });
  }, [courseId, dispatch]);

  const handleStart = async () => {
    if (!acceptedRules) {
      alert('Debes aceptar las reglas');
      return;
    }
    setStarting(true);
    if (!info?.id_evaluacion) return;
    const result = await evaluationService.startEvaluation(info.id_evaluacion, true);
    if (result.intento) {
      dispatch(startSession(result));
    }
    setStarting(false);
  };

  // Si está cargando, mostrar spinner
  if (loading) return <LoadingSpinner />;

  // Si no es elegible y hay datos, mostrar la pantalla de ineligibilidad
  if (eligibilityData && !eligibilityData.eligible) {
    // Siempre mostrar el último intento si existe, sin importar la razón de inelegibilidad
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
    
    return (
      <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '500px' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem', color: '#f44336' }}>No puedes tomar la evaluación</h2>
          <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>{eligibilityData?.reason || 'No tienes acceso a esta evaluación en este momento'}</p>
        </div>
      </div>
    );
  }

  if (!info) return <LoadingSpinner />;

  // Evitar scroll: forzar altura mínima y overflow hidden
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div className="instructions-screen">
        <div style={{display:'flex',alignItems:'center',gap:'0.7rem',marginBottom:'1rem'}}>
          <span style={{fontSize:'1.7rem',color:'#2196f3'}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#2196f3" strokeWidth="2"/><path d="M8 12l2 2 4-4" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></span>
          <div>
            <h2 style={{margin:'0',fontWeight:700,fontSize:'1.25rem'}}>Reglas y condiciones de la evaluación</h2>
            <h3 style={{margin:'0.2rem 0',fontWeight:500,color:'#1769aa',fontSize:'1rem'}}>{info?.courseTitle || 'Curso'}</h3>
          </div>
        </div>
        <div className="info-grid" style={{marginBottom:'1.2rem'}}>
          <div><strong>Preguntas:</strong> {configuration.totalQuestions}</div>
          <div><strong>Tiempo límite:</strong> {Math.floor(configuration.timeLimitSeconds / 60)} min</div>
          <div><strong>Puntaje mínimo:</strong> {configuration.minScore ?? configuration.passingPercentage}</div>
          <div><strong>Intentos restantes:</strong> {configuration.remainingAttempts}</div>
        </div>
        <div style={{background:'#f5f8fa',borderRadius:'8px',padding:'0.7rem',marginBottom:'1rem',boxShadow:'0 2px 8px rgba(33,150,243,0.04)',maxHeight:'180px',overflowY:'auto'}}>
          <ul style={{margin:'0',paddingLeft:'1.2rem'}}>
            {info.rules?.map((rule: string, idx: number) => (
              <li key={idx} style={{marginBottom:'0.5rem',fontSize:'0.98rem',display:'flex',alignItems:'center',gap:'0.5rem'}}>
                <span style={{color:'#2196f3',fontSize:'1.1rem'}}>•</span> {rule}
              </li>
            ))}
          </ul>
        </div>
        <label style={{display:'flex',alignItems:'center',fontSize:'1rem',marginBottom:'1.2rem',gap:'0.5rem'}}>
          <input type="checkbox" checked={acceptedRules} onChange={e => setAcceptedRules(e.target.checked)} style={{accentColor:'#2196f3',width:'1.1rem',height:'1.1rem'}} />
          <span>He leído y acepto todas las reglas y condiciones</span>
        </label>
        <div className="actions">
          <button onClick={handleStart} disabled={!acceptedRules || starting} style={{minWidth:'160px',fontSize:'1rem'}}>
            {starting ? 'Iniciando...' : 'INICIAR EVALUACIÓN'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionsScreen;
