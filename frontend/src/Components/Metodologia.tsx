import React from "react";
import {
  FaBookOpen,
  FaProjectDiagram,
  FaUsers,
  FaTrophy,
} from "react-icons/fa";

interface MethodologyStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
  borderColor: string;
  hoverColor: string;
}

const Metodologia: React.FC = () => {
  const steps: MethodologyStep[] = [
    {
      id: 1,
      title: "Aprende",
      description:
        "Accede a contenido teórico, interactivo y práctico para comprender los conceptos clave.",
      borderColor: "border-green-500",
      hoverColor: "group-hover:text-green-400",
      bgColor: "bg-green-500",
      icon: (
        <FaBookOpen className="text-[#0D1A28] w-8 h-8 group-hover:text-green-500 transition-colors duration-300" />
      ),
    },
    {
      id: 2,
      title: "Practica",
      description:
        "Trabaja en proyectos reales y ejercicios prácticos con herramientas actuales y tecnologías innovadoras.",
      hoverColor: "group-hover:text-orange-400",
      borderColor: "border-orange-500",
      bgColor: "bg-orange-500",
      icon: (
        <FaProjectDiagram className="text-[#0D1A28] w-8 h-8 group-hover:text-orange-500 transition-colors duration-300" />
      ),
    },
    {
      id: 3,
      title: "Colabora",
      description:
        "Trabaja junto a mentores y compañeros en proyectos colaborativos para resolver problemas reales.",
      hoverColor: "group-hover:text-amber-400",
      borderColor: "border-amber-500",
      bgColor: "bg-amber-500",
      icon: (
        <FaUsers className="text-[#0D1A28] w-8 h-8 group-hover:text-amber-500 transition-colors duration-300" />
      ),
    },
    {
      id: 4,
      title: "Certifícate",
      description:
        "Obtén una certificación oficial que avale tus nuevas habilidades y tu experiencia profesional adquirida.",
      hoverColor: "group-hover:text-rose-400",
      borderColor: "border-rose-500",
      bgColor: "bg-rose-500",
      icon: (
        <FaTrophy className="text-[#0D1A28] w-8 h-8 group-hover:text-rose-400 transition-colors duration-300" />
      ),
    },
  ];

  return (
    <section className="py-10 lg:py-12 px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 lg:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
            Nuestra Metodología de Aprendizaje
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Un enfoque integral que combina teoría, práctica y colaboración para
            maximizar tu desarrollo profesional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6">
          {steps.map((step) => (
            <div key={step.id} className="group">
              <div
                className={`bg-[#0D1A28] backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group border-b-4 ${step.borderColor}`}
              >
                <div className="flex justify-center mb-6">
                  <div
                    className={`w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:ring-4 ${step.hoverColor}`}
                  >
                    <div className={`transition-colors duration-300`}>
                      {step.icon}
                    </div>
                  </div>
                </div>

                <h3
                  className={`text-2xl font-bold text-white mb-6 text-center ${step.hoverColor} transition-colors duration-300`}
                >
                  {step.title}
                </h3>

                <div className={`w-16 h-1 ${step.bgColor} mx-auto mb-6`}></div>

                <p className="text-gray-300 text-center leading-relaxed text-base">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Metodologia;
