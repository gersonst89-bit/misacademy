import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { apiUrl } from "../config/api";

export default function Reclamaciones() {
  const [form, setForm] = useState({
    nombre_completo: "",
    dni: "",
    email: "",
    tipo_reclamo: "",
    asunto: "",
    descripcion: "",
  });

  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);

    try {
      const response = await fetch(
        apiUrl("/reclamaciones"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(form),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.errors
            ? (Object.values(data.errors)[0] as string)
            : data.message || "Ocurrió un error"
        );
      }

      setMensaje("✔ Reclamación enviada correctamente.");

      setForm({
        nombre_completo: "",
        dni: "",
        email: "",
        tipo_reclamo: "",
        asunto: "",
        descripcion: "",
      });

      setTimeout(() => {
        setMensaje(null);
      }, 3000);

    } catch (error: any) {
      setMensaje("Error: " + error.message);

      setTimeout(() => {
        setMensaje(null);
      }, 3000);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-300 px-6 md:px-20 py-16">
      <div className="max-w-4xl mx-auto">

        <nav className="flex items-center text-sm mb-10 space-x-2">
          <Link
            to="/"
            className="text-sky-400 hover:text-sky-300 font-semibold"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-sky-300 font-semibold">Libro de Reclamaciones</span>
        </nav>

        <h1 className="text-5xl font-extrabold text-white mb-3 text-center">
          Libro de Reclamaciones
        </h1>

        <p className="text-lg text-gray-400 mb-12 text-center max-w-2xl mx-auto">
          Por favor, completa el siguiente formulario con información verídica.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0e1c2b] rounded-2xl p-8 shadow-lg border border-sky-800 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Nombre completo</label>
              <input
                type="text"
                name="nombre_completo"
                value={form.nombre_completo}
                onChange={handleChange}
                className="w-full bg-[#1b2a3a] text-white rounded-lg px-4 py-3"
                placeholder="Juan Jorge"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Número de DNI</label>
              <input
                type="text"
                name="dni"
                value={form.dni}
                onChange={handleChange}
                className="w-full bg-[#1b2a3a] text-white rounded-lg px-4 py-3"
                placeholder="00000000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full bg-[#1b2a3a] text-white rounded-lg px-4 py-3"
              placeholder="correo@correo.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Tipo de Reclamo</label>
            <select
              name="tipo_reclamo"
              value={form.tipo_reclamo}
              onChange={handleChange}
              className="w-full bg-[#1b2a3a] text-white rounded-lg px-4 py-3"
              required
            >
              <option value="">Seleccione una opción</option>
              <option value="Producto/Servicio">Producto/Servicio</option>
              <option value="Pago">Pago</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Asunto</label>
            <input
              type="text"
              name="asunto"
              value={form.asunto}
              onChange={handleChange}
              className="w-full bg-[#1b2a3a] text-white rounded-lg px-4 py-3"
              placeholder="Reclamo sobre..."
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Descripción</label>
            <textarea
              rows={5}
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full bg-[#1b2a3a] text-white rounded-lg px-4 py-3"
              placeholder="Describe el reclamo con detalle..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-sky-700 hover:bg-sky-600 text-white font-semibold text-lg py-4 rounded-full ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Enviando..." : "Enviar Reclamo"}
          </button>

          {mensaje && (
            <div
              className={`mt-4 text-center text-lg font-semibold ${
                mensaje.startsWith("✔") ? "text-green-400" : "text-red-400"
              }`}
            >
              {mensaje}
            </div>
          )}
        </form>

      </div>
    </div>
  );
}
