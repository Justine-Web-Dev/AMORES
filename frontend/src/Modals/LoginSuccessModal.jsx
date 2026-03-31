import React from 'react'
import { IoIosCheckmarkCircle } from "react-icons/io";
import './LoginModal.css'

function LoginSuccessModal() {
  return (
    <div className='absolute bg-white login-overlay'>
      <div className='flex justify-center flex-col items-center h-[160px] w-[350px] rounded-[8px] login-modal'>
        <IoIosCheckmarkCircle  size={70} color='green'/>
        <h1 className='text-lg '>LOGIN SUCCESSFUL</h1>
        {/* <span className='loader'></span> */}
      </div>
    </div>
  )
}

export default LoginSuccessModal
