import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from './redux';
import { decrementTime } from '../store/evaluationSlice';

export const useTimer = () => {
  const dispatch = useAppDispatch();
  const timeRemaining = useAppSelector((state) => state.evaluation.timeRemainingSeconds);
  const timerStatus = useAppSelector((state) => state.evaluation.timerStatus);

  useEffect(() => {
    if (timerStatus !== 'running') return;
    const interval = setInterval(() => {
      dispatch(decrementTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStatus, dispatch]);
};
