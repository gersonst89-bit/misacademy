import { FaFire } from 'react-icons/fa';

interface CursoMasVendido {
  id_curso: number;
  nombre_curso: string;
  total_ventas: number;
}

interface CursosMasVendidosProps {
  cursosMasVendidos: CursoMasVendido[];
}

const CursosMasVendidos: React.FC<CursosMasVendidosProps> = ({ cursosMasVendidos }) => {
  // =====================================================
  // PREPARAR DATOS
  // =====================================================

  const data = [...cursosMasVendidos]
    .sort((a, b) => b.total_ventas - a.total_ventas)
    .slice(0, 5)
    .map((curso) => ({
      id: curso.id_curso,
      name: curso.nombre_curso,
      value: Number(curso.total_ventas) || 0,
    }));

  const hasData = data.length > 0;

  const hasSales = data.some((item) => item.value > 0);

  // Máximo utilizado únicamente para comparar
  // visualmente los cursos entre sí.
  const maxValue = Math.max(...data.map((item) => item.value), 1);

  const coursesWithSales = data.filter((item) => item.value > 0).length;

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
            bg-orange-50
            text-orange-600
            shadow-sm
          "
        >
          <FaFire size={18} />
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
            Cursos más Vendidos
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
            {hasSales ? 'Top rendimiento del mes' : 'Resumen actual'}
          </p>
        </div>
      </div>

      {/* =====================================================
          SIN DATOS
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
                bg-orange-50
                text-orange-500
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <FaFire size={22} />
            </div>

            <h4 className="text-sm font-black text-slate-700">Aún no hay ventas</h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Los cursos aparecerán aquí cuando se registre la primera venta.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          HAY CURSOS, PERO SIN VENTAS
      ====================================================== */}
      {hasData && !hasSales && (
        <div className="flex-1 min-h-[300px] flex items-center justify-center">
          <div className="text-center max-w-xs">
            <div
              className="
                mx-auto
                w-14
                h-14
                rounded-2xl
                bg-orange-50
                text-orange-500
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <FaFire size={22} />
            </div>

            <h4 className="text-sm font-black text-slate-700">Sin ventas registradas</h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Los cursos aparecerán en el ranking cuando tengan ventas completadas.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          RANKING
      ====================================================== */}
      {hasSales && (
        <div className="flex-1 flex flex-col justify-center">
          <div className="space-y-5">
            {data.map((item, index) => {
              /*
               * La barra utiliza como máximo el 82%
               * del ancho para evitar que visualmente
               * parezca una métrica porcentual.
               */
              const relativeWidth = (item.value / maxValue) * 82;

              const isTop = index === 0 && item.value > 0;

              const salesLabel = item.value === 1 ? 'venta' : 'ventas';

              return (
                <div key={`${item.id}-${index}`} className="group">
                  {/* =================================================
                      INFORMACIÓN DEL CURSO
                  ================================================== */}
                  <div className="flex items-center justify-between gap-5 mb-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Ranking */}
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
                          ${isTop ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}
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
                        text-[11px]
                        font-black
                        ${isTop ? 'text-orange-600' : 'text-slate-500'}
                      `}
                    >
                      {item.value} {salesLabel}
                    </span>
                  </div>

                  {/* =================================================
                      TRACK + BARRA
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
                    <div
                      className={`
                        absolute
                        inset-y-0
                        left-0
                        rounded-full
                        transition-all
                        duration-500
                        ease-out
                        ${
                          isTop ? 'bg-gradient-to-r from-orange-500 to-orange-400' : 'bg-orange-200'
                        }
                        group-hover:brightness-105
                      `}
                      style={{
                        width: `${Math.max(relativeWidth, 4)}%`,
                      }}
                    />
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
              Cursos con ventas
            </span>

            <span
              className="
                px-2.5
                py-1
                rounded-lg
                bg-orange-50
                border
                border-orange-100
                text-[9px]
                font-black
                uppercase
                tracking-[0.12em]
                text-orange-600
              "
            >
              {coursesWithSales} DE {data.length}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CursosMasVendidos;
