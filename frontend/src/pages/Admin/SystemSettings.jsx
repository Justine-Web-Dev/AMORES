import React, { useState, useEffect } from 'react'
import { api } from '../../../api/api'

function SystemSettings() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/users/system-settings/');
      setIsApplicationOpen(response.data.is_application_open);
      setStartDate(response.data.application_start_date || '');
      setEndDate(response.data.application_end_date || '');
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

      await api.put('/users/system-settings/update/', {
        is_application_open: isApplicationOpen,
        application_start_date: startDate || null,
        application_end_date: endDate || null,
        performed_by: currentUser // Pass the user explicitly
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading settings...</div>;

  return (
    <div className='module-content p-6'>
      <h2 className="text-2xl font-bold mb-2">System Settings</h2>
      <p className="text-gray-600 mb-6">Configure system-wide settings and preferences.</p>
      
      <div className="system-settings-container bg-white p-8 rounded-xl shadow-md border border-gray-100 max-w-2xl">
        <div className="settings-section mb-10">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#2C2D86]">
            <span className="w-2 h-6 bg-[#EB612A] rounded-full"></span>
            Recruitment Management
          </h3>

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
    </div>
  )
}

export default SystemSettings
