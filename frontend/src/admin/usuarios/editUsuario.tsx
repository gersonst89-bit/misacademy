"use client";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InputComponent from "../components/InputComponent";
import type { Usuario } from "../../types/models";
import { API_URL } from "../../config/api";


export default function EditUsuario() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState<Usuario>({
    nombre: "",
    apellido: "",
    email: "",
    dni: "",
    password: "",
    id_rol: 2,
    estado: "Activo",
  });

  const [loading, setLoading] = useState(!!id);

  useEffect(() => {
    if (!id) return;

    const fetchUsuario = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${API_URL}/admin/usuarios/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!res.ok) throw new Error("Usuario no encontrado");
        const data = await res.json();
        setUsuario({
          id_usuario: data.id_usuario,
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email,
          dni: data.dni,
          id_rol: data.id_rol,
          estado: data.estado,
        });
      } catch (error) {
        console.error("Error al cargar usuario:", error);
        alert("No se pudo cargar el usuario.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuario();
  }, [id]);

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = id
        ? `${API_URL}/admin/usuarios/${id}`
        : `${API_URL}/admin/usuarios`;

      const method = id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify(usuario),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Error al guardar usuario");
      }

      alert(`Usuario ${id ? "actualizado" : "creado"} con éxito`);
      navigate("/admin/usuarios");
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al guardar usuario");
    }
  };

  if (loading) return <p className="text-gray-600 p-6">Cargando usuario...</p>;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg animate-fade-in">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {id ? `Editar Usuario` : "Agregar Usuario"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputComponent
            label="Nombre"
            placeholder="Nombre"
            value={usuario.nombre}
            onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
          />
          <InputComponent
            label="Apellido"
            placeholder="Apellido"
            value={usuario.apellido}
            onChange={(e) =>
              setUsuario({ ...usuario, apellido: e.target.value })
            }
          />
          <InputComponent
            type="email"
            label="Email"
            placeholder="Correo electrónico"
            value={usuario.email}
            onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
          />
         
          {!id && (
            <InputComponent
              type="password"
              label="Contraseña"
              placeholder="Contraseña"
              value={usuario.password}
              onChange={(e) =>
                setUsuario({ ...usuario, password: e.target.value })
              }
            />
          )}

          <div className="mb-4 flex flex-col">
            <label className="block text-sm pb-1 font-semibold text-gray-700">
              Rol
            </label>
            <select
              value={usuario.id_rol}
              onChange={(e) =>
                setUsuario({ ...usuario, id_rol: Number(e.target.value) })
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
              value={usuario.estado}
              onChange={(e) =>
                setUsuario({ ...usuario, estado: e.target.value })
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
            {id ? "Guardar Cambios" : "Crear Usuario"}
          </button>
          <button
            onClick={() => navigate("/admin/usuarios")}
            className="bg-gray-300 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
