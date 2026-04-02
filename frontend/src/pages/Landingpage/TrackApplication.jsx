import React from 'react'
import './TrackApplicationCss.css'
import { CiSearch } from "react-icons/ci";

function TrackApplication() {
  return (
  <div className='bg-gray-100 min-h-screen p-4 flex justify-center items-start track-application-container'>

  <div className='flex flex-col w-full max-w-2xl items-center rounded-[8px] gap-6 p-6 md:p-10 bg-white shadow-sm track-container'>
    
    <div className='w-full text-left'>
      <h1 className='text-2xl md:text-[32px] font-semibold leading-tight'>Track Your Application</h1>
      <p className='text-gray-600 mt-2'>Enter your reference number to see the current status of your application.</p>
    </div>

    <div className='flex flex-col md:flex-row items-center gap-4 w-full'>
      <div className='w-full md:flex-1'>
        <input 
          type="text" 
          placeholder='e.g., TA-1234AB' 
          className='w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800 track-application-input'
        />
      </div>
      
      {/* Button is now full-width on mobile */}
      <button className='w-full md:w-auto flex justify-center items-center gap-2 px-6 py-3 bg-[#2C2D86] text-white font-semibold rounded hover:bg-opacity-90 transition-all check-status-btn'>
        <CiSearch size={25}/>
        <span>Check Status</span>
      </button>
    </div>

    <div className='w-full border-t pt-4'>
      {/* status content goes here */}
    </div>
    
  </div>
</div>
  )
}

export default TrackApplication
