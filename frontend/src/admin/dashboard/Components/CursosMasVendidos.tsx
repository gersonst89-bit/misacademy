import { FaFire } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CursoMasVendido {
  id_curso: number;
  nombre_curso: string;
  total_ventas: number;
}

interface CursosMasVendidosProps {
  cursosMasVendidos: CursoMasVendido[];
}

const CursosMasVendidos: React.FC<CursosMasVendidosProps> = ({
  cursosMasVendidos,
}) => {
  const top5Cursos = cursosMasVendidos
    .sort((a, b) => b.total_ventas - a.total_ventas)
    .slice(0, 5);

  const chartData = top5Cursos.map((curso) => ({
    nombre: curso.nombre_curso,
    Cantidad: curso.total_ventas,
  }));

  return (
    <section className="bg-white rounded-lg shadow p-6 md:col-span-2">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <FaFire className="w-6 h-6 text-orange-600" />
        <span>Top 5 cursos más vendidos del mes</span>
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="nombre" tick={{ fontSize: 14 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="Cantidad" fill="#f97316" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default CursosMasVendidos;
