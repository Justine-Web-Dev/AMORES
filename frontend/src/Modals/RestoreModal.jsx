import React from 'react';
import { IoArrowUndoOutline } from "react-icons/io5";

const RestoreModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-slide-up">
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <IoArrowUndoOutline size={58} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{title || 'Restore User'}</h3>
              <p className="text-gray-500 text-sm mt-1">{message || 'Are you sure you want to restore this user?'}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#2C2D86] hover:bg-[#202163] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
          >
            Restore
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestoreModal;
