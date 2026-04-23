import { useEffect, useState } from "react";
import { FaEdit, FaSearch, FaInfoCircle } from "react-icons/fa";
import InputComponent from "../components/InputComponent";
import InfoUsuarioModal from "./InfoUsuarioModal";
import type { Usuario } from "../../types/models";
import { API_URL } from "../../config/api";

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroRol, setFiltroRol] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (filtroEstado) params.append("estado", filtroEstado);
      if (filtroRol) params.append("id_rol", filtroRol);

      const res = await fetch(
        `${API_URL}/admin/usuarios?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const data = await res.json();
      if (res.ok && data.data) {
        let filtrados = data.data;

        if (filtroRol && filtroRol !== "0") {
          filtrados = filtrados.filter(
            (u: Usuario) => u.id_rol === Number(filtroRol)
          );
        }

        filtrados.sort((a: Usuario, b: Usuario) => {
          if (a.estado === "Activo" && b.estado !== "Activo") return -1;
          if (a.estado !== "Activo" && b.estado === "Activo") return 1;

          const nombreA = `${a.nombre} ${a.apellido}`.toLowerCase();
          const nombreB = `${b.nombre} ${b.apellido}`.toLowerCase();
          return nombreA.localeCompare(nombreB);
        });

        setUsuarios(filtrados);
      } else {
        setUsuarios([]);
      }
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [search, filtroEstado, filtroRol]);

  const openModal = (usuario?: Usuario) => {
    if (usuario) {
      setSelectedUsuario(usuario);
    } else {
      setSelectedUsuario({
        nombre: "",
        apellido: "",
        email: "",
        dni: "",
        password: "",
        id_rol: 2,
        estado: "Activo",
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!selectedUsuario) return;
    try {
      const token = localStorage.getItem("token");
      const url = selectedUsuario.id_usuario
        ? `${API_URL}/admin/usuarios/${selectedUsuario.id_usuario}`
        : `${API_URL}/admin/usuarios`;

      const method = selectedUsuario.id_usuario ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(selectedUsuario),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al guardar usuario");
      }

      alert(
        `Usuario ${
          selectedUsuario.id_usuario ? "actualizado" : "creado"
        } con éxito`
      );
      setShowModal(false);
      fetchUsuarios();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al guardar usuario");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="relative w-full mb-4">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nombre..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex justify-center gap-4 mb-6">
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
        >
          <option value="">Todos los estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>

        <select
          value={filtroRol}
          onChange={(e) => setFiltroRol(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
        >
          <option value="">Todos los roles</option>
          <option value="1">Administrador</option>
          <option value="2">Usuario</option>
          <option value="3">Docente</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-600 text-center">Cargando usuarios...</p>
      ) : usuarios.length === 0 ? (
        <p className="text-gray-600 text-center">No se encontraron usuarios.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-lg">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-slate-800 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nombre completo</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Rol</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id_usuario} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {u.nombre} {u.apellido}
                  </td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    {u.id_rol === 1
                      ? "Administrador"
                      : u.id_rol === 3
                      ? "Docente"
                      : "Usuario"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        u.estado.toLowerCase() === "activo"
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {u.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-4">
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => openModal(u)}
                        className="text-sky-600 hover:text-sky-800 flex items-center gap-1 justify-center"
                        title="Editar Usuario"
                      >
                        <FaEdit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUsuario(u);
                          setShowInfoModal(true);
                        }}
                        className="text-gray-600 hover:text-sky-800 flex items-center gap-1 justify-center"
                        title="Ver Información"
                      >
                        <FaInfoCircle size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal para información del usuario */}
      {showInfoModal && selectedUsuario && (
        <InfoUsuarioModal
          usuario={selectedUsuario}
          onClose={() => setShowInfoModal(false)}
        />
      )}

      {/* Modal para crear/editar usuario */}
      {showModal && selectedUsuario && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg animate-fade-in">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              {selectedUsuario.id_usuario
                ? "Editar Usuario"
                : "Agregar Usuario"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputComponent
                label="Nombre"
                placeholder="Nombre"
                value={selectedUsuario.nombre}
                onChange={(e) =>
                  setSelectedUsuario({
                    ...selectedUsuario,
                    nombre: e.target.value,
                  })
                }
              />
              <InputComponent
                label="Apellido"
                placeholder="Apellido"
                value={selectedUsuario.apellido}
                onChange={(e) =>
                  setSelectedUsuario({
                    ...selectedUsuario,
                    apellido: e.target.value,
                  })
                }
              />
              <InputComponent
                type="email"
                label="Email"
                placeholder="Correo electrónico"
                value={selectedUsuario.email}
                onChange={(e) =>
                  setSelectedUsuario({
                    ...selectedUsuario,
                    email: e.target.value,
                  })
                }
              />
             
              {!selectedUsuario.id_usuario && (
                <InputComponent
                  type="password"
                  label="Contraseña"
                  placeholder="Contraseña"
                  value={selectedUsuario.password || ""}
                  onChange={(e) =>
                    setSelectedUsuario({
                      ...selectedUsuario,
                      password: e.target.value,
                    })
                  }
                />
              )}

              <div className="mb-4 flex flex-col">
                <label className="block text-sm pb-1 font-semibold text-gray-700">
                  Rol
                </label>
                <select
                  value={selectedUsuario.id_rol}
                  onChange={(e) =>
                    setSelectedUsuario({
                      ...selectedUsuario,
                      id_rol: Number(e.target.value),
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                >
                  <option value={1}>Administrador</option>
                  <option value={2}>Usuario</option>
                  <option value={3}>Docente</option>
                </select>
              </div>

              <div className="mb-4 flex flex-col">
                <label className="block text-sm pb-1 font-semibold text-gray-700">
                  Estado
                </label>
                <select
                  value={selectedUsuario.estado}
                  onChange={(e) =>
                    setSelectedUsuario({
                      ...selectedUsuario,
                      estado: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600 focus:border-sky-600"
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleSave}
                className="bg-sky-600 text-white px-6 py-2 rounded-md hover:bg-sky-700 transition-colors"
              >
                {selectedUsuario.id_usuario
                  ? "Guardar Cambios"
                  : "Crear Usuario"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
