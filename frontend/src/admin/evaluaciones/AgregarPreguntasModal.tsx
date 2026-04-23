"use client";

import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { API_URL } from "../../config/api";


const API = API_URL;

function authHeaders() {
  const token =
    (typeof window !== "undefined" &&
      (localStorage.getItem("token") ||
        localStorage.getItem("access_token"))) ||
    "";

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}


interface OpcionRespuesta {
  id_opcion: number;
  id_pregunta: number;
  texto_opcion: string;
  es_correcta: number | boolean;
}

interface Pregunta {
  id_pregunta: number;
  id_evaluacion: number;
  texto_pregunta: string;
  tipo: string;
  puntos: number;
  orden: number;
}

interface PreguntaConOpciones extends Pregunta {
  opciones: OpcionRespuesta[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  id_evaluacion: number | null;
}


export default function AgregarPreguntasModal({
  isOpen,
  onClose,
  id_evaluacion,
}: Props) {
  const [preguntas, setPreguntas] = useState<PreguntaConOpciones[]>([]);
  const [cargando, setCargando] = useState(true);

  const [editPregunta, setEditPregunta] = useState<PreguntaConOpciones | null>(
    null
  );
  const [editOpcion, setEditOpcion] = useState<OpcionRespuesta | null>(null);

  const [crearPreguntaOpen, setCrearPreguntaOpen] = useState(false);
  const [crearOpcionOpen, setCrearOpcionOpen] = useState<{
    open: boolean;
    id_pregunta: number | null;
  }>({ open: false, id_pregunta: null });

  const [nuevaPregunta, setNuevaPregunta] = useState({
    texto_pregunta: "",
    tipo: "Opcion multiple",
    puntos: 1,
    orden: 1,
  });

  const [nuevaOpcion, setNuevaOpcion] = useState({
    texto_opcion: "",
    es_correcta: false,
  });



const cargarPreguntas = async () => {
  if (!id_evaluacion) return;

  setCargando(true);

  const rPreg = await fetch(`${API}/preguntas`, {
    headers: authHeaders(),
  });
  const jsonPreg = await rPreg.json();

  const todasPreguntas: Pregunta[] = Array.isArray(jsonPreg.preguntas)
    ? jsonPreg.preguntas
    : [];

  const preguntasFiltradas = todasPreguntas.filter(
    (p) => Number(p.id_evaluacion) === Number(id_evaluacion)
  );

  const rOp = await fetch(`${API}/opciones`, {
    headers: authHeaders(),
  });
  const jsonOp = await rOp.json();

  const todasOpciones: OpcionRespuesta[] = Array.isArray(jsonOp.opciones)
    ? jsonOp.opciones
    : [];

  const resultado: PreguntaConOpciones[] = preguntasFiltradas.map((preg) => ({
    ...preg,
    opciones: todasOpciones.filter(
      (op) => Number(op.id_pregunta) === Number(preg.id_pregunta)
    ),
  }));

  setPreguntas(resultado);
  setCargando(false);
};


  useEffect(() => {
    if (isOpen) cargarPreguntas();
  }, [id_evaluacion, isOpen]);


  const crearPregunta = async () => {
    if (!id_evaluacion) return;

    const body = {
      ...nuevaPregunta,
      id_evaluacion,
    };

    await fetch(`${API}/preguntas`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    setCrearPreguntaOpen(false);
    setNuevaPregunta({
      texto_pregunta: "",
      tipo: "Opcion multiple",
      puntos: 1,
      orden: 1,
    });

    cargarPreguntas();
  };

  const crearOpcion = async () => {
    if (!crearOpcionOpen.id_pregunta) return;

    const body = {
      texto_opcion: nuevaOpcion.texto_opcion,
      es_correcta: nuevaOpcion.es_correcta ? 1 : 0,
      id_pregunta: crearOpcionOpen.id_pregunta,
    };

    await fetch(`${API}/opciones`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(body),
    });

    setCrearOpcionOpen({ open: false, id_pregunta: null });
    setNuevaOpcion({ texto_opcion: "", es_correcta: false });

    cargarPreguntas();
  };


  const eliminarPregunta = async (id_pregunta: number) => {
    if (!confirm("¿Eliminar esta pregunta?")) return;

    await fetch(`${API}/preguntas/${id_pregunta}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    cargarPreguntas();
  };

  const eliminarOpcion = async (id_opcion: number) => {
    if (!confirm("¿Eliminar esta opción?")) return;

    await fetch(`${API}/opciones/${id_opcion}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    cargarPreguntas();
  };


const guardarPregunta = async () => {
  if (!editPregunta) return;
  await fetch(`${API}/preguntas/${editPregunta.id_pregunta}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({
      texto_pregunta: editPregunta.texto_pregunta,
      puntos: editPregunta.puntos,
      tipo: editPregunta.tipo,
      orden: editPregunta.orden,

      id_evaluacion: editPregunta.id_evaluacion,
    }),
  });

  setEditPregunta(null);
  cargarPreguntas();
};

const guardarOpcion = async () => {
  if (!editOpcion) return;

  await fetch(`${API}/opciones/${editOpcion.id_opcion}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({

      texto_opcion: editOpcion.texto_opcion,
      es_correcta: editOpcion.es_correcta ? 1 : 0,

      id_pregunta: editOpcion.id_pregunta,
    }),
  });

  setEditOpcion(null);
  cargarPreguntas();
};



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-5xl max-h-[90vh] shadow-xl overflow-y-auto">

        <h2 className="text-2xl font-bold mb-6 text-center text-black">
          Preguntas de Evaluación {id_evaluacion}
        </h2>

        {cargando ? (
          <p className="text-center text-lg">Cargando...</p>
        ) : preguntas.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-600 text-lg mb-4">
              No hay preguntas registradas para esta evaluación.
            </p>
            <button
              onClick={() => setCrearPreguntaOpen(true)}
              className="bg-sky-600 text-white px-5 py-2 rounded-lg shadow hover:bg-sky-700"
            >
              Agregar pregunta
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setCrearPreguntaOpen(true)}
                className="bg-sky-600 text-white px-4 py-2 rounded-lg shadow hover:bg-sky-700"
              >
                Agregar Pregunta
              </button>
            </div>

            {preguntas.map((p, idx) => (
              <div
                key={p.id_pregunta}
                className="border rounded-lg p-4 mb-4 bg-gray-50 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-lg text-black">
                    {idx + 1}. {p.texto_pregunta}
                  </h3>

                  <div className="flex gap-3">
                    <button
                      className="text-sky-600 hover:text-sky-800"
                      onClick={() => setEditPregunta({ ...p })}
                    >
                      Editar
                    </button>

                    <button
                      className="text-red-600 hover:text-red-800"
                      onClick={() => eliminarPregunta(p.id_pregunta)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {p.opciones.map((op) => (
                      <div
                        key={op.id_opcion}
                        className={`p-4 rounded-lg shadow-sm border flex justify-between items-center transition hover:shadow-md ${
                          op.es_correcta ? "border-green-500 bg-green-50" : "border-gray-300 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-black">
                          {op.es_correcta ? (
                            <span className="text-green-600 text-xl">✔</span>
                          ) : (
                            <span className="text-gray-400 text-xl">○</span>
                          )}

                          <span className="font-medium">{op.texto_opcion}</span>
                        </div>

                        <div className="flex gap-3 text-xl">
                          <button
                            onClick={() => setEditOpcion({ ...op })}
                            className="text-sky-600 hover:text-sky-800"
                            title="Editar opción"
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => eliminarOpcion(op.id_opcion)}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar opción"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                <div className="text-right mt-3">
                  <button
                    onClick={() =>
                      setCrearOpcionOpen({
                        open: true,
                        id_pregunta: p.id_pregunta,
                      })
                    }
                    className="text-sm bg-sky-600 text-white px-3 py-1 rounded shadow hover:bg-sky-700"
                  >
                    Agregar opción
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        <div className="text-center mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-black rounded shadow hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>

     {crearPreguntaOpen && (
  <div className="fixed inset-0 bg-black/30 flex justify-center items-center p-4 z-[60]">
    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
      <h3 className="text-xl font-bold mb-5 text-center">Agregar Pregunta</h3>

      <label className="block mb-1 font-semibold text-gray-700">
        Texto de la pregunta
      </label>
      <input
        placeholder="Ingrese la pregunta"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
        value={nuevaPregunta.texto_pregunta}
        onChange={(e) =>
          setNuevaPregunta({
            ...nuevaPregunta,
            texto_pregunta: e.target.value,
          })
        }
      />

      <label className="block mb-1 font-semibold text-gray-700">
        Tipo de pregunta
      </label>
      <input
        type="text"
        placeholder="Ej: opcion_multiple, abierta"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
        value={nuevaPregunta.tipo}
        onChange={(e) =>
          setNuevaPregunta({
            ...nuevaPregunta,
            tipo: e.target.value,
          })
        }
      />

      <label className="block mb-1 font-semibold text-gray-700">
        Puntos asignados
      </label>
      <input
        type="number"
        placeholder="Ej: 1"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
        value={nuevaPregunta.puntos}
        onChange={(e) =>
          setNuevaPregunta({
            ...nuevaPregunta,
            puntos: Number(e.target.value),
          })
        }
      />

      <label className="block mb-1 font-semibold text-gray-700">
        Orden de aparición
      </label>
      <input
        type="number"
        placeholder="Ej: 1"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
        value={nuevaPregunta.orden}
        onChange={(e) =>
          setNuevaPregunta({
            ...nuevaPregunta,
            orden: Number(e.target.value),
          })
        }
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={crearPregunta}
          className="bg-sky-600 text-white px-4 py-2 rounded shadow hover:bg-sky-700 transition"
        >
          Guardar
        </button>

        <button
          onClick={() => setCrearPreguntaOpen(false)}
          className="px-4 py-2 bg-gray-200 text-black rounded shadow hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}


      {crearOpcionOpen.open && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center p-4 z-[60]">
          <div className="bg-white p-5 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">Agregar Opción</h3>
               <label className="block mb-1 font-semibold text-gray-700">
        Texto de la opción
      </label>
            <input
              placeholder="Texto de la opción"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              value={nuevaOpcion.texto_opcion}
              onChange={(e) =>
                setNuevaOpcion({
                  ...nuevaOpcion,
                  texto_opcion: e.target.value,
                })
              }
            />

            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={nuevaOpcion.es_correcta}
                onChange={(e) =>
                  setNuevaOpcion({
                    ...nuevaOpcion,
                    es_correcta: e.target.checked,
                  })
                }
              />
              ¿Es correcta?
            </label>

            <button
              onClick={crearOpcion}
              className="bg-sky-600 text-white px-4 py-2 rounded mr-2"
            >
              Guardar
            </button>

            <button
              onClick={() =>
                setCrearOpcionOpen({ open: false, id_pregunta: null })
              }
              className="px-4 py-2 text-black rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {editPregunta && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-[60]">
    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
      <h3 className="text-xl font-bold mb-5 text-center">Editar Pregunta</h3>

      <label className="block mb-1 font-semibold text-gray-700">
        Texto de la pregunta
      </label>
      <input
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
        value={editPregunta.texto_pregunta}
        onChange={(e) =>
          setEditPregunta({
            ...editPregunta,
            texto_pregunta: e.target.value,
          })
        }
      />

      <label className="block mb-1 font-semibold text-gray-700">
        Tipo de pregunta
      </label>
      <input
        type="text"
        placeholder="Ej: opcion_multiple ó abierta"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
        value={editPregunta.tipo}
        onChange={(e) =>
          setEditPregunta({
            ...editPregunta,
            tipo: e.target.value,
          })
        }
      />

      <label className="block mb-1 font-semibold text-gray-700">
        Puntos asignados
      </label>
      <input
        type="number"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
        value={editPregunta.puntos}
        onChange={(e) =>
          setEditPregunta({
            ...editPregunta,
            puntos: Number(e.target.value),
          })
        }
      />

      <label className="block mb-1 font-semibold text-gray-700">
        Orden de aparición
      </label>
      <input
        type="number"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
        value={editPregunta.orden}
        onChange={(e) =>
          setEditPregunta({
            ...editPregunta,
            orden: Number(e.target.value),
          })
        }
      />

      <div className="flex justify-end gap-3">
        <button
          onClick={guardarPregunta}
          className="bg-sky-600 text-white px-4 py-2 rounded shadow hover:bg-sky-700 transition"
        >
          Guardar
        </button>

        <button
          onClick={() => setEditPregunta(null)}
          className="px-4 py-2 bg-gray-200 text-black rounded shadow hover:bg-gray-300 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}

      {editOpcion && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4 z-[60]">
          <div className="bg-white p-5 rounded-xl w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">Editar Opción</h3>
               <label className="block mb-1 font-semibold text-gray-700">
        Texto de la opción
      </label>
            <input
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-5 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-600"
              value={editOpcion.texto_opcion}
              onChange={(e) =>
                setEditOpcion({
                  ...editOpcion,
                  texto_opcion: e.target.value,
                })
              }
            />

            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={!!editOpcion.es_correcta}
                onChange={(e) =>
                  setEditOpcion({
                    ...editOpcion,
                    es_correcta: e.target.checked,
                  })
                }
              />
              Correcta
            </label>

            <button
              onClick={guardarOpcion}
              className="bg-sky-600 text-white px-4 py-2 rounded mr-2"
            >
              Guardar
            </button>

            <button
              onClick={() => setEditOpcion(null)}
              className="px-4 py-2 text-black rounded bg-gray-200 hover:bg-gray-300"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
