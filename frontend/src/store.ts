import { configureStore } from '@reduxjs/toolkit';
import evaluationReducer from './store/evaluationSlice';

export const store = configureStore({
  reducer: {
    evaluation: evaluationReducer,
  },
});
