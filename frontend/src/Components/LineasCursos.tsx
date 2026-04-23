import React from "react";
import { BookOpen, Code2, GraduationCap, TrendingUp } from "lucide-react";

type Curso = {
  icon: React.ReactNode;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  temas: string[];
  borderColor: string;
  underlineColor: string;
  ringColor: string;
  buttonBg: string; // color del botón
  buttonHover: string; // color hover del botón
};

const cursos: Curso[] = [
  {
    icon: (
      <BookOpen className="text-[#0D1A28] w-8 h-8 group-hover:text-green-500 transition-colors duration-300" />
    ),
    titulo: "IA",
    subtitulo: "Inteligencia Artificial",
    descripcion:
      "Domina machine learning, deep learning y técnicas modernas de IA para crear soluciones innovadoras.",
    temas: ["Machine Learning", "Deep Learning", "Computer Vision", "NLP"],
    borderColor: "border-green-500",
    underlineColor: "bg-green-500",
    ringColor: "ring-green-500",
    buttonBg: "bg-green-600",
    buttonHover: "bg-green-700",
  },
  {
    icon: (
      <Code2 className="text-[#0D1A28] w-8 h-8 group-hover:text-orange-500 transition-colors duration-300" />
    ),
    titulo: "DEV",
    subtitulo: "Desarrollo",
    descripcion:
      "Conviértete en desarrollador full-stack con tecnologías de alta demanda en el mercado.",
    temas: ["Frontend", "Backend", "Mobile", "DevOps"],
    borderColor: "border-orange-500",
    underlineColor: "bg-orange-500",
    ringColor: "ring-orange-500",
    buttonBg: "bg-orange-600",
    buttonHover: "bg-orange-700",
  },
  {
    icon: (
      <GraduationCap className="text-[#0D1A28] w-8 h-8 group-hover:text-amber-500 transition-colors duration-300" />
    ),
    titulo: "TEACHER",
    subtitulo: "Educación",
    descripcion:
      "Desarrolla habilidades pedagógicas y tecnológicas para enseñar con impacto en el siglo XXI.",
    temas: ["Pedagogía Digital", "E-learning", "Gamificación", "EdTech"],
    borderColor: "border-amber-500",
    underlineColor: "bg-amber-500",
    ringColor: "ring-amber-500",
    buttonBg: "bg-amber-600",
    buttonHover: "bg-amber-700",
  },
  {
    icon: (
      <TrendingUp className="text-[#0D1A28] w-8 h-8 group-hover:text-rose-500 transition-colors duration-300" />
    ),
    titulo: "BUSINESS",
    subtitulo: "Negocios",
    descripcion:
      "Lidera proyectos tecnológicos y emprende con éxito en el ecosistema digital actual.",
    temas: ["Startups", "Product Management", "Digital Marketing", "Fintech"],
    borderColor: "border-rose-500",
    underlineColor: "bg-rose-500",
    ringColor: "ring-rose-500",
    buttonBg: "bg-rose-600",
    buttonHover: "bg-rose-700",
  },
];

const LineasCursos: React.FC = () => {
  return (
    <section className="py-20 text-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
            Nuestras Líneas de Cursos
          </h2>
          <p className="text-gray-300">
            Cuatro rutas especializadas diseñadas para impulsar tu carrera
            profesional en las áreas más demandadas de la tecnología.
          </p>
        </div>

        {/* Igualamos alturas con items-stretch y tarjetas h-full flex-col */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 items-stretch">
          {cursos.map((curso, i) => (
            <div key={i} className="group h-full">
              <div
                className={[
                  "bg-[#0D1A28] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300",
                  "border-b-4",
                  curso.borderColor,
                  "h-full flex flex-col",
                ].join(" ")}
              >
                {/* Icono */}
                <div className="flex justify-center mb-6">
                  <div
                    className={[
                      "w-16 h-16 bg-white rounded-full flex items-center justify-center",
                      "shadow-lg transition-all duration-300",
                      "group-hover:scale-110 group-hover:shadow-2xl",
                      "group-hover:ring-4",
                      curso.ringColor,
                    ].join(" ")}
                  >
                    {curso.icon}
                  </div>
                </div>

                {/* Títulos */}
                <h3 className="text-2xl font-bold text-center mb-1 group-hover:text-white">
                  {curso.titulo}
                </h3>
                <p className="text-lg text-gray-400 text-center">
                  {curso.subtitulo}
                </p>
                <div
                  className={`w-16 h-1 ${curso.underlineColor} mx-auto my-5`}
                />

                {/* Contenido flexible */}
                <div className="flex-1 flex flex-col">
                  <p className="text-gray-300 text-center leading-relaxed text-[15px] mb-5">
                    {curso.descripcion}
                  </p>

                  <ul className="text-left text-sm text-gray-400 mb-6 space-y-1">
                    {curso.temas.map((tema, idx) => (
                      <li key={idx}>• {tema}</li>
                    ))}
                  </ul>

                  {/* Botón con color propio */}
                  <button
                    className={[
                      "mt-auto w-full px-4 py-2 rounded-lg font-medium transition-colors",
                      curso.buttonBg,
                      `hover:${curso.buttonHover}`,
                    ].join(" ")}
                  >
                    Explorar Ruta →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LineasCursos;
