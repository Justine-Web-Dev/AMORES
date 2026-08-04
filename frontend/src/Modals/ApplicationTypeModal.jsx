import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import InstructionReApply from './InstructionReApply'
import DraftCodeApplication from './DraftCodeApplication'

function ApplicationTypeModal({ onClose, onRetrieve }) {
  const [selectedType, setSelectedType] = useState(null);
  const [showReapplyInstruction, setShowReapplyInstruction] = useState(false);
  const [showDraftInstruction, setShowDraftInstruction] = useState(false);
  const navigate = useNavigate();

  const handleProceed = () => {
    if (!selectedType) return;
    
    if (selectedType === 'new') {
      if (onClose) onClose();
    } else if (selectedType === 'draft') {
      setShowDraftInstruction(true);
    } else {
      setShowReapplyInstruction(true);
    }
  };

  if (showReapplyInstruction) {
    return (
      <InstructionReApply 
        onClose={() => setShowReapplyInstruction(false)} 
        onProceed={(data) => {
          if (onRetrieve) {
             onRetrieve(data);
          } else {
             if (onClose) onClose();
             navigate('/track-application');
          }
        }} 
      />
    );
  }

  if (showDraftInstruction) {
    return (
      <DraftCodeApplication 
        onClose={() => setShowDraftInstruction(false)}
        onProceed={(data) => {
          if (onRetrieve) {
             onRetrieve(data);
          } else {
             if (onClose) onClose();
             navigate('/form');
          }
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white max-w-4xl w-full max-h-[95vh] overflow-y-auto rounded-2xl shadow-2xl p-5 sm:p-8 border border-gray-100 relative animate-slide-up">
        
        {/* Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        <header className="text-center mb-6 sm:mb-10 mt-2 sm:mt-0">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-3 tracking-tight">Application Pathway</h3>
          <p className="text-gray-500 text-sm sm:text-lg">Select how you would like to proceed with your submission.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-10">
          <label 
            className={`relative flex flex-col p-4 sm:p-6 cursor-pointer rounded-xl border-2 transition-all duration-200 ease-in-out group
              ${selectedType === 'new' 
                ? 'border-[#2C2D86] bg-[#2C2D86]/5 shadow-md shadow-[#2C2D86]/20' 
                : 'border-gray-200 hover:border-[#2C2D86]/40 hover:bg-gray-50'}`}
          >
            <input 
              type="radio" 
              name="applicationType" 
              value="new"
              checked={selectedType === 'new'}
              onChange={() => setSelectedType('new')}
              className="sr-only" 
            />
            <div className="flex justify-between items-center mb-4">
              <div className={`p-3 rounded-full ${selectedType === 'new' ? 'bg-[#2C2D86] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-[#2C2D86]/10 group-hover:text-[#2C2D86]'} transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedType === 'new' ? 'border-[#2C2D86]' : 'border-gray-300'}`}>
                {selectedType === 'new' && <div className="w-2.5 h-2.5 rounded-full bg-[#2C2D86]" />}
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">New Application</h1>
            <p className="text-gray-500 text-xs sm:text-sm flex-grow">First-time applicant on AMORES. Start a fresh application process.</p>
          </label>

          <label 
            className={`relative flex flex-col p-4 sm:p-6 cursor-pointer rounded-xl border-2 transition-all duration-200 ease-in-out group
              ${selectedType === 'reapply' 
                ? 'border-[#2C2D86] bg-[#2C2D86]/5 shadow-md shadow-[#2C2D86]/20' 
                : 'border-gray-200 hover:border-[#2C2D86]/40 hover:bg-gray-50'}`}
          >
            <input 
              type="radio" 
              name="applicationType" 
              value="reapply"
              checked={selectedType === 'reapply'}
              onChange={() => setSelectedType('reapply')}
              className="sr-only" 
            />
            <div className="flex justify-between items-center mb-4">
              <div className={`p-3 rounded-full ${selectedType === 'reapply' ? 'bg-[#2C2D86] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-[#2C2D86]/10 group-hover:text-[#2C2D86]'} transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedType === 'reapply' ? 'border-[#2C2D86]' : 'border-gray-300'}`}>
                {selectedType === 'reapply' && <div className="w-2.5 h-2.5 rounded-full bg-[#2C2D86]" />}
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Re-Application</h1>
            <p className="text-gray-500 text-xs sm:text-sm flex-grow">Existing record? Import past details to save time on your application.</p>
          </label>

          <label 
            className={`relative flex flex-col p-4 sm:p-6 cursor-pointer rounded-xl border-2 transition-all duration-200 ease-in-out group
              ${selectedType === 'draft' 
                ? 'border-[#2C2D86] bg-[#2C2D86]/5 shadow-md shadow-[#2C2D86]/20' 
                : 'border-gray-200 hover:border-[#2C2D86]/40 hover:bg-gray-50'}`}
          >
            <input 
              type="radio" 
              name="applicationType" 
              value="draft"
              checked={selectedType === 'draft'}
              onChange={() => setSelectedType('draft')}
              className="sr-only" 
            />
            <div className="flex justify-between items-center mb-4">
              <div className={`p-3 rounded-full ${selectedType === 'draft' ? 'bg-[#2C2D86] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-[#2C2D86]/10 group-hover:text-[#2C2D86]'} transition-colors`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${selectedType === 'draft' ? 'border-[#2C2D86]' : 'border-gray-300'}`}>
                {selectedType === 'draft' && <div className="w-2.5 h-2.5 rounded-full bg-[#2C2D86]" />}
              </div>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Draft Application</h1>
            <p className="text-gray-500 text-xs sm:text-sm flex-grow">Have a draft code? Continue where you left off.</p>
          </label>
        </div>

        <div className="flex justify-center">
          <button 
            onClick={handleProceed}
            disabled={!selectedType}
            className={`w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-3.5 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              selectedType 
                ? 'bg-[#2C2D86] hover:bg-[#44488a] shadow-lg shadow-[#2C2D86]/30 active:scale-[0.98] focus:ring-[#2C2D86]' 
                : 'bg-gray-400 cursor-not-allowed opacity-75'
            }`}
          >
            {selectedType ? `Proceed with ${selectedType === 'new' ? 'New ' : selectedType === 'reapply' ? 'Re-' : 'Draft '}Application` : 'Select an Option'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ApplicationTypeModal