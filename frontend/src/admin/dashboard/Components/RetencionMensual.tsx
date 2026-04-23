import { FaChartLine } from "react-icons/fa";
import {
  LineChart,
  Line,
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
        {
          mes: retencionMensual.mes_actual,
          retencion: parseFloat(retencionMensual.porcentaje_retencion),
        },
      ]
    : [];

  return (
    <section className="bg-white rounded-lg shadow p-6 md:col-span-2 mb-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <FaChartLine className="w-6 h-6 text-pink-600" />
        <span>Retención mensual de usuarios (%)</span>
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tickCount={6}
          />
          <Tooltip formatter={(value) => `${value}%`} />
          <Line
            type="monotone"
            dataKey="retencion"
            stroke="#ec4899"
            strokeWidth={3}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
};

export default RetencionMensual;
