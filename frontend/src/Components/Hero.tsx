import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useEffect } from 'react';

function Hero() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth - 0.5) * 2;
      const y = (clientY / window.innerHeight - 0.5) * 2;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen w-full flex items-start justify-center text-white overflow-hidden bg-[#050a15] px-6 pt-8 pb-16 md:pt-12 md:pb-20">
      {/* Único glow central, sin partículas */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-yP-1/2 w-[800px] h-[800px] bg-sky-500/8 blur-[150px] rounded-full animate-pulse"
        style={{ animationDuration: '6s' }}
      />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/6 blur-[120px] rounded-full animate-pulse"
        style={{ animationDuration: '8s', animationDelay: '2s' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto text-center">
        {/* Badge limpio */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
        >
          <div className="w-2 h-2 bg-sky-500 rounded-full animate-ping" />
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-sky-400">
            Líderes en Educación
          </span>
        </motion.div>

        {/* Título con efecto Shimmer y parallax en el contenedor */}
        <motion.div
          style={{
            x: useTransform(mouseX, [-1, 1], [-15, 15]),
            y: useTransform(mouseY, [-1, 1], [-10, 10]),
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14 flex flex-col items-center"
          >
            <motion.span
              initial={{ opacity: 0, letterSpacing: '0.2em' }}
              animate={{ opacity: 1, letterSpacing: '0.8em' }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-sky-300 text-sm md:text-xl font-black mb-4 ml-[0.8em] tracking-[0.8em] drop-shadow-[0_0_20px_rgba(125,211,252,0.3)]"
            >
              MIS
            </motion.span>

            <h1 className="text-[clamp(3.5rem,16vw,10rem)] font-black tracking-tighter leading-[0.85]">
              <span className="shimmer-text inline-block">ACADEMY</span>
            </h1>

            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '120px', opacity: 1 }}
              transition={{ delay: 0.8, duration: 1.2 }}
              className="h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent mt-8 rounded-full shadow-[0_0_20px_rgba(14,165,233,0.5)]"
            />
          </motion.div>
        </motion.div>

        {/* Subtítulos */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <p className="text-2xl md:text-5xl font-light text-slate-100 leading-[1.1] tracking-tight">
            Transforma tu futuro con <br />
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-sky-200">
              tecnología de vanguardia
            </span>
          </p>
          <p className="text-base md:text-lg text-slate-300 max-w-xl mx-auto leading-relaxed">
            Especialízate en IA, Desarrollo y Negocios con rutas de aprendizaje diseñadas para
            liderar la nueva era digital.
          </p>
        </motion.div>

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToSection('cursos')}
            className="group relative px-10 py-5 bg-sky-600 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-full shadow-[0_0_30px_-8px_rgba(14,165,233,0.4)] hover:shadow-[0_0_50px_-8px_rgba(14,165,233,0.6)] transition-shadow overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-2">
              Explorar Cursos{' '}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500 to-sky-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03, y: -3 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => scrollToSection('metodologia')}
            className="px-10 py-5 bg-white/5 border border-white/10 text-white text-xs font-bold tracking-[0.2em] uppercase rounded-full hover:bg-white/10 transition-all backdrop-blur-sm hover:border-sky-500/50"
          >
            Ver Metodología
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
