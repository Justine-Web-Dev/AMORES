import React, { useState, useEffect } from 'react'
import { api } from '../../../../api/api'
import MessageModal from '../../../Modals/MessageModal'
import { FaPlus, FaSave, FaTrash, FaEdit } from 'react-icons/fa'

function GlobalSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState({ show: false, type: 'success', title: '', message: '' });
  
  // For new setting form
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDescription, setNewDescription] = useState('');
  
  // For editing existing settings
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/global-settings/');
      // Ensure boolean strings are properly maintained as strings for DB, but we parse them conceptually
      setSettings(response.data);
    } catch (error) {
      console.error("Error fetching global settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBoolean = async (setting) => {
    const isCurrentlyTrue = String(setting.value).toLowerCase() === 'true';
    const newValue = isCurrentlyTrue ? 'false' : 'true';
    
    // Optimistic UI update
    setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: newValue } : s));

    try {
      await api.put('/users/global-settings/update/', {
        key: setting.key,
        value: newValue,
        description: setting.description
      });
    } catch (error) {
      // Revert on failure
      setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, value: setting.value } : s));
      console.error("Error toggling setting:", error);
      setShowModal({
        show: true, type: 'error', title: 'Toggle Failed', message: 'Failed to update setting.'
      });
    }
  };

  const handleSaveSetting = async (key, value, description) => {
    setSaving(true);
    try {
      // Basic JSON validation if it starts with { or [
      let parsedValue = value;
      if (typeof value === 'string' && (value.trim().startsWith('{') || value.trim().startsWith('['))) {
        try {
          parsedValue = JSON.parse(value);
        } catch (e) {
          throw new Error("Invalid JSON format in value");
        }
      }

      const response = await api.put('/users/global-settings/update/', {
        key,
        value: parsedValue,
        description
      });
      
      setShowModal({
        show: true,
        type: 'success',
        title: 'Settings Saved',
        message: `Global setting '${key}' has been updated successfully.`
      });
      
      // Reset forms
      setNewKey('');
      setNewValue('');
      setNewDescription('');
      setEditingId(null);
      
      fetchSettings();
    } catch (error) {
      console.error("Error saving global setting:", error);
      setShowModal({
        show: true,
        type: 'error',
        title: 'Save Failed',
        message: error.message || 'Failed to save global setting. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (setting) => {
    setEditingId(setting.id);
    setEditValue(typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : setting.value);
    setEditDescription(setting.description || '');
  };

  return (
    <div className='module-content max-w-7xl mx-auto p-6'>
      <h2 className="text-2xl font-bold mb-2 text-[#2C2D86]">Global Platform Settings</h2>
      <p className="text-gray-600 mb-6 italic">Manage core platform configurations, key-value stores, and master data (Super Admin Only).</p>
      
      {loading ? (
        <div className="bg-white p-20 rounded-xl shadow-md border border-gray-100 flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-[#2C2D86]/10 border-t-[#2C2D86] rounded-full animate-spin mb-4"></div>
          <p className="text-[#2C2D86] font-medium">Loading global settings...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Add New Setting Card */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <h3 className="text-lg font-bold text-[#2C2D86] mb-4 border-b pb-2">Add New Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Key Name</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all"
                  placeholder="e.g., MAINTENANCE_MODE"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all"
                  placeholder="What does this control?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Value (String or JSON)</label>
                <textarea 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all min-h-[100px] font-mono text-sm"
                  placeholder="true, false, string value, or valid JSON {}"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => handleSaveSetting(newKey, newValue, newDescription)}
                disabled={saving || !newKey || !newValue}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-white transition-all ${
                  saving || !newKey || !newValue ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2C2D86] hover:bg-[#1a1a54] shadow-md hover:shadow-lg'
                }`}
              >
                <FaPlus />
                {saving ? 'Creating...' : 'Create Setting'}
              </button>
            </div>
          </div>

          {/* Existing Settings List */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider border-b">
                  <th className="px-6 py-4 w-1/4">Configuration Key</th>
                  <th className="px-6 py-4 w-2/4">Value & Description</th>
                  <th className="px-6 py-4 w-1/4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {settings.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No global settings configured yet.</td>
                  </tr>
                ) : (
                  settings.map((setting) => (
                    <tr key={setting.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 align-top">
                        <span className="font-mono text-sm font-bold text-[#2C2D86] bg-[#2C2D86]/10 px-2 py-1 rounded">
                          {setting.key}
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {editingId === setting.id ? (
                          <div className="flex flex-col gap-2">
                            <input 
                              type="text" 
                              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm mb-1"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              placeholder="Description"
                            />
                            <textarea 
                              className="w-full px-3 py-2 border border-gray-300 rounded text-sm font-mono min-h-[80px]"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                            ></textarea>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-1">
                            {setting.description && <span className="text-xs text-gray-500 mb-1">{setting.description}</span>}
                            
                            {(String(setting.value).toLowerCase() === 'true' || String(setting.value).toLowerCase() === 'false') ? (
                              <div className="mt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input 
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={String(setting.value).toLowerCase() === 'true'}
                                    onChange={() => handleToggleBoolean(setting)}
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                  <span className="ml-3 text-sm font-medium text-gray-700">
                                    {String(setting.value).toLowerCase() === 'true' ? 'Enabled' : 'Disabled'}
                                  </span>
                                </label>
                              </div>
                            ) : (
                              <pre className="bg-gray-100 p-2 rounded text-xs font-mono overflow-x-auto text-gray-800">
                                {typeof setting.value === 'object' ? JSON.stringify(setting.value, null, 2) : setting.value}
                              </pre>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top text-right">
                        {editingId === setting.id ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => setEditingId(null)}
                              className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                            <button 
                              onClick={() => handleSaveSetting(setting.key, editValue, editDescription)}
                              disabled={saving}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded hover:bg-green-700"
                            >
                              <FaSave /> Save
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => startEditing(setting)}
                            className="flex items-center justify-end w-full gap-1 text-sm font-semibold text-[#EB612A] hover:text-[#c44f20] transition-colors"
                          >
                            <FaEdit /> Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal.show && (
        <MessageModal 
          type={showModal.type} 
          message={showModal.message} 
          onClose={() => setShowModal({ ...showModal, show: false })} 
        />
      )}
    </div>
  )
}

export default GlobalSettings
