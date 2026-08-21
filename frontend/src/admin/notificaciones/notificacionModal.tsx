'use client';

import AdminModal from '../Components/AdminModal';
import {
  IoNotificationsOutline,
  IoPersonOutline,
  IoTimeOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5';

interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  mensaje: string;
  leido: boolean;
  fecha_creacion: string;
}

interface Props {
  data: Notificacion;
  onClose: () => void;
}

export const NotificacionModal = ({ data, onClose }: Props) => {
  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Fecha no disponible';

    const fechaISO = fecha.includes(' ') ? fecha.replace(' ', 'T') : fecha;

    const dateObj = new Date(fechaISO);

    if (isNaN(dateObj.getTime())) {
      return 'Fecha no válida';
    }

    return dateObj.toLocaleString('es-PE', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <AdminModal
      isOpen={true}
      onClose={onClose}
      title="Detalle de notificación"
      maxWidth="max-w-2xl"
      footer={
        <button
          onClick={onClose}
          className="w-full md:w-auto px-8 py-4 bg-[#0E1C2B] text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:shadow-2xl hover:shadow-sky-900/20 transition-all active:scale-95 border border-white/5"
        >
          Cerrar
        </button>
      }
    >
      <div className="space-y-6 md:space-y-8">
        {/* Encabezado */}
        <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 p-6 md:p-8 bg-gray-50/50 rounded-[1.5rem] md:rounded-[2.5rem] border border-gray-100 text-center sm:text-left">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-xl md:rounded-2xl shadow-sm flex items-center justify-center text-sky-500 shrink-0">
            <IoNotificationsOutline size={30} />
          </div>

          <div className="min-w-0">
            <h3 className="text-base md:text-lg font-black text-[#0E1C2B]">
              Notificación del sistema
            </h3>

            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Registro #{data.id_notificacion}
            </p>
          </div>
        </div>

        {/* Información general */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center shrink-0">
              <IoPersonOutline className="text-sky-500" size={17} />
            </div>

            <div>
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Usuario
              </label>

              <p className="text-xs md:text-sm font-bold text-[#0E1C2B]">
                Usuario #{data.id_usuario}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
              <IoTimeOutline className="text-purple-500" size={17} />
            </div>

            <div>
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Fecha y hora
              </label>

              <p className="text-xs md:text-sm font-bold text-[#0E1C2B]">
                {formatearFecha(data.fecha_creacion)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
              <IoCheckmarkCircleOutline className="text-emerald-500" size={17} />
            </div>

            <div>
              <label className="block text-[8px] font-black text-gray-400 uppercase tracking-widest">
                Estado
              </label>

              <p className="text-xs md:text-sm font-bold text-[#0E1C2B]">
                {data.leido ? 'Leída' : 'No leída'}
              </p>
            </div>
          </div>
        </div>

        {/* Mensaje */}
        <div className="space-y-3 pt-4 border-t border-gray-50">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Mensaje
          </h4>

          <div className="p-5 bg-sky-50/40 rounded-[1.5rem] border border-sky-100">
            <p className="text-sm md:text-base font-medium text-[#0E1C2B] leading-relaxed break-words">
              {data.mensaje}
            </p>
          </div>
        </div>
      </div>
    </AdminModal>
  );
};
