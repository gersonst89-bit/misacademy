import { configureStore } from '@reduxjs/toolkit';
import evaluationReducer from './evaluationSlice';
import academicReducer from './academicSlice';

export const store = configureStore({
  reducer: {
    evaluation: evaluationReducer,
    academic: academicReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
