import { Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";
import { apiUrl } from "../config/api";

export default function ProtectedAdminRoute({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAllowed(false);
      setLoading(false);
      return;
    }

    fetch(apiUrl("/auth/profile"), {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((r) => r.json())
      .then((p) => {
        if (p.id_rol === 1 || p.id_rol === 3) {
          setAllowed(true);
        } else {
          setAllowed(false);
        }
        setLoading(false);
      })
      .catch(() => {
        setAllowed(false);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Cargando…</div>;

  return allowed ? children : <Navigate to="/404" replace />;
}
