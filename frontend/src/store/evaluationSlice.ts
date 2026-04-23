import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Answer {
  selectedOptions: string[];
  markedForReview: boolean;
  answeredAt: string;
}

interface EvaluationState {
  currentScreen: 'eligibility' | 'instructions' | 'quiz' | 'results' | 'review';
  status: 'idle' | 'loading' | 'active' | 'submitted' | 'error';
  courseId: string;
  courseTitle: string;
  isEligible: boolean;
  eligibilityData: any;
  configuration: {
    totalQuestions: number;
    timeLimitSeconds: number;
    passingPercentage: number;
    maxAttempts: number;
    remainingAttempts: number;
  };
  sessionId: string;
  sessionToken: string;
  attemptId: string;
  startedAt: string;
  questions: any[];
  currentQuestionIndex: number;
  answers: Record<string, Answer>;
  answeredCount: number;
  markedForReviewCount: number;
  timeRemainingSeconds: number;
  timeElapsedSeconds: number;
  timerStatus: 'stopped' | 'running' | 'paused';
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: string;
  isOnline: boolean;
  securityEvents: any[];
  warningLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  results: any;
}

const initialState: EvaluationState = {
  currentScreen: 'eligibility',
  status: 'idle',
  courseId: '',
  courseTitle: '',
  isEligible: false,
  eligibilityData: null,
  configuration: {
    totalQuestions: 0,
    timeLimitSeconds: 0,
    passingPercentage: 0,
    maxAttempts: 0,
    remainingAttempts: 0,
  },
  sessionId: '',
  sessionToken: '',
  attemptId: '',
  startedAt: '',
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  answeredCount: 0,
  markedForReviewCount: 0,
  timeRemainingSeconds: 0,
  timeElapsedSeconds: 0,
  timerStatus: 'stopped',
  saveStatus: 'idle',
  lastSaved: '',
  isOnline: true,
  securityEvents: [],
  warningLevel: 'LOW',
  results: null,
};

