import React, { useEffect, useMemo, useState } from "react";
import { FaQuoteLeft } from "react-icons/fa";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

type Testimonio = {
  id: number;
  opinion: string;
  nombre: string;
  carrera: string;
  avatarUrl?: string;
};

const baseOpiniones: Testimonio[] = [
  {
    id: 1,
    opinion:
      "Próximamente encontrarás aquí testimonios reales de nuestros estudiantes compartiendo sus experiencias de aprendizaje y crecimiento profesional.",
    nombre: "Estudiante MIS",
    carrera: "Ingeniería de Sistemas",
  },
  {
    id: 2,
    opinion:
      "Gracias a los proyectos prácticos pude conseguir mi primera pasantía como desarrollador.",
    nombre: "Carlos R.",
    carrera: "Computación e Informática",
  },
  {
    id: 3,
    opinion:
      "El contenido es claro y actualizado. Me ayudó a ordenar mis conocimientos y avanzar más rápido.",
    nombre: "María A.",
    carrera: "Software Engineering",
  },
  {
    id: 4,
    opinion:
      "Las rutas de aprendizaje me dieron una guía concreta para especializarme.",
    nombre: "Luis F.",
    carrera: "Ing. de Sistemas",
  },
  {
    id: 5,
    opinion:
      "Los instructores responden dudas y comparten buenas prácticas de la industria.",
    nombre: "Sofía P.",
    carrera: "Data Science",
  },
  {
    id: 6,
    opinion:
      "Las clases son muy dinámicas y con retos reales. 100% recomendado.",
    nombre: "Diego M.",
    carrera: "Desarrollo Web",
  },
];

// Carrusel simple sin dependencias externas
const Opiniones: React.FC = () => {
  // Si mañana llegan más de 6 desde API, tomamos las primeras 6 para el carrusel
  const testimonios = useMemo<Testimonio[]>(
    () => baseOpiniones.slice(0, 6),
    []
  );

  const [index, setIndex] = useState(0);
  const total = testimonios.length;

  const next = () => setIndex((i) => (i + 1) % total);
  const prev = () => setIndex((i) => (i - 1 + total) % total);

  // Autoplay cada 5s
  useEffect(() => {
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [total]);

  // Soporte de teclado (izq/der)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section className="py-24 px-6 lg:px-8 bg-[#03070C] relative overflow-hidden">
      {/* Luces de fondo muy sutiles para dar profundidad sin lavar el negro */}
      <div className="absolute top-0 left-1/4 w-full h-full bg-sky-500/[0.03] rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
          Lo que dicen nuestros estudiantes
        </h2>
        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-16 font-medium">
          Testimonios de estudiantes que han transformado su carrera con
          nuestros cursos especializados
        </p>

        {/* Carrusel */}
        <div className="relative max-w-4xl mx-auto select-none">
          {/* Pista */}
          <div className="overflow-hidden rounded-[2.5rem]">
            <div
              className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {testimonios.map((t) => (
                <div
                  key={t.id}
                  className="w-full flex-shrink-0 px-4 py-6"
                  aria-roledescription="slide"
                >
                  <div className="bg-white/[0.05] backdrop-blur-2xl border border-white/10 p-10 md:p-14 rounded-[2.5rem] shadow-2xl relative group">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
                      <FaQuoteLeft className="text-white text-xl" />
                    </div>

                    <p className="text-xl md:text-2xl text-gray-200 leading-relaxed italic mb-10 font-medium">
                      “{t.opinion}”
                    </p>

                    <div className="flex flex-col items-center gap-4">
                      {t.avatarUrl ? (
                        <div className="p-1 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600">
                          <img
                            src={t.avatarUrl}
                            alt={t.nombre}
                            className="h-16 w-16 rounded-[0.9rem] object-cover bg-[#0E1C2B]"
                          />
                        </div>
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-600/20 border border-sky-500/30 flex items-center justify-center text-sky-400 text-2xl font-black shadow-inner">
                          {t.nombre.charAt(0)}
                        </div>
                      )}
                      <div className="text-center">
                        <div className="text-xl text-white font-black tracking-wide mb-1 uppercase">
                          {t.nombre}
                        </div>
                        <div className="text-sky-400 text-xs font-black uppercase tracking-[0.2em]">
                          {t.carrera}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flechas Navegación */}
          <div className="hidden md:block">
            <button
              aria-label="Anterior"
              onClick={prev}
              className="absolute -left-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 hover:bg-sky-500 hover:scale-110 text-white rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center group shadow-xl"
            >
              <FiChevronLeft className="text-2xl group-hover:scale-125 transition-transform" />
            </button>
            <button
              aria-label="Siguiente"
              onClick={next}
              className="absolute -right-16 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/5 hover:bg-sky-500 hover:scale-110 text-white rounded-2xl border border-white/10 backdrop-blur-md transition-all duration-300 flex items-center justify-center group shadow-xl"
            >
              <FiChevronRight className="text-2xl group-hover:scale-125 transition-transform" />
            </button>
          </div>

          {/* Dots de Navegación */}
          <div className="mt-10 flex items-center justify-center gap-3">
            {testimonios.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index 
                    ? "w-10 bg-gradient-to-r from-sky-400 to-indigo-500 shadow-[0_0_15px_rgba(56,189,248,0.5)]" 
                    : "w-3 bg-white/20 hover:bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tip: si quieres mostrar 2–3 tarjetas a la vez, se puede adaptar el ancho de cada slide con CSS grid.
            Este carrusel deja una sola card por vista para foco y lectura cómoda. */}
      </div>
    </section>
  );
};

export default Opiniones;
