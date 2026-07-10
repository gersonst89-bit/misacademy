import React, { useState, useEffect, useRef } from "react";
import { FaCertificate, FaLaptopCode } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiActivity } from "react-icons/fi";
import { MdLibraryBooks } from "react-icons/md";
import { motion } from "framer-motion";

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

const WhyChooseUs: React.FC = () => {
  const [percentage, setPercentage] = useState(0);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const interval = setInterval(() => {
              setPercentage((prev) => {
                if (prev < 100) {
                  return prev + 5;
                } else {
                  clearInterval(interval);
                  return 100;
                }
              });
            }, 100);
            observer.unobserve(sectionRef.current!);
          }
        });
      },
      { threshold: 0.5 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => { if (sectionRef.current) observer.unobserve(sectionRef.current); };
  }, []);

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-[#03070c]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-sky-500/8 rounded-full blur-[140px] -z-10" />
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/6 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-blue-600/6 rounded-full blur-[120px] -z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-sky-400/3 rounded-full blur-[80px] -z-10" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-6"
          >
            <div className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400">Nuestra Propuesta de Valor</span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-black text-white tracking-tight mb-4"
          >
            ¿Por qué elegir{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400">
              MIS ACADEMY?
            </span>
          </motion.h2>
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 0.5, scale: 1 }}
            viewport={{ once: true }}
            className="w-24 h-1 bg-sky-500 mx-auto rounded-full" 
          />
        </div>

        {/* Stats */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-24" 
          ref={sectionRef}
        >
          {[
            { icon: <FiActivity />, val: "4", label: "Líneas especializadas", color: "text-green-400" },
            { icon: <FiCheckCircle />, val: `${percentage}%`, label: "Enfoque práctico", color: "text-sky-400" },
            { icon: <FiClock />, val: "24/7", label: "Acceso ilimitado", color: "text-amber-400" },
          ].map((stat, i) => (
            <motion.div variants={itemVariants} key={i} className="text-center group">
              <div className={`flex items-center justify-center mb-4 ${stat.color}`}>
                <span className="text-5xl md:text-6xl font-black group-hover:scale-110 transition-transform duration-500">
                  {stat.val}
                </span>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {[
            {
              icon: <MdLibraryBooks />,
              title: "Metodología Práctica",
              desc: "Aprende con proyectos reales diseñados para que adquieras experiencia práctica. Domina las habilidades clave y crea un portafolio atractivo.",
              color: "border-green-500/40 hover:border-green-500/80",
              glow: "bg-green-500/10"
            },
            {
              icon: <FaLaptopCode />,
              title: "Tecnología de Vanguardia",
              desc: "Acceso a las herramientas más actuales y formación de expertos. Te ayudamos a estar al día con las tendencias del mercado digital.",
              color: "border-sky-500/40 hover:border-sky-500/80",
              glow: "bg-sky-500/10"
            },
            {
              icon: <FaCertificate />,
              title: "Certificación Oficial",
              desc: "Recibe una certificación reconocida al completar cada curso. Impulsa tu perfil profesional y destaca en los procesos de selección.",
              color: "border-amber-500/40 hover:border-amber-500/80",
              glow: "bg-amber-500/10"
            }
          ].map((card, i) => (
            <motion.div 
              variants={itemVariants}
              key={i} 
              className={`glass-card bg-gradient-to-b from-white/[0.03] to-white/[0.01] rounded-[2.5rem] p-10 border border-white/10 border-t-4 ${card.color} flex flex-col items-center text-center shadow-2xl transition-all duration-500 hover:-translate-y-2 group`}
            >
              <div className="relative mb-8">
                <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${card.glow.replace('10', '40')}`} />
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl text-white relative z-10 group-hover:scale-110 transition-transform duration-500">
                  {card.icon}
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors leading-tight font-['Outfit'] tracking-tight">
                {card.title.split(' ').map((word, idx) => (
                  <React.Fragment key={idx}>{word}<br/></React.Fragment>
                ))}
              </h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                {card.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
