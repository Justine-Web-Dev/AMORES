import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { HiArrowNarrowLeft } from "react-icons/hi";
import './DocumentSubmissionCss.css' // Your external CSS
import { api } from '../../../api/api'

function DocumentSubmission() {
  const location = useLocation()
  const navigate = useNavigate()

  const [formData] = useState(
    location.state?.formData || JSON.parse(localStorage.getItem('applicationFormData')) || {}
  )

  const [documents, setDocuments] = useState({
    psa: null,
    eligibility: null,
    scholastic: null,
    clearances: null
  })

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleFileChange = (event, documentType) => {
    const file = event.target.files[0]
    if (file) {
      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }))
    }
  }

  const isDocumentFormValid = documents.psa && documents.eligibility && documents.scholastic && documents.clearances

  const handleBack = () => {
    navigate(-1)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      // 1. Register applicant info
      const payload = {
        ...formData,
        date_graduated: formData.date_graduated ? new Date(formData.date_graduated).toISOString().split('T')[0] : null,
      }

      const response = await api.post("users/register_applicant_info/", payload)
      const applicantId = response.data.id;
      const code = response.data.tracking_code;

      // 2. Prepare document uploads
      const uploadPromises = []
      const docTypes = [
        { key: 'psa', label: 'PSA' },
        { key: 'eligibility', label: 'ELIGIBILITY' },
        { key: 'scholastic', label: 'SCHOLASTIC' },
        { key: 'clearances', label: 'CLEARANCE' }
      ]

      docTypes.forEach(doc => {
        if (documents[doc.key]) {
          const docFormData = new FormData()
          docFormData.append('applicant', applicantId)
          docFormData.append('document_type', doc.label)
          docFormData.append('file', documents[doc.key])
          
          uploadPromises.push(api.post("users/upload-document/", docFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          }))
        }
      })

      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises)
      }

      localStorage.removeItem('applicationFormData')
      localStorage.removeItem('applicationDocumentNames')

      navigate('/success-submit', { state: { trackingCode: code } })
    } catch (err) {
      const errorMessage =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "An error occurred while submitting your application"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="document-submit-container">
      <div className="document-card">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className='flex items-center gap-2 cursor-pointer mb-4 text-gray-600 hover:text-blue-800 transition-colors'
        >
          <HiArrowNarrowLeft size={20} />
          <span className="text-sm font-medium">Back</span>
        </button>

        <h1 className="title">Document Submission</h1>
        <p className="subtitle">Please upload the required documents in image format.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="doc-form">
          {/* PSA */}
          <div className="form-group">
            <label>PSA (Birth Certificate)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'psa')}
              disabled={loading}
            />
            {documents.psa && <p className="file-name">✓ {documents.psa.name}</p>}
          </div>

          {/* Eligibility */}
          <div className="form-group">
            <label>Eligibility Documents</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'eligibility')}
              disabled={loading}
            />
            {documents.eligibility && <p className="file-name">✓ {documents.eligibility.name}</p>}
          </div>

          {/* Scholastic */}
          <div className="form-group">
            <label>Scholastic Records</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'scholastic')}
              disabled={loading}
            />
            {documents.scholastic && <p className="file-name">✓ {documents.scholastic.name}</p>}
          </div>

          {/* Clearances */}
          <div className="form-group">
            <label>Clearances</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'clearances')}
              disabled={loading}
            />
            {documents.clearances && <p className="file-name">✓ {documents.clearances.name}</p>}
          </div>

          <button
            type="submit"
            className="submit-btn"
            disabled={loading || !isDocumentFormValid}
          >
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default DocumentSubmission