import { FaServer, FaDatabase, FaBolt, FaCircle, FaCheck } from 'react-icons/fa6';

interface SystemMetric {
  label: string;
  status: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
}

const EstadoSistema: React.FC = () => {
  /*
   * Estos estados son informativos y actualmente
   * representan el estado configurado de cada servicio.
   *
   * Más adelante pueden conectarse a un endpoint
   * de health check para mostrar información real
   * en tiempo real.
   */
  const metrics: SystemMetric[] = [
    {
      label: 'Servidor API',
      status: 'Operativo',
      value: 'Activo',
      icon: <FaServer size={14} />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Base de Datos',
      status: 'Conectada',
      value: 'Activo',
      icon: <FaDatabase size={14} />,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      label: 'Servicio',
      status: 'Disponible',
      value: 'Activo',
      icon: <FaBolt size={14} />,
      color: 'text-amber-500',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* =====================================================
          ENCABEZADO
      ====================================================== */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className="
            w-10
            h-10
            rounded-2xl
            bg-emerald-50
            text-emerald-600
            flex
            items-center
            justify-center
            shadow-sm
          "
        >
          <FaServer size={18} />
        </div>

        <div className="min-w-0">
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
            Estado del Sistema
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
            Salud de la plataforma
          </p>
        </div>
      </div>

      {/* =====================================================
          MÉTRICAS
      ====================================================== */}
      <div className="space-y-3 flex-1">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="
              group
              flex
              items-center
              justify-between
              gap-4
              min-h-[72px]
              px-3.5
              py-3
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
                INFORMACIÓN
            ================================================== */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Icono */}
              <div
                className={`
                  flex-shrink-0
                  w-10
                  h-10
                  rounded-xl
                  ${metric.bg}
                  ${metric.color}
                  flex
                  items-center
                  justify-center
                  border
                  border-white
                  shadow-sm
                  group-hover:scale-105
                  transition-transform
                  duration-300
                `}
              >
                {metric.icon}
              </div>

              {/* Texto */}
              <div className="flex flex-col min-w-0">
                <span
                  className="
                    text-[12px]
                    font-black
                    text-slate-800
                    leading-tight
                    truncate
                  "
                >
                  {metric.label}
                </span>

                <div className="flex items-center gap-1.5 mt-1">
                  <FaCircle size={5} className={metric.color} />

                  <span
                    className="
                      text-[9px]
                      font-bold
                      text-slate-400
                      uppercase
                      tracking-[0.11em]
                    "
                  >
                    {metric.status}
                  </span>
                </div>
              </div>
            </div>

            {/* =================================================
                ESTADO
            ================================================== */}
            <div
              className="
                flex
                items-center
                gap-1.5
                px-2.5
                py-1.5
                rounded-lg
                bg-emerald-50
                border
                border-emerald-100
                flex-shrink-0
              "
            >
              <FaCheck size={8} className="text-emerald-500" />

              <span
                className="
                  text-[9px]
                  font-black
                  uppercase
                  tracking-[0.11em]
                  text-emerald-600
                "
              >
                {metric.value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* =====================================================
          ESTADO GENERAL
      ====================================================== */}
      <div
        className="
          mt-5
          px-3.5
          py-3
          rounded-xl
          bg-slate-900
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <span
          className="
            flex
            items-center
            gap-2
            text-[10px]
            font-semibold
            text-slate-300
          "
        >
          <span className="relative flex w-2 h-2">
            <span
              className="
                absolute
                inline-flex
                w-full
                h-full
                rounded-full
                bg-emerald-400
                opacity-50
                animate-ping
              "
            />

            <span
              className="
                relative
                inline-flex
                w-2
                h-2
                rounded-full
                bg-emerald-500
              "
            />
          </span>
          Plataforma operativa
        </span>

        <span
          className="
            text-[9px]
            font-bold
            text-slate-500
            whitespace-nowrap
          "
        >
          Estado normal
        </span>
      </div>
    </div>
  );
};

export default EstadoSistema;
