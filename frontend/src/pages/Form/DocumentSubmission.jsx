import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiArrowNarrowLeft, HiOutlineCloudUpload, HiX } from "react-icons/hi";
import { api } from '../../../api/api'

function DocumentSubmission() {
  const location = useLocation()
  const navigate = useNavigate()

  const [formData] = useState(
    location.state?.formData || JSON.parse(localStorage.getItem('applicationFormData')) || {}
  )

  // Every single required document now has its own individual state
  const [documents, setDocuments] = useState({
    // PSA
    birthCert: null,
    // Scholastic
    otr: null,
    diploma: null,
    // Clearances
    barangayClearance: null,
    policeClearance: null,
    prosecutorClearance: null,
    nbiClearance: null,
    // Eligibilities (Applicant selects one or multiple that apply to them)
    prc: null,
    napolcom: null,
    pd907: null,
    csProf: null
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (event, documentKey) => {
    const file = event.target.files[0]
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [documentKey]: file
      }))
    }
  }

  const removeFile = (documentKey) => {
    setDocuments(prev => ({
      ...prev,
      [documentKey]: null
    }))
  }

  const isFormValid = 
    documents.birthCert &&
    documents.otr &&
    documents.diploma &&
    documents.barangayClearance &&
    documents.policeClearance &&
    documents.prosecutorClearance &&
    documents.nbiClearance &&
    (documents.prc || documents.napolcom || documents.pd907 || documents.csProf)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = {
        ...formData,
        date_graduated: formData.date_graduated ? new Date(formData.date_graduated).toISOString().split('T')[0] : null,
      }

      // 1. Register base applicant text info
      const response = await api.post("users/register_applicant_info/", payload)
      const applicantId = response.data.id;
      const code = response.data.tracking_code;

      // 2. Map local document states to specific document type codes
      const uploadQueue = [
        { file: documents.birthCert, label: 'BIRTH_CERT' },
        { file: documents.otr, label: 'OTR' },
        { file: documents.diploma, label: 'DIPLOMA' },
        { file: documents.barangayClearance, label: 'BRGY_CLEARANCE' },
        { file: documents.policeClearance, label: 'POLICE_CLEARANCE' },
        { file: documents.prosecutorClearance, label: 'PROS_CLEARANCE' },
        { file: documents.nbiClearance, label: 'NBI_CLEARANCE' },
        { file: documents.prc, label: 'PRC' },
        { file: documents.napolcom, label: 'NAPOLCOM' },
        { file: documents.pd907, label: 'PD907' },
        { file: documents.csProf, label: 'CS_PROF' },
      ]

      const uploadPromises = []

      uploadQueue.forEach(item => {
        if (item.file) {
          const docFormData = new FormData()
          docFormData.append('applicant', applicantId)
          docFormData.append('document_type', item.label)
          docFormData.append('file', item.file)

          uploadPromises.push(api.post("users/upload-document/", docFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }))
        }
      })

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises)
      }

      localStorage.removeItem('applicationFormData')
      navigate('../success-submit', { state: { trackingCode: code }, relative: 'path' })
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err?.response?.data?.detail || "Submission failed."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const SingleUploadBox = ({ label, docKey, file }) => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">Image Format Required</p>
        </div>
        
        {!file ? (
          <label className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md text-xs font-semibold cursor-pointer transition-colors border border-blue-200">
            <HiOutlineCloudUpload size={16} />
            <span>Upload Image</span>
            <input
              type="file"
              accept="image/*"
              disabled={loading}
              onChange={(e) => handleFileChange(e, docKey)}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 px-2.5 py-1.5 rounded-md max-w-full sm:max-w-xs">
            <span className="text-xs font-medium text-green-700 truncate">✓ {file.name}</span>
            <button
              type="button"
              disabled={loading}
              onClick={() => removeFile(docKey)}
              className="text-gray-400 hover:text-red-500 rounded transition-colors"
            >
              <HiX size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6   sm:p-8 my-10">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 cursor-pointer mb-6 text-gray-600 hover:text-blue-800 transition-colors"
        >
          <HiArrowNarrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Document Submission</h1>
        <p className="text-sm text-gray-500 mb-6">Please upload each specified requirement below.</p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* PSA SECTION */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2.5">1. PSA Identity Documents</h2>
            <SingleUploadBox label="Birth Certificate" docKey="birthCert" file={documents.birthCert} />
          </div>

          {/* SCHOLASTIC SECTION */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2.5">2. Scholastic Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SingleUploadBox label="Official Transcript of Records (OTR)" docKey="otr" file={documents.otr} />
              <SingleUploadBox label="Diploma" docKey="diploma" file={documents.diploma} />
            </div>
          </div>

          {/* CLEARANCES SECTION */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-2.5">3. Government Clearances</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SingleUploadBox label="Barangay Clearance" docKey="barangayClearance" file={documents.barangayClearance} />
              <SingleUploadBox label="National Police Clearance" docKey="policeClearance" file={documents.policeClearance} />
              <SingleUploadBox label="Prosecutor's Clearance" docKey="prosecutorClearance" file={documents.prosecutorClearance} />
              <SingleUploadBox label="NBI Clearance" docKey="nbiClearance" file={documents.nbiClearance} />
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-1">4. Career & Civil Service Eligibilities</h2>
            <p className="text-xs text-gray-400 mb-3">Upload at least one item below that matches your qualifications:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <SingleUploadBox label="PRC License" docKey="prc" file={documents.prc} />
              <SingleUploadBox label="Napolcom Entrance Rating" docKey="napolcom" file={documents.napolcom} />
              <SingleUploadBox label="PD907 (Honor Graduate)" docKey="pd907" file={documents.pd907} />
              <SingleUploadBox label="CS Professional Eligibility" docKey="csProf" file={documents.csProf} />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="w-full mt-4 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Uploading Application Files...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DocumentSubmission