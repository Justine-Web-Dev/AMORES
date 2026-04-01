import React from 'react'
import { useNavigate } from 'react-router';
import './SubmitApplicationCss.css'

import { FiCheckCircle } from "react-icons/fi";

function SubmitApplicationModal() {
  const navigate = useNavigate()

  const handleBackToHome = () =>{
    navigate('/')
  }
  return (
    <div className='Submit-application-container'>
      <div className='absolute flex flex-col items-center gap-5 bg-white w-[650px] submit-app-modal'>
        <div className='flex flex-col items-center '>
          <div className='flex justify-center items-center h-[70px] w-[70px] rounded-[50%] icon-container'>
            <FiCheckCircle size={60} color='#2C2D86'/>
          </div>

          <h1 className='text-[24px] font-semibold'>Thank you for Applying!</h1>
          <h2 className='text-[20px] text-gray-600'>Your application has been successfully submitted.</h2>
        </div>

        <div className=''>
          <p className='text-[18px] text-center'>Please save your reference number. You can use it to track the status of your application.</p>
        </div>
        <div className='h-[70px] flex justify-center items-center rounded-[5px] code-container'>
          <p className='text-[1.5rem] font-semibold code-text'>code value</p>

        </div>

        <div className='flex gap-5 button-container'>
          <button className='bg-[#2C2D86] text-white rounded track-btn'>Track Application</button>
          <button 
          onClick={handleBackToHome}
          className='bg-gray-300 rounded back-home-btn'>Back to Home</button>
        </div>
      </div>
    </div>
  )
}

export default SubmitApplicationModal
