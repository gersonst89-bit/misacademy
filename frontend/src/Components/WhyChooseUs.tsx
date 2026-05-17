import React, { useState, useEffect, useRef } from "react";
import { FaCertificate, FaLaptopCode } from "react-icons/fa";
import { FiCheckCircle, FiClock, FiActivity } from "react-icons/fi";
import { MdLibraryBooks } from "react-icons/md";

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
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            ¿Por qué elegir <span className="text-gradient-sky">MIS ACADEMY?</span>
          </h2>
          <div className="w-24 h-1 bg-sky-500 mx-auto rounded-full opacity-50" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 mb-24" ref={sectionRef}>
          {[
            { icon: <FiActivity />, val: "4", label: "Líneas especializadas", color: "text-green-400" },
            { icon: <FiCheckCircle />, val: `${percentage}%`, label: "Enfoque práctico", color: "text-sky-400" },
            { icon: <FiClock />, val: "24/7", label: "Acceso ilimitado", color: "text-amber-400" },
          ].map((stat, i) => (
            <div key={i} className="text-center group">
              <div className={`flex items-center justify-center mb-4 ${stat.color}`}>
                <span className="text-5xl md:text-6xl font-black group-hover:scale-110 transition-transform duration-500">
                  {stat.val}
                </span>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <MdLibraryBooks />,
              title: "Metodología Práctica",
              desc: "Aprende con proyectos reales diseñados para que adquieras experiencia práctica. Domina las habilidades clave y crea un portafolio atractivo.",
              color: "border-green-500/30",
              glow: "bg-green-500/10"
            },
            {
              icon: <FaLaptopCode />,
              title: "Tecnología de Vanguardia",
              desc: "Acceso a las herramientas más actuales y formación de expertos. Te ayudamos a estar al día con las tendencias del mercado digital.",
              color: "border-sky-500/30",
              glow: "bg-sky-500/10"
            },
            {
              icon: <FaCertificate />,
              title: "Certificación Oficial",
              desc: "Recibe una certificación reconocida al completar cada curso. Impulsa tu perfil profesional y destaca en los procesos de selección.",
              color: "border-amber-500/30",
              glow: "bg-amber-500/10"
            }
          ].map((card, i) => (
            <div key={i} className={`glass-card glass-card-hover rounded-[2.5rem] p-10 border-t-4 ${card.color} flex flex-col items-center text-center group`}>
              <div className="relative mb-8">
                <div className={`absolute inset-0 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${card.glow.replace('10', '40')}`} />
                <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-2xl text-white relative z-10 group-hover:scale-110 transition-transform duration-500">
                  {card.icon}
                </div>
              </div>
              <h3 className="text-2xl font-black mb-4 group-hover:text-white transition-colors leading-tight">
                {card.title.split(' ').map((word, idx) => (
                  <React.Fragment key={idx}>{word}<br/></React.Fragment>
                ))}
              </h3>
              <p className="text-slate-400 text-sm font-light leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
