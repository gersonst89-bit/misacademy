interface Props {
  data: any;
  onClose: () => void;
}

const traducirAccion = (accion: string) => {
  switch (accion) {
    case "updated":
      return "Actualización";
    case "created":
      return "Creación";
    case "deleted":
      return "Eliminación";
    default:
      return accion;
  }
};

const formatearFechaValor = (valor: any) => {
  if (!valor || typeof valor !== "string") return valor;

  const fecha = new Date(valor);

  if (isNaN(fecha.getTime())) return valor;

  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const anio = fecha.getFullYear();

  const horas = String(fecha.getHours()).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  const segundos = String(fecha.getSeconds()).padStart(2, "0");

  return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
};

export const NotificacionModal = ({ data, onClose }: Props) => {
  const oldValues = data.old_values || {};
  const newValues = data.new_values || {};

  const obtenerCambios = () => {
    const claves = new Set([
      ...Object.keys(oldValues),
      ...Object.keys(newValues),
    ]);
    return Array.from(claves);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white text-black rounded-lg shadow-lg w-[90%] max-w-lg p-6 animate-fadeIn max-h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Detalles de la notificación</h2>

        <div className="space-y-3 text-sm">
          <p>
            <span className="font-semibold">Usuario:</span> {data.user_name} (
            {data.user_rol})
          </p>

          <p>
            <span className="font-semibold">Correo:</span> {data.user_email}
          </p>

          <p>
            <span className="font-semibold">Acción:</span>{" "}
            {traducirAccion(data.event)}
          </p>

          <p>
            <span className="font-semibold">Modelo afectado:</span>{" "}
            {data.model.replace("App\\Models\\", "")}
          </p>

          <p>
            <span className="font-semibold">Fecha:</span>{" "}
            {new Date(data.created_at).toLocaleString("es-PE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>

          <p className="max-w-full break-words">
            <span className="font-semibold">Ruta:</span> {data.url}
          </p>

          {/* Formato amigable de cambios */}
          <div className="mt-3">
            <h3 className="font-semibold mb-1">Cambios realizados:</h3>

            {obtenerCambios().length === 0 ? (
              <p className="text-gray-500 text-sm">
                No se registraron cambios específicos.
              </p>
            ) : (
              <ul className="space-y-2">
                {obtenerCambios().map((clave) => {
                  const valorAnterior = formatearFechaValor(oldValues[clave]);
                  const valorNuevo = formatearFechaValor(newValues[clave]);

                  return (
                    <li
                      key={clave}
                      className="bg-gray-100 p-3 rounded border border-gray-300"
                    >
                      <p className="font-semibold capitalize">{clave}:</p>

                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-red-700">Antes:</span>{" "}
                        {valorAnterior ?? "—"}
                      </p>

                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-green-700">
                          Ahora:
                        </span>{" "}
                        {valorNuevo ?? "—"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-md"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
