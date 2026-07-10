import React from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../services/apiClient';

interface NoAttemptsLeftProps {
  puntos_obtenidos?: number;
  puntaje_maximo?: number;
  porcentaje?: number;
  puntaje_requerido?: number;
  fecha_finalizacion?: string;
  intento_numero?: number;
  reason?: string;
  calificacion?: number | string;
  id_curso?: number | string;
}

const NoAttemptsLeft: React.FC<NoAttemptsLeftProps> = ({ 
  puntos_obtenidos,
  puntaje_maximo,
  porcentaje,
  puntaje_requerido,
  intento_numero,
  reason,
  calificacion,
  id_curso
}) => {
  const navigate = useNavigate();

  const handleVerCertificado = async () => {
    const finalCourseId = id_curso || window.location.pathname.split('/').pop();
    if (!finalCourseId) {
      navigate('/certificados');
      return;
    }

    try {
      const response = await apiClient.post('/certificaciones/solicitar', { id_curso: finalCourseId });
      const data = response.data;
      if (data && data.codigo_certificado) {
        navigate(`/certificado/${data.codigo_certificado}`);
      } else {
        navigate('/certificados');
      }
    } catch (e) {
      navigate('/certificados');
    }
  };

  const puntosObtenidos = Number(puntos_obtenidos ?? (typeof calificacion === 'string' ? parseFloat(calificacion) : calificacion ?? 0)) || 0;
  const puntajeMaximo = Number(puntaje_maximo ?? 100) || 100;
  const puntajeRequerido = Number(puntaje_requerido ?? 60) || 60;
  const porcentajeCalculado = Number(porcentaje ?? (puntajeMaximo > 0 ? (puntosObtenidos / puntajeMaximo) * 100 : 0)) || 0;
  const isPassed = porcentajeCalculado >= puntajeRequerido;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 pointer-events-none ${isPassed ? 'bg-emerald-500' : 'bg-red-500'}`} />

      <div className="relative w-full max-w-lg bg-[#0f0f0f]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 sm:p-12 shadow-2xl flex flex-col items-center">
        
        {/* Status Icon */}
        <div className={`w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center mb-8 ${isPassed ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border border-red-500/30 text-red-500'}`}>
          <div className="-rotate-3">
            {isPassed ? (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            ) : (
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white mb-2 text-center tracking-tight">
          Evaluación Finalizada
        </h2>

        {reason && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium px-4 py-3 rounded-xl mb-6 text-center w-full">
            {reason}
          </div>
        )}

        <div className="text-5xl font-black text-white tracking-tighter mb-2">
          {porcentajeCalculado.toFixed(0)}%
        </div>
        
        <p className={`text-sm font-medium mb-8 text-center ${isPassed ? 'text-emerald-400' : 'text-red-400'}`}>
          {isPassed ? '¡Felicidades! Has aprobado.' : `No alcanzaste el puntaje de ${puntajeRequerido.toFixed(0)} pts.`}
        </p>

        <div className="w-full space-y-3 mb-8">
          <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
            <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Puntaje</span>
            <span className="text-white font-medium">{puntosObtenidos.toFixed(0)} / {puntajeMaximo.toFixed(0)}</span>
          </div>
          {intento_numero && (
            <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex justify-between items-center">
              <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Intentos usados</span>
              <span className="text-white font-medium">{intento_numero}</span>
            </div>
          )}
        </div>

        <button 
          onClick={isPassed ? handleVerCertificado : () => navigate('/cursos')} 
          className={`w-full py-4 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg mb-4 ${isPassed ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20' : 'bg-white hover:bg-white/90 text-black'}`}
        >
          {isPassed ? 'Ver Mi Certificado' : 'Ver otros cursos'}
        </button>

        <button 
          onClick={() => navigate(-1)} 
          className="text-white/40 hover:text-white/80 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Regresar
        </button>

      </div>
    </div>
  );
};

export default NoAttemptsLeft;
