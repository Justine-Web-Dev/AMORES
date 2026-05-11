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

  useEffect(() => {
    setSelectedStatus(currentStatus);
    setRejectionReason(currentRejectionReason || "");
    
    // Sync evaluation states if data refreshes
    if (applicantData) {
      setSchDate(applicantData.scheduled_date || '');
      setSchTime(applicantData.scheduled_time || '');
      setDrugResult(applicantData.drug_test_result || '');
      setBmiHeight(applicantData.bmi_height || '');
      setBmiWeight(applicantData.bmi_weight || '');
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
        drug_test_result: selectedStatus === 'Drug Test' ? drugResult : null,
        bmi_height: selectedStatus === 'Body Mass Index' ? (bmiHeight === '' ? null : bmiHeight) : null,
        bmi_weight: selectedStatus === 'Body Mass Index' ? (bmiWeight === '' ? null : bmiWeight) : null,
        // Schedule
        scheduled_date: schDate || null,
        scheduled_time: schTime || null,
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
    "Document Review",
    "Initial Screening",
    "Accepted",
    "Rejected"
  ];

  const POST_ACCEPTANCE_STATUSES = [
    "Accepted",
    "Body Mass Index",
    "Physical Agility Test",
    "Neuro Examination",
    "Medical",
    "Drug Test",
    "Final Interview",
    "Oath Taking",
    "Rejected"
  ];

  // Determine which list to show
  // If current status is 'Accepted' or any of the post-acceptance stages, show the second list
  const isPostAcceptance = currentStatus === 'Accepted' || POST_ACCEPTANCE_STATUSES.includes(currentStatus);
  const statusOptions = isPostAcceptance ? POST_ACCEPTANCE_STATUSES : INITIAL_STATUSES;

  return (
    <div className='flex flex-col justify-evenly bg-[#F9FAFB] shadow-sm  rounded-[12px] status-management'>
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
              <option key={status} value={status}>{status}</option>
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
                className="w-full p-2 border rounded mt-1 text-sm h-[38px]" 
                placeholder="cm"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase">Weight (kg)</label>
              <input 
                type="number" 
                value={bmiWeight} 
                onChange={(e)=>setBmiWeight(e.target.value)} 
                className="w-full p-2 border rounded mt-1 text-sm h-[38px]" 
                placeholder="kg"
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
          <label className="text-sm font-medium">Reason for Rejection:</label>
          <textarea
            className="w-full mt-1 p-2 border rounded"
            placeholder="Enter reason..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>
      )}
      <button onClick={handleUpdate}
        disabled={isUpdating}
        className={`rounded-[4px] text-white cursor-pointer save-changes-btn mt-4 h-10 ${
          isUpdating ? 'bg-gray-400' : 'bg-[#2C2D86]'
        }`}>{isUpdating ? 'Saving...' : 'Save Changes'}</button>

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
