import { useEffect, useState } from "react";
import { FaEdit, FaSearch, FaMoneyBill, FaWallet } from "react-icons/fa";
import EditarPagoModal from "./EditarPagoModal";
import type { Pago } from "../../types/models";
import TipoPagoList from "./TipoPagoList";
import { apiUrl,API_URL } from "../../config/api";

export default function PagosAdminPage() {
  const [vista, setVista] = useState<"pagos" | "tipoPagos">("pagos");
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagoSeleccionado, setPagoSeleccionado] = useState<Pago | null>(null);

  useEffect(() => {
    if (vista === "pagos") obtenerPagos();
  }, [vista]);

  const obtenerPagos = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/pagos`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) throw new Error(`Error HTTP ${response.status}`);

      const data = await response.json();
      const pagosArray = Array.isArray(data)
        ? data
        : Array.isArray(data.pagos)
        ? data.pagos
        : [];

      setPagos(pagosArray);
    } catch (err) {
      console.error(err);
      setError("Error al obtener los pagos");
    } finally {
      setLoading(false);
    }
  };

  const actualizarEstado = async (id: number, nuevoEstado: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/pagos/${id}/estado`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ estado: nuevoEstado }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        setPagoSeleccionado(null);
        obtenerPagos();
      } else {
        alert(data.mensaje || "No se pudo actualizar el estado");
      }
    } catch (error) {
      console.error(error);
      alert("Error al actualizar el estado");
    }
  };

  const pagosFiltrados = pagos
    .filter((p) => {
      const cumpleEstado = estadoFiltro
        ? p.estado.toLowerCase() === estadoFiltro.toLowerCase()
        : true;

      const fechaPago = new Date(p.fecha_pago);
      const cumpleFechaInicio = fechaInicio
        ? fechaPago >= new Date(fechaInicio)
        : true;
      const cumpleFechaFin = fechaFin ? fechaPago <= new Date(fechaFin) : true;

      return cumpleEstado && cumpleFechaInicio && cumpleFechaFin;
    })
    .sort((a, b) => {
      const ordenEstados = [
        "pendiente",
        "reembolsado",
        "fallido",
        "completado",
      ];
      const ordenA = ordenEstados.indexOf(a.estado.toLowerCase());
      const ordenB = ordenEstados.indexOf(b.estado.toLowerCase());

      if (ordenA !== ordenB) return ordenA - ordenB;

      const fechaA = new Date(a.fecha_pago).getTime();
      const fechaB = new Date(b.fecha_pago).getTime();
      return fechaB - fechaA;
    });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Botones de navegación */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setVista("pagos")}
          className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium ${
            vista === "pagos"
              ? "bg-sky-600 text-white shadow-md"
              : "bg-white border border-sky-500 text-sky-600 hover:bg-sky-50"
          }`}
        >
          <FaMoneyBill /> Pagos
        </button>
        <button
          onClick={() => setVista("tipoPagos")}
          className={`flex items-center gap-2 px-5 py-2 rounded-md font-medium ${
            vista === "tipoPagos"
              ? "bg-sky-600 text-white shadow-md"
              : "bg-white border border-sky-500 text-sky-600 hover:bg-sky-50"
          }`}
        >
          <FaWallet /> Tipo de Pagos
        </button>
      </div>

      {/* Vista de PAGOS */}
      {vista === "pagos" && (
        <>
          <div className="flex flex-wrap justify-center mb-6 gap-3">
            <select
              className="border border-gray-300 rounded-md px-3 py-2 w-60 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
            >
              <option value="">Filtrar por estado...</option>
              <option value="pendiente">Pendiente</option>
              <option value="reembolsado">Reembolsado</option>
              <option value="fallido">Fallido</option>
              <option value="completado">Completado</option>
            </select>

            <div className="flex items-center gap-2">
              <label className="text-gray-600 text-sm">Desde:</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-600 text-sm">Hasta:</label>
              <input
                type="date"
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>

            <button
              onClick={() =>
                console.log("Filtrando:", estadoFiltro, fechaInicio, fechaFin)
              }
              className="bg-sky-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-sky-700"
            >
              <FaSearch /> Buscar
            </button>
          </div>

          {loading ? (
            <p>Cargando pagos...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">ID Pago</th>
                    <th className="px-4 py-3 text-left">Usuario</th>
                    <th className="px-4 py-3 text-left">Tipo de Pago</th>
                    <th className="px-4 py-3 text-left">Monto</th>
                    <th className="px-4 py-3 text-left">Fecha</th>
                    <th className="px-4 py-3 text-left">Estado</th>
                    <th className="px-4 py-3 text-left">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pagosFiltrados.map((pago) => (
                    <tr
                      key={pago.id_pago}
                      className="border-b hover:bg-gray-100"
                    >
                      <td className="px-4 py-3">{pago.id_pago}</td>
                      <td className="px-4 py-3">
                        {pago.usuario
                          ? `${pago.usuario.nombre} ${pago.usuario.apellido}`
                          : "Desconocido"}
                      </td>
                      <td className="px-4 py-3">
                        {pago.tipo_pago?.nombre ?? "Desconocido"}
                      </td>
                      <td className="px-4 py-3">
                        S/ {Number(pago.monto).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(pago.fecha_pago).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            pago.estado.toLowerCase() === "completado"
                              ? "bg-green-100 text-green-700"
                              : pago.estado.toLowerCase() === "reembolsado"
                              ? "bg-yellow-100 text-yellow-800"
                              : pago.estado.toLowerCase() === "fallido"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {pago.estado}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => setPagoSeleccionado(pago)}
                          className="text-sky-600 hover:text-sky-800 flex items-center gap-1"
                        >
                          <FaEdit /> Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagoSeleccionado && (
            <EditarPagoModal
              pago={pagoSeleccionado}
              onClose={() => setPagoSeleccionado(null)}
              onActualizar={actualizarEstado}
            />
          )}
        </>
      )}

      {/* Vista de TIPO DE PAGOS */}
      {vista === "tipoPagos" && <TipoPagoList />}
    </div>
  );
}
