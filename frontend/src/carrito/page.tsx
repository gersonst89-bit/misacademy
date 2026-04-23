"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config/api";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="relative w-12 h-12">
      <div className="absolute border-4 border-sky-500 border-t-transparent rounded-full w-12 h-12 animate-spin"></div>
      <div className="absolute border-4 border-sky-700 border-t-transparent rounded-full w-8 h-8 top-2 left-2 animate-spin animation-delay-150"></div>
    </div>
  </div>
);

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

export default function Carrito() {
  const [carrito, setCarrito] = useState<CarritoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const fetchCarrito = async () => {
    if (!token) {
      setError("Debes iniciar sesión para ver tu carrito.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/carrito`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();

      if (response.ok && data.data) {
        setCarrito(data.data);
      } else {
        setCarrito(null);
      }
    } catch (err) {
      console.error("Error al conectar con el servidor:", err);
      setError("Error al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarrito();
  }, []);

  const eliminarCurso = async (id_item: number) => {
    try {
      const response = await fetch(`${API_URL}/carrito/quitar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id_item }),
      });

      const data = await response.json();
      if (response.ok && data.data) {
        setCarrito(data.data);
        setMensaje("Curso eliminado del carrito.");
        setTimeout(() => setMensaje(null), 3000);
      } else {
        setError(data.message || "Error al eliminar el curso.");
      }
    } catch (err) {
      console.error(err);
      setError("Error al conectar con el servidor.");
    }
  };

  const subtotal =
    carrito?.items.reduce((acc, item) => acc + Number(item.precio || 0), 0) ||
    0;
  const total = subtotal;

  const procederAlPago = () => {
    if (carrito && carrito.items.length > 0) {
      localStorage.setItem("carritoData", JSON.stringify(carrito));
      navigate("/pago");
    } else {
      setError("Tu carrito está vacío. Agrega cursos antes de pagar.");
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        {error}
      </div>
    );

  if (!carrito || carrito.items.length === 0)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white">
        <h1 className="text-4xl font-bold mb-4">Tu carrito está vacío</h1>
        <p className="text-gray-400 text-lg mb-6">
          Agrega algunos cursos para comenzar.
        </p>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white mb-4 text-center">
          Carrito de Compras
        </h1>
        <p className="text-lg text-gray-400 mb-12 text-center">
          {carrito.items.length} curso
          {carrito.items.length > 1 ? "s" : ""} en tu carrito
        </p>

        <div className="space-y-6">
          {carrito.items.map((item) => (
            <div
              key={item.id_item}
              className="flex flex-col md:flex-row items-center bg-[#0e1c2b] border border-sky-800 rounded-2xl p-6 shadow-lg hover:shadow-sky-500/10 transition-all duration-300"
            >
              <img
                src={item.curso.imagen}
                alt={item.curso.titulo}
                className="w-full md:w-30 h-30 rounded-xl object-cover border border-sky-800 mb-4 md:mb-0"
              />

              <div className="flex-1 md:ml-6">
                <h2 className="text-2xl font-semibold text-white">
                  {item.curso.titulo}
                </h2>
                <p className="text-[22px] text-sky-400 font-bold mt-2">
                  {item.curso.nombre}
                </p>
                <p className="text-[15px] text-gray-400 mt-2 text-justify pr-6 pb-4">
                  {item.curso.descripcion}
                </p>
              </div>

              <div className="mt-4 md:mt-0 flex flex-col items-end w-full md:w-auto">
                <p className="text-2xl font-bold text-sky-400">
                  S/ {Number(item.precio).toFixed(2)}
                </p>
                <button
                  onClick={() => eliminarCurso(item.id_item)}
                  className="mt-4 text-red-500 hover:underline flex items-center space-x-1 pb-1"
                >
                  <Trash2 className="w-4 h-4" /> <span>Eliminar</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-[#0e1c2b] border border-sky-800 rounded-2xl p-8 shadow-lg text-center max-w-xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">
            Resumen del Pedido
          </h2>
          <div className="flex justify-between text-lg mb-2">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white">S/ {subtotal.toFixed(2)}</span>
          </div>
          <div className="border-t border-gray-700 my-4"></div>
          <div className="flex justify-between text-2xl font-bold mb-8">
            <span className="text-sky-400">Total</span>
            <span className="text-sky-400">S/ {total.toFixed(2)}</span>
          </div>

          <button
            type="button"
            onClick={procederAlPago}
            className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold text-lg py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-sky-500/40"
          >
            Proceder al pago
          </button>
        </div>
      </div>

      {mensaje && (
        <div className="fixed bottom-4 right-4 bg-[#0D1A28] border-l-4 border-sky-500 text-white px-4 py-2 rounded-lg z-50 shadow-lg transition-opacity duration-500">
          {mensaje}
        </div>
      )}
    </div>
  );
}
