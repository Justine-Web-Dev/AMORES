import React, { useState, useEffect } from 'react';
import { api } from '../../../../api/api';
import MessageModal from '../../../Modals/MessageModal';
import { FiBriefcase, FiInfo, FiSliders } from 'react-icons/fi';

function SystemSettings() {
  const [isApplicationOpen, setIsApplicationOpen] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentBatch, setCurrentBatch] = useState(1);
  const [quotaType, setQuotaType] = useState('Attrition');
  const [systemName, setSystemName] = useState('AMORES System');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSettings, setSavedSettings] = useState(null);
  const [showModal, setShowModal] = useState({ show: false, type: 'success', title: '', message: '' });

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
      if (response.data.system_name) {
        setSystemName(response.data.system_name);
      }
      setSavedSettings({
        isApplicationOpen: response.data.is_application_open,
        startDate: response.data.application_start_date || '',
        endDate: response.data.application_end_date || '',
        currentBatch: response.data.current_batch || 1,
        quotaType: response.data.quota_type || 'Attrition',
        systemName: response.data.system_name || 'AMORES System'
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setLoading(false);
    }
  };

  const handleStartDateChange = (e) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (endDate && newStart > endDate) {
      setEndDate(newStart);
    }
  };

  const handleSave = async () => {
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
        system_name: systemName,
        performed_by: currentUser 
      });
      
      if (response.data) {
        setIsApplicationOpen(response.data.is_application_open);
        setStartDate(response.data.application_start_date || '');
        setEndDate(response.data.application_end_date || '');
        setCurrentBatch(response.data.currentBatch || response.data.current_batch || 1);
        setQuotaType(response.data.quota_type || 'Attrition');
        setSavedSettings({
          isApplicationOpen: response.data.is_application_open,
          startDate: response.data.application_start_date || '',
          endDate: response.data.application_end_date || '',
          currentBatch: response.data.currentBatch || response.data.current_batch || 1,
          quotaType: response.data.quota_type || 'Attrition',
          systemName: response.data.system_name || systemName
        });
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

  const handleDiscard = () => {
    if (!savedSettings) return;
    setIsApplicationOpen(savedSettings.isApplicationOpen);
    setStartDate(savedSettings.startDate);
    setEndDate(savedSettings.endDate);
    setCurrentBatch(savedSettings.currentBatch);
    setQuotaType(savedSettings.quotaType);
    setSystemName(savedSettings.systemName);
  };

  return (
    <div className="system-settings-page overflow-hidden">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto px-5 pt-8 pb-6 sm:px-8">
        <h2 className="!mb-1 text-[28px] font-extrabold text-[#2C2D86] tracking-tight">System Settings</h2>
        <p className="!mb-0 text-sm text-[#6b7c9c]">Configure system-wide parameters and recruitment cycles for the platform.</p>
      </div>

      {loading ? (
        <div className="max-w-6xl mx-auto bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center min-h-[350px]">
          <div className="w-10 h-10 border-4 border-[#2C2D86]/20 border-t-[#2C2D86] rounded-full animate-spin mb-3"></div>
          <p className="text-[#2C2D86] font-semibold text-base">Loading settings configuration...</p>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto px-5 pb-28 sm:px-8">
          {/* Recruitment Settings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-[#edf0f7] overflow-hidden">
            <div className="p-6 sm:p-7">
              <div className="flex items-start gap-3 mb-5">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eeeffc] text-[#2C2D86]"><FiBriefcase size={17} /></div>
                <div>
                  <h3 className="!mb-0 text-base font-extrabold tracking-wide text-[#2C2D86]">Recruitment Management</h3>
                  <p className="!mb-0 mt-0.5 text-sm text-[#7183a2]">Control operational windows and intake batching.</p>
                </div>
              </div>
              <div className="mb-5 h-0.5 w-10 bg-[#2C2D86]" />

              <div className="mb-4 inline-flex items-center rounded-md bg-[#eeeffc] text-[11px] font-bold uppercase tracking-wide text-[#2C2D86]">
                <span className="px-3 py-2">Current Batch</span>
                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#2C2D86] text-white">{currentBatch}</span>
              </div>

              {/* Dynamic Batch Alerts */}
              {!isApplicationOpen && (
                <div className="mb-5 flex items-center gap-2 rounded-md border border-[#f1dfd2] bg-[#fff8f3] px-3 py-2.5 text-sm text-[#4d5261]">
                  <FiInfo className="shrink-0 text-[#f36b25]" size={15} />
                  <div>
                    {currentBatch === 1 ? (
                      <span>Opening applications will automatically transition systems to <strong>Batch 2</strong>.</span>
                    ) : (
                      <span>System has reached the maximum intake limit. Re-opening will reset to <strong>Batch 1</strong> and clear active date windows.</span>
                    )}
                  </div>
                </div>
              )}

              {/* Form Input Grid */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-4">
                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#61718f]">Application Start Date</label>
                  <input 
                    type="date" 
                    value={startDate}
                    min={today}
                    onChange={handleStartDateChange}
                    className="h-10 w-full rounded-md border border-[#dce3ef] bg-white px-3 text-sm font-medium text-[#37435a] outline-none transition-all focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#61718f]">Application End Date</label>
                  <input 
                    type="date" 
                    value={endDate}
                    min={startDate || today}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 w-full rounded-md border border-[#dce3ef] bg-white px-3 text-sm font-medium text-[#37435a] outline-none transition-all focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* General Platform Settings Card */}
          <div className="mt-6 rounded-xl border border-[#edf0f7] bg-white p-6 shadow-sm sm:p-7">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#eeeffc] text-[#2C2D86]"><FiSliders size={17} /></div>
              <div>
                <h3 className="!mb-0 text-base font-extrabold tracking-wide text-[#2C2D86]">General Platform Preferences</h3>
                <p className="!mb-0 mt-0.5 text-sm text-[#7183a2]">Manage global application metadata.</p>
              </div>
            </div>
            <div className="mb-5 mt-3 h-0.5 w-10 bg-[#2C2D86]" />
            
            <div>
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-[#61718f]">System Name</label>
              <input 
                type="text" 
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="h-10 w-full rounded-md border border-[#dce3ef] bg-white px-3 text-sm font-medium text-[#37435a] outline-none transition-all focus:border-[#2C2D86] focus:ring-1 focus:ring-[#2C2D86]"
              />
            </div>
            
            {/* Actions */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#edf0f7] pt-5 sm:flex-row">
              <span className="flex items-center gap-2 text-xs font-medium text-[#7183a2]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#f36b25]" />
                You have unsaved changes in your system configurations.
              </span>
              <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
                {showModal.show && showModal.type === 'success' && !saving && (
                  <span className="text-emerald-600 mr-2 flex items-center gap-1.5 text-sm font-bold animate-pulse">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Saved!
                  </span>
                )}
                <button
                  onClick={handleDiscard}
                  disabled={saving}
                  className="rounded-md border border-[#2C2D86] bg-white px-5 py-2 text-sm font-bold text-[#2C2D86] transition-colors hover:bg-[#f1f1ff] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Discard
                </button>
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex min-w-[140px] items-center justify-center gap-2 rounded-md bg-[#f36b25] px-6 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#dc591c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save Settings'
                  )}
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Confirmation Modal */}
      <MessageModal 
        isOpen={showModal.show}
        onClose={() => setShowModal({ ...showModal, show: false })}
        type={showModal.type}
        title={showModal.title}
        message={showModal.message}
      />
    </div>
  );
}

export default SystemSettings;