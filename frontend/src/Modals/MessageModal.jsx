import React from 'react';
import { IoCheckmarkCircleOutline, IoCloseCircleOutline } from "react-icons/io5";

const MessageModal = ({ isOpen, onClose, type, title, message }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slide-up">
        <div className="p-8 text-center">
          <div className={`w-20 h-20 rounded-full ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} flex items-center justify-center mx-auto mb-6`}>
            {isSuccess ? (
              <IoCheckmarkCircleOutline size={50} />
            ) : (
              <IoCloseCircleOutline size={50} />
            )}
          </div>
          
          <h3 className="text-2xl font-bold text-slate-800 mb-2">
            {title || (isSuccess ? 'Success' : 'Error')}
          </h3>
          
          <p className="text-slate-500 text-base mb-8">
            {message}
          </p>

          <button
            onClick={onClose}
            className="w-full py-3 bg-[#2C2D86] hover:bg-[#1e1f5c] text-white font-bold rounded-xl shadow-lg transition-all duration-300 active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
