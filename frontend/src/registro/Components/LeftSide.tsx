import React from "react";

const LeftSide: React.FC = () => {
  return (
    <div className="hidden md:flex w-1/2 bg-black text-white flex-col items-center justify-center px-10 relative">
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/circles.png')] bg-repeat"></div>
      <div className="relative z-10 text-center">
        <img
          src="/logomatt.png" // coloca tu logo aquí
          alt="MattInnova Logo"
          className="mx-auto w-40 mb-6"
        />
        <h1 className="text-3xl font-bold mb-4 leading-tight">
          Aprende hoy, <br /> transforma tu mañana
        </h1>
        <p className="text-gray-300 max-w-md mx-auto">
          En MattInnova Solution ofrecemos cursos online prácticos y accesibles,
          diseñados para impulsar tu desarrollo personal y profesional.
        </p>
      </div>
    </div>
  );
};

export default LeftSide;
