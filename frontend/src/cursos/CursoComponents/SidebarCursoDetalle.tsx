import React, { useState, useEffect } from "react";
import { FaCartPlus, FaCheck } from "react-icons/fa";
import type { Curso } from "../../types/models";
import { API_URL } from "../../config/api";

const CursoSidebar: React.FC<{ curso: Curso }> = ({ curso }) => {
  const [cartMessage, setCartMessage] = useState<string | null>(null);
  const [isMessageVisible, setIsMessageVisible] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAddedToCart, setIsAddedToCart] = useState<boolean>(false);
  const [isPurchased, setIsPurchased] = useState<boolean>(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  useEffect(() => {
    const checkEstadoCurso = async () => {
      if (!token) return;

      try {
        const responseCarrito = await fetch(`${API_URL}/carrito`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!responseCarrito.ok) throw new Error("Error al obtener el carrito");

        const dataCarrito = await responseCarrito.json();

        if (dataCarrito && Array.isArray(dataCarrito.data?.items)) {
          const cursoEnCarrito = dataCarrito.data.items.some(
            (item: any) =>
              Number(item.curso.id_curso) === Number(curso.id_curso)
          );
          setIsAddedToCart(cursoEnCarrito);
        }

        const resHistorial = await fetch(`${API_URL}/compras/historial`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        if (resHistorial.ok) {
          const dataHistorial = await resHistorial.json();

          if (
            dataHistorial.status === "success" &&
            Array.isArray(dataHistorial.compras)
          ) {
            const yaComprado = dataHistorial.compras.some(
              (compra: any) =>
                Number(compra.curso?.id_curso) === Number(curso.id_curso)
            );
            setIsPurchased(yaComprado);
          }
        }
      } catch (error) {
        console.error("Error al verificar carrito/compra:", error);
      }
    };

    checkEstadoCurso();
  }, [curso.id_curso, token]);

  const addToCart = async () => {
    if (!token) {
      setCartMessage(
        "Por favor, ingresa sesión para agregar el curso al carrito."
      );
      setIsMessageVisible(true);
      return;
    }

    if (isPurchased) {
      setCartMessage("Ya compraste este curso.");
      setIsMessageVisible(true);
      return;
    }

    if (isAddedToCart) {
      setCartMessage("Este curso ya está en el carrito.");
      setIsMessageVisible(true);
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
        body: JSON.stringify({ id_curso: curso.id_curso }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Error al añadir al carrito.");
      }

      setIsAddedToCart(true);
      setCartMessage("Curso añadido al carrito.");
      setIsMessageVisible(true);
    } catch (error: unknown) {
      if (error instanceof Error)
        setCartMessage(error.message || "Error inesperado.");
      setIsMessageVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (cartMessage) {
      setIsMessageVisible(true);
      const timer = setTimeout(() => {
        setIsMessageVisible(false);
        setTimeout(() => setCartMessage(null), 500);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [cartMessage]);

  let buttonBg = "bg-sky-400";
  let buttonHover = "hover:bg-sky-500";
  let buttonLabel = "Agregar";
  let ButtonIcon: React.ComponentType<{ className?: string }> = FaCartPlus;
  let disabled = isLoading;

  if (isPurchased) {
    buttonBg = "bg-green-500";
    buttonHover = "hover:bg-green-600";
    buttonLabel = "Comprado";
    ButtonIcon = FaCheck;
    disabled = true;
  } else if (isLoading) {
    buttonBg = "bg-gray-500";
    buttonHover = "";
    buttonLabel = "Añadiendo";
    ButtonIcon = FaCartPlus;
  } else if (isAddedToCart) {
    buttonBg = "bg-green-500";
    buttonHover = "hover:bg-green-600";
    buttonLabel = "Añadido";
    ButtonIcon = FaCartPlus;
  }

  return (
    <div className="bg-[#0D1A28] rounded-xl p-6 flex flex-col gap-6 sticky top-6">
      <section className="my-1 pt-1">
        <div className="flex justify-center items-center gap-6">
          <div>
            <p className="text-[34px] font-bold text-sky-400">
              S/. {curso.precio}
            </p>
          </div>
          <button
            onClick={addToCart}
            disabled={disabled}
            className={`${buttonBg} ${buttonHover} text-white font-semibold px-6 py-2 rounded-lg flex items-center gap-x-2 disabled:opacity-100`}
          >
            <ButtonIcon className="text-white text-[19px]" />
            <span className="text-[15px]">{buttonLabel}</span>
          </button>
        </div>
      </section>

      {cartMessage && (
        <div
          className={`fixed bottom-4 right-4 bg-[#0D1A28] border-l-4 border-sky-500 text-white px-4 py-2 rounded-lg z-50 transition-opacity duration-500 ${
            isMessageVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          {cartMessage}
        </div>
      )}

      <section className="mb-2">
        <h2 className="text-2xl font-semibold mb-3">
          {curso.docente ? "Docente" : "Docentes"}
        </h2>
        {curso.docente ? (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-sky-500 shadow-lg">
              <img
                src={
                  curso.docente?.imagen
                    ? curso.docente.imagen.startsWith("http")
                      ? curso.docente.imagen
                      : `${API_URL.replace("/api", "")}/${curso.docente.imagen}`
                    : "/sinUsuario.jpg"
                }
                alt={curso.docente.nombre}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-gray-300">
              <p className="font-semibold text-xl">{curso.docente.nombre}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-300">No hay docente disponible.</p>
        )}
      </section>

      <section className="mb-2">
        <h2 className="text-2xl font-semibold mb-2">Requisitos</h2>
        <ul className="list-disc pl-5 text-gray-300 text-sm">
          {curso.requisitos ? (
            curso.requisitos
              .split(",")
              .map((item, i) => <li key={i}>{item.trim()}</li>)
          ) : (
            <p>No hay requisitos disponibles.</p>
          )}
        </ul>
      </section>

      <section className="mb-1">
        <h2 className="text-2xl font-semibold mb-2">Descripción</h2>
        {curso.descripcion_larga ? (
          <p className="text-gray-300 text-sm mb-2">
            {curso.descripcion_larga}
          </p>
        ) : (
          <p className="text-gray-300">No hay descripción disponible.</p>
        )}
      </section>
    </div>
  );
};

export default CursoSidebar;
