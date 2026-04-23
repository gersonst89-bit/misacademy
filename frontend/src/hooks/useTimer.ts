import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { decrementTime } from '../store/evaluationSlice';

export const useTimer = () => {
  const dispatch = useDispatch();
  const timeRemaining = useSelector((state: any) => state.evaluation.timeRemainingSeconds);
  const timerStatus = useSelector((state: any) => state.evaluation.timerStatus);

  useEffect(() => {
    if (timerStatus !== 'running') return;
    const interval = setInterval(() => {
      dispatch(decrementTime());
    }, 1000);
    return () => clearInterval(interval);
  }, [timerStatus, dispatch]);
};
