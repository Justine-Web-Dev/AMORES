import React, { useState } from 'react'
import './TrackApplicationCss.css'
import { CiSearch } from "react-icons/ci";

import { api } from '../../../api/api';

import { HiOutlineXCircle } from 'react-icons/hi';

function TrackApplication() {
 const [code, setCode] = useState('');
 const [application, setApplication] = useState(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

  const statusColors = {
    "New Applicant": "bg-blue-100 text-blue-600",
    "Document Review": "bg-purple-100 text-purple-600",
    "Initial Screening": "bg-yellow-100 text-yellow-600",
    "Technical Interview": "bg-cyan-100 text-cyan-600",
    "Final Interview": "bg-pink-100 text-pink-600",
    "Accepted": "bg-green-100 text-green-600",
    "Rejected": "bg-red-100 text-red-600",
  };

  const STAGES = [
    "New Applicant",
    "Document Review",
    "Initial Screening",
    "Technical Interview",
    "Final Interview",
    "Accepted"
  ];

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

  const getStageIndex = (status) => {
    if (status === "Rejected") return -1;
    return STAGES.indexOf(status);
  };

  return (
    <div className='min-h-screen p-4 flex justify-center items-start track-application-container'>
      <div className='flex flex-col w-full max-w-4xl items-center rounded-[8px] gap-8 p-6 md:p-10 bg-white shadow-sm track-container'>
        
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
            <div className="flex justify-between items-center mb-6">
              <h3 className='text-xl font-bold title-app-details'>Application Progress</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[application.status] || "bg-gray-100 text-gray-600"}`}>
                {application.status}
              </span>
            </div>

            {/* Visual Stepper */}
            <div className="w-full mb-10 mt-4 overflow-x-auto pb-10 stepper-scroll-container">
              <div className="relative flex justify-between items-center min-w-[600px] px-4">
                {/* Progress Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
                <div 
                  className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500"
                  style={{ width: `${Math.max(0, (getStageIndex(application.status) / (STAGES.length - 1)) * 100)}%` }}
                ></div>

                {STAGES.map((stage, index) => {
                  const isActive = index <= getStageIndex(application.status);
                  const isCurrent = index === getStageIndex(application.status);
                  const isRejected = application.status === "Rejected";

                  return (
                    <div key={stage} className="relative z-10 flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                        isRejected ? 'bg-red-100 text-red-600 border-2 border-red-600' :
                        isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-400 border-2 border-gray-200'
                      } ${isCurrent ? 'ring-4 ring-blue-100' : ''}`}>
                        {index + 1}
                      </div>
                      <span className={`absolute -bottom-8 whitespace-nowrap text-[10px] font-semibold uppercase tracking-tighter text-center ${
                        isActive ? 'text-blue-700' : 'text-gray-400'
                      }`}>
                        {stage === "New Applicant" ? "Submitted" : stage.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-12 bg-gray-50 p-6 rounded-lg border border-gray-100'>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Applicant Name</span>
                <p className="font-semibold text-gray-800">{application.full_name}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Desired Program</span>
                <p className="font-semibold text-gray-800">{application.program}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Reference Number</span>
                <p className="font-semibold text-blue-700">{application.tracking_code}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400">Submission Date</span>
                <p className="font-semibold text-gray-800">{new Date(application.date_applied).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
              </div>
              
              {application?.status === 'Rejected' && application?.rejection_reason && (
                <div className='col-span-1 md:col-span-2 mt-2 p-4 bg-red-50 border border-red-200 rounded-lg'>
                  <div className="flex items-center gap-2 mb-1">
                    <HiOutlineXCircle className="text-red-600" size={20}/>
                    <strong className='text-red-800 text-sm'>Application Update</strong>
                  </div>
                  <p className='text-red-700 text-sm'>{application.rejection_reason}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackApplication
