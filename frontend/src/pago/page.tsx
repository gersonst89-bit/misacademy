"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

interface Curso {
  id_curso: number;
  titulo: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen?: string;
}

interface CarritoItem {
  id_item: number;
  curso: Curso;
  precio: number;
}

interface CarritoData {
  id_carrito: number;
  items: CarritoItem[];
}

interface TipoPago {
  id_tipo_pago: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

export default function Pago() {
  const navigate = useNavigate();

  const [carrito, setCarrito] = useState<CarritoData | null>(null);
  const [metodosPago, setMetodosPago] = useState<TipoPago[]>([]);
  const [loadingMetodos, setLoadingMetodos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [pagoData, setPagoData] = useState({
    id_tipo_pago: "",
    referencia_externa: "",
  });

  const [imagenComprobante, setImagenComprobante] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [mostrarTerminos, setMostrarTerminos] = useState(false);
  const [aceptado, setAceptado] = useState(false);

  useEffect(() => {
    const data = localStorage.getItem("carritoData");
    if (data) setCarrito(JSON.parse(data));
  }, []);

  useEffect(() => {
    const fetchMetodosPago = async () => {
      try {
        const res = await fetch(`${API_URL}/tipos-pagos`);
        const data = await res.json();
        if (res.ok && data.status === "success") {
          const activos = data.tipos_pagos.filter(
            (tp: any) => tp.activo === true || tp.activo === 1
          );
          setMetodosPago(activos);
        }
      } catch (err) {
        console.error("Error al cargar tipos de pago:", err);
      } finally {
        setLoadingMetodos(false);
      }
    };
    fetchMetodosPago();
  }, []);

  const total =
    carrito?.items.reduce((acc, item) => acc + Number(item.precio || 0), 0) || 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setPagoData({ ...pagoData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenComprobante(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!aceptado) {
      setError("Debes aceptar los términos y condiciones para continuar.");
      return;
    }

    if (!pagoData.id_tipo_pago) {
      setError("Selecciona un método de pago.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Debes iniciar sesión para registrar el pago.");
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append("id_tipo_pago", pagoData.id_tipo_pago);
      formData.append("concepto", "Pago de cursos del carrito");
      formData.append(
        "detalles_transaccion",
        carrito?.items.map((i) => i.curso.titulo).join(", ") || ""
      );
      if (pagoData.referencia_externa)
        formData.append("referencia_externa", pagoData.referencia_externa);
      if (imagenComprobante)
        formData.append("imagen_comprobante", imagenComprobante);

      const res = await fetch(`${API_URL}/pagos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.status === 201 && data.status === "success") {
        await fetch(`${API_URL}/carrito/vaciar`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });
        localStorage.removeItem("carritoData");

        setMostrarModal(true);
      } else {
        setError(data.mensaje || "Error al registrar el pago.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleAceptar = () => {
    setMostrarModal(false);
    navigate("/cursos");
  };

  if (!carrito || carrito.items.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold mb-3">No hay cursos para pagar.</h1>
        <button
          onClick={() => navigate("/cursos")}
          className="bg-sky-600 px-6 py-2 rounded-lg hover:bg-sky-700 transition"
        >
          Ir a cursos
        </button>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Confirmar Pago de Cursos
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-900/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Cursos seleccionados</h2>

          <div className="space-y-4">
            {carrito.items.map((item) => (
              <div
                key={item.id_item}
                className="flex items-center justify-between bg-gray-800/50 rounded-lg p-3 border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.curso.imagen}
                    alt={item.curso.titulo}
                    className="w-16 h-16 rounded object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{item.curso.titulo}</h3>
                    <p className="text-gray-400 text-sm">{item.curso.nombre}</p>
                  </div>
                </div>
                <p className="text-sky-400 font-semibold">
                  S/ {Number(item.precio || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-700 my-4"></div>

          <div className="flex justify-between text-lg font-semibold">
            <span>Total a pagar:</span>
            <span className="text-sky-400">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-gray-900/40 border border-gray-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Método de pago</h2>

          <label className="block mb-2 text-sm">Selecciona un método</label>
          <select
            name="id_tipo_pago"
            value={pagoData.id_tipo_pago}
            onChange={handleChange}
            className="w-full p-2 mb-4 rounded bg-gray-800 border border-gray-600"
          >
            {loadingMetodos ? (
              <option>Cargando métodos...</option>
            ) : (
              <>
                <option value="">Selecciona un método</option>
                {metodosPago.map((metodo) => (
                  <option
                    key={metodo.id_tipo_pago}
                    value={metodo.id_tipo_pago}
                    className="bg-gray-800 text-white"
                  >
                    {metodo.nombre}
                  </option>
                ))}
              </>
            )}
          </select>


          <label className="block mb-2 text-sm">Comprobante</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-sky-600 file:text-white hover:file:bg-sky-700 cursor-pointer"
          />

          {preview && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-1">Vista previa:</p>
              <img
                src={preview}
                alt="Vista previa comprobante"
                className="w-full h-40 object-contain rounded border border-gray-700"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="acepto"
              checked={aceptado}
              onChange={(e) => setAceptado(e.target.checked)}
              className="w-4 h-4 accent-sky-600 cursor-pointer"
            />
            <label htmlFor="acepto" className="text-sm text-gray-300">
              Acepto los{" "}
              <button
                type="button"
                onClick={() => setMostrarTerminos(true)}
                className="text-sky-400 underline hover:text-sky-500"
              >
                Términos y Condiciones
              </button>
            </label>
          </div>

          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading || !aceptado}
            className={`mt-6 w-full bg-sky-600 rounded-lg py-2 font-semibold hover:bg-sky-700 transition ${
              loading || !aceptado ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Procesando..." : "Confirmar pago"}
          </button>
        </div>
      </div>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center shadow-lg w-[90%] max-w-md">
            <div className="text-green-400 text-5xl mb-4">✔</div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              ¡Pago registrado correctamente!
            </h2>
            <p className="text-gray-300 mb-6">
              Revisa tu correo. Te avisaremos cuando tu curso esté disponible.
            </p>
            <button
              onClick={handleAceptar}
              className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}

      {mostrarTerminos && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            <h3 className="text-lg font-semibold text-sky-400 mb-3">
              Términos y Condiciones de Pago
            </h3>
        <p className="text-sm text-gray-300 mb-5 text-justify">
        Al confirmar tu pago, aceptas las políticas establecidas por la
        plataforma MIS ACADEMY. Todos los pagos serán procesados de forma
        segura y verificada. <br /><br />
        En caso de error en el pago o causas justificadas, el estudiante podrá
        solicitar un reembolso dentro de los primeros <b>7 días hábiles</b> tras
        la confirmación del mismo. Pasado este plazo, no se aceptarán solicitudes
        de devolución. <br /><br />
        El acceso al curso se habilitará una vez validado el comprobante
        correspondiente. Cualquier irregularidad en la información del pago
        podría retrasar la activación del curso.
      </p>
            <button
              onClick={() => setMostrarTerminos(false)}
              className="bg-sky-600 px-5 py-1.5 rounded-lg text-white hover:bg-sky-700 transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
