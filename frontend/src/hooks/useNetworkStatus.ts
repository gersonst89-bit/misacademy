import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setOnlineStatus } from '../store/evaluationSlice';

export const useNetworkStatus = () => {
  const dispatch = useDispatch();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      dispatch(setOnlineStatus(true));
    };
    const handleOffline = () => {
      setIsOnline(false);
      dispatch(setOnlineStatus(false));
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return isOnline;
};
