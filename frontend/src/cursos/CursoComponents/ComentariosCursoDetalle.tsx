import React, { useState, useEffect } from 'react';
import { FaComments, FaStar, FaEdit, FaTrash, FaRegCommentDots } from 'react-icons/fa';
import FormularioComentario from './FormularioComentario';
import DeleteModal from './DeleteModalComentario';
import type { Resena } from '../../types/models';
import { API_URL, BASE_URL } from '../../config/api';
import { apiClient } from '../../services/apiClient';

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
    nombre: 'Anónimo',
    apellido: '',
    imagen: '/sinUsuario.jpg',
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
        const response = await apiClient.get('/auth/profile');

        const data = response.data;

        setUsuarioActual({
          id_usuario: data.id_usuario,
          nombre: data.nombre || 'Anónimo',
          apellido: data.apellido || '',
          imagen: data.imagen || '/sinUsuario.jpg',
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

      try {
        const resHistorial = await apiClient.get('/compras/historial');

        const dataHistorial = resHistorial.data;

        if (dataHistorial.status !== 'success' || !Array.isArray(dataHistorial.compras)) {
          setCanComment(false);
          setMustComplete(false);
          return;
        }

        const compraCurso = dataHistorial.compras.find((c: any) => c.curso?.id_curso === cursoId);

        if (!compraCurso) {
          setCanComment(false);
          setMustComplete(false);
          return;
        }

        const resProgreso = await apiClient.get(`/cursos/${cursoId}/progreso`);

        const dataProgreso = resProgreso.data;

        const progresoTotal =
          dataProgreso.curso?.progreso_total ?? dataProgreso.progreso_total ?? 0;

        if (progresoTotal >= 100) {
          setCanComment(true);
          setMustComplete(false);
        } else {
          setCanComment(false);
          setMustComplete(true);
        }
      } catch (err) {
        console.error('Error verificando permisos de comentario:', err);

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
      await apiClient.delete(`/cursos/resenas/${resenaAEliminar.id_resena}`);

      setReseñas(reseñas.filter((r) => r.id_resena !== resenaAEliminar.id_resena));

      cerrarModal();
    } catch (err) {
      console.error(err);
      alert('No se pudo eliminar la reseña');
    }
  };

  return (
    <section>
      {/* =========================================================
          CABECERA
      ========================================================= */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center">
          <FaComments className="text-sky-400 text-sm" />
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">Opiniones</h2>

          <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] mt-0.5">
            Experiencias de nuestros estudiantes
          </p>
        </div>
      </div>

      {/* =========================================================
          FORMULARIO
      ========================================================= */}
      {isAuthenticated && canComment && (
        <FormularioComentario
          cursoId={cursoId}
          resena={resenaEditando || undefined}
          onComentarioEnviado={(nueva) => {
            if (resenaEditando) {
              const nuevasResenas = reseñas.map((r) =>
                r.id_resena === resenaEditando.id_resena ? { ...r, ...nueva } : r,
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
                  nombre: usuarioActual.nombre || 'Anónimo',
                  apellido: usuarioActual.apellido || '',
                  imagen_perfil: usuarioActual.imagen || '/sinUsuario.jpg',
                },
              } as Resena);
            }
          }}
          onCancelar={handleCancelarEdicion}
        />
      )}

      {/* =========================================================
          AVISO DE CURSO NO COMPLETADO
      ========================================================= */}
      {isAuthenticated && !canComment && mustComplete && !checkingPermisos && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/15 flex items-center justify-center shrink-0">
            <span className="text-amber-400 text-xs">!</span>
          </div>

          <p className="text-amber-300/90 text-sm leading-relaxed">
            Para poder dejar tu comentario, primero completa el curso.
          </p>
        </div>
      )}

      {/* =========================================================
          RESEÑAS
      ========================================================= */}
      <div className="space-y-4 text-sm text-gray-300">
        {reseñas.length > 0 ? (
          reseñas.map((r) => (
            <div
              key={r.id_resena}
              className="bg-[#0D1A28] p-4 rounded-2xl flex items-start border border-white/5"
            >
              <img
                src={
                  r.usuario?.imagen_perfil &&
                  r.usuario.imagen_perfil !== 'null' &&
                  r.usuario.imagen_perfil !== '' &&
                  r.usuario.imagen_perfil !== null
                    ? r.usuario.imagen_perfil.startsWith('http')
                      ? r.usuario.imagen_perfil
                      : `${BASE_URL}${r.usuario.imagen_perfil}`
                    : '/sinUsuario.jpg'
                }
                onError={(e) => (e.currentTarget.src = '/sinUsuario.jpg')}
                alt={r.usuario?.nombre || 'Usuario'}
                className="w-12 h-12 rounded-full mr-4 object-cover"
              />

              <div className="flex flex-col flex-grow">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-white">
                    {r.usuario?.nombre || 'Anónimo'} {r.usuario?.apellido || ''}
                  </p>

                  <p className="flex items-center text-yellow-400">
                    <FaStar className="inline-block mr-1" />
                    {r.calificacion}
                  </p>
                </div>

                <p className="text-gray-400 mt-2">{r.comentario}</p>

                {isAuthenticated && r.id_usuario === usuarioActual.id_usuario && (
                  <div className="mt-3 flex gap-2 justify-end text-sm">
                    <button
                      onClick={() => handleEditarResena(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition"
                    >
                      <FaEdit />
                      Editar
                    </button>

                    <button
                      onClick={() => abrirModalEliminar(r)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                    >
                      <FaTrash />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          /* =====================================================
             ESTADO VACÍO
          ====================================================== */
          <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.07] bg-gradient-to-br from-white/[0.03] to-transparent px-6 py-10 md:py-12">
            <div className="absolute top-0 right-0 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full" />

            <div className="relative z-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/15 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(14,165,233,0.08)]">
                <FaRegCommentDots className="text-sky-400 text-2xl" />
              </div>

              <h3 className="text-lg md:text-xl font-black text-white mb-2">
                Aún no hay opiniones
              </h3>

              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                Este curso todavía no cuenta con reseñas. Las experiencias de nuestros estudiantes
                aparecerán aquí.
              </p>

              <div className="flex items-center gap-2 mt-5 opacity-40">
                <FaStar className="text-sky-400 text-xs" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
                  Sé parte de la comunidad
                </span>
              </div>
            </div>
          </div>
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
