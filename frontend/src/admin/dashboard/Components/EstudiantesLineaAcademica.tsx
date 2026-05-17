import { FaUserAlt } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface EstudiantesLineaAcademicaProps {
  lineasAcademicas: { name: string; Cantidad: number; value?: number }[];
}

const COLORS = ['#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1'];

const EstudiantesLineaAcademica: React.FC<EstudiantesLineaAcademicaProps> = ({
  lineasAcademicas,
}) => {
  const data = lineasAcademicas.map((linea) => ({
    name: linea.name,
    value: linea.value || linea.Cantidad || 0,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2.5 rounded-2xl bg-lime-50 text-lime-600 shadow-sm`}>
          <FaUserAlt size={18} />
        </div>
        <div>
          <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-none mb-1">Estudiantes por Línea</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Distribución académica</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '12px'
              }}
            />
            <Bar 
              dataKey="value" 
              radius={[10, 10, 0, 0]}
              barSize={40}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EstudiantesLineaAcademica;
