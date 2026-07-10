


import { apiClient } from './apiClient';

export const evaluationService = {
  async checkEligibility(courseId: string) {
    try {
      const res = await apiClient.get(`/courses/${courseId}/evaluation/check-eligibility`);
      return res.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  },
  async getEvaluationInfo(courseId: string) {
    const res = await apiClient.get(`/courses/${courseId}/evaluation/info`);
    return res.data;
  },
  async startEvaluation(courseId: string | number, acceptedRules: boolean) {
    const res = await apiClient.post(`/evaluaciones/${courseId}/iniciar`, {
      acceptedRules,
      clientTimestamp: new Date().toISOString(),
    });
    sessionStorage.setItem('sessionId', res.data.intento.id_intento);
    return res.data;
  },
  async resumeSession(sessionId: string) {
    const res = await apiClient.get(`/evaluation-sessions/${sessionId}/resume`);
    return res.data;
  },
  async saveAnswer(sessionId: string, answerData: any) {
    const res = await apiClient.post(`/evaluation-sessions/${sessionId}/answers`, answerData);
    return res.data;
  },
  async saveAnswersBatch(sessionId: string, answers: any[]) {
    const res = await apiClient.post(`/evaluation-sessions/${sessionId}/answers/batch`, { answers });
    return res.data;
  },
  async sendHeartbeat(sessionId: string, data: any) {
    const res = await apiClient.post(`/evaluation-sessions/${sessionId}/heartbeat`, data);
    return res.data;
  },
  async recordEvents(sessionId: string, events: any[]) {
    const res = await apiClient.post(`/evaluation-sessions/${sessionId}/events`, { events });
    return res.data;
  },
  async submitEvaluation(sessionId: string, finalAnswers: any[], submissionType: string) {
    const res = await apiClient.post(`/evaluation-sessions/${sessionId}/submit`, {
      finishedAt: new Date().toISOString(),
      finalAnswers,
      submissionType,
    });
    sessionStorage.removeItem('sessionId');
    return res.data;
  },
  async getResults(attemptId: string) {
    const res = await apiClient.get(`/evaluaciones/intentos/${attemptId}`);
    return res.data;
  },
};

