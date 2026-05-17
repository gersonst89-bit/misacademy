import { configureStore } from '@reduxjs/toolkit';
import evaluationReducer from './store/evaluationSlice';
import academicReducer from './store/academicSlice';

export const store = configureStore({
  reducer: {
    evaluation: evaluationReducer,
    academic: academicReducer,
  },
});
