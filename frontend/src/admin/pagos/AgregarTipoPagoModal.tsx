import { useState } from "react";
import InputComponent from "../components/InputComponent";
import { apiUrl,API_URL } from "../../config/api";

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AgregarTipoPagoModal({ onClose, onSuccess }: Props) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [activo, setActivo] = useState(true);
  const [comision, setComision] = useState<number | "">("");
  const [codigoReferencia, setCodigoReferencia] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() === "" ? null : descripcion.trim(),
        activo: activo ? 1 : 0, // 👈 enviado como número
        comision: !isNaN(Number(comision)) ? Number(comision) : 0,
        codigo_referencia:
          codigoReferencia.trim() === "" ? null : codigoReferencia.trim(),
      };

      console.log("📦 Enviando payload:", payload);

      const response = await fetch(`${API_URL}/tipos-pagos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status === "success") {
        alert("✅ Tipo de pago agregado correctamente");
        onSuccess();
      } else {
        alert(data.mensaje || "⚠️ Error al agregar tipo de pago");
      }
    } catch (err) {
      console.error("❌ Error al agregar tipo de pago:", err);
      alert("❌ Error de red o formato al agregar tipo de pago");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-screen overflow-y-auto animate-fade-in">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
          Agregar Tipo de Pago
        </h2>

          <InputComponent
            label="Nombre del tipo de pago"
            value={nombre}
            placeholder="Ingresa el nombre del tipo de pago"
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <InputComponent
            label="Descripción"
            value={descripcion}
            placeholder="Ingresa una breve descripción"
            onChange={(e) => setDescripcion(e.target.value)}
          />

          <InputComponent
            label="Comisión (%)"
            value={comision}
            placeholder="Ingresa la comisión a cobrar"
            onChange={(e) =>
              setComision(e.target.value === "" ? "" : Number(e.target.value))
            }
            min="0"
            step="0.01"/>

          <InputComponent
            label="Código de referencia"
            placeholder="Ingresa el código de referencia"
            value={codigoReferencia}
            onChange={(e) => setCodigoReferencia(e.target.value)}
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
            />
            <label className="text-gray-700">Activo</label>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 text-gray-800">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700">
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
      </div>
    </div>
  );
}
