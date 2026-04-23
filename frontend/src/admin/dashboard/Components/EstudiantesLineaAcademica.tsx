import { FaUserAlt } from "react-icons/fa";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface EstudiantesLineaAcademicaProps {
  lineasAcademicas: { name: string; Cantidad: number }[];
}

const EstudiantesLineaAcademica: React.FC<EstudiantesLineaAcademicaProps> = ({
  lineasAcademicas,
}) => {
  const data = lineasAcademicas.map((linea) => ({
    name: linea.name,
    Cantidad: linea.Cantidad ?? 0,
  }));

  return (
    <section className="bg-white rounded-lg shadow p-6 md:col-span-2 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <FaUserAlt className="w-6 h-6 text-lime-600" />
        <span>Estudiantes por línea académica</span>
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tick={{ fontSize: 14 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="Cantidad" fill="#84cc16" />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
};

export default EstudiantesLineaAcademica;
