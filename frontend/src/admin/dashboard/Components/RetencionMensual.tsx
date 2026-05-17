import { FaChartLine } from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RetencionMensualProps {
  retencionMensual: { mes_actual: string; porcentaje_retencion: string } | null;
}

const RetencionMensual: React.FC<RetencionMensualProps> = ({
  retencionMensual,
}) => {
  const chartData = retencionMensual
    ? [
        { mes: retencionMensual.mes_actual, retencion: parseFloat(retencionMensual.porcentaje_retencion) },
      ]
    : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2.5 rounded-2xl bg-pink-50 text-pink-600 shadow-sm`}>
          <FaChartLine size={18} />
        </div>
        <div>
          <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-none mb-1">Retención de Usuarios</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Lealtad de la comunidad</p>
        </div>
      </div>
      
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="mes" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              domain={[0, 100]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              formatter={(value) => [`${value}%`, 'Retención']}
            />
            <Area
              type="monotone"
              dataKey="retencion"
              stroke="#ec4899"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRet)"
              activeDot={{ r: 6, strokeWidth: 0, fill: '#ec4899' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {retencionMensual && (
        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
          <span className="text-2xl font-black text-pink-600">{retencionMensual.porcentaje_retencion}</span>
        </div>
      )}
    </div>
  );
};

export default RetencionMensual;
