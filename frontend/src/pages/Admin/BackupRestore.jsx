import React, { useState } from 'react'
import { api } from '../../../api/api'
import { FaDatabase, FaSyncAlt, FaCloudUploadAlt } from "react-icons/fa";
import MessageModal from '../../Modals/MessageModal'

function BackupRestore() {
  const [loading, setLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: 'success', title: '', message: '' })

  const handleBackup = async () => {
    setLoading(true)
    try {
      const response = await api.get('users/backup/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const date = new Date().toISOString().split('T')[0];
      link.setAttribute('download', `amores_backup_${date}.sqlite3`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Backup Successful',
        message: 'Your system database backup has been downloaded successfully.'
      })
    } catch (error) {
      console.error("Backup failed:", error)
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Backup Failed',
        message: 'There was an error generating your backup. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.name.endsWith('.sqlite3')) {
      setSelectedFile(file);
    } else {
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Invalid File',
        message: 'Please select a valid .sqlite3 database file.'
      });
      e.target.value = null;
    }
  }

  const handleRestore = async () => {
    if (!selectedFile) return;

    setLoading(true)
    const formData = new FormData();
    formData.append('backup_file', selectedFile);

    try {
      const response = await api.post('users/restore/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setModalConfig({
        isOpen: true,
        type: 'success',
        title: 'Restore Successful',
        message: response.data.message || 'Database has been restored successfully.'
      })
      setSelectedFile(null)
    } catch (error) {
      console.error("Restore failed:", error)
      setModalConfig({
        isOpen: true,
        type: 'error',
        title: 'Restore Failed',
        message: error.response?.data?.error || 'Failed to restore the database.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='module-content max-w-4xl'>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Backup & Restore</h2>
        <p className="text-slate-500">Securely manage your system data by creating backups or restoring from a previous state.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Backup Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
            <FaDatabase size={30} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">System Backup</h3>
          <p className="text-sm text-slate-500 mb-8">
            Generate a full backup of the system database. This includes all users, applicants, and audit logs.
          </p>
          <button 
            onClick={handleBackup}
            disabled={loading}
            className="w-full py-3 bg-[#2C2D86] hover:bg-[#1e1f5c] text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {loading ? <FaSyncAlt className="animate-spin" /> : <FaCloudUploadAlt size={20} />}
            Create Backup
          </button>
        </div>

        {/* Restore Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6">
            <FaSyncAlt size={30} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Restore Data</h3>
          <p className="text-sm text-slate-500 mb-8">
            Upload a previously saved .sqlite3 backup file to restore the system to that specific point in time.
          </p>
          
          <div className="w-full mb-4">
            <input 
              type="file" 
              accept=".sqlite3" 
              onChange={handleFileChange}
              id="restore-file"
              className="hidden"
            />
            <label 
              htmlFor="restore-file"
              className="block w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-600 cursor-pointer hover:border-[#2C2D86] transition-colors truncate"
            >
              {selectedFile ? selectedFile.name : 'Select .sqlite3 file'}
            </label>
          </div>

          <button 
            onClick={handleRestore}
            disabled={!selectedFile || loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 disabled:bg-gray-300 flex items-center justify-center gap-2"
          >
            {loading ? <FaSyncAlt className="animate-spin" /> : 'Restore System'}
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100">
        <h4 className="text-amber-800 font-bold mb-2">Important Note</h4>
        <p className="text-sm text-amber-700">
          Restoring the database will overwrite all current system data. This action cannot be undone. Always create a fresh backup before performing a restore.
        </p>
      </div>

      <MessageModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  )
}

export default BackupRestore
