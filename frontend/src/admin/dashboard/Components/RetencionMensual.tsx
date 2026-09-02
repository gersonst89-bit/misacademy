import React from 'react';
import { FaChartLine } from 'react-icons/fa';

interface RetencionMensualData {
  mes_actual: string;
  porcentaje_retencion: string;
  hay_datos?: boolean;
  estudiantes_mes_anterior?: number;
  estudiantes_retenidos?: number;
}

interface RetencionMensualProps {
  retencionMensual: RetencionMensualData | null;
}

const RetencionMensual: React.FC<RetencionMensualProps> = ({ retencionMensual }) => {
  const hasData = retencionMensual?.hay_datos === true;

  const porcentaje = retencionMensual?.porcentaje_retencion
    ? parseFloat(retencionMensual.porcentaje_retencion.replace('%', ''))
    : 0;

  const estudiantesMesAnterior = retencionMensual?.estudiantes_mes_anterior ?? 0;

  const estudiantesRetenidos = retencionMensual?.estudiantes_retenidos ?? 0;

  // Texto dinámico para evitar:
  // "1 de 1 estudiantes regresaron"
  const textoRetencion = `${estudiantesRetenidos} de ${estudiantesMesAnterior} ${
    estudiantesMesAnterior === 1 ? 'estudiante' : 'estudiantes'
  } ${estudiantesRetenidos === 1 ? 'regresó' : 'regresaron'}`;

  return (
    <div className="flex flex-col h-full">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-2xl bg-pink-50 text-pink-600 shadow-sm">
          <FaChartLine size={18} />
        </div>

        <div>
          <h3
            className="
    text-[17px]
    font-semibold
    text-slate-900
    tracking-normal
    leading-tight
    mb-1
  "
            style={{
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Retención de Estudiantes
          </h3>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">
            {hasData ? 'Retención mensual' : 'Sin datos suficientes'}
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
                bg-pink-50
                text-pink-500
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <FaChartLine size={22} />
            </div>

            <h4 className="text-sm font-black text-slate-700">Aún no hay datos suficientes</h4>

            <p className="mt-1 text-xs leading-5 text-slate-400">
              Necesitamos actividad de estudiantes en el mes anterior para calcular la retención.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          CON DATOS
      ====================================================== */}
      {hasData && (
        <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center">
          <span
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.18em]
              text-slate-400
            "
          >
            Retención mensual
          </span>

          <div
            className="
              mt-3
              text-[56px]
              leading-none
              font-black
              tracking-tight
              text-pink-600
            "
          >
            {porcentaje.toLocaleString('es-PE', {
              maximumFractionDigits: 1,
            })}
            %
          </div>

          <p className="mt-3 text-xs font-medium text-slate-400">{textoRetencion}</p>

          <div
            className="
              mt-6
              px-3
              py-1.5
              rounded-xl
              bg-pink-50
              border
              border-pink-100
              text-[9px]
              font-black
              uppercase
              tracking-[0.12em]
              text-pink-600
            "
          >
            {retencionMensual?.mes_actual}
          </div>
        </div>
      )}
    </div>
  );
};

export default RetencionMensual;
