import React, { useState, useEffect } from "react";
import { FaCartPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import { API_URL } from "../../config/api";

const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

interface CursoCardProps {
  title: string;
  description: string;
  precio: string;
  image: string;
  slug: string;
  cursoId: number;
}

const CursoCard: React.FC<CursoCardProps> = ({
  title,
  description,
  precio,
  image,
  cursoId,
}) => {
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [isMessageVisible, setIsMessageVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const token = localStorage.getItem("token");

  // Función para añadir el curso al carrito en el backend
  const addToCart = async (cursoId: number) => {
    // Verifica si el usuario está autenticado (token presente)
    if (!token) {
      setCartMessage(
        "Por favor, ingresa sesión para agregar el curso al carrito."
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/carrito/agregar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id_curso: cursoId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Detalles del error:", errorData);
        throw new Error(errorData.message || "Error al añadir al carrito.");
      }

      setCartMessage("Curso añadido al carrito.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error al añadir al carrito:", error.message);
        setCartMessage(error.message || "Error inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cartMessage) {
      const timer = setTimeout(() => {
        setIsMessageVisible(false);
        setTimeout(() => {
          setCartMessage(null);
        }, 500);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [cartMessage]);

  return (
    <div className="flex flex-col text-white">
      <Link to={`/curso/${createSlug(title)}`}>
        <img
          src={image}
          alt={title}
          className="w-full h-60 md:h-40 xl:h-50 object-cover rounded-xl cursor-pointer transition-transform duration-300 hover:scale-105"
        />
      </Link>

      <div className="py-2 flex flex-col flex-1">
        <h3 className="text-lg font-semibold mb-1 text-left">{title}</h3>
        <p className="text-sm text-gray-300 mb-3 text-justify flex-1">
          {description}
        </p>

        <button
          onClick={() => addToCart(cursoId)}
          disabled={isLoading}
          className={`${
            isLoading ? "bg-gray-500" : "bg-sky-400 hover:bg-sky-500"
          } text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 w-fit transition-colors duration-300`}
        >
          <FaCartPlus className="text-white text-lg" />
          {isLoading ? "Añadiendo" : precio}{" "}
        </button>

        {cartMessage && (
          <div
            className={`fixed bottom-4 right-4 bg-[#0D1A28] border-l-4 border-sky-500 text-white px-4 py-2 rounded-lg z-50 transition-opacity duration-500 ${
              isMessageVisible ? "opacity-100" : "opacity-0"
            }`}
          >
            {cartMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default CursoCard;
