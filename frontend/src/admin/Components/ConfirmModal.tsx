type ConfirmModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message?: string;
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  message = "¿Estás seguro de cerrar sesión?",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">
          Confirmación
        </h2>
        <p className="text-gray-600 mb-4.5 text-center text-md">{message}</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-md"
          >
            Cerrar Sesión
          </button>
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
}
