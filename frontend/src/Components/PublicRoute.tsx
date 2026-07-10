import { Navigate } from "react-router-dom";
import { useEffect, useState, type ReactNode } from "react";

export default function PublicRoute({
  children,
}: {
  children: ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const localUser = localStorage.getItem("user");
    if (localUser) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  if (isLoggedIn) {
    return <Navigate to="/perfil" replace />;
  }

  return <>{children}</>;
}
