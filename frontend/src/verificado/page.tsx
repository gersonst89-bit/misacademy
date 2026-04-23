import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle2, XCircle } from "lucide-react";

export default function VerificadoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const success = params.get("success");
  const error = params.get("error");

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate("/login");
  }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f7fa] px-6">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md text-center">
        {success ? (
          <>
            <CheckCircle2 className="text-green-500 mx-auto mb-4" size={64} />
            <div className="text-2xl font-bold text-green-700 mb-2">¡Correo verificado!</div>
            <div className="text-gray-700 mb-6">Tu cuenta ha sido activada. Serás redirigido al login en unos segundos.</div>
          </>
        ) : (
          <>
            <XCircle className="text-red-500 mx-auto mb-4" size={64} />
            <div className="text-2xl font-bold text-red-700 mb-2">Error de verificación</div>
            <div className="text-gray-700 mb-6">
              {error === "token"
                ? "El enlace de verificación es inválido, expirado o ya fue usado."
                : error === "expirado"
                ? "El enlace de verificación ha expirado."
                : "No se pudo verificar tu cuenta."}
            </div>
            <button
              className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
              onClick={() => navigate("/login")}
            >
              Ir al login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
