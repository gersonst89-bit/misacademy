import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="flex items-center justify-center gap-6"
      >
        <span className="text-[10rem] font-extrabold text-sky-500 leading-none">4</span>
        <AlertTriangle className="w-32 h-32 text-sky-400" />
        <span className="text-[10rem] font-extrabold text-sky-500 leading-none">4</span>
      </motion.div>

      <motion.h2
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-4xl md:text-5xl font-bold text-white mt-6"
      >
        ¡Página errónea!
      </motion.h2>

      <motion.p
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="text-lg md:text-xl text-gray-300 mt-4 max-w-2xl"
      >
        ¡Lo sentimos! La página que buscas no está disponible.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Link
          to="/"
          className="mt-10 inline-block bg-sky-500 hover:bg-sky-600 text-white font-semibold text-lg px-10 py-4 rounded-full transition-all duration-300 shadow-lg hover:shadow-sky-500/40"
        >
          Volver a la página principal
        </Link>
      </motion.div>
    </div>
  );
}
