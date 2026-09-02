import React from 'react';
import { FaUserPlus, FaCalendarAlt, FaRoute, FaBookOpen } from 'react-icons/fa';

interface ActividadReciente {
  id_actividad: string;

  tipo: 'ruta' | 'curso' | 'desconocido';

  fecha_inscripcion: string;

  usuario: {
    id_usuario: number;
    nombre: string;
    apellido: string;
    email: string;
  };

  curso: {
    id_curso: number;
    nombre: string;
  } | null;

  ruta: {
    id_ruta: number;
    nombre: string;
  } | null;
}

interface InscripcionesRecientesProps {
  inscripciones: ActividadReciente[];
}

const InscripcionesRecientes: React.FC<InscripcionesRecientesProps> = ({ inscripciones }) => {
  const hasData = inscripciones.length > 0;

  // =====================================================
  // FORMATEAR FECHA
  // =====================================================

  const formatDate = (fecha: string) => {
    const date = new Date(fecha);

    if (Number.isNaN(date.getTime())) {
      return {
        date: 'Fecha no disponible',
        time: '',
      };
    }

    return {
      date: date.toLocaleDateString('es-PE', {
        day: 'numeric',
        month: 'short',
      }),
      time: date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  return (
    <div className="flex flex-col h-full">
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="
            p-2.5
            rounded-2xl
            bg-blue-50
            text-blue-600
            shadow-sm
          "
        >
          <FaUserPlus size={18} />
        </div>

        <div>
          <h3
            className="
              text-[16px]
              font-black
              text-slate-900
              tracking-tight
              leading-none
              mb-1
            "
          >
            Actividad Reciente
          </h3>

          <p
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.15em]
              text-slate-400
            "
          >
            {hasData ? 'Últimas compras' : 'Resumen actual'}
          </p>
        </div>
      </div>

      {/* =====================================================
          CONTENIDO
      ====================================================== */}
      {hasData ? (
        <>
          <div className="space-y-3">
            {inscripciones.slice(0, 5).map((actividad) => {
              const nombreCompleto = `${actividad.usuario.nombre} ${actividad.usuario.apellido}`;

              const inicial = actividad.usuario.nombre?.charAt(0).toUpperCase() || '?';

              const esRuta = actividad.tipo === 'ruta';

              const nombreProducto = esRuta ? actividad.ruta?.nombre : actividad.curso?.nombre;

              const tipoProducto = esRuta ? 'RUTA ACADÉMICA' : 'CURSO';

              const fecha = formatDate(actividad.fecha_inscripcion);

              return (
                <div
                  key={actividad.id_actividad}
                  className="
                      group
                      relative
                      flex
                      items-center
                      justify-between
                      gap-4
                      p-3.5
                      rounded-2xl
                      bg-slate-50/70
                      border
                      border-slate-100
                      hover:bg-white
                      hover:border-slate-200
                      hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]
                      transition-all
                      duration-300
                    "
                >
                  {/* =================================================
                        USUARIO + PRODUCTO
                    ================================================== */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    <div
                      className="
                          flex-shrink-0
                          w-10
                          h-10
                          rounded-xl
                          bg-gradient-to-br
                          from-sky-400
                          to-blue-600
                          flex
                          items-center
                          justify-center
                          text-white
                          text-xs
                          font-black
                          shadow-sm
                          group-hover:scale-105
                          transition-transform
                          duration-300
                        "
                    >
                      {inicial}
                    </div>

                    {/* Información */}
                    <div className="flex flex-col min-w-0">
                      {/* Usuario */}
                      <span
                        className="
                            text-[13px]
                            font-black
                            text-slate-800
                            truncate
                          "
                        title={nombreCompleto}
                      >
                        {nombreCompleto}
                      </span>

                      {/* Producto */}
                      <div className="flex items-center gap-1.5 min-w-0 mt-1">
                        {esRuta ? (
                          <FaRoute
                            size={9}
                            className="
                                flex-shrink-0
                                text-violet-500
                              "
                          />
                        ) : (
                          <FaBookOpen
                            size={9}
                            className="
                                flex-shrink-0
                                text-sky-500
                              "
                          />
                        )}

                        <span
                          className="
                              text-[10px]
                              text-slate-400
                              font-medium
                              truncate
                            "
                          title={nombreProducto || 'Producto no disponible'}
                        >
                          {nombreProducto || 'Producto no disponible'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                        FECHA + TIPO
                    ================================================== */}
                  <div
                    className="
                        flex-shrink-0
                        flex
                        flex-col
                        items-end
                        gap-1
                      "
                  >
                    {/* Fecha */}
                    <div className="flex items-center gap-1.5">
                      <FaCalendarAlt size={9} className="text-sky-600" />

                      <span
                        className="
                            text-[10px]
                            font-black
                            text-sky-600
                          "
                      >
                        {fecha.date}
                      </span>

                      {fecha.time && (
                        <>
                          <span className="text-[9px] text-slate-300">·</span>

                          <span
                            className="
                                text-[9px]
                                font-medium
                                text-slate-400
                              "
                          >
                            {fecha.time}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Tipo */}
                    <span
                      className={`
                          px-2
                          py-0.5
                          rounded-md
                          border
                          text-[8px]
                          font-black
                          uppercase
                          tracking-[0.12em]
                          ${
                            esRuta
                              ? `
                                bg-violet-50
                                border-violet-100
                                text-violet-500
                              `
                              : `
                                bg-sky-50
                                border-sky-100
                                text-sky-600
                              `
                          }
                        `}
                    >
                      {tipoProducto}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* =====================================================
              ACCIÓN
          ====================================================== */}
          <button
            type="button"
            className="
              mt-5
              w-full
              py-2.5
              rounded-xl
              border
              border-slate-200
              bg-white
              text-[9px]
              font-black
              uppercase
              tracking-[0.16em]
              text-slate-500
              hover:text-sky-600
              hover:border-sky-200
              hover:bg-sky-50/50
              transition-all
              duration-300
            "
          >
            Ver toda la actividad
          </button>
        </>
      ) : (
        /* =====================================================
           ESTADO VACÍO
        ====================================================== */
        <div className="flex-1 min-h-[260px] flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div
              className="
                mx-auto
                w-14
                h-14
                rounded-2xl
                bg-blue-50
                text-blue-500
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <FaUserPlus size={22} />
            </div>

            <h4 className="text-sm font-black text-slate-700">Aún no hay actividad</h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Las nuevas compras e inscripciones aparecerán aquí cuando los estudiantes adquieran
              cursos o rutas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InscripcionesRecientes;
