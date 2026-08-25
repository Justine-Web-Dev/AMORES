import React from 'react'
import { useNavigate } from 'react-router-dom'
function ApplicationLocked() {
  const navigate = useNavigate()
  return (
    <div className="application-locked-screen h-screen overflow-hidden bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center space-y-4 border border-gray-200">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Application Locked</h2>
          <p className="text-gray-600">
            The application form is currently closed. Please wait for the application period to open or check back later.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-[#2C2D88] text-white rounded-lg hover:bg-opacity-90 font-medium transition-colors"
          >
            Return to Home
          </button>
        </div>
      </div>
  )
}

export default ApplicationLocked
