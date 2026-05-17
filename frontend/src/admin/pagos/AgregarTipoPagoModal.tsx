"use client";

import { useState } from "react";
import InputComponent from "../Components/InputComponent";
import { API_URL } from "../../config/api";
import AdminModal from "../Components/AdminModal";
import { IoWalletOutline } from "react-icons/io5";

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
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!nombre.trim()) return setError("El nombre es obligatorio.");
    setError(null);
    setLoading(true);

    try {
      const payload = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || null,
        activo: activo ? 1 : 0,
        comision: !isNaN(Number(comision)) ? Number(comision) : 0,
        codigo_referencia: codigoReferencia.trim() || null,
      };

      const response = await fetch(`${API_URL}/tipos-pagos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.status === "success") {
        onSuccess();
      } else {
        setError(data.mensaje || "Error al agregar tipo de pago");
      }
    } catch (err) {
      setError("Error de red al intentar guardar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title="Nuevo Método de Pago"
      maxWidth="max-w-lg"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Configuración de Pasarela
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={loading} 
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5 disabled:opacity-50 text-sm"
          >
            {loading ? "Creando..." : "Crear Método"}
          </button>
          <button onClick={onClose} className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm">
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-6 md:py-8 bg-slate-100/40 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200/50 mb-2 md:mb-4 relative overflow-hidden group">
           <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
           <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-[1.25rem] md:rounded-[1.5rem] shadow-xl shadow-slate-200/50 flex items-center justify-center text-sky-500 mb-4 relative z-10 transition-transform duration-500 group-hover:scale-110 border border-slate-50">
              <IoWalletOutline size={34} />
           </div>
           <div className="flex flex-col items-center relative z-10 text-center px-4">
              <h3 className="text-[9px] md:text-[10px] font-black text-sky-600 uppercase tracking-[0.3em] bg-sky-100 px-4 py-1 rounded-full border border-sky-200/50">Módulo de Pasarela</h3>
              <p className="text-[12px] md:text-[13px] font-bold text-slate-400 mt-2">Configurar nuevo receptor de fondos</p>
           </div>
        </div>

        <InputComponent
          label="Nombre del Método"
          value={nombre}
          placeholder="Ej: Stripe, PayPal, Transferencia"
          onChange={(e) => setNombre(e.target.value)}
          required
        />

        <div>
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5 ml-1">Descripción de la Operativa</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-5 md:px-6 py-4 md:py-5 bg-slate-50/40 border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 focus:bg-white transition-all text-[13px] font-bold h-24 md:h-28 text-slate-900 placeholder:text-slate-300 shadow-inner"
            placeholder="Ej: Solo transferencias directas..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InputComponent
            label="Comisión (%)"
            type="number"
            value={String(comision)}
            placeholder="0.00"
            onChange={(e) => setComision(e.target.value === "" ? "" : Number(e.target.value))}
          />
          <InputComponent
            label="Código de Ref."
            placeholder="Opcional"
            value={codigoReferencia}
            onChange={(e) => setCodigoReferencia(e.target.value)}
          />
        </div>

        <label className="flex items-center gap-4 p-4 md:p-5 bg-slate-50/40 rounded-[1.25rem] md:rounded-[1.5rem] border border-slate-100 cursor-pointer group hover:bg-emerald-50/30 hover:border-emerald-200/50 transition-all duration-300">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="w-6 h-6 rounded-lg border-slate-300 text-emerald-500 focus:ring-emerald-500/20 transition-all cursor-pointer"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-600 transition-colors">Activar Inmediatamente</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-tight">Estará disponible en la pasarela de pagos</span>
          </div>
        </label>

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 animate-shake">
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">{error}</p>
          </div>
        )}
      </div>
    </AdminModal>
  );
}
