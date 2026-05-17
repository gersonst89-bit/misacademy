import React from "react";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Cpu, 
  Users, 
  Award,
  ArrowRight,
  Zap
} from "lucide-react";

interface MethodologyStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  glow: string;
}

const Metodologia: React.FC = () => {
  const steps: MethodologyStep[] = [
    {
      id: 1,
      title: "Núcleo Teórico",
      description: "Domina los fundamentos con contenido curado por expertos y optimizado para la retención cognitiva.",
      color: "from-sky-400 to-blue-600",
      glow: "shadow-sky-500/20",
      icon: <BookOpen className="w-8 h-8" />,
    },
    {
      id: 2,
      title: "Inmersión Práctica",
      description: "Aprende haciendo. Desarrolla proyectos reales con tecnologías de vanguardia y flujos de trabajo profesionales.",
      color: "from-purple-400 to-fuchsia-600",
      glow: "shadow-fuchsia-500/20",
      icon: <Cpu className="w-8 h-8" />,
    },
    {
      id: 3,
      title: "Red de Expertos",
      description: "No estás solo. Accede a mentorías personalizadas y colabora con una comunidad de alto rendimiento.",
      color: "from-emerald-400 to-teal-600",
      glow: "shadow-emerald-500/20",
      icon: <Users className="w-8 h-8" />,
    },
    {
      id: 4,
      title: "Acreditación Global",
      description: "Obtén certificaciones con valor internacional que validan tu expertise ante las mejores empresas IT.",
      color: "from-amber-400 to-orange-600",
      glow: "shadow-orange-500/20",
      icon: <Award className="w-8 h-8" />,
    },
  ];

  return (
    <section id="metodologia" className="relative pt-12 pb-24 lg:pb-32 overflow-hidden bg-transparent px-6">
      {/* Decorative Background Elements */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-sky-500/5 blur-[120px] rounded-full -translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-500/5 blur-[100px] rounded-full translate-x-1/2" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 mb-6"
          >
            <Zap className="w-3 h-3 text-sky-400" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-sky-400">Nuestro Método</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight"
          >
            Metodología de <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-purple-400">
              Alto Rendimiento
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg md:text-xl max-w-3xl mx-auto font-medium"
          >
            Combinamos ingeniería educativa avanzada con práctica intensiva para 
            acelerar tu crecimiento profesional en tiempo récord.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative"
            >
              {/* Glass Card */}
              <div className="h-full p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-3xl overflow-hidden flex flex-col transition-all duration-500 group-hover:bg-white/[0.05] group-hover:border-white/20">
                {/* Glow Effect */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500`} />
                
                {/* Icon Container */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} p-[1px] mb-8 shadow-lg ${step.glow} group-hover:scale-110 transition-transform duration-500`}>
                  <div className="w-full h-full rounded-2xl bg-[#050a12] flex items-center justify-center text-white">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-sky-400 transition-colors">
                  {step.title}
                </h3>
                
                <p className="text-slate-400 leading-relaxed font-medium mb-8 flex-1">
                  {step.description}
                </p>

                <div className="flex items-center gap-2 text-white/20 group-hover:text-sky-400 transition-all duration-500">
                  <div className="h-[1px] w-8 bg-current transition-all group-hover:w-12" />
                  <ArrowRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metodologia;
