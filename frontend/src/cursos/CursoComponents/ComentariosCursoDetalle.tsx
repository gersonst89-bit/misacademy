import React, { useState, useEffect } from "react";
import { FaComments, FaStar, FaEdit, FaTrash } from "react-icons/fa";
import FormularioComentario from "./FormularioComentario";
import DeleteModal from "./DeleteModalComentario";
import type { Resena } from "../../types/models";
import { API_URL, BASE_URL } from "../../config/api";

interface ComentariosProps {
  cursoId: number;
  reseñasIniciales: Resena[];
  isAuthenticated: boolean;
}

const Comentarios: React.FC<ComentariosProps> = ({
  cursoId,
  reseñasIniciales,
  isAuthenticated,
}) => {
  const [reseñas, setReseñas] = useState<Resena[]>(reseñasIniciales);
  const [resenaEditando, setResenaEditando] = useState<Resena | null>(null);

  const [usuarioActual, setUsuarioActual] = useState<{
    id_usuario?: number;
    nombre: string;
    apellido: string;
    imagen: string;
  }>({
    nombre: "Anónimo",
    apellido: "",
    imagen: "/sinUsuario.jpg",
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [resenaAEliminar, setResenaAEliminar] = useState<Resena | null>(null);

  const [checkingPermisos, setCheckingPermisos] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [mustComplete, setMustComplete] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPerfil = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) return;

        const data = await response.json();
        setUsuarioActual({
          id_usuario: data.id_usuario,
          nombre: data.nombre || "Anónimo",
          apellido: data.apellido || "",
          imagen: data.imagen || "/sinUsuario.jpg",
        });
      } catch (err) {
        console.error(err);
      }
    };

    fetchPerfil();
  }, [isAuthenticated]);

  useEffect(() => {
    const verificarPermisosComentario = async () => {
      if (!isAuthenticated) {
        setCanComment(false);
        setMustComplete(false);
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        setCanComment(false);
        setMustComplete(false);
        return;
      }

      setCheckingPermisos(true);

      try {
        const resHistorial = await fetch(`${API_URL}/compras/historial`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const dataHistorial = await resHistorial.json();

        if (
          !resHistorial.ok ||
          dataHistorial.status !== "success" ||
          !Array.isArray(dataHistorial.compras)
        ) {
          setCanComment(false);
          setMustComplete(false);
          return;
        }

        const compraCurso = dataHistorial.compras.find(
          (c: any) => c.curso?.id_curso === cursoId
        );

        if (!compraCurso) {
          setCanComment(false);
          setMustComplete(false);
          return;
        }

        const resProgreso = await fetch(
          `${API_URL}/cursos/${cursoId}/progreso`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const dataProgreso = await resProgreso.json();

        if (!resProgreso.ok) {
          setCanComment(false);
          setMustComplete(false);
          return;
        }

        const progresoTotal =
          dataProgreso.curso?.progreso_total ??
          dataProgreso.progreso_total ??
          0;

        if (progresoTotal >= 100) {
          setCanComment(true);
          setMustComplete(false);
        } else {
          setCanComment(false);
          setMustComplete(true);
        }
      } catch (err) {
        console.error("Error verificando permisos de comentario:", err);
        setCanComment(false);
        setMustComplete(false);
      } finally {
        setCheckingPermisos(false);
      }
    };

    verificarPermisosComentario();
  }, [cursoId, isAuthenticated]);

  const handleNuevaResena = (nueva: Resena) => {
    setReseñas([nueva, ...reseñas]);
  };

  const handleEditarResena = (resena: Resena) => setResenaEditando(resena);

  const handleCancelarEdicion = () => setResenaEditando(null);

  const abrirModalEliminar = (resena: Resena) => {
    setResenaAEliminar(resena);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setResenaAEliminar(null);
    setModalAbierto(false);
  };

  const confirmarEliminarResena = async () => {
    if (!resenaAEliminar) return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_URL}/cursos/resenas/${resenaAEliminar.id_resena}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Error al eliminar reseña");
      setReseñas(
        reseñas.filter((r) => r.id_resena !== resenaAEliminar.id_resena)
      );
      cerrarModal();
    } catch (err) {
      console.error(err);
      alert("No se pudo eliminar la reseña");
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-3 flex items-center">
        <FaComments className="mr-2 text-white" /> Opiniones
      </h2>

      {isAuthenticated && canComment && (
        <FormularioComentario
          cursoId={cursoId}
          resena={resenaEditando || undefined}
          onComentarioEnviado={(nueva) => {
            if (resenaEditando) {
              const nuevasResenas = reseñas.map((r) =>
                r.id_resena === resenaEditando.id_resena
                  ? { ...r, ...nueva }
                  : r
              );
              setReseñas(nuevasResenas);
              setResenaEditando(null);
            } else {
              handleNuevaResena({
                id_resena: Date.now(),
                id_usuario: usuarioActual.id_usuario,
                calificacion: nueva.calificacion,
                comentario: nueva.comentario,
                usuario: {
                  nombre: usuarioActual.nombre || "Anónimo",
                  apellido: usuarioActual.apellido || "",
                  imagen_perfil: usuarioActual.imagen || "/sinUsuario.jpg",
                },
              } as Resena);
            }
          }}
          onCancelar={handleCancelarEdicion}
        />
      )}

      {isAuthenticated && !canComment && mustComplete && !checkingPermisos && (
        <p className="text-yellow-300 text-sm mb-4 py-2">
          Para poder dejar tu comentario, primero completa el curso.
        </p>
      )}

      <div className="space-y-4 text-sm text-gray-300">
        {reseñas.length > 0 ? (
          reseñas.map((r) => (
            <div
              key={r.id_resena}
              className="bg-[#0D1A28] p-4 rounded-lg flex items-start"
            >
              <img
                src={
                  r.usuario?.imagen_perfil &&
                  r.usuario.imagen_perfil !== "null" &&
                  r.usuario.imagen_perfil !== "" &&
                  r.usuario.imagen_perfil !== null
                    ? r.usuario.imagen_perfil.startsWith("http")
                      ? r.usuario.imagen_perfil
                      : `${BASE_URL}${r.usuario.imagen_perfil}`
                    : "/sinUsuario.jpg"
                }
                onError={(e) => (e.currentTarget.src = "/sinUsuario.jpg")}
                alt={r.usuario?.nombre || "Usuario"}
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />
              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-white">
                    {r.usuario?.nombre || "Anónimo"} {r.usuario?.apellido || ""}
                  </p>
                  <p className="flex items-center text-yellow-400">
                    <FaStar className="inline-block mr-1" /> {r.calificacion}
                  </p>
                </div>
                <p className="text-gray-400 mt-2">{r.comentario}</p>
                {isAuthenticated &&
                  r.id_usuario === usuarioActual.id_usuario && (
                    <div className="mt-2 flex gap-3 justify-end text-sm">
                      <button
                        onClick={() => handleEditarResena(r)}
                        className="flex items-center gap-1 px-2 py-1 bg-sky-500 text-white rounded hover:bg-sky-600 transition"
                      >
                        <FaEdit /> Editar
                      </button>
                      <button
                        onClick={() => abrirModalEliminar(r)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        <FaTrash /> Eliminar
                      </button>
                    </div>
                  )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-300">No hay opiniones disponibles.</p>
        )}
      </div>

      <DeleteModal
        isOpen={modalAbierto}
        onClose={cerrarModal}
        onConfirm={confirmarEliminarResena}
      />
    </section>
  );
};

export default Comentarios;
