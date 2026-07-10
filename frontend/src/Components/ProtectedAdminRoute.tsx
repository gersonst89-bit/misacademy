import { Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { apiClient } from "../services/apiClient";

export default function ProtectedAdminRoute({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    // 1. Verificación rápida local (Optimistic Check)
    const localUser = localStorage.getItem("user");
    if (localUser) {
      try {
        const u = JSON.parse(localUser);
        const role = u.id_rol || u.user?.id_rol || 0;
        if (role === 1 || role === 2) {
          setAllowed(true); // Permitir entrada inicial si el local dice que es admin
        }
      } catch (e) {}
    }

    // 2. Verificación real con el servidor
    apiClient.get("/auth/profile")
      .then((res) => {
        const p = res.data;
        const userRole = p.id_rol || p.user?.id_rol || 3;
        if (userRole === 1 || userRole === 2) {
          setAllowed(true);
          // Actualizar local storage con datos frescos
          localStorage.setItem("user", JSON.stringify(p));
        } else {
          setAllowed(false);
          window.location.href = "/"; // Si no es admin, fuera al home
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Auth guard error:", err);
        // Si hay error de red pero ya teníamos permiso local, mantenemos el acceso
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

  // Si no está permitido después de cargar, mandamos al home en lugar de un 404 confuso
  if (!loading && !allowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
