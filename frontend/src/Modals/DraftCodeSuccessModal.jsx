import React from 'react';
import { FiCheckCircle } from "react-icons/fi";
import './SubmitApplicationCss.css';

const DraftCodeSuccessModal = ({ isOpen, onClose, draftCode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/40 animate-fade-in px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] overflow-hidden animate-slide-up p-8">
        
        {/* Header Section */}
        <div className='flex flex-col items-center text-center gap-3'>
          <div className='flex justify-center items-center h-[70px] w-[70px] rounded-full icon-container'>
            <FiCheckCircle size={45} color='#2C2D86' />
          </div>
          <div className='space-y-2'>
            <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
              Progress Saved Successfully!
            </h1>
            <h2 className='text-base sm:text-lg text-gray-600 leading-relaxed'>
              Your application draft has been saved.
            </h2>
          </div>
        </div>

        {/* Message Body */}
        <div className="flex justify-center mt-4">
          <p className='text-sm sm:text-base text-center text-gray-500 max-w-[400px]'>
            Please save your draft code. You will need it to retrieve and continue your application later.
          </p>
        </div>

        {/* Code Display */}
        <div className="flex justify-center mt-6 mb-8">
          <div className='h-[60px] sm:h-[70px] flex justify-center items-center rounded-lg code-container mx-auto'>
            <p className='text-xl sm:text-2xl font-bold code-text'>
              {draftCode}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className='flex justify-center'>
          <button
            onClick={onClose}
            className='bg-[#2C2D86] hover:bg-[#1e1f5c] text-white track-btn w-full sm:w-auto transition-colors'
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  );
};

export default DraftCodeSuccessModal;
