import { FaUsers, FaBookOpen, FaCertificate, FaArrowTrendUp } from 'react-icons/fa6';

interface KPIProps {
  usuariosTotales: number;
  cursosTotales: number;
  certificadosTotales: number;
  ingresosTotales?: number;
}

interface KPICard {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  badge: string;
  isCurrency?: boolean;
}

const KPI: React.FC<KPIProps> = ({
  usuariosTotales,
  cursosTotales,
  certificadosTotales,
  ingresosTotales = 0,
}) => {
  const cards: KPICard[] = [
    {
      title: 'Comunidad Total',
      value: usuariosTotales,
      icon: <FaUsers size={20} />,
      color: 'from-blue-500 to-sky-400',
      badge: 'Total actual',
    },
    {
      title: 'Cursos Totales',
      value: cursosTotales,
      icon: <FaBookOpen size={20} />,
      color: 'from-amber-400 to-orange-400',
      badge: 'Total actual',
    },
    {
      title: 'Certificados Emitidos',
      value: certificadosTotales,
      icon: <FaCertificate size={20} />,
      color: 'from-emerald-500 to-teal-400',
      badge: certificadosTotales > 0 ? 'Histórico' : 'Sin datos',
    },
    {
      title: 'Ingresos Totales',
      value: ingresosTotales,
      isCurrency: true,
      icon: <FaArrowTrendUp size={20} />,
      color: 'from-indigo-500 to-violet-500',
      badge: ingresosTotales > 0 ? 'Histórico' : 'Sin ventas',
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatValue = (card: KPICard) => {
    if (card.isCurrency) {
      return formatCurrency(card.value);
    }

    return card.value.toLocaleString('es-PE');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 mb-10">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="
            group
            relative
            overflow-hidden
            bg-[#F1F5F9]
            rounded-[1.75rem]
            p-5
            border
            border-slate-200/70
            shadow-[0_8px_30px_rgba(15,23,42,0.04)]
            hover:shadow-[0_14px_32px_rgba(15,23,42,0.07)]
            hover:-translate-y-0.5
            transition-all
            duration-300
          "
        >
          {/* =====================================================
              DETALLE DECORATIVO
          ====================================================== */}
          <div
            className={`
              absolute
              -top-8
              -right-8
              w-28
              h-28
              bg-gradient-to-br
              ${card.color}
              opacity-0
              group-hover:opacity-[0.025]
              rounded-full
              scale-75
              group-hover:scale-100
              transition-all
              duration-500
              pointer-events-none
            `}
          />

          {/* =====================================================
              ENCABEZADO
          ====================================================== */}
          <div className="relative z-10 flex items-start justify-between mb-5">
            {/* Icono */}
            <div
              className={`
                p-3
                rounded-[1rem]
                bg-gradient-to-br
                ${card.color}
                text-white
                shadow-md
                shadow-slate-200/60
                group-hover:scale-105
                group-hover:-translate-y-0.5
                transition-all
                duration-300
              `}
            >
              <div className="drop-shadow-sm">{card.icon}</div>
            </div>

            {/* Badge */}
            <div
              className="
                px-2.5
                py-1.5
                rounded-lg
                bg-white/80
                border
                border-slate-200/80
                text-slate-500
                text-[8px]
                font-black
                uppercase
                tracking-[0.13em]
                whitespace-nowrap
              "
            >
              {card.badge}
            </div>
          </div>

          {/* =====================================================
              INFORMACIÓN
          ====================================================== */}
          <div className="relative z-10">
            <span
              className="
                block
                text-slate-400
                text-[9px]
                font-black
                uppercase
                tracking-[0.15em]
                mb-2
                transition-colors
                duration-300
                group-hover:text-slate-500
              "
            >
              {card.title}
            </span>

            <div className="flex items-baseline">
              <span
                className="
                  text-[36px]
                  leading-none
                  font-black
                  text-slate-900
                  tracking-tight
                  group-hover:scale-[1.01]
                  origin-left
                  transition-transform
                  duration-300
                  whitespace-nowrap
                "
              >
                {formatValue(card)}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPI;
