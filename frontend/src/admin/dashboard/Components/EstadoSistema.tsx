import { useEffect, useState } from "react";
import { FaServer, FaDatabase, FaBolt, FaCircle } from "react-icons/fa6";

const EstadoSistema = () => {
  const [latency, setLatency] = useState(12);
  const [network, setNetwork] = useState(1.2);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulamos fluctuación natural
      setLatency(prev => {
        const delta = Math.floor(Math.random() * 5) - 2; // -2 a +2
        return Math.max(8, Math.min(25, prev + delta));
      });
      
      setNetwork(prev => {
        const delta = (Math.random() * 0.4) - 0.2; // -0.2 a +0.2
        return Math.max(0.5, Math.min(4.5, prev + delta));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const metrics = [
    {
      label: "Servidor API",
      status: "Operacional",
      value: "99.9%",
      icon: <FaServer />,
      color: "text-emerald-500",
      bg: "bg-emerald-50"
    },
    {
      label: "Base de Datos",
      status: "Conectado",
      value: `${latency}ms`,
      icon: <FaDatabase />,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      label: "Carga de Red",
      status: "Normal",
      value: `${network.toFixed(1)}MB/s`,
      icon: <FaBolt />,
      color: "text-amber-500",
      bg: "bg-amber-50"
    }
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 shadow-sm`}>
          <FaServer size={18} />
        </div>
        <div>
          <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-none mb-1">Estado del Sistema</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Salud de la plataforma</p>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {metrics.map((metric, idx) => (
          <div key={idx} className="group flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${metric.bg} ${metric.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                {metric.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-800">{metric.label}</span>
                <div className="flex items-center gap-1.5">
                  <FaCircle size={6} className={`animate-pulse ${metric.color}`} />
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{metric.status}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-slate-900 tabular-nums">{metric.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 rounded-xl bg-slate-900 text-[10px] text-slate-400 font-medium flex items-center justify-between">
        <span className="flex items-center gap-2">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
           Sincronizado en tiempo real
        </span>
        <span className="text-slate-500 italic">v2.4.0</span>
      </div>
    </div>
  );
};

export default EstadoSistema;