const evaluationSlice = createSlice({
  name: 'evaluation',
  initialState,
  reducers: {
    setCurrentScreen(state: EvaluationState, action: PayloadAction<EvaluationState['currentScreen']>) {
      state.currentScreen = action.payload;
    },
    setCourseId(state: EvaluationState, action: PayloadAction<string>) {
      state.courseId = action.payload;
    },
    setEligibility(state: EvaluationState, action: PayloadAction<any>) {
      state.isEligible = action.payload.eligible;
      state.eligibilityData = action.payload;
    },
    setConfiguration(state: EvaluationState, action: PayloadAction<EvaluationState['configuration']>) {
      state.configuration = action.payload;
    },
    startSession(state: EvaluationState, action: PayloadAction<any>) {
      state.sessionId = action.payload.intento?.id_intento || '';
      state.attemptId = action.payload.intento?.id_intento || '';
      state.startedAt = action.payload.intento?.fecha_inicio || '';
      state.questions = action.payload.evaluacion?.preguntas || [];
      // Limpiar respuestas y contadores al iniciar nuevo intento
      state.answers = {};
      state.answeredCount = 0;
      state.markedForReviewCount = 0;
      state.currentScreen = 'quiz';
      state.status = 'active';
      state.timeRemainingSeconds = state.configuration.timeLimitSeconds;
      state.timerStatus = 'running';
    },
    resumeSession(state: EvaluationState, action: PayloadAction<any>) {
      state.sessionId = action.payload.session?.id_intento || '';
      state.attemptId = action.payload.session?.id_intento || '';
      state.startedAt = action.payload.session?.fecha_inicio || '';
      state.questions = action.payload.session?.evaluacion?.preguntas || [];
      // Poblar answers con las respuestas guardadas, soportando arrays y valores únicos
      const savedAnswers = action.payload.session?.respuestas || [];
      const answersObj: Record<string, Answer> = {};
      savedAnswers.forEach((ans: any) => {
        let selectedOptions: string[] = [];
        if (Array.isArray(ans.selectedOptions)) {
          selectedOptions = ans.selectedOptions;
        } else if (Array.isArray(ans.opciones_seleccionadas)) {
          selectedOptions = ans.opciones_seleccionadas;
        } else if (ans.selectedOptions) {
          selectedOptions = [ans.selectedOptions];
        } else if (ans.id_opcion) {
          selectedOptions = [ans.id_opcion];
        }
        answersObj[ans.questionId || ans.id_pregunta] = {
          selectedOptions,
          markedForReview: !!ans.markedForReview,
          answeredAt: ans.answeredAt || ans.fecha_respuesta || '',
        };
      });
      // Solo poblar answers si hay respuestas guardadas
      if (Object.keys(answersObj).length > 0) {
        state.answers = answersObj;
      }
      state.answeredCount = Object.values(state.answers).filter(a => (a as Answer).selectedOptions.length > 0).length;
      state.markedForReviewCount = Object.values(state.answers).filter(a => (a as Answer).markedForReview).length;
      state.currentScreen = 'quiz';
      state.status = 'active';
      // Restaurar tiempo restante si viene del backend, si no usar el de la configuración
      const tiempoRestante = action.payload.tiempo_restante ?? action.payload.session?.tiempo_restante ?? action.payload.session?.timeRemainingSeconds;
      state.timeRemainingSeconds = typeof tiempoRestante === 'number' && !isNaN(tiempoRestante)
        ? tiempoRestante
        : state.configuration.timeLimitSeconds;
      state.timerStatus = 'running';
    },
    setAnswer(state: EvaluationState, action: PayloadAction<{ questionId: string; answer: Answer }>) {
      state.answers[action.payload.questionId] = action.payload.answer;
      state.answeredCount = Object.values(state.answers).filter(a => (a as Answer).selectedOptions.length > 0).length;
      state.markedForReviewCount = Object.values(state.answers).filter(a => (a as Answer).markedForReview).length;
    },
    setCurrentQuestion(state: EvaluationState, action: PayloadAction<number>) {
      state.currentQuestionIndex = action.payload;
    },
    nextQuestion(state: EvaluationState) {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        state.currentQuestionIndex += 1;
      }
    },
    previousQuestion(state: EvaluationState) {
      if (state.currentQuestionIndex > 0) {
        state.currentQuestionIndex -= 1;
      }
    },
    toggleMarkForReview(state: EvaluationState, action: PayloadAction<string>) {
      const qId = action.payload;
      if (state.answers[qId]) {
        state.answers[qId].markedForReview = !state.answers[qId].markedForReview;
      }
    },
    decrementTime(state: EvaluationState) {
      if (state.timeRemainingSeconds > 0) {
        state.timeRemainingSeconds -= 1;
        state.timeElapsedSeconds += 1;
      }
    },
    pauseTimer(state: EvaluationState) {
      state.timerStatus = 'paused';
    },
    resumeTimer(state: EvaluationState) {
      state.timerStatus = 'running';
    },
    setOnlineStatus(state: EvaluationState, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    addSecurityEvent(state: EvaluationState, action: PayloadAction<any>) {
      state.securityEvents.push(action.payload);
    },
    setResults(state: EvaluationState, action: PayloadAction<any>) {
      state.results = action.payload;
      state.currentScreen = 'results';
      state.status = 'submitted';
    },
    resetEvaluation(state: EvaluationState) {
      Object.assign(state, initialState);
    },
    setSaveStatus(state: EvaluationState, action: PayloadAction<{ status: 'idle' | 'saving' | 'saved' | 'error'; timestamp?: string }>) {
      state.saveStatus = action.payload.status;
      if (action.payload.timestamp) state.lastSaved = action.payload.timestamp;
    },
  },
});

export const {
  setCurrentScreen,
  setEligibility,
  setConfiguration,
  setCourseId,
  startSession,
  resumeSession,
  setAnswer,
  setCurrentQuestion,
  nextQuestion,
  previousQuestion,
  toggleMarkForReview,
  decrementTime,
  pauseTimer,
  resumeTimer,
  setOnlineStatus,
  addSecurityEvent,
  setResults,
  resetEvaluation,
  setSaveStatus,
} = evaluationSlice.actions;

export default evaluationSlice.reducer;
