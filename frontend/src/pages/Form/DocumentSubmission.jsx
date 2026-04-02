import React, { useState } from 'react'
import { useLocation,useNavigate } from 'react-router-dom'
import './DocumentSubmissionCss.css'
import { api } from '../../../api/api'

function DocumentSubmission() {
  const location = useLocation()
  const navigate = useNavigate()
  const formData = location.state?.formData || {}

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
    setDocuments(prev => ({
      ...prev,
      [documentType]: file
    }))
  }

  const isDocumentFormValid = documents.psa && documents.eligibility && documents.scholastic && documents.clearances

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // First, register applicant info
      const payload = {
        ...formData,
        middle_name: formData.middle_name,
        name_of_school: formData.name_of_school,
        pag_ibig_number: formData.pag_ibig_number,
        phil_health_id_num: formData.phil_health_id_num,
        tribe_affiliated: formData.tribe_affiliated,
        date_graduated: formData.date_graduated ? new Date(formData.date_graduated).toISOString().split('T')[0] : null,
      }

      const response = await api.post("users/register_applicant_info/", payload)
      const applicantId = response.data.id;
      const code = response.data.tracking_code;

      // Upload documents - each document needs a separate request
      const uploadPromises = []

      if (documents.psa) {
        const formData = new FormData()
        formData.append('applicant', applicantId)
        formData.append('document_type', 'PSA')
        formData.append('file', documents.psa)
        uploadPromises.push(api.post("users/upload-document/", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }))
      }

      if (documents.eligibility) {
        const formData = new FormData()
        formData.append('applicant', applicantId)
        formData.append('document_type', 'ELIGIBILITY')
        formData.append('file', documents.eligibility)
        uploadPromises.push(api.post("users/upload-document/", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }))
      }

      if (documents.scholastic) {
        const formData = new FormData()
        formData.append('applicant', applicantId)
        formData.append('document_type', 'SCHOLASTIC')
        formData.append('file', documents.scholastic)
        uploadPromises.push(api.post("users/upload-document/", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }))
      }

      if (documents.clearances) {
        const formData = new FormData()
        formData.append('applicant', applicantId)
        formData.append('document_type', 'CLEARANCE')
        formData.append('file', documents.clearances)
        uploadPromises.push(api.post("users/upload-document/", formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }))
      }

      // Wait for all document uploads to complete
      if (uploadPromises.length > 0) {
        await Promise.all(uploadPromises)
      }

      navigate('/success-submit', { state: { trackingCode: code } })
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error.message || "An error occurred while submitting your application"
      setError(errorMessage)
      console.error("Error submitting application:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="document-submit-container">
      <div className="document-card">
        
        <h1 className="title">Document Submission</h1>
        <p className="subtitle">Please upload the required documents</p>

        {error && <div className="error-message" style={{ color: 'red', padding: '10px', marginBottom: '15px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>{error}</div>}

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
            {documents.psa && <p className="file-name">{documents.psa.name}</p>}
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
            {documents.eligibility && <p className="file-name">{documents.eligibility.name}</p>}
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
            {documents.scholastic && <p className="file-name">{documents.scholastic.name}</p>}
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
            {documents.clearances && <p className="file-name">{documents.clearances.name}</p>}
          </div>

          <button type="submit" className="submit-btn" disabled={loading || !isDocumentFormValid}>
            {loading ? 'Submitting...' : 'Submit Application'}
          </button>
        </form>

      </div>
    </div>
  )
}

export default DocumentSubmission
