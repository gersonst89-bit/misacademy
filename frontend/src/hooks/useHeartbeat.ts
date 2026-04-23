import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { evaluationService } from '../services/evaluationService';

export const useHeartbeat = () => {
  const sessionId = useSelector((state: any) => state.evaluation.sessionId);
  const currentQuestion = useSelector((state: any) => state.evaluation.questions[state.evaluation.currentQuestionIndex]);
  const timeElapsed = useSelector((state: any) => state.evaluation.timeElapsedSeconds);
  const answeredCount = useSelector((state: any) => state.evaluation.answeredCount);
  const securityEvents = useSelector((state: any) => state.evaluation.securityEvents);

  useEffect(() => {
    const interval = setInterval(() => {
      evaluationService.sendHeartbeat(sessionId, {
        currentQuestionId: currentQuestion?.id_pregunta,
        timeElapsedSeconds: timeElapsed,
        answeredCount,
        events: securityEvents,
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [sessionId, currentQuestion, timeElapsed, answeredCount, securityEvents]);
};
