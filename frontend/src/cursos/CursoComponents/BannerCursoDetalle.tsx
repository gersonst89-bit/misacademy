import React from "react";
import { Link } from "react-router-dom";
import { BsBarChartFill } from "react-icons/bs";
import { FaClock, FaStar } from "react-icons/fa";

interface BannerCursoDetalleProps {
  titulo: string;
  descripcionCorta: string;
  videoUrl: string;
  duracion_total: number | string;
  nivel: string;
  calificacion: number;
  totalResenas: number;
}

function getEmbedUrl(url: string): string | null {
  if (!url) return null;

  const ytMatch = url.match(
    /(?:youtube\.com.*(?:\?|&)v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`;
  }

  return url;
}

const BannerCursoDetalle: React.FC<BannerCursoDetalleProps> = ({
  titulo,
  descripcionCorta,
  videoUrl,
  duracion_total,
  nivel,
  calificacion,
  totalResenas,
}) => {
  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  return (
    <div className="relative w-full min-h-fit overflow-hidden text-white">
      <div className="flex flex-col items-center justify-between px-10 h-full">
        <div className="flex flex-1 w-full flex-col md:flex-row">
          <div className="w-full md:w-10/18 flex flex-col justify-center md:pr-14">
            <div className="py-2 text-sm text-gray-400">
              <Link to="/cursos" className="hover:underline cursor-pointer">
                Cursos{" "}
              </Link>
              &gt; <span>{titulo}</span>
            </div>
            <h3 className="text-4xl font-bold mt-1 leading-[3.6rem]">
              {titulo}
            </h3>
            <p className="text-gray-300 mt-3 font-medium text-md">
              {descripcionCorta}
            </p>
            <div className="flex items-center gap-6 text-[15px] text-gray-300 mt-4">
              <span className="flex items-center gap-2">
                <FaClock className="text-amber-400 text-lg" />
                {duracion_total}
              </span>
              <span className="flex items-center gap-2">
                <BsBarChartFill className="text-amber-400 text-lg" />
                {nivel}
              </span>
              <span className="flex items-center gap-2">
                <FaStar className="text-amber-400 text-lg" />
                {calificacion.toFixed(1)} ({totalResenas}{" "}
                {totalResenas === 1 ? "calificación" : "calificaciones"})
              </span>
            </div>
          </div>

          <div className="w-full md:w-8/18 flex items-center justify-center">
            <div className="w-full h-0 pb-[56.25%] relative max-w-[100%] rounded-2xl shadow-lg">
              {embedUrl ? (
                <iframe
                  width="100%"
                  height="100%"
                  className="absolute top-0 left-0 rounded-2xl"
                  src={embedUrl}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Video del curso"
                />
              ) : (
                <div className="absolute top-0 left-0 w-full h-full rounded-2xl border border-dashed border-gray-600 flex items-center justify-center text-gray-400 text-sm">
                  Sin video de previsualización
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerCursoDetalle;
