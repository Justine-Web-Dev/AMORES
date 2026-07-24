import React, { useState } from 'react';
import { api } from '../../../api/api';
import MessageModal from '../../Modals/MessageModal';

function InitialScreeningChecklist({ applicantId, onComplete }) {
  const [flags, setFlags] = useState({
    citizenship_is_filipino: false,
  });

  // Automatically check boxes if AI verified the corresponding documents
  React.useEffect(() => {
    const fetchAndApplyAIData = async () => {
      try {
        const response = await api.get(`users/view-applicant-document/${applicantId}`);
        const documents = response.data;
        
        let newFlags = { ...flags };
        
        documents.forEach(doc => {
          if (doc.ai_verified) {
            if (doc.document_type === 'BIRTH_CERT' || doc.document_type === 'PSA') {
              newFlags.citizenship_is_filipino = true;
            }
          }
        });
        
        setFlags(newFlags);
      } catch (err) {
        console.error("Failed to fetch documents for AI auto-check", err);
      }
    };
    
    if (applicantId) {
      fetchAndApplyAIData();
    }
  }, [applicantId]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'success', message: '' });

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFlags(prev => ({ ...prev, [name]: checked }));
  };

  const handleRunScreening = async () => {
    setIsSubmitting(true);
    try {
      const response = await api.post(`v1/applications/screen-initial/`, {
        application_id: applicantId,
        ...flags
      });
      
      setModalConfig({
        isOpen: true,
        type: 'success',
        message: 'Initial screening completed! The applicant status has been updated based on the automated rules.',
      });
      
      // Wait for modal to be seen, then trigger update
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (err) {
      console.error("Screening failed:", err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        message: err.response?.data?.error || 'Failed to run initial screening. Please try again.',
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex flex-col justify-evenly bg-[#F9FAFB] shadow-sm mt-5 rounded-[12px] p-6 border border-yellow-200'>
      <div className="mb-4">
        <h1 className='text-[20px] font-semibold text-yellow-700 flex items-center gap-2'>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          Automated Initial Screening
        </h1>
        <p className="text-sm text-gray-600 mt-1">Please verify the following manual checks. The system will automatically evaluate Age, Height, and Education.</p>
      </div>

      <div className="flex flex-col gap-3">
        {Object.entries({
          citizenship_is_filipino: "Citizenship is Natural born Filipino"
        }).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded transition-colors">
            <input
              type="checkbox"
              name={key}
              checked={flags[key]}
              onChange={handleCheckboxChange}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <button
          onClick={handleRunScreening}
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-all ${
            isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-sm'
          }`}
        >
          {isSubmitting ? 'Running Evaluation...' : 'Run Automated Screening'}
        </button>
      </div>

      <MessageModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        message={modalConfig.message}
      />
    </div>
  );
}

export default InitialScreeningChecklist;
