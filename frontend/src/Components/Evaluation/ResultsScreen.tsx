import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCurrentScreen } from '../../store/evaluationSlice';
import { useNavigate } from 'react-router-dom';
import styles from './ResultsScreen.module.css';
import { API_URL } from "../../config/api";

const ResultsScreen: React.FC = () => {
  const results = useSelector((state: any) => state.evaluation.results);
  const configuration = useSelector((state: any) => state.evaluation.configuration);
  const courseId = useSelector((state: any) => state.evaluation.courseId);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  if (!results) return <div>Cargando resultados...</div>;

  // Comparar porcentaje obtenido contra el puntaje mínimo requerido
  const isPassed = (results.porcentaje || 0) >= (configuration.passingPercentage || 0);
  const maxAttempts = results.intentos_permitidos ?? 3;
  const attemptsMade = results.intentos_realizados ?? 0;
  const isLastAttempt = attemptsMade >= maxAttempts;

  const handleCertificado = async () => {
    try {
      const idCurso = courseId;
      if (!idCurso) {
        alert('No se pudo determinar el curso para el certificado.');
        return;
      }
      // Solicita el certificado vía API
      const res = await fetch(`${API_URL}/certificaciones/solicitar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: "include",
        body: JSON.stringify({ id_curso: idCurso })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.codigo_certificado) {
          navigate(`/certificado/${data.codigo_certificado}`);
        } else {
          navigate('/certificados');
        }
      } else {
        const errorData = await res.json();
        alert('No se pudo solicitar el certificado: ' + (errorData.message || 'Error desconocido'));
      }
    } catch (err) {
      alert('Error al solicitar el certificado.');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-white/30 text-white z-0">
      
      {/* Premium Ambient Background Orb */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none transition-colors duration-1000 -z-10 ${isPassed ? 'bg-emerald-500/15' : 'bg-red-500/15'}`} />

      {/* Glassmorphism Card */}
      <div className="relative w-full max-w-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 md:p-12 text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10">
        
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center shadow-2xl relative rotate-3 ${isPassed ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20' : 'bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/20'}`}>
            <div className="absolute inset-0 rounded-2xl border border-white/20" />
            {isPassed ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white drop-shadow-md -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white drop-shadow-md -rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            )}
          </div>
        </div>

        {/* Title & Score */}
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white/90">
          {isPassed ? '¡Examen Aprobado!' : 'Examen Reprobado'}
        </h2>
        <div className="flex justify-center items-end gap-2 mb-6">
          <span className={`text-7xl font-black tracking-tighter text-transparent bg-clip-text ${isPassed ? 'bg-gradient-to-br from-emerald-300 to-teal-500' : 'bg-gradient-to-br from-red-300 to-rose-500'}`}>
            {results.calificacion}%
          </span>
        </div>

        {/* Message */}
        <p className="text-white/60 text-sm font-medium max-w-md mx-auto mb-10 leading-relaxed">
          {isPassed
            ? '¡Excelente trabajo! Has demostrado dominio en el tema. Ya puedes solicitar tu certificado oficial.'
            : isLastAttempt
            ? 'Has agotado tus intentos. Revisa tus respuestas, repasa el material y vuelve a intentarlo cuando estés listo.'
            : 'No alcanzaste la calificación mínima. Revisa el material e inténtalo de nuevo.'}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center transition-all hover:bg-white/[0.05]">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Puntos Obtenidos</span>
            <span className="text-3xl font-bold text-white/90">{results.puntos_obtenidos}</span>
          </div>
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center transition-all hover:bg-white/[0.05]">
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-2">Puntos Máximos</span>
            <span className="text-3xl font-bold text-white/90">{results.puntos_maximos}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col md:flex-row gap-4 justify-center mb-8">
          {isPassed ? (
            <>
              <button 
                onClick={handleCertificado} 
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
              >
                Solicitar Certificado
              </button>

              {(results.porcentaje || 0) < 100 && !isLastAttempt && (
                <button 
                  onClick={() => dispatch(setCurrentScreen('eligibility'))} 
                  className="flex-1 py-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.2)] flex items-center justify-center gap-2"
                >
                  Mejorar Nota
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={() => dispatch(setCurrentScreen('eligibility'))} 
              className="flex-1 py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)] flex items-center justify-center gap-2"
            >
              Volver a Intentar
            </button>
          )}

          <button 
            onClick={() => dispatch(setCurrentScreen('review'))} 
            className="flex-1 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Revisar Respuestas
          </button>
        </div>

        {/* Return to Course Button */}
        <button 
          onClick={() => navigate(`/video-page/${courseId}`)} 
          className="text-white/40 hover:text-white/80 text-xs font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 w-full"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al curso
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
