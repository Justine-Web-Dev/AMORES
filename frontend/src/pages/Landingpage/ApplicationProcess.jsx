import React from 'react'

const applicationStepsData = [
  { 
    id: '01', 
    title: 'ONLINE PRE-REGISTRATION', 
    description: 'Complete the online pre-registration form at the official PNP Recruitment portal.' 
  },
  { 
    id: '02', 
    title: 'DOCUMENT SUBMISSION', 
    description: 'Submit all required documents to your nearest Regional Police Office or designated processing center.' 
  },
  { 
    id: '03', 
    title: 'QUALIFYING EXAM', 
    description: 'Take the PNP written qualifying exam administered at designated testing centers nationwide.' 
  },
  { 
    id: '04', 
    title: 'PHYSICAL & MEDICAL', 
    description: 'Complete the Physical Agility Test, medical evaluation, and neuro-psychiatric examination.' 
  },
  { 
    id: '05', 
    title: 'FINAL SELECTION', 
    description: 'Background investigation and final screening by the PNP Recruitment and Selection Board.' 
  },
];

const ProcessCard = ({ id, title, description }) => (
  <div className="border border-gray-300 p-8 rounded-lg bg-white shadow-sm flex flex-col items-center">
    {/* Step Number in Accent Color */}
    <span className="text-[#EB612A] font-bold text-6xl mb-4 font-black">{id}</span>
    
    {/* Step Title in Main Color */}
    <h3 className="text-[#2C2D86] font-bold text-xl uppercase mb-3 text-center">{title}</h3>
    
    {/* Description in subtle text (Tailwind Default Gray) */}
    <p className="text-gray-700 text-sm text-center font-normal">{description}</p>
  </div>
);

function ApplicationProcess() {
  return (
// Main Container with bg-gray-100
    <div className="bg-gray-100 p-10 min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Titles */}
        <div className="mb-12">
          {/* Header 1 (Who May Apply style - Subtle blue) */}
          <h2 className="flex gap-3 text-gray-500 text-sm font-bold tracking-wider mb-2 uppercase flex items-center">
            <div className="h-[2px] w-8 bg-[#EB612A] "></div>
            HOW TO APPLY
          </h2>
          
          {/* Main Title (Blue) and Accent Underline (Orange-red) */}
          <h1 className="text-[#2C2D86] text-5xl font-black mb-10">APPLICATION PROCESS</h1>
          <div className="w-48 h-1.5 bg-[#EB612A] mb-12"></div>
        </div>

        {/* The Timeline Grid (3 columns on medium screens, 1 on small) */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {applicationStepsData.map((step) => (
            <ProcessCard key={step.id} {...step} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ApplicationProcess
