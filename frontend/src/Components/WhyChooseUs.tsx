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
            }, 200);
            observer.unobserve(sectionRef.current!);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="py-10 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 lg:mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            ¿Por qué elegir <span className="text-white">MIS ACADEMY?</span>
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12 lg:mb-18">
          <div className="text-center group">
            <div className="flex items-center justify-center mb-5">
              <FiActivity className="text-green-500 w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-110 transition-transform duration-300" />
              <span className="ml-4 text-8xl md:text-7xl font-extrabold text-green-500 group-hover:scale-105 transition-transform duration-300">
                4
              </span>
            </div>
            <p className="text-lg sm:text-xl text-green-500 font-semibold">
              Líneas de cursos
            </p>
          </div>

          <div className="text-center group" ref={sectionRef}>
            <div className="flex items-center justify-center mb-5">
              <FiCheckCircle className="text-orange-400  w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-110 transition-transform duration-300" />
              <span className="ml-4 text-8xl md:text-7xl font-extrabold text-orange-400  group-hover:scale-105 transition-transform duration-300">
                {percentage}%
              </span>
            </div>
            <p className="text-lg sm:text-xl text-orange-400  font-semibold">
              Enfoque práctico
            </p>
          </div>

          <div className="text-center group">
            <div className="flex items-center justify-center mb-5">
              <FiClock className="text-amber-400 w-12 h-12 sm:w-14 sm:h-14 group-hover:scale-110 transition-transform duration-300" />
              <span className="ml-4 text-8xl md:text-7xl font-extrabold text-amber-400 group-hover:scale-105 transition-transform duration-300">
                24/7
              </span>
            </div>
            <p className="text-lg sm:text-xl text-amber-400 font-semibold">
              Acceso total
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-[#0D1A28] backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group border-b-4 border-green-500">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-green-400">
                <MdLibraryBooks className="text-[#0D1A28] w-8 h-8 group-hover:text-green-500 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 text-center group-hover:text-green-500 transition-colors duration-300">
              Metodología <br /> Práctica
            </h3>
            <div className="w-16 h-1 bg-green-500 mx-auto mb-6"></div>{" "}
            {/* Línea de color debajo */}
            <p className="text-gray-300 text-center leading-relaxed text-base">
              Aprende con proyectos reales diseñados para que adquieras
              experiencia práctica. Domina las habilidades clave en tu campo y
              crea un portafolio atractivo que te abra puertas a nuevas
              oportunidades laborales.
            </p>
          </div>

          <div className="bg-[#0D1A28] backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group border-b-4 border-orange-500">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-orange-400">
                <FaLaptopCode className="text-[#0D1A28] w-8 h-8 group-hover:text-orange-500 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 text-center group-hover:text-orange-400 transition-colors duration-300">
              Tecnología a la <br /> vanguardia
            </h3>
            <div className="w-16 h-1 bg-orange-400 mx-auto mb-6"></div>{" "}
            {/* Línea de color debajo */}
            <p className="text-gray-300 text-center leading-relaxed text-base">
              Con acceso a las herramientas más actuales y formación de expertos
              en el área tecnológica, te ayudamos a estar al día con las
              tendencias del mercado y mejorar tus habilidades para destacarte
              en el mundo digital.
            </p>
          </div>

          <div className="bg-[#0D1A28] backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 group border-b-4 border-amber-500">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-2xl group-hover:ring-4 group-hover:ring-amber-400">
                <FaCertificate className="text-[#0D1A28] w-8 h-8 group-hover:text-amber-500 transition-colors duration-300" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2 text-center group-hover:text-amber-400 transition-colors duration-300">
              Certificación <br /> Reconocida
            </h3>
            <div className="w-16 h-1 bg-amber-400 mx-auto mb-6"></div>{" "}
            <p className="text-gray-300 text-center leading-relaxed text-base">
              Recibe una certificación oficial al completar el curso, reconocida
              por las principales empresas del sector. Te ayudamos a superar
              entrevistas y avanzar en tu carrera profesional con la de una
              formación sólida.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
