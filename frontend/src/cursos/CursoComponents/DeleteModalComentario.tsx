import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 bg-opacity-50 z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Confirmar eliminación
        </h2>
        <p className="text-center text-gray-600 mb-6">
          ¿Seguro que deseas eliminar este comentario?
        </p>

        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Eliminar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-400 hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
