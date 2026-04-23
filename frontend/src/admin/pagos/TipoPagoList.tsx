import { useEffect, useState } from "react";
import { FaSearch, FaPlus, FaEdit } from "react-icons/fa";
import AgregarTipoPagoModal from "./AgregarTipoPagoModal";
import EditarTipoPagoModal from "./EditarTipoPagoModal";
import { apiUrl,API_URL } from "../../config/api";

interface TipoPago {
  id_tipo_pago: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean | number;
  comision?: number | string | null;
  codigo_referencia?: string | null;
}

export default function TipoPagoList() {
  const [tipos, setTipos] = useState<TipoPago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mostrarAgregar, setMostrarAgregar] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoPago | null>(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    obtenerTipos();
  }, []);

  const obtenerTipos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/tipos-pagos`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Error al cargar tipos de pago");

      const data = await response.json();
      const lista = Array.isArray(data.tipos_pagos) ? data.tipos_pagos : [];
      setTipos(lista);
    } catch (err) {
      console.error("❌ Error al obtener tipos de pago:", err);
      setError("Error al cargar los tipos de pago");
    } finally {
      setLoading(false);
    }
  };

const tiposFiltrados = tipos
  .filter((t) => t.nombre.toLowerCase().includes(busqueda.toLowerCase()))
  .sort((a, b) => {
    const activoA = Boolean(a.activo);
    const activoB = Boolean(b.activo);

    if (activoA && !activoB) return -1;
    if (!activoA && activoB) return 1;

    return a.nombre.localeCompare(b.nombre);
  });


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
    <div className="flex flex-wrap items-center justify-between mb-6 gap-3 w-full">
      <div className="relative flex-grow">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar tipo de pago..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <button
        onClick={() => setMostrarAgregar(true)}
        className="bg-sky-600 text-white px-5 py-2 rounded-md flex items-center gap-2 hover:bg-sky-700 transition font-semibold shadow"
      >
        <FaPlus /> Agregar Tipo de Pago
      </button>
    </div>

      {loading ? (
        <p className="text-center text-gray-600">Cargando tipos de pago...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : tiposFiltrados.length === 0 ? (
        <p className="text-center text-gray-500">No se encontraron tipos de pago.</p>
      ) : (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Descripción</th>
                <th className="px-4 py-3 text-left">Comisión (%)</th>
                <th className="px-4 py-3 text-left">Activo</th>
                <th className="px-4 py-3 text-left">Código Ref.</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tiposFiltrados.map((tipo) => (
                <tr key={tipo.id_tipo_pago} className="border-b hover:bg-gray-100">
                  <td className="px-4 py-3">{tipo.nombre}</td>
                  <td className="px-4 py-3">{tipo.descripcion ?? "-"}</td>
                  <td className="px-4 py-3">{Number(tipo.comision || 0).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        tipo.activo
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                      {tipo.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">{tipo.codigo_referencia ?? "-"}</td>
                  <td className="p-3">
                    <button
                      onClick={() => setTipoSeleccionado(tipo)}
                      className="text-sky-600 hover:text-sky-800 flex items-center gap-1">
                      <FaEdit /> Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modales */}
      {mostrarAgregar && (
        <AgregarTipoPagoModal
          onClose={() => setMostrarAgregar(false)}
          onSuccess={() => {
            setMostrarAgregar(false);
            obtenerTipos();
          }}
        />
      )}

      {tipoSeleccionado && (
        <EditarTipoPagoModal
          tipoPago={tipoSeleccionado}
          onClose={() => setTipoSeleccionado(null)}
          onSuccess={() => {
            setTipoSeleccionado(null);
            obtenerTipos();
          }}
        />
      )}
    </div>
  );
}
