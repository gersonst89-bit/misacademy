import { useState } from "react";
import AdminModal from "../Components/AdminModal";
import SelectComponent from "../Components/SelectComponent";
import {
  IoPersonOutline,
  IoMailOutline,
  IoDocumentTextOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { apiClient } from "../../services/apiClient";

interface Reclamacion {
  id: number;
  nombre_completo: string;
  dni: string;
  email: string;
  tipo_reclamo: string;
  asunto: string;
  descripcion: string;
  estado: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  reclamacion: Reclamacion | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function DetalleReclamacionModal({ reclamacion, onClose, onUpdated }: Props) {
  const [nuevoEstado, setNuevoEstado] = useState(reclamacion?.estado || "pendiente");
  const [loading, setLoading] = useState(false);

  if (!reclamacion) return null;

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await apiClient.patch(`/admin/reclamaciones/${reclamacion.id}`, {
        estado: nuevoEstado,
      });
      onUpdated();
      onClose();
    } catch (error) {
      console.error("Error al actualizar estado:", error);
    } finally {
      setLoading(false);
    }
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case "resuelto":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10";
      case "en_revision":
        return "bg-sky-500/20 text-sky-400 border-sky-500/30 shadow-sky-500/10";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-amber-500/10";
    }
  };

  const estadoLabel = (estado: string) => {
    switch (estado) {
      case "resuelto": return "Resuelto";
      case "en_revision": return "En Revisión";
      default: return "Pendiente";
    }
  };

  const recId = `REC-${String(reclamacion.id).padStart(5, "0")}`;

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title={`Reclamación ${recId}`}
      maxWidth="max-w-xl"
      footer={
        <>
          <div className="flex items-center gap-2 text-slate-400 font-extrabold text-[10px] uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100/50 w-full md:w-auto justify-center md:justify-start md:mr-auto">
            Libro de Reclamaciones
          </div>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="w-full md:w-auto bg-gradient-to-br from-[#0E1C2B] to-[#1a3a5a] text-white px-10 py-4 rounded-2xl font-black tracking-tight hover:shadow-2xl hover:shadow-slate-900/20 transition-all active:scale-95 shadow-lg border border-white/5 disabled:opacity-50 text-sm"
          >
            {loading ? "Guardando..." : "Confirmar Estado"}
          </button>
          <button
            onClick={onClose}
            className="w-full md:w-auto px-6 py-3 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-sm"
          >
            Cancelar
          </button>
        </>
      }
    >
      <div className="space-y-6 md:space-y-8">
        {/* Header Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-red-400/80 mb-3 md:mb-4 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">
              {reclamacion.tipo_reclamo}
            </span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight leading-tight max-w-md">
              {reclamacion.asunto}
            </h3>
            <div
              className={`mt-6 md:mt-8 px-5 md:px-6 py-2.5 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] border backdrop-blur-md shadow-lg ${estadoColor(reclamacion.estado)}`}
            >
              Estado Actual: {estadoLabel(reclamacion.estado)}
            </div>
          </div>
        </div>

        {/* Datos del Reclamante */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm">
              <IoPersonOutline size={18} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Datos del Reclamante
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/40 rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 border border-slate-100/50">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
                <IoPersonOutline size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Nombre Completo
                </span>
                <span className="text-[12px] md:text-[13px] font-bold text-slate-700 truncate block">
                  {reclamacion.nombre_completo}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                <IoShieldCheckmarkOutline size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  DNI
                </span>
                <span className="text-[12px] md:text-[13px] font-bold text-slate-700">
                  {reclamacion.dni}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
                <IoMailOutline size={20} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Correo
                </span>
                <span className="text-[12px] md:text-[13px] font-bold text-sky-600 truncate block">
                  {reclamacion.email}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <IoCalendarOutline size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Fecha Registro
                </span>
                <span className="text-[12px] md:text-[13px] font-bold text-slate-700">
                  {new Date(reclamacion.created_at).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Descripción del Reclamo */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2 px-2">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shadow-sm">
              <IoDocumentTextOutline size={18} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
              Descripción del Reclamo
            </h4>
          </div>

          <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
              {reclamacion.descripcion}
            </p>
          </div>
        </div>

        {/* Cambiar Estado */}
        <div className="space-y-4 md:space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center shadow-sm">
              <IoCheckmarkCircleOutline size={18} />
            </div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
              Acción Requerida
            </h4>
          </div>

          <SelectComponent
            label="Nuevo Estado"
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value)}
            options={[
              { value: "pendiente", label: "Pendiente" },
              { value: "en_revision", label: "En Revisión" },
              { value: "resuelto", label: "Resuelto" },
            ]}
          />
        </div>
      </div>
    </AdminModal>
  );
}
