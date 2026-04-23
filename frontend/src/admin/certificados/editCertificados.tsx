"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { CertificacionAdicional } from "../../types/models";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  item: CertificacionAdicional;
  onSave: (data: CertificacionAdicional) => Promise<boolean>;
};

export function EditCertificadoModal({ isOpen, onClose, item, onSave }: Props) {
  if (!isOpen) return null;

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [codigo, setCodigo] = useState("");
  const [nombreEstudiante, setNombreEstudiante] = useState("");
  const [nombreCurso, setNombreCurso] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [totalHoras, setTotalHoras] = useState<number | "">("");
  const [emailDestinatario, setEmailDestinatario] = useState("");
  const [fechaEmision, setFechaEmision] = useState("");

  useEffect(() => {
    if (!item) return;

    setCodigo(item.codigo_certificado || "");
    setNombreEstudiante(item.nombre_estudiante || "");
    setNombreCurso(item.nombre_curso || "");
    setFechaInicio(item.fecha_inicio ? item.fecha_inicio.slice(0, 10) : "");
    setFechaFin(item.fecha_fin ? item.fecha_fin.slice(0, 10) : "");
    setTotalHoras(typeof item.total_horas === "number" ? item.total_horas : "");
    setEmailDestinatario(item.email_destinatario || "");
    setFechaEmision(item.fecha_emision ? item.fecha_emision.slice(0, 10) : "");
    setError(null);
  }, [item]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setIsSaving(true);

      const payload: CertificacionAdicional = {
        ...item,
        tipo_certificado: "adicional",
        codigo_certificado: codigo || "",
        nombre_estudiante: nombreEstudiante,
        nombre_curso: nombreCurso,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        total_horas: totalHoras || 0,
        email_destinatario: emailDestinatario,
        fecha_emision: fechaEmision || null, // Enviar la fecha de emisión
      };

      const ok = await onSave(payload);
      if (!ok) {
        setError("No se pudo actualizar el certificado adicional.");
        setIsSaving(false);
        return;
      }

      onClose();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al actualizar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Editar certificado adicional
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Código + fecha_emision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Código</label>
              <input
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Fecha de emisión (opcional)
              </label>
              <input
                type="date"
                value={fechaEmision}
                onChange={(e) => setFechaEmision(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Datos adicionales */}
          <div className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">
                  Nombre del estudiante
                </label>
                <input
                  value={nombreEstudiante}
                  onChange={(e) => setNombreEstudiante(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Nombre del curso</label>
                <input
                  value={nombreCurso}
                  onChange={(e) => setNombreCurso(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Fecha inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Fecha fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Total de horas</label>
                <input
                  type="number"
                  min={0}
                  value={totalHoras}
                  onChange={(e) =>
                    setTotalHoras(e.target.value ? Number(e.target.value) : "")
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  Email destinatario
                </label>
                <input
                  type="email"
                  value={emailDestinatario}
                  onChange={(e) => setEmailDestinatario(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-sky-600 text-white font-semibold hover:bg-sky-700 disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              disabled={isSaving}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCertificadoModal;
