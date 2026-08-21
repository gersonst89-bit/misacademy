import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { evaluationService } from '../services/evaluationService';

export const useHeartbeat = () => {
  const sessionId = useSelector((state: any) => state.evaluation.sessionId);
  const currentQuestion = useSelector(
    (state: any) => state.evaluation.questions[state.evaluation.currentQuestionIndex],
  );
  const timeElapsed = useSelector((state: any) => state.evaluation.timeElapsedSeconds);
  const answeredCount = useSelector((state: any) => state.evaluation.answeredCount);
  const securityEvents = useSelector((state: any) => state.evaluation.securityEvents);

  // Guardamos siempre el snapshot más reciente sin provocar que el
  // intervalo se destruya y recree en cada actualización.
  const latestData = useRef({ currentQuestion, timeElapsed, answeredCount, securityEvents });
  useEffect(() => {
    latestData.current = { currentQuestion, timeElapsed, answeredCount, securityEvents };
  }, [currentQuestion, timeElapsed, answeredCount, securityEvents]);

  useEffect(() => {
    if (!sessionId) return;

    let inFlight = false;

    const interval = setInterval(() => {
      // Evita apilar peticiones si una anterior sigue en curso
      // (por ejemplo, por una conexión lenta).
      if (inFlight) return;

      // Si el navegador está offline, no intentamos ni gastamos el ciclo.
      if (!navigator.onLine) return;

      inFlight = true;
      const { currentQuestion, timeElapsed, answeredCount, securityEvents } = latestData.current;

      evaluationService
        .sendHeartbeat(sessionId, {
          currentQuestionId: currentQuestion?.id_pregunta,
          timeElapsedSeconds: timeElapsed,
          
          answeredCount,
          events: securityEvents,
        })
        .catch((err) => {
          // Fallo de red o de servidor: no bloqueamos el examen,
          // solo lo registramos para diagnóstico.
          console.warn('Heartbeat falló, se reintentará en el próximo ciclo:', err);
        })
        .finally(() => {
          inFlight = false;
        });
    }, 30000);

    return () => clearInterval(interval);
  }, [sessionId]); // 👈 solo se recrea si cambia la sesión
};
