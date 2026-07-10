"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Mail, MessageSquare, ArrowRight, FileText } from "lucide-react";
import { apiClient } from "../services/apiClient";

interface ContactoResponse {
  status?: string;
  message?: string;
  contacto_id?: number;
  errors?: Record<string, string[]>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    asunto: "",
    mensaje: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !formData.nombre ||
      !formData.apellido ||
      !formData.email ||
      !formData.asunto ||
      !formData.mensaje
    ) {
      setError("Por favor completa todos los campos.");
      return;
    }

    setLoading(true);

    try {
      const res = await apiClient.post("/contacto", formData);
      const data: ContactoResponse = res.data;

      setSuccess(data.message || "Mensaje enviado exitosamente.");
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        asunto: "",
        mensaje: "",
      });
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.data) {
        const data = err.response.data as ContactoResponse;
        if (data.errors) {
          const firstError = Object.values(data.errors)[0]?.[0];
          setError(firstError || "Ocurrió un error al enviar el mensaje.");
        } else {
          setError(data.message || "Ocurrió un error al enviar el mensaje.");
        }
      } else {
        setError("Error de conexión con el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <section className="flex items-center justify-center px-4 text-white overflow-hidden py-10 lg:py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        className="flex flex-col items-center justify-center w-full max-w-3xl text-center"
      >
        <motion.h2
          variants={itemVariants}
          className="text-3xl md:text-5xl font-extrabold mb-4"
        >
          ¿Listo para transformar <br />
          <span className="text-sky-400">tu futuro?</span>
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-base md:text-lg text-gray-300 mb-10 max-w-2xl"
        >
          Únete a <span className="font-semibold">MIS ACADEMY</span> y comienza
          tu viaje hacia el éxito en el mundo de la tecnología.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          variants={itemVariants}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-xl w-full max-w-lg"
        >
          <h3 className="text-xl font-bold text-center mb-6">
            Contáctanos y recibe información exclusiva
          </h3>

          {["nombre", "apellido"].map((field) => (
            <div
              key={field}
              className="flex items-center bg-white/10 rounded-lg px-4 py-3 mb-4"
            >
              <User className="text-sky-400 mr-3" size={18} />
              <input
                type="text"
                name={field}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={(formData as any)[field]}
                onChange={handleChange}
                className="bg-transparent outline-none w-full placeholder-gray-400 text-white"
              />
            </div>
          ))}

          <div className="flex items-center bg-white/10 rounded-lg px-4 py-3 mb-4">
            <Mail className="text-sky-400 mr-3" size={18} />
            <input
              type="email"
              name="email"
              placeholder="tu.email@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
              className="bg-transparent outline-none w-full placeholder-gray-400 text-white"
            />
          </div>

          <div className="flex items-center bg-white/10 rounded-lg px-4 py-3 mb-4">
            <FileText className="text-sky-400 mr-3" size={18} />
            <input
              type="text"
              name="asunto"
              placeholder="Asunto del mensaje"
              value={formData.asunto}
              onChange={handleChange}
              className="bg-transparent outline-none w-full placeholder-gray-400 text-white"
            />
          </div>

          <div className="flex items-start bg-white/10 rounded-lg px-4 py-3 mb-6">
            <MessageSquare className="text-sky-400 mr-3 mt-1" size={18} />
            <textarea
              name="mensaje"
              placeholder="Escribe tu mensaje..."
              value={formData.mensaje}
              onChange={handleChange}
              className="bg-transparent outline-none w-full placeholder-gray-400 text-white h-24 resize-none"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mb-3"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-green-400 text-sm mb-3 font-semibold"
            >
              {success}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className={`w-full bg-amber-400 text-black font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition ${
              loading ? "opacity-60 cursor-not-allowed" : "hover:bg-amber-300"
            }`}
          >
            {loading ? "Enviando..." : "Enviar"} <ArrowRight size={18} />
          </motion.button>

          <p className="text-xs text-gray-400 mt-4 text-center">
            Al registrarte, aceptas recibir información sobre nuestros cursos.
          </p>
        </motion.form>
      </motion.div>
    </section>
  );
}
