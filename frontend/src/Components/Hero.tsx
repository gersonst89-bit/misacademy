import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

function Hero() {
  return (
    <section className="relative min-h-screen w-full flex items-center justify-center text-white overflow-hidden">
      <div
        className="absolute inset-0 bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/hero-image.jpg')",
          backgroundSize: "100% 100%",
        }}
      ></div>

      <div className="absolute inset-0 bg-black/60"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 bg-white/10 backdrop-blur-xl p-12 rounded-2xl shadow-2xl border border-white/20 w-[95%] max-w-3xl text-center"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none animate-[shine_3s_infinite]" />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 relative z-10"
        >
          MIS <span className="text-white">ACADEMY</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-xl md:text-2xl font-medium mb-6 relative z-10"
        >
          Transforma tu futuro con{" "}
          <span className="text-sky-400">tecnología de vanguardia</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-base md:text-lg text-gray-200 leading-relaxed mb-10 relative z-10"
        >
          Cursos especializados en IA, Desarrollo, Educación y Negocios,
          diseñados para estudiantes de Ingeniería de Sistemas.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 1,
            type: "spring",
            stiffness: 120,
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mx-auto flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 rounded-xl hover:bg-sky-700 font-semibold shadow-lg transition relative z-10"
        >
          Explorar Cursos <ArrowRight size={20} />
        </motion.button>
      </motion.div>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-150%); }
          50% { transform: translateX(150%); }
          100% { transform: translateX(150%); }
        }
        body {
          overflow-x: hidden; /* evita scroll lateral */
        }
      `}</style>
    </section>
  );
}

export default Hero;
