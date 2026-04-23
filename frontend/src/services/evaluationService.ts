

import axios from 'axios';
import { API_URL } from '../config/api';

const API = `${API_URL}/evaluaciones`;

// Función helper para obtener el token dinámicamente
const getAuthHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const evaluationService = {
  async checkEligibility(courseId: string) {
    try {
      const res = await axios.get(`${API}/courses/${courseId}/eligibility`, {
        headers: getAuthHeaders()
      });
      return res.data;
    } catch (error: any) {
      // Si el backend responde con 403, devolver el JSON de error
      if (error.response && error.response.data) {
        return error.response.data;
      }
      throw error;
    }
  },
  async getEvaluationInfo(courseId: string) {
    const res = await axios.get(`${API}/courses/${courseId}/info`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },
  async startEvaluation(courseId: string, acceptedRules: boolean) {
    const res = await axios.post(`${API}/${courseId}/iniciar`, {
      acceptedRules,
      clientTimestamp: new Date().toISOString(),
    }, {
      headers: getAuthHeaders()
    });
    // sessionId = res.data.intento.id_intento
    sessionStorage.setItem('sessionId', res.data.intento.id_intento);
    return res.data;
  },
  async resumeSession(sessionId: string) {
    const res = await axios.get(`${API}/sessions/${sessionId}/resume`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },
  async saveAnswer(sessionId: string, answerData: any) {
    const res = await axios.post(`${API}/sessions/${sessionId}/answers`, answerData, {
      headers: getAuthHeaders()
    });
    return res.data;
  },
  async saveAnswersBatch(sessionId: string, answers: any[]) {
    const res = await axios.post(`${API}/sessions/${sessionId}/answers/batch`, { answers }, {
      headers: getAuthHeaders()
    });
    return res.data;
  },
  async sendHeartbeat(sessionId: string, data: any) {
    const res = await axios.post(`${API}/sessions/${sessionId}/heartbeat`, data, {
      headers: getAuthHeaders()
    });
    return res.data;
  },
  async recordEvents(sessionId: string, events: any[]) {
    const res = await axios.post(`${API}/sessions/${sessionId}/events`, { events }, {
      headers: getAuthHeaders()
    });
    return res.data;
  },
  async submitEvaluation(sessionId: string, finalAnswers: any[], submissionType: string) {
    const res = await axios.post(`${API}/sessions/${sessionId}/submit`, {
      finishedAt: new Date().toISOString(),
      finalAnswers,
      submissionType,
    }, {
      headers: getAuthHeaders()
    });
    sessionStorage.removeItem('sessionId');
    return res.data;
  },
  async getResults(attemptId: string) {
    const res = await axios.get(`${API}/intentos/${attemptId}`, {
      headers: getAuthHeaders()
    });
    return res.data;
  },
};
