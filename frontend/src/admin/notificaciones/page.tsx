'use client';

import { useEffect, useState } from 'react';
import { NotificacionModal } from './notificacionModal';
import { apiClient } from '../../services/apiClient';
import { IoNotificationsOutline, IoTimeOutline, IoChevronForwardOutline } from 'react-icons/io5';

interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  mensaje: string;
  leido: boolean;
  fecha_creacion: string;
}

export const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalData, setModalData] = useState<Notificacion | null>(null);

  useEffect(() => {
    const obtenerNotificaciones = async () => {
      try {
        const respuesta = await apiClient.get('/notificaciones');

        const data = respuesta.data?.data || respuesta.data || [];

        setNotificaciones(data);
      } catch (error) {
        console.error('Error cargando notificaciones:', error);
        setNotificaciones([]);
      } finally {
        setCargando(false);
      }
    };

    obtenerNotificaciones();
  }, []);

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
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto py-8 px-4 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-[#0E1C2B] text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-sky-900/20">
            <IoNotificationsOutline size={28} />
          </div>

          <div>
            <h1 className="text-2xl font-black text-[#0E1C2B] tracking-tight">Notificaciones</h1>

            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Comunicaciones del sistema
            </p>
          </div>
        </div>

        <div className="bg-slate-50/50 px-6 py-4 rounded-[1.5rem] border border-slate-100 flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
              Total
            </span>

            <span className="text-xl font-black text-[#0E1C2B]">{notificaciones.length}</span>
          </div>

          <div className="w-[1px] h-8 bg-slate-200 mx-2" />

          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>

      {cargando ? (
        <div className="py-32 flex flex-col items-center gap-6">
          <div className="w-14 h-14 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] animate-pulse">
            Cargando notificaciones...
          </p>
        </div>
      ) : notificaciones.length === 0 ? (
        <div className="bg-white rounded-[3rem] p-32 text-center border border-slate-100 border-dashed">
          <IoNotificationsOutline size={56} className="mx-auto text-slate-200 mb-6" />

          <p className="text-[14px] font-black text-slate-700 uppercase tracking-widest">
            Sin notificaciones
          </p>

          <p className="text-[12px] text-slate-400 mt-2 italic">
            No tienes comunicaciones pendientes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notificaciones.map((n) => (
            <div
              key={n.id_notificacion}
              onClick={() => setModalData(n)}
              className={`group bg-white p-6 rounded-[2.5rem] border shadow-sm hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)] hover:border-sky-100 transition-all cursor-pointer flex items-center gap-6 ${
                n.leido ? 'border-slate-100' : 'border-sky-200 bg-sky-50/20'
              }`}
            >
              <div
                className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 border relative shadow-sm ${
                  n.leido
                    ? 'bg-slate-100 text-slate-400 border-slate-200'
                    : 'bg-sky-500/10 text-sky-500 border-sky-100'
                }`}
              >
                <IoNotificationsOutline size={30} />

                {!n.leido && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white bg-sky-500" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-black text-slate-900 group-hover:text-sky-600 transition-colors">
                  {n.mensaje}
                </p>

                <div className="flex items-center gap-2 mt-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <IoTimeOutline size={14} className="text-sky-500/50" />

                  {formatearFecha(n.fecha_creacion)}
                </div>
              </div>

              <div className="shrink-0 w-12 h-12 rounded-full bg-slate-50 text-slate-300 group-hover:bg-sky-500 group-hover:text-white transition-all flex items-center justify-center">
                <IoChevronForwardOutline
                  size={20}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {modalData && <NotificacionModal data={modalData} onClose={() => setModalData(null)} />}
    </div>
  );
};
