import React from 'react'
import { IoIosCloseCircle, IoIosCheckmarkCircle } from "react-icons/io";
import './LoginModal.css'

function ErrorLoginModal({ isOpen, onClose, message, isSuccess = false }) {
  if (!isOpen) return null;

  return (
    <div className='absolute bg-white login-overlay'>
      <div className='flex justify-center flex-col items-center h-[220px] w-[350px] rounded-[8px] login-modal'>
        <div className={`w-20 h-20 rounded-full ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} flex items-center justify-center mb-2`}>
            {isSuccess ? <IoIosCheckmarkCircle size={55} /> : <IoIosCloseCircle size={55} />}
        </div>
        <h1 className='text-center text-sm uppercase font-bold text-slate-800 px-4'>{message || 'LOGIN FAILED'}</h1>
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
