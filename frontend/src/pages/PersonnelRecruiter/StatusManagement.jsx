import React from 'react'
import { useState,useEffect } from 'react'
import { api } from '../../../api/api'
import MessageModal from '../../Modals/MessageModal'

function StatusManagement({applicantId, applicantData, currentStatus, onUpdate,currentRejectionReason}) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus)
  const [rejectionReason,setRejectionReason] = useState(currentRejectionReason || "")
  const [isUpdating, setIsUpdating] = useState(false)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'success', message: '' })

  const [schDate, setSchDate] = useState(applicantData?.scheduled_date || '')
  const [schTime, setSchTime] = useState(applicantData?.scheduled_time || '')
  const [drugResult, setDrugResult] = useState(applicantData?.drug_test_result || '')
  const [bmiHeight, setBmiHeight] = useState(applicantData?.bmi_height || '')
  const [bmiWeight, setBmiWeight] = useState(applicantData?.bmi_weight || '')
  const [patScore, setPatScore] = useState(applicantData?.pat_score || '')
  const [psychologicalResult, setPsychologicalResult] = useState(applicantData?.psychological_result || '')
  const [medicalResult, setMedicalResult] = useState(applicantData?.medical_result || '')
  const [finalInterviewScore, setFinalInterviewScore] = useState(applicantData?.final_interview_score || '')

  const isAccepted = currentStatus === 'Accepted'

  useEffect(() => {
    // If current status is 'New Applicant', preselect based on AI screening result
    if (currentStatus === 'New Applicant') {
      const remarks = applicantData?.evaluation_remarks || "";
      const rejReason = currentRejectionReason || applicantData?.rejection_reason || "";
      
      if (remarks.includes("AI Passed") || remarks.includes("Initial screening passed")) {
        setSelectedStatus("Qualified");
        setRejectionReason("");
      } else if (remarks.includes("Failed") || rejReason.includes("Failed") || remarks.includes("failed") || rejReason.includes("failed")) {
        setSelectedStatus("Rejected");
        setRejectionReason(rejReason || remarks);
      } else {
        setSelectedStatus(currentStatus);
        setRejectionReason(currentRejectionReason || "");
      }
    } else {
      setSelectedStatus(currentStatus);
      setRejectionReason(currentRejectionReason || "");
    }
    
    // Sync evaluation states if data refreshes
    if (applicantData) {
      setSchDate(applicantData.scheduled_date || '');
      setSchTime(applicantData.scheduled_time || '');
      setDrugResult(applicantData.drug_test_result || '');
      setBmiHeight(applicantData.bmi_height || '');
      setBmiWeight(applicantData.bmi_weight || '');
      setPatScore(applicantData.pat_score || '');
      setPsychologicalResult(applicantData.psychological_result || '');
      setMedicalResult(applicantData.medical_result || '');
      setFinalInterviewScore(applicantData.final_interview_score || '');
    }
  }, [currentStatus, currentRejectionReason, applicantData]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Get the current user from the token for audit logging
      const token = localStorage.getItem('token');
      let currentUser = 'Unknown';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUser = payload.username || 'Unknown';
        } catch (e) {
          console.error("Token parse error:", e);
        }
      }

      const dataToSend = {
        status: selectedStatus,
        rejection_reason: selectedStatus === 'Rejected' ? rejectionReason : null,
        performed_by: currentUser,
        drug_test_result: drugResult || null,
        bmi_height: bmiHeight === '' ? null : bmiHeight,
        bmi_weight: bmiWeight === '' ? null : bmiWeight,
        pat_score: patScore === '' ? null : patScore,
        psychological_result: psychologicalResult || null,
        medical_result: medicalResult || null,
        final_interview_score: finalInterviewScore === '' ? null : finalInterviewScore,
        // Schedule
        scheduled_date: schDate || null,
        scheduled_time: schTime || null,
        oath_taking_date: selectedStatus === 'Oath Taking' ? schDate : (applicantData?.oath_taking_date || null),
        evaluation_remarks: rejectionReason || null,
      };

      await api.put(`users/update_status/${applicantId}/`, dataToSend);
      setModalConfig({
        isOpen: true,
        type: 'success',
        message: 'The applicant status and information have been updated successfully.'
      });
      onUpdate(); 
    } catch (err) {
      console.error("Update failed:", err);
      setModalConfig({
        isOpen: true,
        type: 'error',
        message: 'There was an error updating the status. Please try again.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const INITIAL_STATUSES = [
    "New Applicant",
    "Qualified",
    "Rejected"
  ];

  const POST_ACCEPTANCE_STATUSES = [
    "Qualified",
    "Body Mass Index",
    "Physical Agility Test",
    "Neuro Examination",
    "Medical",
    "Drug Test",
    "Final Interview",
    "Oath Taking",
    "Accepted",
    "Rejected"
  ];

  // If current status is 'Qualified' or any of the post-acceptance stages, show the second list
  const isPostAcceptance = currentStatus === 'Qualified' || currentStatus === 'Accepted' || POST_ACCEPTANCE_STATUSES.includes(currentStatus);
  const statusOptions = isPostAcceptance ? POST_ACCEPTANCE_STATUSES : INITIAL_STATUSES;

  return (
    <div className='flex flex-col justify-evenly bg-[#F9FAFB] shadow-sm mt-5 rounded-[12px] status-management'>
      <div>
        <h1 className='text-[24px] font-semibold'>Update Status</h1>
        <p>Update the applicant's status and schedule appointments.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-gray-500 uppercase">Status</label>
          <select 
            value={selectedStatus}
            onChange={(e)=> setSelectedStatus(e.target.value)}
            className='status-option mt-1'
          >
            <option value="" disabled>Select Status</option>
            {statusOptions.map(status => (
              <option 
              disabled={isAccepted}
              key={status}
              value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* BMI Specific Options */}
        {selectedStatus === 'Body Mass Index' && (
          <div className="flex gap-4 pt-2">
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Height (cm)</label>
              <input 
                type="number" 
                value={bmiHeight} 
                onChange={(e)=>setBmiHeight(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded mt-1 text-sm h-[38px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                placeholder="cm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Weight (kg)</label>
              <input 
                type="number" 
                value={bmiWeight} 
                onChange={(e)=>setBmiWeight(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded mt-1 text-sm h-[38px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                placeholder="kg"
              />
            </div>
          </div>
        )}

        {/* PAT Specific Options */}
        {selectedStatus === 'Physical Agility Test' && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">PAT Score (%)</label>
            <input 
              type="number" 
              value={patScore} 
              onChange={(e)=>setPatScore(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded mt-1 text-sm h-[38px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
              placeholder="e.g. 85.5"
            />
          </div>
        )}

        {/* Neuro Examination Specific Option */}
        {selectedStatus === 'Neuro Examination' && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Neuro/Psychological Findings</label>
            <textarea 
              value={psychologicalResult} 
              onChange={(e)=>setPsychologicalResult(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[80px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
              placeholder="Enter psychological examination results..."
            />
          </div>
        )}

        {/* Medical Specific Option */}
        {selectedStatus === 'Medical' && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Medical Examination Findings</label>
            <textarea 
              value={medicalResult} 
              onChange={(e)=>setMedicalResult(e.target.value)} 
              className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[80px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
              placeholder="Enter medical examination findings..."
            />
          </div>
        )}

        {/* Final Interview Specific Option */}
        {selectedStatus === 'Final Interview' && (
          <div className="pt-2 space-y-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Final Interview Score (%)</label>
              <input 
                type="number" 
                value={finalInterviewScore} 
                onChange={(e)=>setFinalInterviewScore(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded mt-1 text-sm h-[38px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                placeholder="e.g. 92.0"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Interview Remarks/Message</label>
              <textarea 
                value={rejectionReason} 
                onChange={(e)=>setRejectionReason(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[80px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
                placeholder="Enter interview feedback or recommendation message..."
              />
            </div>
          </div>
        )}

        {/* Drug Test Specific Option */}
        {selectedStatus === 'Drug Test' && (
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase">Drug Test Result</label>
            <select 
              value={drugResult} 
              onChange={(e)=>setDrugResult(e.target.value)} 
              className="status-option mt-1"
            >
              <option value="">Select Result</option>
              <option value="Negative">Negative</option>
              <option value="Positive">Positive</option>
            </select>
          </div>
        )}

        {/* Scheduling Section */}
        {['Body Mass Index', 'Physical Agility Test', 'Neuro Examination', 'Medical', 'Drug Test', 'Final Interview', 'Oath Taking'].includes(selectedStatus) && (
          <div className="grid grid-cols-2 gap-3 border-t border-gray-300 pt-4">
            <div className="col-span-2 text-xs font-bold text-gray-400 uppercase mb-1">Schedule Next Step</div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Date</label>
              <input 
                type="date" 
                value={schDate} 
                onChange={(e)=>setSchDate(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Time</label>
              <input 
                type="time" 
                value={schTime} 
                onChange={(e)=>setSchTime(e.target.value)} 
                className="w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>
          </div>
        )}
      </div>

      {selectedStatus === 'Rejected' && (
        <div className="mt-4">
          <label className="text-xs font-bold text-gray-500 uppercase">Reason for Rejection</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded mt-1 text-sm min-h-[80px] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            placeholder="Enter specific reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      )}
      <button onClick={handleUpdate}
        disabled={isUpdating}
        className={`rounded-[4px] text-white font-semibold cursor-pointer save-changes-btn mt-6 h-11 transition-all active:scale-[0.98] ${
          isUpdating ? 'bg-gray-400' : 'bg-[#2C2D86] hover:bg-[#1e1f5e] shadow-md hover:shadow-lg'
        }`}>{isUpdating ? 'Saving Changes...' : 'Save Changes'}</button>

      <MessageModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.type === 'success' ? 'Update Successful' : 'Update Failed'}
        message={modalConfig.message}
      />
    </div>
  )
}

export default StatusManagement
