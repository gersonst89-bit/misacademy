import { Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { apiClient } from "../services/apiClient";

export default function ProtectedRoute({
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
      setAllowed(true);
    }

    // 2. Verificación real con el servidor
    apiClient.get("/auth/profile")
      .then((res) => {
        if (res.data) {
          setAllowed(true);
          localStorage.setItem("user", JSON.stringify(res.data));
        } else {
          setAllowed(false);
          localStorage.removeItem("user");
        }
        setLoading(false);
      })
      .catch(() => {
        setAllowed(false);
        localStorage.removeItem("user");
        setLoading(false);
      });
  }, []);

  if (loading && !allowed) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#03070c] gap-6">
        <div className="w-12 h-12 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
        <p className="text-sky-400 font-black tracking-widest uppercase text-[10px] animate-pulse">
          Validando Sesión...
        </p>
      </div>
    );
  }

  if (!loading && !allowed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
