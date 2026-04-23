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
    <section className="py-16 px-6 lg:px-8 bg-[#0D1A28]">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Lo que dicen nuestros estudiantes
        </h2>
        <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-12">
          Testimonios de estudiantes que han transformado su carrera con
          nuestros cursos especializados
        </p>

        {/* Carrusel */}
        <div className="relative max-w-3xl mx-auto select-none">
          {/* Pista */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {testimonios.map((t) => (
                <div
                  key={t.id}
                  className="w-full flex-shrink-0 px-2 sm:px-4 py-2"
                  aria-roledescription="slide"
                >
                  <div className="bg-[#132435] p-8 rounded-2xl shadow-lg">
                    <FaQuoteLeft className="text-sky-500 text-3xl mb-4 mx-auto" />
                    <p className="text-gray-300 italic mb-6">“{t.opinion}”</p>

                    <div className="flex items-center justify-center gap-3">
                      {t.avatarUrl ? (
                        <img
                          src={t.avatarUrl}
                          alt={t.nombre}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-sky-600/30 border border-sky-500/50 flex items-center justify-center text-sky-300 font-bold">
                          {t.nombre.charAt(0)}
                        </div>
                      )}
                      <div className="text-left">
                        <div className="text-white font-bold leading-tight">
                          {t.nombre}
                        </div>
                        <div className="text-sky-400 text-sm">
                          {t.carrera}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flechas */}
          <button
            aria-label="Anterior"
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 text-white p-2 rounded-full border border-white/10 backdrop-blur-sm"
          >
            <FiChevronLeft className="text-2xl" />
          </button>
          <button
            aria-label="Siguiente"
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/5 hover:bg-white/10 text-white p-2 rounded-full border border-white/10 backdrop-blur-sm"
          >
            <FiChevronRight className="text-2xl" />
          </button>

          {/* Dots */}
          <div className="mt-6 flex items-center justify-center gap-2">
            {testimonios.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir al slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-sky-400" : "w-2.5 bg-sky-400/40"
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
