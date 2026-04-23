import { FaTimes } from "react-icons/fa";
import type { Usuario } from "../../types/models";

interface Props {
  usuario: Usuario;
  onClose: () => void;
}

export default function InfoUsuarioModal({ usuario, onClose }: Props) {
  const getImagenPerfil = () => {
    if (usuario.id_rol === 1 || usuario.id_rol === 3) {
      return usuario.imagen_perfil || "/default-docente.png";
    } else if (usuario.id_rol === 2) {
      return usuario.imagen_perfil || "/default-user.png";
    }
    return "/default-user.png";
  };

  const getRolTexto = () => {
    switch (usuario.id_rol) {
      case 1:
        return "Administrador";
      case 2:
        return "Usuario";
      case 3:
        return "Docente";
      default:
        return "Desconocido";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={18} />
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          

          <div className="flex-1 space-y-3">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {usuario.nombre} {usuario.apellido}
            </h2>
            <p><strong>Email:</strong> {usuario.email}</p>
            <p><strong>Rol:</strong> {getRolTexto()}</p>
            <p>
              <strong>Estado:</strong>{" "}
              <span
                className={`ml-2 px-2 py-1 rounded-full text-sm ${
                  usuario.estado.toLowerCase() === "activo"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {usuario.estado}
              </span>
            </p>

            {usuario.biografia && (
              <p><strong>Biografía:</strong> {usuario.biografia}</p>
            )}

            {usuario.email_verificado !== undefined && (
              <p>
                <strong>Email verificado:</strong>{" "}
                {usuario.email_verificado ? "Sí" : "No"}
              </p>
            )}

            {usuario.fecha_registro && (
              <p>
                <strong>Fecha de registro:</strong>{" "}
                {new Date(usuario.fecha_registro).toLocaleDateString()}
              </p>
            )}

          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-sky-600 text-white px-5 py-2 rounded-md hover:bg-sky-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
