"use client";

import { useState, type FormEvent } from "react";
import type { CertificacionAdicional } from "../../types/models";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<CertificacionAdicional, "id_certificacion">
  ) => Promise<boolean>;
};

export function AddCertificadoModal({ isOpen, onClose, onSave }: Props) {
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

  const resetForm = () => {
    setCodigo("");
    setNombreEstudiante("");
    setNombreCurso("");
    setFechaInicio("");
    setFechaFin("");
    setTotalHoras("");
    setEmailDestinatario("");
    setFechaEmision("");
    setError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación del código
    if (!/^ADI[A-Z0-9]{6}$/.test(codigo)) {
      setError(
        "El código debe comenzar con 'ADI' y tener exactamente 9 caracteres."
      );
      return;
    }

    // Validación de campos requeridos
    if (
      !nombreEstudiante ||
      !nombreCurso ||
      !fechaInicio ||
      !fechaFin ||
      !totalHoras ||
      !emailDestinatario
    ) {
      setError("Todos los campos son requeridos.");
      return;
    }

    try {
      setIsSaving(true);

      const payload: Omit<CertificacionAdicional, "id_certificacion"> = {
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
        setError("No se pudo guardar el certificado adicional.");
        setIsSaving(false);
        return;
      }

      resetForm();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Ocurrió un error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">
          Agregar certificado adicional
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Código</label>
              <input
                value={codigo}
                onChange={(e) => {
                  let v = e.target.value.toUpperCase();

                  if (!v.startsWith("ADI")) {
                    v = "ADI" + v.replace(/^ADI/i, "").replace(/ADI/i, "");
                  }

                  v = v.slice(0, 9); // Solo permitir 9 caracteres
                  setCodigo(v);
                }}
                maxLength={9}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="ADI000123"
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
                  placeholder="correo@ejemplo.com"
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
              {isSaving ? "Guardando..." : "Guardar"}
            </button>
            <button
              type="button"
              onClick={() => {
                resetForm();
                onClose();
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
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

export default AddCertificadoModal;
