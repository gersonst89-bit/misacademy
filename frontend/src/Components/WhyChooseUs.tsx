import React, { useState, useEffect, useRef } from 'react';
import { FaCertificate, FaLaptopCode } from 'react-icons/fa';
import { FiCheckCircle, FiClock, FiActivity, FiArrowRight } from 'react-icons/fi';
import { MdLibraryBooks } from 'react-icons/md';
import { motion, useInView } from 'framer-motion';

// --- Datos ---
const statsData = [
  {
    target: 4,
    label: 'Líneas especializadas',
    suffix: '',
    icon: FiActivity,
    color: 'text-green-400',
  },
  {
    target: 100,
    label: 'Enfoque práctico',
    suffix: '%',
    icon: FiCheckCircle,
    color: 'text-sky-400',
  },
  { target: 24, label: 'Acceso ilimitado', suffix: '/7', icon: FiClock, color: 'text-amber-400' },
];

const cardsData = [
  {
    icon: MdLibraryBooks,
    title: 'Metodología Práctica',
    desc: 'Aprende con proyectos reales diseñados para que adquieras experiencia práctica. Domina las habilidades clave y crea un portafolio atractivo.',
    color: 'border-green-500/40 hover:border-green-500',
    glow: 'bg-green-500/10',
    gradient: 'from-green-500/20 to-transparent',
  },
  {
    icon: FaLaptopCode,
    title: 'Tecnología de Vanguardia',
    desc: 'Acceso a las herramientas más actuales y formación de expertos. Te ayudamos a estar al día con las tendencias del mercado digital.',
    color: 'border-sky-500/40 hover:border-sky-500',
    glow: 'bg-sky-500/10',
    gradient: 'from-sky-500/20 to-transparent',
  },
  {
    icon: FaCertificate,
    title: 'Certificación Oficial',
    desc: 'Recibe una certificación reconocida al completar cada curso. Impulsa tu perfil profesional y destaca en los procesos de selección.',
    color: 'border-amber-500/40 hover:border-amber-500',
    glow: 'bg-amber-500/10',
    gradient: 'from-amber-500/20 to-transparent',
  },
];

// --- Componente de conteo (con tipos explícitos) ---
const CountUp: React.FC<{ target: number; suffix?: string; duration?: number }> = ({
  target,
  suffix = '',
  duration = 2,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {isInView ? count : 0}
      {suffix}
    </span>
  );
};

// --- Variantes de animación (con `as const` para el tipo) ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

// --- Componente principal ---
const WhyChooseUs: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      className="relative py-28 px-6 overflow-hidden bg-gradient-to-b from-[#03070c] to-[#0a0f1e] why-choose-rustica"
    >
      {/* --- FONDOS --- */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[140px] -z-10" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/6 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-600/6 rounded-full blur-[120px] -z-10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* --- TÍTULO DE SECCIÓN --- */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-6"
          >
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400">
              Nuestra Propuesta de Valor
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4"
          >
            ¿Por qué elegir{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400">
              ACADEMIA TAYAMAQ?
            </span>
          </motion.h2>

          <motion.div
            initial={{ width: 0, opacity: 0 }}
            whileInView={{ width: '80px', opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="h-1 bg-gradient-to-r from-sky-400 to-indigo-400 mx-auto rounded-full"
          />
        </div>

        {/* --- ESTADÍSTICAS --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-24"
        >
          {statsData.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div variants={itemVariants} key={i} className="text-center group">
                <div className={`flex items-center justify-center gap-2 mb-3 ${stat.color}`}>
                  <Icon className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span className="text-5xl md:text-6xl font-black group-hover:scale-110 transition-transform duration-500 tabular-nums">
                    <CountUp target={stat.target} suffix={stat.suffix} duration={2} />
                  </span>
                </div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* --- TARJETAS DE BENEFICIOS --- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {cardsData.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                variants={itemVariants}
                key={i}
                className={`group relative rounded-[2rem] p-10 border border-white/10 border-t-4 ${card.color} bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-sm transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:shadow-sky-500/10 overflow-hidden`}
              >
                <div
                  className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br ${card.gradient}`}
                />

                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center text-3xl text-white group-hover:scale-110 transition-transform duration-500 group-hover:shadow-lg group-hover:shadow-sky-500/20">
                    <Icon className="text-white/80 group-hover:text-white transition-colors" />
                  </div>
                </div>

                <h3 className="text-2xl font-black mb-3 text-white/90 group-hover:text-white transition-colors leading-tight">
                  {card.title}
                </h3>

                <p className="text-slate-400 text-sm font-light leading-relaxed group-hover:text-slate-300 transition-colors">
                  {card.desc}
                </p>

                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                  <FiArrowRight className="text-sky-400 text-xl" />
                </div>

                <motion.div
                  className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
