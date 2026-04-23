import { useState } from "react";
import type { Pago } from "../../types/models";

interface EditarPagoModalProps {
  pago: Pago | null;
  onClose: () => void;
  onActualizar: (id: number, nuevoEstado: string) => void;
}


export default function EditarPagoModal({ pago, onClose, onActualizar }: EditarPagoModalProps) {
  const [nuevoEstado, setNuevoEstado] = useState(pago?.estado || "");
  const [loading, setLoading] = useState(false);

  if (!pago) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-bold text-center text-sky-700 mb-4">
          Gestión del Pago #{pago.id_pago}
        </h2>

        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Actualizar Estado
          </h3>
          <select
            className="border rounded-md p-2 w-full mb-3"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
          >
            <option value="Pendiente">Pendiente</option>
            <option value="Completado">Completado</option>
            <option value="Fallido">Fallido</option>
            <option value="Reembolsado">Reembolsado</option>
          </select>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Resumen del Pago
          </h3>
          <p><strong>ID:</strong> {pago.id_pago}</p>
          <p><strong>Fecha:</strong> {new Date(pago.fecha_pago).toLocaleDateString()}</p>
          <p>
            <strong>Usuario:</strong>{" "}
            {pago.usuario
              ? `${pago.usuario.nombre} ${pago.usuario.apellido}`
              : "Desconocido"}
          </p>
          <p><strong>Email:</strong> {pago.usuario?.email ?? "No registrado"}</p>
          <p><strong>Estado Actual:</strong> {pago.estado}</p>
          <p><strong>Total:</strong> S/ {Number(pago.monto).toFixed(2)}</p>
        </div>

        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition"
          >
            Cerrar
          </button>
              <button
      disabled={loading}
      onClick={async () => {
        setLoading(true);
        await onActualizar(pago.id_pago, nuevoEstado);
        setLoading(false); }}
      className={`bg-sky-600 text-white px-4 py-2 rounded-md transition
        ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-sky-700"}`}>
      {loading ? "Guardando..." : "Guardar Cambios"}
    </button>
        </div>
      </div>
    </div>
  );
}
