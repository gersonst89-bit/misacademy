import { FaFire } from "react-icons/fa";
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

interface CursoMasVendido {
  id_curso: number;
  nombre_curso: string;
  total_ventas: number;
}

interface CursosMasVendidosProps {
  cursosMasVendidos: CursoMasVendido[];
}

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

const CursosMasVendidos: React.FC<CursosMasVendidosProps> = ({
  cursosMasVendidos,
}) => {
  const top5Cursos = [...cursosMasVendidos]
    .sort((a, b) => b.total_ventas - a.total_ventas)
    .slice(0, 5);

  const chartData = top5Cursos.map((curso) => ({
    nombre: curso.nombre_curso.length > 25 ? curso.nombre_curso.substring(0, 25) + '...' : curso.nombre_curso,
    fullName: curso.nombre_curso,
    Cantidad: curso.total_ventas,
  }));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className={`p-2.5 rounded-2xl bg-orange-50 text-orange-600 shadow-sm`}>
          <FaFire size={18} />
        </div>
        <div>
          <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-none mb-1">Cursos más Vendidos</h3>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Top rendimiento del mes</p>
        </div>
      </div>
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            layout="vertical" 
            data={chartData} 
            margin={{ top: 0, right: 30, left: 40, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="nombre" 
              type="category" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
              width={120}
            />
            <Tooltip 
              cursor={{ fill: '#fff7ed' }}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              formatter={(value: any, name: any, props: any) => [value, 'Ventas']}
              labelFormatter={(label) => `Curso: ${label}`}
            />
            <Bar 
              dataKey="Cantidad" 
              radius={[0, 10, 10, 0]}
              barSize={32}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CursosMasVendidos;
