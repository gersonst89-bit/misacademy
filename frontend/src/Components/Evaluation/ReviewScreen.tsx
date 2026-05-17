import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { evaluationService } from '../../services/evaluationService';
import { setCurrentScreen } from '../../store/evaluationSlice';

const ReviewScreen: React.FC = () => {
  const dispatch = useDispatch();
  const reduxAttemptId = useSelector((state: any) => state.evaluation.attemptId);
  const results = useSelector((state: any) => state.evaluation.results);
  const questions = useSelector((state: any) => state.evaluation.questions);
  const attemptId = reduxAttemptId || results?.id_intento || results?.intento_id;
  
  const [detailedResults, setDetailedResults] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!detailedResults && attemptId) {
      evaluationService.getResults(attemptId).then(res => {
        setDetailedResults(res.intento || res);
      }).catch(err => {
        console.error("Error fetching review details", err);
        setError("No se pudieron cargar los detalles de la revisión.");
      });
    } else if (!attemptId) {
      setError("No se encontró el ID del intento para revisar las respuestas.");
    }
  }, [attemptId, detailedResults]);

  if (error) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center p-8 text-center gap-4">
        <p className="text-red-500 font-medium tracking-wide">{error}</p>
        <button 
          onClick={() => dispatch(setCurrentScreen('results'))}
          className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-semibold"
        >
          Volver a Resultados
        </button>
      </div>
    );
  }

  if (!detailedResults) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-white/10 border-t-white/80 rounded-full animate-spin" />
        <span className="text-white/50 text-xs font-bold tracking-widest uppercase">Cargando revisión...</span>
      </div>
    );
  }

  const respuestas = detailedResults.respuestas || detailedResults.detalles || [];
  
  const filteredQuestions = respuestas.filter((q: any) => {
    if (filter === 'correct') return q.puntos_obtenidos > 0;
    if (filter === 'incorrect') return q.puntos_obtenidos === 0;
    return true;
  });

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-white/30 overflow-hidden relative">
      
      {/* Sticky Header */}
      <div className="w-full bg-[#0a0a0a] border-b border-white/10 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => dispatch(setCurrentScreen('results'))}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Revisión Detallada</h2>
            <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Análisis de respuestas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-lg border border-white/10">
          <button 
            onClick={() => setFilter('all')} 
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === 'all' ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white/80'}`}
          >
            Todas
          </button>
          <button 
            onClick={() => setFilter('correct')} 
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === 'correct' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/50 hover:text-white/80 border border-transparent'}`}
          >
            Correctas
          </button>
          <button 
            onClick={() => setFilter('incorrect')} 
            className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${filter === 'incorrect' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-white/50 hover:text-white/80 border border-transparent'}`}
          >
            Incorrectas
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto p-4 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6">
        {filteredQuestions.map((q: any, idx: number) => {
          const isCorrect = q.puntos_obtenidos > 0;
          
          // Fallback lookups via global Redux state since the API only returns IDs
          const originalQuestion = questions.find((ques: any) => ques.id_pregunta === q.id_pregunta);
          const originalOption = originalQuestion?.opciones?.find((op: any) => op.id_opcion === q.id_opcion);

          return (
            <div key={idx} className={`bg-[#0a0a0a] border rounded-2xl p-6 md:p-8 transition-colors relative overflow-hidden ${isCorrect ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.05)]'}`}>
              
              {/* Decorative accent line */}
              <div className={`absolute top-0 left-0 w-1 h-full ${isCorrect ? 'bg-emerald-500/50' : 'bg-red-500/50'}`} />

              <div className="flex items-start justify-between gap-4 mb-6 pl-4">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${isCorrect ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-500' : 'border-red-500/30 bg-red-500/10 text-red-500'}`}>
                    {isCorrect ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                  </div>
                  <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Pregunta {idx + 1}</span>
                </div>
                <div className="bg-white/5 border border-white/10 px-3 py-1 rounded-md text-xs font-semibold text-white/70">
                  {q.puntos_obtenidos} pts
                </div>
              </div>

              <div className="text-lg font-medium text-white/90 mb-6 leading-relaxed pl-4">
                {q.pregunta?.texto_pregunta || originalQuestion?.texto_pregunta || q.texto_pregunta || "Texto de la pregunta no disponible"}
              </div>

              <div className="space-y-3 pl-4 mb-6">
                {originalQuestion?.opciones ? (
                  originalQuestion.opciones.map((op: any) => {
                    const isSelected = op.id_opcion === q.id_opcion;
                    // El backend podría ocultar 'es_correcta' para evitar trampas, así que lo deducimos de los puntos:
                    const isCorrectOption = op.es_correcta === 1 || op.es_correcta === true || (isSelected && q.puntos_obtenidos > 0);
                    
                    return (
                      <div 
                        key={op.id_opcion} 
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                          isSelected && isCorrectOption ? 'bg-emerald-500/10 border-emerald-500/30' : 
                          isSelected && !isCorrectOption ? 'bg-red-500/10 border-red-500/30' : 
                          isCorrectOption ? 'bg-emerald-500/5 border-emerald-500/20' : 
                          'bg-transparent border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                             isSelected && isCorrectOption ? 'border-emerald-500 bg-emerald-500' : 
                             isSelected && !isCorrectOption ? 'border-red-500 bg-red-500' : 
                             isCorrectOption ? 'border-emerald-500/50' :
                             'border-white/20'
                           }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                           </div>
                           <span className={`text-sm font-medium ${
                             isSelected ? 'text-white' : 
                             isCorrectOption ? 'text-emerald-400' : 
                             'text-white/60'
                           }`}>
                             {op.texto_opcion}
                           </span>
                        </div>

                        <div className="flex items-center gap-2 pl-8 sm:pl-0">
                          {isCorrectOption && !isSelected && (
                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/70 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              Respuesta Correcta
                            </span>
                          )}
                          {isSelected && (
                            <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-md border ${
                              isCorrectOption ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/20' : 'text-red-400 border-red-500/30 bg-red-500/20'
                            }`}>
                              Tu Respuesta
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">Tu Respuesta</div>
                    <div className="text-sm font-medium text-white/80">
                      {q.opcion?.texto_opcion || originalOption?.texto_opcion || q.respuesta_texto || <span className="text-white/30 italic">Sin respuesta</span>}
                    </div>
                  </div>
                )}
              </div>

              {(q.pregunta?.explicacion || originalQuestion?.explicacion || q.explicacion) && (
                <div className="mt-6 pt-6 border-t border-white/10 ml-4">
                  <div className="text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Explicación
                  </div>
                  <div className="text-sm text-white/60 leading-relaxed">
                    {q.pregunta?.explicacion || originalQuestion?.explicacion || q.explicacion}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default ReviewScreen;
