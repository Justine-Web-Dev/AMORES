import React, { useState, useEffect } from 'react'
import { api } from '../../../../api/api'
import MessageModal from '../../../Modals/MessageModal'

function SystemSettings() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentBatch, setCurrentBatch] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState({ show: false, type: 'success', title: '', message: '' });

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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
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

      const response = await api.put('/users/system-settings/update/', {
        is_application_open: isApplicationOpen,
        application_start_date: startDate || null,
        application_end_date: endDate || null,
        performed_by: currentUser 
      });
      
      if (response.data) {
        setIsApplicationOpen(response.data.is_application_open);
        setStartDate(response.data.application_start_date || '');
        setEndDate(response.data.application_end_date || '');
        setCurrentBatch(response.data.current_batch || 1);
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
        <div className="system-settings-container bg-white p-10 rounded-xl shadow-md border border-gray-100 max-w-6xl">
        <div className="settings-section mb-10">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold flex items-center gap-2 text-[#2C2D86]">
              <span className="w-2 h-6 bg-[#EB612A] rounded-full"></span>
              Recruitment Management
            </h3>
            <div className="bg-[#2C2D86]/10 px-4 py-2 rounded-lg border border-[#2C2D86]/20 flex items-center gap-3">
              <span className="text-[#2C2D86] text-sm font-bold uppercase tracking-wider">Current Active Batch</span>
              <span className="bg-[#2C2D86] text-white px-3 py-1 rounded-full text-lg font-black shadow-sm">
                {currentBatch}
              </span>
            </div>
          </div>
          
          {!isApplicationOpen && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex items-center gap-3 text-orange-700 text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Opening the application will automatically start <strong>Batch {currentBatch + 1}</strong>.</span>
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="date-input-group">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Start of Applying</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
            <div className="date-input-group">
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">End of Applying</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="settings-section mb-10">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#2C2D86]">
            <span className="w-2 h-6 bg-[#2C2D86] rounded-full"></span>
            General Settings
          </h3>
          <div className="setting-item mb-6">
            <label className="block mb-2 font-bold text-gray-700">System Name</label>
            <input 
              type="text" 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all" 
              defaultValue="AMORes System" 
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#2C2D86] text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-[#1a1b5c] hover:-translate-y-1 transition-all active:translate-y-0 disabled:bg-gray-400 disabled:translate-y-0"
          >
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
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
