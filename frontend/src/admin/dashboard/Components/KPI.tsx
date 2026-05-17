import { FaUsers, FaBookOpen, FaCertificate, FaArrowTrendUp } from "react-icons/fa6";

interface KPIProps {
  usuariosTotales: number;
  cursosTotales: number;
  certificadosTotales: number;
  ingresosTotales?: number;
}

const KPI: React.FC<KPIProps> = ({
  usuariosTotales,
  cursosTotales,
  certificadosTotales,
  ingresosTotales = 0,
}) => {
  const cards = [
    {
      title: "Comunidad Total",
      value: usuariosTotales,
      icon: <FaUsers size={24} />,
      color: "from-blue-500 to-sky-400",
      bg: "bg-blue-50",
      textColor: "text-blue-600",
      trend: "+12%"
    },
    {
      title: "Cursos Totales",
      value: cursosTotales,
      icon: <FaBookOpen size={24} />,
      color: "from-amber-500 to-orange-400",
      bg: "bg-amber-50",
      textColor: "text-amber-600",
      trend: "+5"
    },
    {
      title: "Certificados",
      value: certificadosTotales,
      icon: <FaCertificate size={24} />,
      color: "from-emerald-500 to-teal-400",
      bg: "bg-emerald-50",
      textColor: "text-emerald-600",
      trend: "+28"
    },
    {
      title: "Ingresos Totales",
      value: ingresosTotales,
      isCurrency: true,
      icon: <FaArrowTrendUp size={24} />,
      color: "from-indigo-500 to-purple-400",
      bg: "bg-indigo-50",
      textColor: "text-indigo-600",
      trend: "+15%"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
      {cards.map((card, idx) => (
        <div 
          key={idx} 
          className="group bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:-translate-y-2 transition-all duration-500 border border-slate-100 relative overflow-hidden"
        >
          {/* Background Gradient Detail */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-[0.03] rounded-full transition-all duration-700 scale-50 group-hover:scale-100`} />
          
          <div className="flex items-start justify-between mb-8">
            <div className={`p-4 rounded-3xl bg-gradient-to-br ${card.color} text-white transition-all group-hover:rotate-[10deg] duration-500 shadow-xl shadow-slate-200 group-hover:shadow-lg`}>
              <div className="drop-shadow-md">
                {card.icon}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/10 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
              <FaArrowTrendUp size={10} className="group-hover:scale-110 transition-transform" />
              {card.trend}
            </div>
          </div>
          
          <div className="flex flex-col relative z-10">
            <span className="text-slate-400 text-[11px] font-black uppercase tracking-[0.2em] mb-2 group-hover:text-slate-500 transition-colors">{card.title}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-slate-900 tracking-tighter group-hover:scale-105 origin-left transition-transform duration-500">
                {card.isCurrency ? (
                  <span className="flex items-baseline gap-1">
                    <span className="text-xl opacity-40">S/.</span>
                    {card.value.toLocaleString()}
                  </span>
                ) : (
                  card.value.toLocaleString()
                )}
              </span>
            </div>
          </div>
          
          <div className="mt-8 h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
            <div className={`h-full bg-gradient-to-r ${card.color} w-2/3 rounded-full opacity-40 group-hover:opacity-100 group-hover:w-full transition-all duration-1000 ease-out`} />
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPI;

