import React, { useState, useEffect } from 'react'
import { api } from '../../../api/api'

function SystemSettings() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/users/system-settings/');
      setIsApplicationOpen(response.data.is_application_open);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/users/system-settings/update/', {
        is_application_open: isApplicationOpen
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
          
          <div className="setting-item flex items-center justify-between p-5 bg-gray-50 rounded-xl border border-gray-200 transition-all hover:border-[#2C2D86]/30">
            <div className="max-w-[70%]">
              <label className="font-bold block text-gray-800 mb-1">Application Status</label>
              <p className="text-sm text-gray-500">When closed, the "Start Application" button on the landing page will be disabled.</p>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <span className={`text-[10px] font-black tracking-widest px-2 py-1 rounded ${isApplicationOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isApplicationOpen ? 'ACTIVE' : 'INACTIVE'}
              </span>
              <button 
                onClick={() => setIsApplicationOpen(!isApplicationOpen)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none shadow-inner ${isApplicationOpen ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isApplicationOpen ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
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