import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTimer } from '../../../hooks/useTimer';
import { useAutoSave } from '../../../hooks/useAutoSave';
import { useHeartbeat } from '../../../hooks/useHeartbeat';
import { useVisibilityDetector } from '../../../hooks/useVisibilityDetector';
import { useNetworkStatus } from '../../../hooks/useNetworkStatus';
import { setCurrentScreen, setResults } from '../../../store/evaluationSlice';
import { evaluationService } from '../../../services/evaluationService';
import QuestionCard from './QuestionCard';
import QuestionNavigation from './QuestionNavigation';
import QuestionMiniMap from './QuestionMiniMap';
import QuizHeader from './QuizHeader';
import ProgressBar from './ProgressBar';
import AutoSaveStatus from './AutoSaveStatus';
import Toast from './Toast';
import styles from '../QuizScreen.module.css';

const QuizScreen: React.FC = () => {
  useTimer();
  useAutoSave();
  useHeartbeat();
  useVisibilityDetector();
  const isOnline = useNetworkStatus();

  const dispatch = useDispatch();
  const timeRemainingSeconds = useSelector((state: any) => state.evaluation.timeRemainingSeconds);
  const questions = useSelector((state: any) => state.evaluation.questions as any[]);
  const currentQuestionIndex = useSelector((state: any) => state.evaluation.currentQuestionIndex);
  const sessionId = useSelector((state: any) => state.evaluation.sessionId);
  const answers = useSelector((state: any) => state.evaluation.answers as Record<string, any>);

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
      e.returnValue = 'Evaluación en progreso';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('copy', e => e.preventDefault());
    document.addEventListener('contextmenu', e => e.preventDefault());
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('copy', e => e.preventDefault());
      document.removeEventListener('contextmenu', e => e.preventDefault());
    };
  }, []);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'warning' | 'error' } | null>(null);

  useEffect(() => {
    if (timeRemainingSeconds === 600) setToast({ message: '10 minutos restantes', type: 'warning' });
    if (timeRemainingSeconds === 300) setToast({ message: '5 minutos restantes', type: 'warning' });
    if (timeRemainingSeconds === 60) setToast({ message: '1 minuto restante', type: 'error' });
    if (timeRemainingSeconds === 0) handleAutoSubmit();
  }, [timeRemainingSeconds]);

  // Agregar función handleAutoSubmit
  const handleAutoSubmit = () => {
    submitEvaluation();
  };

  useEffect(() => {
    if (!isOnline) {
      setToast({ message: 'Sin conexión. Reconectando...', type: 'error' });
    }
  }, [isOnline]);

  const handleFinish = () => {
    const unanswered = questions.filter((q: any) => {
      const ans = answers[q.id_pregunta];
      return !ans || !Array.isArray(ans.selectedOptions) || ans.selectedOptions.length === 0;
    });
    if (unanswered.length > 0) {
      if (!window.confirm('Hay preguntas sin responder. ¿Deseas finalizar de todos modos?')) return;
    }
    submitEvaluation();
  };

  const submitEvaluation = async () => {
    const preparedAnswers = Object.keys(answers).map(qId => {
      const ans = answers[qId];
      return {
        questionId: qId,
        selectedOptions: Array.isArray(ans.selectedOptions) ? ans.selectedOptions : [],
        markedForReview: !!ans.markedForReview,
        answeredAt: ans.answeredAt || null,
      };
    });
    const result = await evaluationService.submitEvaluation(sessionId, preparedAnswers, 'MANUAL');
    if (result) {
      dispatch(setResults(result));
    }
  };

  if (!questions.length) return <div>Cargando preguntas...</div>;

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion?.id_pregunta] || {};

  return (
    <div className={styles['quiz-screen']}>
      <QuizHeader />
      <ProgressBar />
      <AutoSaveStatus />
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.type === 'error' ? 5000 : 3000}
          onClose={() => setToast(null)}
        />
      )}
      <div className={styles['content']}>
        <QuestionCard question={currentQuestion} currentAnswer={currentAnswer} />
      </div>
      <QuestionMiniMap onFinish={handleFinish} />
    </div>
  );
};

export default QuizScreen;
