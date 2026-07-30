import React from 'react'

function InterviewDashboard() {
  return (
    <div className='module-content'>
      <div className="flex justify-between items-center mb-6 lg:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Interviewer Overview</h2>
          <p className="text-gray-500">Welcome to the Interviewer Dashboard.</p>
        </div>
      </div>
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[300px]">
        <h3 className="text-xl font-bold text-[#2C2D86] mb-2">Welcome!</h3>
        <p className="text-gray-500 text-center max-w-md">This dashboard is currently being set up. Here you will be able to evaluate applicants assigned to you for interviews.</p>
      </div>
    </div>
  )
}

export default InterviewDashboard
