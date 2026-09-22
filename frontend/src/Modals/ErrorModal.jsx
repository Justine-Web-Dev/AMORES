import React from 'react';
import { FiXCircle } from "react-icons/fi";

function ErrorModal({ isOpen, onClose, errorMessage }) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[700] bg-black/40 flex items-center justify-center'>
      <div className='flex flex-col items-center bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 animate-[fadeIn_0.15s_ease-out]'>
        <div className='bg-red-50 p-4 rounded-full border border-red-200 w-fit'>
          <FiXCircle size={32} className='text-red-500' />
        </div>

        <div className='mt-4 text-center'>
          <p className='text-lg font-semibold text-gray-900'>Submission Error</p>
          <p className='mt-2 text-sm text-gray-500 leading-relaxed'>
            {errorMessage || "Please make sure to fill out the form completely."}
          </p>
        </div>

        <div className='mt-6 flex w-full'>
          <button
            onClick={onClose}
            className='flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#25267f] rounded-lg hover:bg-[#23246e] transition-colors cursor-pointer shadow-sm hover:translate-y-[-2px] duration-200 transition-transform duration-200'
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
