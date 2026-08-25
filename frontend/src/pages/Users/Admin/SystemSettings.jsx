import React, { useState, useEffect } from 'react'
import { api } from '../../../../api/api'
import MessageModal from '../../../Modals/MessageModal'

function SystemSettings() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentBatch, setCurrentBatch] = useState(1);
  const [quotaType, setQuotaType] = useState('Attrition');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState({ show: false, type: 'success', title: '', message: '' });

  // Get current date in YYYY-MM-DD format based on local time
  const today = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/users/system-settings/');
      setIsApplicationOpen(response.data.is_application_open);
      setStartDate(response.data.application_start_date || '');
      setEndDate(response.data.application_end_date || '');
      setCurrentBatch(response.data.current_batch || 1);
      setQuotaType(response.data.quota_type || 'Attrition');
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    // Automatically adjust end date if it precedes the new start date
    if (endDate && newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const handleSave = async () => {
    // Validate date sequence prior to API request
    if (startDate && endDate && endDate < startDate) {
      setShowModal({
        show: true,
        type: 'error',
        title: 'Invalid Date Range',
        message: 'End date cannot be earlier than start date.'
      });
      return;
    }

    setSaving(true);
    try {
      const token = sessionStorage.getItem('token');
      let currentUser = 'Unknown';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUser = payload.username || 'Unknown';
        } catch (e) {
          console.error("Token parse error:", e);
        }
      }

      const response = await api.put('/users/system-settings/update/', {
        is_application_open: isApplicationOpen,
        application_start_date: startDate || null,
        application_end_date: endDate || null,
        quota_type: quotaType,
        performed_by: currentUser 
      });
      
      if (response.data) {
        setIsApplicationOpen(response.data.is_application_open);
        setStartDate(response.data.application_start_date || '');
        setEndDate(response.data.application_end_date || '');
        setCurrentBatch(response.data.currentBatch || response.data.current_batch || 1);
        setQuotaType(response.data.quota_type || 'Attrition');
      }
      
      setShowModal({
        show: true,
        type: 'success',
        title: 'Settings Saved',
        message: 'System settings have been updated successfully.'
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setShowModal({
        show: true,
        type: 'error',
        title: 'Save Failed',
        message: 'Failed to save system settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='module-content max-w-7xl mx-auto p-6'>
      <h2 className="text-2xl font-bold mb-2 text-[#2C2D86]">System Settings</h2>
      <p className="text-gray-600 mb-6 italic">Configure system-wide settings and preferences for the AMORes platform.</p>
      
      {loading ? (
        <div className="bg-white p-20 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#2C2D86]/10 border-t-[#2C2D86] rounded-full animate-spin mb-4"></div>
          <p className="text-[#2C2D86] font-medium">Loading system settings...</p>
        </div>
      ) : (
        <div className="system-settings-container max-w-5xl relative">
          
          <div className="settings-section mb-8 bg-white p-8 rounded-2xl shadow-md shadow-gray-200/50 border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2C2D86] to-[#EB612A]"></div>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100">
              <h3 className="text-xl font-bold flex items-center gap-3 text-[#2C2D86]">
                Recruitment Management
              </h3>
              <div className="bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-2 self-start sm:self-auto">
                <span className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Current Batch</span>
                <span className="bg-white text-gray-700 px-2.5 py-0.5 rounded-full text-sm font-black shadow-sm">
                  {currentBatch}
                </span>
              </div>
            </div>
            
            {!isApplicationOpen && currentBatch === 1 && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start sm:items-center gap-3 text-amber-800 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Opening the application will automatically start <strong>Batch 2</strong>.</span>
              </div>
            )}
            
            {!isApplicationOpen && currentBatch === 2 && (
              <div className="mb-8 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start sm:items-center gap-3 text-amber-800 text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>The system has reached the maximum of 2 batches. Upon the next closing date, it will reset to <strong>Batch 1</strong> and clear the dates.</span>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Type of Quota</label>
              <select 
                value={quotaType}
                onChange={(e) => setQuotaType(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all text-gray-700 font-medium cursor-pointer"
              >
                <option value="">Select Quota Type</option>
                <option value="Attrition">Attrition (Regional)</option>
                <option value="Regular">Regular (National)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="date-input-group">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Start of Applying</label>
                <input 
                  type="date" 
                  value={startDate}
                  min={today}
                  onChange={handleStartDateChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all text-gray-700 font-medium cursor-pointer"
                />
              </div>
              <div className="date-input-group">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">End of Applying</label>
                <input 
                  type="date" 
                  value={endDate}
                  min={startDate || today}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all text-gray-700 font-medium cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="settings-section mb-8 bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <h3 className="text-base font-bold mb-4 text-gray-600">
              General Settings
            </h3>
            <div className="setting-item max-w-md">
              <label className="block mb-2 text-sm font-semibold text-gray-600">System Name</label>
              <input 
                type="text" 
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all text-sm font-medium text-gray-700" 
                defaultValue="AMORES System" 
              />
            </div>
          </div>

          <div className="sticky bottom-6 mt-8 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex flex-col sm:flex-row justify-between items-center gap-4 z-40">
            <div className="text-sm font-medium text-gray-500 hidden sm:block px-2">
              Make sure to save your changes before leaving.
            </div>
            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              {showModal.show && showModal.type === 'success' && !saving && (
                <span className="text-green-600 flex items-center gap-1.5 text-sm font-bold animate-pulse">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                  Saved!
                </span>
              )}
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full sm:w-auto bg-[#2C2D86] text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-[#1a1b5c] hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : 'Save All Settings'}
              </button>
            </div>
          </div>
        </div>
      )}

      <MessageModal 
        isOpen={showModal.show}
        onClose={() => setShowModal({ ...showModal, show: false })}
        type={showModal.type}
        title={showModal.title}
        message={showModal.message}
      />
    </div>
  )
}

export default SystemSettings