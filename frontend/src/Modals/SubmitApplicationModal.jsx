import React from 'react'
import { useNavigate,useLocation } from 'react-router-dom';
import './SubmitApplicationCss.css'

import { FiCheckCircle } from "react-icons/fi";

function SubmitApplicationModal({ trackingCode: trackingCodeProp }) {
  const navigate = useNavigate()
  const location = useLocation()

  const trackingCode = trackingCodeProp || location.state?.trackingCode || "N/A";

  const handleBackToHome = () => {
    navigate('/')
  }
  const directTrackApplication = () =>{
    navigate('/track-application')
  }
  return (
  <div className='bg-gray-100 Submit-application-container'>
  <div className='flex flex-col items-center gap-6 bg-white max-w-[600px] submit-app-modal'>
    
    {/* Header Section */}
    <div className='flex flex-col items-center text-center gap-3'>
      <div className='flex justify-center items-center h-[70px] w-[70px] rounded-full icon-container'>
        <FiCheckCircle size={45} color='#2C2D86' />
      </div>
      <div className='space-y-2'>
        <h1 className='text-2xl sm:text-3xl font-bold text-gray-800'>
          Thank you for Applying!
        </h1>
        <h2 className='text-base sm:text-lg text-gray-600 leading-relaxed'>
          Your application has been successfully submitted.
        </h2>
      </div>
    </div>

    {/* Message Body */}
    <p className='text-sm sm:text-base text-center text-gray-500 max-w-[400px]'>
      Please save your reference number. You can use it to track the status of your application.
    </p>

    {/* Code Display */}
    <div className='h-[60px] sm:h-[70px] flex justify-center items-center rounded-lg code-container'>
      <p className='text-xl sm:text-2xl font-bold code-text'>
        {trackingCode}
      </p>
    </div>

    {/* Buttons: Stacked on mobile, row on small screens up */}
    <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-auto mt-2'>
      <button 
      onClick={directTrackApplication}
      className='bg-[#2C2D86] text-white track-btn w-full sm:w-auto'>
        Track Application
      </button>
      <button
        onClick={handleBackToHome}
        className='bg-gray-200 text-gray-700 back-home-btn w-full sm:w-auto'>
        Back to Home
      </button>
    </div>

  </div>
</div>
  )
}

export default SubmitApplicationModal
