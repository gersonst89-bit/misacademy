"use client";

import { FaTimes } from "react-icons/fa";
import type {
  Certificacion,
  CertificacionEmpresa,
  CertificacionAdicional,
} from "../../types/models";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item:
    | (Certificacion & { curso_nombre?: string; usuario_nombre?: string })
    | null;
}

export function InfoCertificadoModal({ isOpen, onClose, item }: Props) {
  if (!isOpen || !item) return null;

  const isEmpresa = item.tipo_certificado === "empresa";

  const url =
    isEmpresa && "url_certificado" in item && item.url_certificado
      ? item.url_certificado
      : null;

  const formatDateLocal = (date: string | null) => {
    if (!date) return "—";

    const [year, month, day] = date.split("-").map(Number);
    const parsedDate = new Date(year, month - 1, day);

    return parsedDate.toLocaleDateString("es-ES");
  };

  const formatDateOriginal = (date: string | null) => {
    if (!date) return "—";
    const parsedDate = new Date(date);
    return parsedDate.toLocaleDateString("es-ES");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg animate-fade-in relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={18} />
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 text-center mb-6">
          Información del Certificado
        </h2>

        <div className="space-y-3 text-gray-700 text-sm">
          <p>
            <strong>Código:</strong> {item.codigo_certificado}
          </p>
          <p>
            <strong>Tipo:</strong>{" "}
            {item.tipo_certificado === "empresa" ? "Empresa" : "Adicional"}
          </p>

          {isEmpresa ? (
            <>
              <p>
                <strong>Usuario:</strong> {item.usuario_nombre || "—"}
              </p>
              <p>
                <strong>Curso:</strong> {item.curso_nombre || "—"}
              </p>
              <p>
                <strong>Calificación final:</strong>{" "}
                {("calificacion_final" in item &&
                  (item as CertificacionEmpresa).calificacion_final) ??
                  "—"}
              </p>
              <p>
                <strong>Fecha de emisión:</strong>{" "}
                {formatDateOriginal(item.fecha_emision)}
              </p>
            </>
          ) : (
            <>
              <p>
                <strong>Estudiante:</strong> {item.usuario_nombre || "—"}
              </p>
              <p>
                <strong>Curso:</strong> {item.curso_nombre || "—"}
              </p>
              <p>
                <strong>Fecha de emisión:</strong>{" "}
                {formatDateOriginal(item.fecha_emision)}
              </p>
              <p>
                <strong>Fechas:</strong>{" "}
                {item.fecha_inicio && item.fecha_fin ? (
                  <>
                    {formatDateLocal(item.fecha_inicio)} –{" "}
                    {formatDateLocal(item.fecha_fin)}
                  </>
                ) : (
                  "—"
                )}
              </p>
              <p>
                <strong>Total de horas:</strong>{" "}
                {typeof (item as CertificacionAdicional).total_horas ===
                "number"
                  ? (item as CertificacionAdicional).total_horas
                  : "—"}
              </p>
              <p>
                <strong>Email destinatario:</strong>{" "}
                {(item as CertificacionAdicional).email_destinatario || "—"}
              </p>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoCertificadoModal;
