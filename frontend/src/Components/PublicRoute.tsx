import { Navigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '../services/apiClient';

export default function PublicRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let mounted = true;

    apiClient
      .get('/auth/profile')
      .then((res) => {
        if (!mounted) return;

        if (res.data) {
          setIsLoggedIn(true);
          localStorage.setItem('user', JSON.stringify(res.data));
        } else {
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        }
      })
      .catch((error) => {
        if (!mounted) return;

        const status = error?.response?.status;

        if (status === 401 || status === 403) {
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        } else if (!error?.response) {
          // Sin conexión: no bloqueamos la pantalla de login.
          setIsLoggedIn(false);
        } else {
          setIsLoggedIn(false);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return null;
  }

  if (isLoggedIn) {
    return <Navigate to="/perfil" replace />;
  }

  return <>{children}</>;
}
