import React, { useEffect, useState } from "react";
import { apiUrl } from "../config/api";

interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
}

const Certificado: React.FC = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No se encontró el token de autenticación.");
          return;
        }
        const response = await fetch(
          apiUrl("/auth/profile"),
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error(
              "Token inválido o expirado. Inicia sesión nuevamente."
            );
          }
          if (response.status === 403) {
            throw new Error(
              "Acceso prohibido. No tienes permisos para ver el perfil."
            );
          }
          throw new Error(`Error HTTP ${response.status}`);
        }
        const data = await response.json();
        setUsuario(data);
      } catch (err: any) {
        console.error("Error al obtener usuario:", err);
        setError(err.message || "Error al conectar con la API.");
      }
    };

    fetchUsuario();
  }, []);

  return (
    <div
      className="flex items-center justify-center p-8"
      style={{
        background: "linear-gradient(to right, #0E1C2B, #197DDD)",
      }}
    >
      <div className="w-full max-w-[1000px] space-y-5">
        <div className="text-center mb-6 lg:mb-7">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            ¡Felicidades por completar el curso!
          </h1>
          <p className="mt-4 text-lg text-white max-w-4xl mx-auto">
            Tu certificado llegará en un plazo de 24 horas al correo{" "}
            <strong>{usuario?.email || "usuario@misacademy.com"}</strong>.
          </p>
          {error && <p className="text-red-400 mt-2">{error}</p>}
        </div>
        <div
          className="relative bg-white rounded-xl overflow-hidden shadow-2xl border mx-auto mb-3"
          style={{
            width: "808px",
            height: "572px",
            borderColor: "#0E1C2B",
          }}
        >
          <img
            src="/certificado.jpg"
            alt="Certificado"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Certificado;
