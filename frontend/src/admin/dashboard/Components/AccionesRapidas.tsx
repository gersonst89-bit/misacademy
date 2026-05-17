import { FaPlus, FaUserPlus, FaCreditCard, FaGear, FaRocket } from "react-icons/fa6";
import { Link } from "react-router-dom";

const AccionesRapidas = () => {
  const acciones = [
    {
      title: "Nuevo Curso",
      icon: <FaPlus />,
      path: "cursos",
      color: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
      description: "Crea contenido"
    },
    {
      title: "Nuevo Usuario",
      icon: <FaUserPlus />,
      path: "usuarios",
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
      description: "Registra alumnos"
    },
    {
      title: "Ver Pagos",
      icon: <FaCreditCard />,
      path: "pagos",
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      textColor: "text-amber-600",
      description: "Revisa finanzas"
    },
    {
      title: "Ajustes",
      icon: <FaGear />,
      path: "configuracion",
      color: "from-slate-500 to-slate-700",
      bg: "bg-slate-50",
      textColor: "text-slate-600",
      description: "Panel técnico"
    }
  ];

  const navigateTo = (section: string) => {
    const event = new CustomEvent('navigate-to-section', { detail: section });
    window.dispatchEvent(event);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 shadow-sm`}>
          <FaRocket size={18} />
        </div>
        <div>
          <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-none mb-1">Acciones Rápidas</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Atajos de administración</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {acciones.map((accion, idx) => (
          <button
            key={idx}
            onClick={() => navigateTo(accion.path)}
            className="group relative flex items-center gap-4 p-5 rounded-3xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-[0_15px_30px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-500 overflow-hidden text-left w-full"
          >
            {/* Background Gradient Detail */}
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${accion.color} opacity-0 group-hover:opacity-[0.05] rounded-bl-3xl transition-all duration-500 scale-50 group-hover:scale-100`} />
            
            <div className={`flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${accion.color} text-white flex items-center justify-center transition-all group-hover:rotate-[10deg] duration-500 shadow-lg shadow-slate-200`}>
              <div className="drop-shadow-sm">
                {accion.icon}
              </div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[13px] font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">{accion.title}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{accion.description}</span>
            </div>

            <div className="ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
               <FaRocket className={`text-xs ${accion.textColor} opacity-40`} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AccionesRapidas;
