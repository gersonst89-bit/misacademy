import React from "react";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, userName }) => {
  if (!isOpen) return null;

  return (
<div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          Confirmar eliminación
        </h2>
        <p className="text-center text-gray-600 mb-6">
          ¿Seguro que deseas eliminar al usuario <span className="font-bold">{userName}</span>?  
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
