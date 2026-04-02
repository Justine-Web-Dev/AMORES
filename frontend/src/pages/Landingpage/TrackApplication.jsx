import React, { useState } from 'react'
import './TrackApplicationCss.css'
import { CiSearch } from "react-icons/ci";

import { api } from '../../../api/api';

function TrackApplication() {
 const [code, setCode] = useState('');
 const [application, setApplication] = useState(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const handleTrack = async () =>{
  if(!code.trim()){
    setError('Please enter a tracking code');
    return;
  }

  setLoading(true);
  setError('');
  setApplication(null);

  try{
    const response = await api.get(`users/track-status/?code=${code.toUpperCase()}`)
    setApplication(response.data)
  }catch(err){
    setError(err.response?.data?.error || "An error occurred");
  }finally{
    setLoading(false)
  }
 }

  return (
  <div className='bg-gray-100 min-h-screen p-4 flex justify-center items-start track-application-container'>
    <div className='flex flex-col w-full max-w-2xl items-center rounded-[8px] gap-8 p-6 md:p-10 bg-white shadow-sm track-container'>
      
      <div className='w-full text-left'>
        <h1 className='text-2xl md:text-[32px] font-semibold leading-tight'>Track Your Application</h1>
        <p className='text-gray-600 '>Enter your reference number to see the current status of your application.</p>
      </div>

      <div className='flex flex-col md:flex-row items-center gap-4 w-full border-b-1 input-track-container'>
        <div className='w-full md:flex-1'>
          <input 
            type="text" 
            value={code}
            onChange={(e)=>setCode(e.target.value)}
            placeholder='e.g., TA-1234AB' 
            className='w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-800 track-application-input'
          />
        </div>
        
        <button
        onClick={handleTrack}
        className='w-full md:w-auto flex justify-center items-center gap-2 bg-[#2C2D86] text-white font-semibold rounded hover:bg-opacity-90 transition-all check-status-btn'>
          <CiSearch size={25}/>
          {loading ? "Searching" : "Check status"}
        </button>
      </div>
      

      {error && <div className="w-full p-4 text-red-700 bg-red-100 rounded error-msg">{error}</div>}

      {application && (
            <div className='w-full animate-fade-in rounded app-details'>
              <h3 className='text-xl font-bold mb-2 title-app-details'>Application Details</h3>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <p><span className='font-semibold'>Name:</span> {application.full_name}</p>
                <p><span className='font-semibold'>Program:</span> {application.program}</p>
                <p><span className='font-semibold'>Tracking Code:</span> {application.tracking_code}</p>
                <p><span className='font-semibold'>Date Applied:</span> {new Date(application.date_applied).toLocaleDateString()}</p>
                <p className='col-span-2'>
                  <span className='font-semibold'>Current Status:</span> 
                  <span className={`rounded text-white ${
                    application.status === 'Accepted' ? 'bg-green-500' : 
                    application.status === 'Rejected' ? 'bg-red-500' : 'bg-yellow-500'
                  } status-text`}>
                    {application.status}
                  </span>
                </p>
              </div>
            </div>
          )}
      
    </div>
</div>
  )
}

export default TrackApplication
