import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F1F2F4] flex flex-col justify-center items-center px-6">
      
      {/* 404 Content Card */}
      <div className="max-w-xl w-full bg-white shadow-2xl rounded-2xl p-12 text-center border-t-4 border-[#191B6D]">
        
        {/* Authoritative Icon (Police-themed) */}
        <div className="mb-6 text-[#191B6D]">
          <svg className="w-24 h-24 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
        </div>

        {/* Headline */}
        <h1 className="text-8xl font-black text-[#191B6D] mb-3">404</h1>
        
        {/* Recuitment-Themed Message */}
        <div className="bg-[#EB5A1F] text-white px-4 py-2 inline-block rounded-md mb-6 uppercase text-sm font-bold tracking-wider">
          PAGE NOT FOUND
        </div>
        
        <p className="text-xl font-bold text-[#191B6D] mb-3">
          The requested asset could not be located.
        </p>
        
        <p className="text-[#3A3C72] mb-12 max-w-lg mx-auto">
          The path you are trying to access is unauthorized or does not exist within the PNP Recruitment and Selection Unit records. Please re-verify the address or report a faulty link.
        </p>

        {/* Action Buttons using Landing Page styles */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          
          {/* Primary Action (Home - matches "Start Application" color) */}
          <button 
            onClick={() => navigate('/')}
            className="bg-[#EB5A1F] hover:bg-[#d84e1a] text-white font-bold py-3 px-10 rounded-lg transition duration-300 transform hover:scale-105"
          >
            Return to Homepage
          </button>
          
          {/* Secondary Action (Back - matches "View Requirements" style) */}
          <button 
            onClick={() => navigate(-1)}
            className="border border-[#191B6D] text-[#191B6D] hover:bg-[#eaeaff] font-semibold py-3 px-10 rounded-lg transition duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
      
      {/* Small footer branding */}
      <p className="mt-12 text-[#191B6D] text-xs uppercase tracking-widest font-medium opacity-70">
        Philippine National Police - PNP-AMORES Recruitment
      </p>
    </div>
  );
};

export default NotFound;