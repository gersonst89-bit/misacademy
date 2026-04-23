import React, { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import type { Resena } from "../../types/models";
import { API_URL } from "../../config/api";

interface FormularioComentarioProps {
  cursoId: number;
  resena?: Resena;
  onComentarioEnviado: (nuevaResena: {
    calificacion: number;
    comentario: string;
  }) => void;
  onCancelar?: () => void;
}

const FormularioComentario: React.FC<FormularioComentarioProps> = ({
  cursoId,
  resena,
  onComentarioEnviado,
  onCancelar,
}) => {
  const [comentario, setComentario] = useState(resena?.comentario || "");
  const [calificacion, setCalificacion] = useState(resena?.calificacion || 0);
  const [hover, setHover] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (resena) {
      setComentario(resena.comentario);
      setCalificacion(resena.calificacion);
    } else {
      setComentario("");
      setCalificacion(0);
      setHover(0);
    }
  }, [resena]);

  const mostrarMensaje = (mensaje: string) => {
    setCartMessage(mensaje);
    setIsMessageVisible(true);
    setTimeout(() => {
      setIsMessageVisible(false);
    }, 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario || calificacion === 0) {
      mostrarMensaje("Completa todos los campos antes de enviar la reseña");
      return;
    }

    setIsLoading(true);
    try {
      const method = resena ? "PATCH" : "POST";
      const url = resena
        ? `${API_URL}/cursos/resenas/${resena.id_resena}`
        : `${API_URL}/cursos/${cursoId}/resenas`;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ calificacion, comentario }),
      });

      if (!response.ok) throw new Error("Error al enviar la reseña");

      const data = await response.json();
      onComentarioEnviado(data.resena || { calificacion, comentario });

      mostrarMensaje(
        resena ? "Reseña actualizada correctamente" : "Reseña enviada con éxito"
      );

      if (!resena) {
        setComentario("");
        setCalificacion(0);
        setHover(0);
      }
    } catch (err) {
      console.error(err);
      mostrarMensaje("No se pudo enviar la reseña");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelar = () => {
    setComentario("");
    setCalificacion(0);
    setHover(0);
    if (onCancelar) onCancelar();
    mostrarMensaje("Edición de reseña cancelada");
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-[#0D1A28] p-4 rounded-lg mb-6 flex flex-col gap-3"
      >
        <div className="flex gap-1 mb-0.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCalificacion(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
            >
              <FaStar
                size={24}
                color={n <= (hover || calificacion) ? "#fcc800" : "#374151"}
              />
            </button>
          ))}
        </div>

        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribe tu comentario..."
          rows={3}
          className="p-2 rounded bg-[#132334] text-gray-200 border border-gray-600 focus:outline-none focus:ring-1 focus:ring-sky-500"
        />

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 rounded transition flex-1"
          >
            {isLoading
              ? "Enviando..."
              : resena
              ? "Actualizar reseña"
              : "Enviar reseña"}
          </button>

          {resena && (
            <button
              type="button"
              onClick={handleCancelar}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition flex-1"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      {/* Mensaje de carrito */}
      {cartMessage && (
        <div
          className={`fixed bottom-4 right-4 bg-[#0D1A28] border-l-4 border-sky-500 text-white px-4 py-2 rounded-lg z-50 transition-opacity duration-500 ${
            isMessageVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {cartMessage}
        </div>
      )}
    </>
  );
};

export default FormularioComentario;
