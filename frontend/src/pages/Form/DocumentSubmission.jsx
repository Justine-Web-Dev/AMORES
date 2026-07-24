import React, { useState, useEffect } from 'react'
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
      console.error("Submission error data:", err?.response?.data);
      let errorMessage = "Submission failed.";
      if (err?.response?.data) {
        if (typeof err.response.data === 'object') {
           errorMessage = JSON.stringify(err.response.data);
        } else {
           errorMessage = err.response.data;
        }
      }
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const SingleUploadBox = ({ label, docKey, file, isOptional = false }) => (
    <div className="bg-white border border-gray-300 rounded-lg p-4 transition duration-200 hover:border-gray-400 flex flex-col justify-between min-h-[100px]">
      <div className="flex justify-between items-start gap-2 mb-2">
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            {label}
            {!isOptional && <span className="text-red-500 ml-1">*</span>}
          </span>
          <span className="text-[11px] text-gray-400 mt-0.5">PDF format required</span>
        </div>
      </div>
      
      <div className="mt-auto">
        {!file ? (
          <label className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold cursor-pointer transition border border-gray-200 focus-within:ring-2 focus-within:ring-[#2C2D86]">
            <HiOutlineCloudUpload size={16} className="text-gray-500" />
            <span>Upload Document</span>
            <input
              type="file"
              accept="application/pdf"
              disabled={loading}
              onChange={(e) => handleFileChange(e, docKey)}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            <div className="flex items-center justify-between bg-green-50 border border-green-200 px-3 py-2 rounded-lg w-full">
              <span className="text-xs font-medium text-green-700 truncate max-w-[150px]">✓ {file.name}</span>
              <button
                type="button"
                disabled={loading}
                onClick={() => removeFile(docKey)}
                className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded"
              >
                <HiX size={14} />
              </button>
            </div>
            <iframe
              src={`${URL.createObjectURL(file)}#toolbar=0&navpanes=0&scrollbar=0`}
              title="PDF Preview"
              className="w-full h-48 border border-gray-200 rounded-lg pointer-events-none"
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="form-application-container min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-md space-y-8">
        
        {/* Header Block */}
        <div className="border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 cursor-pointer mb-3 text-sm font-semibold text-[#2C2D86] hover:text-[#1f2063] transition-colors"
            >
              <HiArrowNarrowLeft size={18} />
              <span>Back to Form</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 title-application-form">
              Document Submission
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Please upload each specified requirement below to complete your track records profiles.
            </p>
          </div>
          <div className="text-xs font-semibold text-red-500 bg-red-50 border border-red-200 px-3 py-1 rounded-md self-start md:self-auto">
            * Indicates required document
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* SECTION 1: Identity Documents */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
              Identity Documents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SingleUploadBox label="Birth Certificate" docKey="birthCert" file={documents.birthCert} />
            </div>
          </div>

          {/* SECTION 2: Scholastic Records */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
              Scholastic Records
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleUploadBox label="Official Transcript of Records (OTR)" docKey="otr" file={documents.otr} />
              <SingleUploadBox label="Diploma" docKey="diploma" file={documents.diploma} />
            </div>
          </div>

          {/* SECTION 3: Government Clearances */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
              Government Clearances
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleUploadBox label="Barangay Clearance" docKey="barangayClearance" file={documents.barangayClearance} />
              <SingleUploadBox label="National Police Clearance" docKey="policeClearance" file={documents.policeClearance} />
              <SingleUploadBox label="Prosecutor's Clearance" docKey="prosecutorClearance" file={documents.prosecutorClearance} />
              <SingleUploadBox label="NBI Clearance" docKey="nbiClearance" file={documents.nbiClearance} />
            </div>
          </div>

          {/* SECTION 4: Career & Civil Service Eligibilities */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 border-l-4 border-[#2C2D86] pl-2">
                Career & Civil Service Eligibilities
              </h2>
              <p className="text-xs text-gray-400 mt-1 pl-3.5">Upload at least one item below that matches your qualifications:</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SingleUploadBox label="PRC License" docKey="prc" file={documents.prc} isOptional={true} />
              <SingleUploadBox label="Napolcom Entrance Rating" docKey="napolcom" file={documents.napolcom} isOptional={true} />
              <SingleUploadBox label="PD907 (Honor Graduate)" docKey="pd907" file={documents.pd907} isOptional={true} />
              <SingleUploadBox label="CS Professional Eligibility" docKey="csProf" file={documents.csProf} isOptional={true} />
            </div>
          </div>

          {/* Form Submission Actions */}
          <div className="pt-6 border-t border-gray-200 flex justify-center md:justify-end">
            <button
              type="submit"
              disabled={loading || !isFormValid}
              className={`w-full md:w-[240px] h-11 rounded-lg bg-[#2C2D86] text-white font-bold text-sm tracking-wide shadow-md transition-all duration-200 ${
                loading || !isFormValid
                  ? "opacity-50 cursor-not-allowed bg-gray-400"
                  : "hover:bg-[#1f2063] active:scale-95 cursor-pointer"
              }`}
            >
              {loading ? 'Uploading Application Files...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DocumentSubmission;