
import React, { useEffect, useState } from 'react';
import { LoadingSpinner } from '../../resenas/page';
import './instructions-screen.css';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
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
    const navigate = useNavigate();

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
      evaluationService.resumeSession(sessionId).then(data => {
        dispatch(setConfiguration(data.session?.evaluacion?.configuration || {}));
        dispatch({ type: 'evaluation/resumeSession', payload: data });
      });
      return;
    }
    
    evaluationService.checkEligibility(courseId).then(result => {
      // Indicador de si ya tiene la nota máxima
      const hasPerfectScore = result.bestAttempt && result.bestAttempt.porcentaje >= 100;
      const hasPassed = result.hasPassed || (result.lastAttempt && result.lastAttempt.porcentaje >= (result.configuration?.passingPercentage || 60));
      const hasAttemptsLeft = (result.intentos_permitidos - result.intentos_usados) > 0;

      // Bloquear solo si: (Ya tiene 100%) O (No es elegible por otras razones) O (Ya aprobó Y no le quedan intentos)
      const shouldBlock = hasPerfectScore || !result.eligible || (hasPassed && !hasAttemptsLeft);
      
      // Guardar datos de elegibilidad en Redux
      dispatch(setEligibility({ ...result, hasPassed, hasPerfectScore }));

      if (shouldBlock) {
        setLoading(false);
        return;
      }
      
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
    if (!courseId) return;
    const result = await evaluationService.startEvaluation(courseId, true);
    if (result.intento) {
      dispatch(startSession(result));
    }
    setStarting(false);
  };

  if (loading) return <LoadingSpinner />;

  // LOGICA DE BLOQUEO REFINADA (RENDER)
  if (eligibilityData) {
    const hasPassed = eligibilityData.hasPassed;
    const hasPerfectScore = eligibilityData.hasPerfectScore;
    const hasAttemptsLeft = (eligibilityData.intentos_permitidos - eligibilityData.intentos_usados) > 0;
    const noAttempts = !hasAttemptsLeft;

    // Bloquear con pantalla de resultados si: (Ya tiene 100%) O (No tiene intentos)
    if (hasPerfectScore || noAttempts) {
      return (
        <NoAttemptsLeft 
          puntos_obtenidos={eligibilityData.bestAttempt?.puntaje_obtenido || eligibilityData.lastAttempt?.puntaje_obtenido}
          puntaje_maximo={eligibilityData.bestAttempt?.puntaje_total || eligibilityData.lastAttempt?.puntaje_total}
          porcentaje={eligibilityData.bestAttempt?.porcentaje || eligibilityData.lastAttempt?.porcentaje}
          puntaje_requerido={eligibilityData.configuration?.puntaje_aprobatorio || 60}
          fecha_finalizacion={eligibilityData.lastAttempt?.fecha_fin}
          intento_numero={eligibilityData.intentos_usados}
          reason={hasPerfectScore ? "¡Felicidades! Has alcanzado la nota máxima." : eligibilityData.reason}
        />
      );
    }

    // Caso B: No es elegible por otras razones (ej: lecciones incompletas)
    if (!eligibilityData.eligible) {
      return (
        <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              {eligibilityData.reason || "No puedes tomar la evaluación en este momento."}
            </p>
            <button 
              onClick={() => navigate(-1)}
              className="w-full py-4 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-sky-400 transition-all"
            >
              Volver al curso
            </button>
          </div>
        </div>
      );
    }
  }

  if (!info) return <LoadingSpinner />;

  // Evitar scroll: forzar altura mínima y overflow hidden
  return (
    <div className="min-h-screen w-full bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-white/[0.02] border border-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 sm:p-10 animate-fade-in-up">
        
        {/* Header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.3)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">Evaluación Final</h2>
            <h3 className="text-sky-400 font-medium text-lg">{info?.courseTitle || 'Curso'}</h3>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-white/10">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Preguntas</span>
            <span className="text-3xl font-black text-white">{configuration.totalQuestions}</span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-white/10">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Tiempo</span>
            <span className="text-3xl font-black text-white">{Math.floor(configuration.timeLimitSeconds / 60)}<span className="text-sm font-medium text-white/50 ml-1">m</span></span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-white/10">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Aprobar</span>
            <span className="text-3xl font-black text-emerald-400">{configuration.minScore ?? configuration.passingPercentage}<span className="text-sm font-medium text-emerald-400/50 ml-1">%</span></span>
          </div>
          <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition-all hover:bg-white/10">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest mb-2">Intentos</span>
            <span className="text-3xl font-black text-amber-400">{configuration.remainingAttempts}</span>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-black/40 border border-white/5 rounded-2xl p-6 mb-8">
          <h4 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-5 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Reglas y Condiciones
          </h4>
          <ul className="space-y-4">
            {info.rules?.map((rule: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3 text-sm text-white/80 leading-relaxed font-medium">
                <span className="text-sky-500 mt-0.5">✦</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Checkbox */}
        <label className="flex items-center gap-4 p-5 bg-sky-500/5 border border-sky-500/10 rounded-2xl cursor-pointer hover:bg-sky-500/10 transition-colors mb-8 group">
          <div className="relative flex items-center shrink-0">
            <input 
              type="checkbox" 
              checked={acceptedRules} 
              onChange={e => setAcceptedRules(e.target.checked)} 
              className="peer appearance-none w-7 h-7 border-2 border-sky-500/30 rounded-lg checked:bg-sky-500 checked:border-sky-500 transition-all cursor-pointer"
            />
            <svg className="absolute w-4 h-4 text-white top-1.5 left-1.5 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span className="text-white/80 text-sm font-semibold group-hover:text-white transition-colors">
            Confirmo que he leído y acepto las reglas para iniciar la evaluación.
          </span>
        </label>

        {/* Action Button */}
        <button 
          onClick={handleStart} 
          disabled={!acceptedRules || starting} 
          className="w-full py-5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 disabled:from-white/5 disabled:to-white/5 disabled:border disabled:border-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white text-sm font-black uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_40px_rgba(56,189,248,0.3)] disabled:shadow-none flex items-center justify-center gap-3"
        >
          {starting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              Iniciando Entorno Seguro...
            </>
          ) : (
            'INICIAR EVALUACIÓN'
          )}
        </button>
      </div>
    </div>
  );
};

export default InstructionsScreen;
