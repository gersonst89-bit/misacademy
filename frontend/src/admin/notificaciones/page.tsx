import { useEffect, useState } from "react";
import { NotificacionModal } from "./notificacionModal";
import { apiUrl,API_URL } from "../../config/api";

interface Auditoria {
  id: number;
  event: string;
  model: string;
  user_name: string;
  user_email: string;
  user_rol: string;
  old_values: Record<string, any>;
  new_values: Record<string, any>;
  created_at: string;
  url: string;
}

export const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Auditoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalData, setModalData] = useState<Auditoria | null>(null);

  useEffect(() => {
    const obtenerNotificaciones = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return setCargando(false);

        const respuesta = await fetch(
          `${API_URL}/auditoria`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!respuesta.ok) return setCargando(false);

        const data = await respuesta.json();
        setNotificaciones(data?.data || []);
      } catch {
        setCargando(false);
      } finally {
        setCargando(false);
      }
    };

    obtenerNotificaciones();
  }, []);

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleString("es-PE", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  const obtenerDescripcion = (n: Auditoria) => {
    const modelo = n.model.replace("App\\Models\\", "");

    switch (n.event) {
      case "created":
        return `creó un nuevo registro en ${modelo}.`;
      case "updated":
        return `realizó cambios en ${modelo}.`;
      case "deleted":
        return `eliminó un registro en ${modelo}.`;
      default:
        return `realizó una acción en ${modelo}.`;
    }
  };

  if (cargando)
    return (
      <div className="p-6 text-white text-center text-lg">
        Cargando notificaciones...
      </div>
    );

  return (
    <div className="p-6 text-white">
      {notificaciones.length === 0 ? (
        <p>No hay notificaciones recientes.</p>
      ) : (
        <ul className="space-y-4">
          {notificaciones.map((n) => (
            <li
              key={n.id}
              onClick={() => setModalData(n)}
              className="bg-slate-800 p-4 rounded-lg shadow-md cursor-pointer hover:bg-slate-900 transition"
            >
              <p className="text-base">
                <span className="font-semibold text-sky-300">
                  {n.user_name}
                </span>{" "}
                ({n.user_rol}) {obtenerDescripcion(n)}
              </p>

              <p className="text-sm text-gray-400 mt-1">
                <span className="font-medium">Fecha:</span>{" "}
                {formatearFecha(n.created_at)}
              </p>
            </li>
          ))}
        </ul>
      )}

      {modalData && (
        <NotificacionModal
          data={modalData}
          onClose={() => setModalData(null)}
        />
      )}
    </div>
  );
};
