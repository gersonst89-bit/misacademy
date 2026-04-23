import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { addSecurityEvent } from '../store/evaluationSlice';

export const useVisibilityDetector = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        dispatch(addSecurityEvent({ type: 'TAB_SWITCH', timestamp: new Date().toISOString() }));
      }
    };
    const handleBlur = () => {
      dispatch(addSecurityEvent({ type: 'WINDOW_BLUR', timestamp: new Date().toISOString() }));
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [dispatch]);
};
