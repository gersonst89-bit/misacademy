import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Hero() {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    console.log("Scrolling to:", id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    } else {
      console.error("Element not found:", id);
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center text-white overflow-hidden bg-transparent py-20 px-6">
      {/* Background elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      {/* Atmospheric Lighting */}
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto text-center pointer-events-auto">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-sky-400">
            Líderes en Educación IT
          </span>
        </motion.div>

        {/* Main Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 flex flex-col items-center"
        >
          <motion.span 
            initial={{ opacity: 0, letterSpacing: "0.2em" }}
            animate={{ opacity: 0.8, letterSpacing: "0.8em" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-sky-400 text-xs md:text-base font-bold mb-4 ml-[0.8em]"
          >
            MIS
          </motion.span>
          <h1 className="hero-title-main text-[clamp(3.5rem,16vw,10rem)] font-black tracking-tighter hero-glow leading-[0.85]">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-sky-400">
              ACADEMY
            </span>
          </h1>
          
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "120px", opacity: 1 }}
            transition={{ delay: 1, duration: 1.5 }}
            className="h-[2px] bg-sky-500 mt-8 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.8)]"
          />
        </motion.div>

        {/* Subtitles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <p className="text-2xl md:text-5xl font-light text-slate-100 leading-[1.1] tracking-tight">
            Transforma tu futuro con <br />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-200">
              tecnología de vanguardia
            </span>
          </p>

          <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Especialízate en IA, Desarrollo y Negocios con rutas de aprendizaje 
            diseñadas para liderar la nueva era digital.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 relative z-50 pointer-events-auto"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('cursos')}
            className="group relative px-10 py-5 bg-sky-600 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-full shadow-[0_0_40px_-10px_rgba(14,165,233,0.5)] hover:bg-sky-500 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <div className="flex items-center gap-2">
              Explorar Cursos <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('metodologia')}
            className="px-10 py-5 bg-white/5 border border-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-full hover:bg-white/10 transition-all backdrop-blur-md"
          >
            Ver Metodología
          </motion.button>
        </motion.div>
      </div>

      {/* Decorative lines */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />
    </section>
  );
}

export default Hero;
