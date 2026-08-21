import { Navigate } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '../services/apiClient';
import { isAdminOrDocente } from '../constants/roles';

export default function ProtectedAdminRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // 1. Verificación rápida local
    const localUser = localStorage.getItem('user');

    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        const role = u.id_rol ?? u.user?.id_rol ?? 0;

        if (isAdminOrDocente(role)) {
          setAllowed(true);
        }
      } catch {
        localStorage.removeItem('user');
      }
    }

    // 2. Verificación real con el servidor
    apiClient
      .get('/auth/profile')
      .then((res) => {
        const profile = res.data;
        const userRole = profile.id_rol ?? profile.user?.id_rol ?? 3;

        if (isAdminOrDocente(userRole)) {
          setAllowed(true);

          // Guardar datos actualizados del usuario
          localStorage.setItem('user', JSON.stringify(profile));
        } else {
          // Usuario autenticado, pero sin permisos administrativos/docentes
          setAllowed(false);
          localStorage.removeItem('user');
          window.location.href = '/';
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error('Auth guard error:', err);

        const isNetworkError = !err?.response;

        if (isNetworkError) {
          // Mala conexión: mantenemos el acceso local si ya estaba permitido
          setLoading(false);
          return;
        }

        // El servidor rechazó explícitamente la sesión o el permiso
        setAllowed(false);
        localStorage.removeItem('user');
        setLoading(false);
      });
  }, []);

  if (loading && !allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#03070c] gap-6">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>

        <p className="text-sky-400 font-black tracking-widest uppercase text-[10px] animate-pulse">
          Validando Acceso Imperial...
        </p>
      </div>
    );
  }

  if (!loading && !allowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
