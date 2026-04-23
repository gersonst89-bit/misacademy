import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSaveStatus } from '../store/evaluationSlice';
import { evaluationService } from '../services/evaluationService';

export const useAutoSave = () => {
  const dispatch = useDispatch();
  const sessionId = useSelector((state: any) => state.evaluation.sessionId);
  const answers = useSelector((state: any) => state.evaluation.answers);
  const currentQuestion = useSelector((state: any) => state.evaluation.questions[state.evaluation.currentQuestionIndex]);

  useEffect(() => {
    if (!currentQuestion) return;
    const answer = answers[currentQuestion?.id_pregunta];
    if (!answer) return;
    dispatch(setSaveStatus({ status: 'saving' }));
    evaluationService.saveAnswer(sessionId, {
      questionId: currentQuestion.id_pregunta,
      selectedOptions: answer.selectedOptions,
      markedForReview: answer.markedForReview,
      answeredAt: answer.answeredAt && !isNaN(Date.parse(answer.answeredAt))
        ? new Date(answer.answeredAt).toISOString()
        : new Date().toISOString(),
    }).then(() => {
      dispatch(setSaveStatus({ status: 'saved', timestamp: new Date().toISOString() }));
    });
  }, [answers, currentQuestion, sessionId, dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      const allAnswers = Object.keys(answers).map(qId => {
        const ans = answers[qId];
        return {
          questionId: qId,
          selectedOptions: ans.selectedOptions,
          markedForReview: ans.markedForReview,
          answeredAt: ans.answeredAt && !isNaN(Date.parse(ans.answeredAt))
            ? new Date(ans.answeredAt).toISOString()
            : new Date().toISOString(),
        };
      });
      evaluationService.saveAnswersBatch(sessionId, allAnswers);
    }, 10000);
    return () => clearInterval(interval);
  }, [answers, sessionId]);
};
