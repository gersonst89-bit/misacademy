import { FaUsers, FaBookOpen, FaCertificate } from "react-icons/fa";

interface KPIProps {
  usuariosTotales: number;
  cursosTotales: number;
  certificadosTotales: number;
}

const KPI: React.FC<KPIProps> = ({
  usuariosTotales,
  cursosTotales,
  certificadosTotales,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
      <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
        <FaUsers className="text-sky-500 w-6 h-6" />
        <div>
          <h2 className="text-sm text-gray-500">Usuarios Totales</h2>
          <p className="text-2xl font-semibold">
            {usuariosTotales.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
        <FaBookOpen className="text-amber-500 w-6 h-6" />
        <div>
          <h2 className="text-sm text-gray-500">Cursos Publicados</h2>
          <p className="text-2xl font-semibold">
            {cursosTotales.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 flex items-center space-x-4">
        <FaCertificate className="text-red-500 w-6 h-6" />
        <div>
          <h2 className="text-sm text-gray-500">Certificados Emitidos</h2>
          <p className="text-2xl font-semibold">
            {certificadosTotales.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KPI;
