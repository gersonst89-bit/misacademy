import { FaPlus, FaUserPlus, FaCreditCard, FaGear, FaArrowRight } from 'react-icons/fa6';

interface Accion {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  iconBg: string;
  textColor: string;
}

const AccionesRapidas: React.FC = () => {
  const acciones: Accion[] = [
    {
      title: 'Nuevo Curso',
      description: 'Crea contenido',
      icon: <FaPlus size={14} />,
      path: 'cursos',
      color: 'from-blue-500 to-sky-500',
      iconBg: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Nuevo Usuario',
      description: 'Registra alumnos',
      icon: <FaUserPlus size={14} />,
      path: 'usuarios',
      color: 'from-emerald-500 to-teal-500',
      iconBg: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Ver Pagos',
      description: 'Revisa finanzas',
      icon: <FaCreditCard size={14} />,
      path: 'pagos',
      color: 'from-amber-400 to-orange-400',
      iconBg: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Ajustes',
      description: 'Panel técnico',
      icon: <FaGear size={14} />,
      path: 'configuracion',
      color: 'from-slate-500 to-slate-700',
      iconBg: 'bg-slate-100',
      textColor: 'text-slate-600',
    },
  ];

  const navigateTo = (section: string) => {
    const event = new CustomEvent('navigate-to-section', {
      detail: section,
    });

    window.dispatchEvent(event);
  };

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
            bg-indigo-50
            text-indigo-600
            flex
            items-center
            justify-center
            shadow-sm
          "
        >
          <FaPlus size={18} />
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
            Acciones Rápidas
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
            Atajos de administración
          </p>
        </div>
      </div>

      {/* =====================================================
          ACCIONES
      ====================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {acciones.map((accion) => (
          <button
            key={accion.path}
            type="button"
            aria-label={accion.title}
            onClick={() => navigateTo(accion.path)}
            className="
              group
              relative
              flex
              items-center
              gap-3
              w-full
              min-h-[72px]
              px-3.5
              py-3
              rounded-2xl
              bg-slate-50/70
              border
              border-slate-100
              text-left
              overflow-hidden
              hover:bg-white
              hover:border-slate-200
              hover:shadow-[0_8px_20px_rgba(15,23,42,0.05)]
              transition-all
              duration-300
            "
          >
            {/* =================================================
                EFECTO DE FONDO
            ================================================== */}
            <div
              className={`
                absolute
                -top-8
                -right-8
                w-20
                h-20
                rounded-full
                bg-gradient-to-br
                ${accion.color}
                opacity-0
                group-hover:opacity-[0.045]
                scale-75
                group-hover:scale-100
                transition-all
                duration-500
                pointer-events-none
              `}
            />

            {/* =================================================
                ICONO
            ================================================== */}
            <div
              className={`
                relative
                z-10
                flex-shrink-0
                w-10
                h-10
                rounded-xl
                ${accion.iconBg}
                ${accion.textColor}
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
              {accion.icon}
            </div>

            {/* =================================================
                TEXTO
            ================================================== */}
            <div className="relative z-10 flex flex-col min-w-0">
              <span
                className="
                  text-[12px]
                  font-black
                  text-slate-800
                  leading-tight
                  truncate
                "
              >
                {accion.title}
              </span>

              <span
                className="
                  mt-1
                  text-[10px]
                  font-medium
                  text-slate-400
                  truncate
                "
              >
                {accion.description}
              </span>
            </div>

            {/* =================================================
                FLECHA
            ================================================== */}
            <div
              className={`
                relative
                z-10
                ml-auto
                flex-shrink-0
                ${accion.textColor}
                opacity-35
                group-hover:opacity-100
                group-hover:translate-x-0.5
                transition-all
                duration-300
              `}
            >
              <FaArrowRight size={10} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccionesRapidas;
