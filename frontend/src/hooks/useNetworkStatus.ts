import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { setOnlineStatus } from '../store/evaluationSlice';
import { apiClient } from '../services/apiClient';

export const useNetworkStatus = () => {
  const dispatch = useDispatch();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const wasOffline = useRef(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      dispatch(setOnlineStatus(true));

      if (wasOffline.current) {
        wasOffline.current = false;
        apiClient.get('/auth/profile').catch(() => {
          // Si falla, el interceptor global ya decide si reintentar,
          // refrescar o cerrar sesión. Aquí no hacemos nada más.
        });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasOffline.current = true;
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