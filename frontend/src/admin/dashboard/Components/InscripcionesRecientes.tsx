import React from "react";
import { FaUserPlus, FaCalendarAlt } from "react-icons/fa";

interface Inscripcion {
  id_inscripcion: number;
  fecha_inscripcion: string;
  usuario: {
    nombre: string;
    apellido: string;
    email: string;
  };
  curso: {
    nombre: string;
  };
}

interface InscripcionesRecientesProps {
  inscripciones: Inscripcion[];
}

const InscripcionesRecientes: React.FC<InscripcionesRecientesProps> = ({ inscripciones }) => {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <FaUserPlus size={14} />
        </div>
        <span>Últimas Inscripciones</span>
      </h2>

      <div className="space-y-4">
        {inscripciones.length > 0 ? (
          inscripciones.map((insc, idx) => (
            <div 
              key={insc.id_inscripcion || idx}
              className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-md transition-all duration-300 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-lg group-hover:scale-110 transition-transform">
                  {insc.usuario.nombre.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#0E1C2B]">
                    {insc.usuario.nombre} {insc.usuario.apellido}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium truncate max-w-[150px]">
                    en {insc.curso.nombre}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 text-sky-600">
                  <FaCalendarAlt size={10} />
                  <span className="text-[10px] font-bold">
                    {new Date(insc.fecha_inscripcion).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <span className="text-[9px] text-gray-400 uppercase font-black tracking-tighter mt-1">Exitosa</span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-10 text-center text-gray-400 text-sm font-medium italic">
            No hay inscripciones recientes.
          </div>
        )}
      </div>
      
      {inscripciones.length > 0 && (
        <button className="mt-6 w-full py-3 rounded-xl border border-gray-100 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-sky-500 transition-all">
          Ver todas las inscripciones
        </button>
      )}
    </div>
  );
};

export default InscripcionesRecientes;
