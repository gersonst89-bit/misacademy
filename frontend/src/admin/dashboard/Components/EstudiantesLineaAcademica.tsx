import { FaUserAlt } from 'react-icons/fa';

interface EstudiantesLineaAcademicaProps {
  lineasAcademicas: {
    name: string;
    Cantidad: number;
    value?: number;
  }[];
}

const EstudiantesLineaAcademica: React.FC<EstudiantesLineaAcademicaProps> = ({
  lineasAcademicas,
}) => {
  // =====================================================
  // PREPARAR DATOS
  // =====================================================

  const data = lineasAcademicas
    .map((linea) => ({
      name: linea.name,
      value: Number(linea.value ?? linea.Cantidad ?? 0),
    }))
    .sort((a, b) => b.value - a.value);

  const hasData = data.length > 0;

  const hasStudents = data.some((item) => item.value > 0);

  // Máximo de estudiantes entre las líneas.
  // Se utiliza únicamente para comparar visualmente
  // las barras entre sí.
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  // Número de líneas que actualmente tienen estudiantes.
  const activeLines = data.filter((item) => item.value > 0).length;

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
            bg-lime-50
            text-lime-600
            shadow-sm
          "
        >
          <FaUserAlt size={18} />
        </div>

        <div>
          <h3
            className="
    text-[16px]
    font-extrabold
    font-['Plus_Jakarta_Sans']
    text-slate-900
    tracking-normal
    leading-tight
    mb-1
  "
          >
            Estudiantes por Línea
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
            {hasStudents ? 'Distribución académica' : 'Resumen actual'}
          </p>
        </div>
      </div>

      {/* =====================================================
          SIN LÍNEAS ACADÉMICAS
      ====================================================== */}
      {!hasData && (
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div
              className="
                mx-auto
                w-14
                h-14
                rounded-2xl
                bg-lime-50
                text-lime-600
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <FaUserAlt size={22} />
            </div>

            <h4 className="text-sm font-black text-slate-700">Aún no hay datos</h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              La distribución aparecerá aquí cuando existan líneas académicas disponibles.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          LÍNEAS EXISTENTES, PERO SIN ESTUDIANTES
      ====================================================== */}
      {hasData && !hasStudents && (
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div
              className="
                mx-auto
                w-14
                h-14
                rounded-2xl
                bg-lime-50
                text-lime-600
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <FaUserAlt size={22} />
            </div>

            <h4 className="text-sm font-black text-slate-700">Sin estudiantes asignados</h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Las líneas académicas están disponibles, pero todavía no tienen estudiantes.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          RANKING
      ====================================================== */}
      {hasStudents && (
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-4">
            {data.map((item, index) => {
              const relativeWidth = (item.value / maxValue) * 88;

              const isTop = index === 0 && item.value > 0;

              const studentLabel = item.value === 1 ? 'estudiante' : 'estudiantes';

              return (
                <div key={`${item.name}-${index}`} className="group">
                  {/* =================================================
                      INFORMACIÓN DE LA LÍNEA
                  ================================================== */}
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Posición */}
                      <span
                        className={`
                          flex-shrink-0
                          w-6
                          h-6
                          rounded-lg
                          flex
                          items-center
                          justify-center
                          text-[9px]
                          font-black
                          ${isTop ? 'bg-lime-50 text-lime-600' : 'bg-slate-50 text-slate-400'}
                        `}
                      >
                        {index + 1}
                      </span>

                      {/* Nombre */}
                      <span
                        className="
                          text-[12px]
                          font-bold
                          text-slate-700
                          truncate
                        "
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>

                    {/* Cantidad */}
                    <span
                      className={`
                        flex-shrink-0
                        text-[10px]
                        font-black
                        ${isTop ? 'text-lime-600' : 'text-slate-500'}
                      `}
                    >
                      {item.value} {studentLabel}
                    </span>
                  </div>

                  {/* =================================================
                      BARRA
                  ================================================== */}
                  <div
                    className="
                      relative
                      h-2
                      w-full
                      overflow-hidden
                      rounded-full
                      bg-slate-100
                    "
                  >
                    {item.value > 0 && (
                      <div
                        className={`
                          absolute
                          inset-y-0
                          left-0
                          rounded-full
                          transition-all
                          duration-500
                          ease-out
                          ${isTop ? 'bg-gradient-to-r from-lime-500 to-lime-400' : 'bg-slate-300'}
                          group-hover:brightness-105
                        `}
                        style={{
                          width: `${Math.max(relativeWidth, 4)}%`,
                        }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* =====================================================
              RESUMEN INFERIOR
          ====================================================== */}
          <div
            className="
              mt-6
              pt-4
              border-t
              border-slate-100
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <span
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-slate-400
              "
            >
              Líneas con estudiantes
            </span>

            <span
              className="
                px-2.5
                py-1
                rounded-lg
                bg-lime-50
                border
                border-lime-100
                text-[9px]
                font-black
                uppercase
                tracking-[0.12em]
                text-lime-600
              "
            >
              {activeLines} DE {data.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstudiantesLineaAcademica;
