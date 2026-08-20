import React from 'react'
import { IoIosCloseCircle } from "react-icons/io";
import './LoginModal.css'

function ErrorLoginModal({ isOpen, onClose, message }) {
  if (!isOpen) return null;

  return (
    <div className='absolute bg-white login-overlay'>
      <div className='flex justify-center flex-col items-center h-[220px] w-[350px] rounded-[8px] login-modal'>
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-2">
            <IoIosCloseCircle size={55} />
        </div>
        <h1 className='text-center text-lg uppercase font-bold text-slate-800'>{message || 'LOGIN FAILED'}</h1>
        <button 
          onClick={onClose}
          className='mt-4 px-8 py-2 bg-[#2C2D86] text-white rounded-md font-bold hover:bg-[#1e1f5c] transition-all active:scale-95 shadow-md'
        >
          OK
        </button>
      </div>
    </div>
  )
}

export default ErrorLoginModal
