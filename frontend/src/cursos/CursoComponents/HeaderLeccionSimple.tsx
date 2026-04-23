import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";

interface Curso {
  nombre?: string;
}

interface HeaderLeccionSimpleProps {
  curso?: Curso;
}

const HeaderLeccionSimple: React.FC<HeaderLeccionSimpleProps> = ({ curso }) => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <header className="w-full z-50 bg-[#101A2B] shadow-lg flex items-center justify-between px-6 py-3 border-b border-gray-800">
      <div className="flex items-center gap-4">
        <img src="/logomatt.png" alt="Logo" className="h-12 cursor-pointer" onClick={() => navigate("/")} />
        <span className="font-bold text-white text-lg">{curso?.nombre || "Curso"}</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg font-semibold hover:bg-sky-700 transition"
        >
          Volver
        </button>
        <div className="flex items-center gap-2">
          <User className="w-8 h-8 text-white" />
          {user && <span className="text-white font-medium">{user.nombre || user.email}</span>}
        </div>
      </div>
    </header>
  );
};

export default HeaderLeccionSimple;
