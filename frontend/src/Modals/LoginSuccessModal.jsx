import React from 'react'
import { IoIosCheckmarkCircle } from "react-icons/io";
import './LoginModal.css'

function LoginSuccessModal() {
  return (
    <div className='absolute bg-white login-overlay'>
      <div className='flex justify-center flex-col items-center h-[200px] w-[350px] rounded-[8px] login-modal'>
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
            <IoIosCheckmarkCircle size={55} />
        </div>
        <h1 className='text-lg font-bold text-slate-800'>LOGIN SUCCESSFUL</h1>
      </div>
    </div>
  )
}

export default LoginSuccessModal
