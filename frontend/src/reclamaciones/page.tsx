import { Link } from "react-router-dom";
import { ChevronRight, User, Shield, Mail, HelpCircle, FileText, Send, BookOpen } from "lucide-react";
import { useState } from "react";
import { apiClient } from "../services/apiClient";

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
      await apiClient.post("/reclamaciones", form).catch((err) => {
        const data = err.response?.data;
        const msg = data?.errors
          ? (Object.values(data.errors)[0] as string)
          : data?.message || "Ocurrió un error";
        throw new Error(msg);
      });

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
    <div className="min-h-screen bg-[#03070c] text-gray-300 px-6 md:px-20 py-16 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-fuchsia-500/5 blur-[120px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">

        <nav className="flex items-center text-sm mb-10 space-x-2">
          <Link
            to="/"
            className="text-sky-400 hover:text-sky-300 font-semibold transition-colors duration-300"
          >
            Home
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-500" />
          <span className="text-sky-300 font-semibold">Libro de Reclamaciones</span>
        </nav>

        <div className="text-center mb-12 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-6 shadow-lg shadow-sky-500/5">
            <BookOpen size={28} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 uppercase tracking-tight font-['Outfit']">
            Libro de <span className="text-transparent" style={{ WebkitTextStroke: '1px #38bdf8' }}>Reclamaciones</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mt-4">
            Por favor, completa el siguiente formulario con información verídica para poder procesar tu reclamo.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/[0.02] border border-white/5 backdrop-blur-3xl rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-2xl space-y-6 relative overflow-hidden"
        >
          {/* Internal Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 blur-[80px] rounded-full -z-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/5 blur-[80px] rounded-full -z-10 pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Nombre completo</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-500 transition-colors duration-300" size={18} />
                <input
                  type="text"
                  name="nombre_completo"
                  value={form.nombre_completo}
                  onChange={handleChange}
                  className="w-full bg-white/[0.02] border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 hover:bg-white/[0.04] transition-all placeholder:text-gray-600 font-medium"
                  placeholder="Juan Jorge"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2 font-medium">Número de DNI</label>
              <div className="relative group">
                <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-500 transition-colors duration-300" size={18} />
                <input
                  type="text"
                  name="dni"
                  value={form.dni}
                  onChange={handleChange}
                  className="w-full bg-white/[0.02] border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 hover:bg-white/[0.04] transition-all placeholder:text-gray-600 font-medium"
                  placeholder="00000000"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Correo electrónico</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-500 transition-colors duration-300" size={18} />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 hover:bg-white/[0.04] transition-all placeholder:text-gray-600 font-medium"
                placeholder="correo@correo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Tipo de Reclamo</label>
            <div className="relative group">
              <HelpCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-500 transition-colors duration-300" size={18} />
              <select
                name="tipo_reclamo"
                value={form.tipo_reclamo}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 hover:bg-white/[0.04] transition-all cursor-pointer font-medium"
                required
              >
                <option value="" className="bg-[#03070c] text-gray-400">Seleccione una opción</option>
                <option value="Producto/Servicio" className="bg-[#03070c] text-white">Producto/Servicio</option>
                <option value="Pago" className="bg-[#03070c] text-white">Pago</option>
                <option value="Otros" className="bg-[#03070c] text-white">Otros</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Asunto</label>
            <div className="relative group">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-sky-500 transition-colors duration-300" size={18} />
              <input
                type="text"
                name="asunto"
                value={form.asunto}
                onChange={handleChange}
                className="w-full bg-white/[0.02] border border-white/10 text-white rounded-xl pl-12 pr-4 py-3.5 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 hover:bg-white/[0.04] transition-all placeholder:text-gray-600 font-medium"
                placeholder="Reclamo sobre..."
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2 font-medium">Descripción</label>
            <textarea
              rows={5}
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              className="w-full bg-white/[0.02] border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 hover:bg-white/[0.04] transition-all placeholder:text-gray-600 font-medium"
              placeholder="Describe el reclamo con detalle..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-500 hover:to-sky-600 text-white font-bold text-lg py-4 rounded-full shadow-lg hover:shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Send size={18} />
            {loading ? "Enviando..." : "Enviar Reclamo"}
          </button>

          {mensaje && (
            <div
              className={`mt-4 text-center text-lg font-semibold animate-pulse ${
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
