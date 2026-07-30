import React, { useState, useEffect } from 'react'
import './ViewDocumentCss.css'
import { api } from '../api/api'

const DOC_LABELS = {
  BIRTH_CERT: 'Birth Certificate',
  OTR: 'Official Transcript of Records (OTR)',
  DIPLOMA: 'Diploma',
  BRGY_CLEARANCE: 'Barangay Clearance',
  POLICE_CLEARANCE: 'National Police Clearance',
  PROS_CLEARANCE: "Prosecutor's Clearance",
  NBI_CLEARANCE: 'NBI Clearance',
  PRC: 'PRC License',
  NAPOLCOM: 'Napolcom Entrance Rating',
  PD907: 'PD907 (Honor Graduate)',
  CS_PROF: 'CS Professional Eligibility',
  // Legacy
  PSA: 'PSA Birth Certificate',
  SCHOLASTIC: 'Scholastic Records',
  CLEARANCE: 'Government Clearance',
  ELIGIBILITY: 'Career Eligibility',
}

const SECTIONS = [
  {
    title: '1. PSA',
    keys: ['BIRTH_CERT', 'PSA'],
    fallbackLabels: ['Birth Certificate'],
  },
  {
    title: '2. Scholastic Records',
    keys: ['OTR', 'DIPLOMA', 'SCHOLASTIC'],
    fallbackLabels: ['Official Transcript of Records (OTR)', 'Diploma'],
  },
  {
    title: '3. Clearances',
    keys: ['BRGY_CLEARANCE', 'POLICE_CLEARANCE', 'PROS_CLEARANCE', 'NBI_CLEARANCE', 'CLEARANCE'],
    fallbackLabels: ['Barangay Clearance', 'National Police Clearance', "Prosecutor's Clearance", 'NBI Clearance'],
  },
  {
    title: '4. Eligibilities',
    keys: ['PRC', 'NAPOLCOM', 'PD907', 'CS_PROF', 'ELIGIBILITY'],
    fallbackLabels: ['PRC License', 'Napolcom Entrance Rating', 'PD907 (Honor Graduate)', 'CS Professional Eligibility'],
  },
]

const DocCard = ({ doc, label, onScan }) => {
  let imgUrl = doc.file_url || doc.file;
  if (imgUrl && !imgUrl.startsWith('http')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    imgUrl = imgUrl.startsWith('/') ? `${cleanBaseUrl}${imgUrl}` : `${cleanBaseUrl}/${imgUrl}`;
  }

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden image-docs-container">
      <a href={imgUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={imgUrl}
          alt={doc.document_type}
          className="w-full h-48 object-cover hover:opacity-80 transition-opacity cursor-pointer"
          referrerPolicy="no-referrer"
        />
      </a>
      <div className="p-3">
        <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
          {label || DOC_LABELS[doc.document_type] || doc.document_type}
        </p>
        <p className="text-[10px] mt-1 text-gray-400">
          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
        </p>
        <p className="text-[10px] mt-0.5 text-gray-500 font-medium">
          Expires: <span className="text-orange-500 font-bold">
            {doc.expiration_date 
              ? new Date(doc.expiration_date).toLocaleDateString()
              : new Date(new Date(doc.uploaded_at).getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </span>
        </p>

        {/* AI Verification Badge */}
        {doc.ai_remarks ? (
          <div className="mt-2 text-xs">
            {doc.ai_verified ? (
              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                AI Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-orange-500 font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                AI Flagged
              </span>
            )}
            <p className="text-[9px] text-gray-500 mt-0.5" title={doc.ocr_text}>
              {doc.ai_remarks}
            </p>
          </div>
        ) : (
          <button
            onClick={() => onScan(doc.id)}
            className="mt-2 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-200 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
          >
            Scan with AI
          </button>
        )}
      </div>
    </div>
  )
}

function ViewDocumentSubmitted({ applicantId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get(`users/view-applicant-document/${applicantId}`)
        setDocuments(response.data)
      } catch (err) {
        console.error("Error fetching documents:", err)
      } finally {
        setLoading(false)
      }
    }

    if (applicantId) {
      fetchDocuments()
    }
  }, [applicantId])

  const handleScan = async (docId) => {
    try {
      const response = await api.post(`users/scan-document/${docId}/`)
      setDocuments(docs => docs.map(d => d.id === docId ? response.data : d))
    } catch (err) {
      console.error("Error scanning document:", err)
      alert("Failed to scan document: " + (err.response?.data?.error || err.message))
    }
  }

  if (loading) return <div>Loading Documents...</div>

  if (documents.length === 0) {
    return (
      <div className='rounded-[12px] ViewDocumentSubmitted'>
        <h1 className="text-lg font-bold text-[1.7rem] submitted-doc-title">Submitted Documents</h1>
        <p className="text-gray-500">No documents uploaded for this applicant.</p>
      </div>
    )
  }

  // Group docs by document_type key
  const docsByType = {}
  documents.forEach(doc => {
    docsByType[doc.document_type] = docsByType[doc.document_type] || []
    docsByType[doc.document_type].push(doc)
  })

  return (
    <div className='rounded-[12px] ViewDocumentSubmitted'>
      <h1 className="text-lg font-bold text-[1.7rem] submitted-doc-title">Submitted Documents</h1>

      <div className="space-y-6">
        {SECTIONS.map((section) => {
          // Collect all docs that belong to this section
          const sectionDocs = section.keys.flatMap(key => docsByType[key] || [])
          if (sectionDocs.length === 0) return null

          return (
            <div key={section.title}>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                {section.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sectionDocs.map((doc, index) => {
                  const isLegacy = ['CLEARANCE', 'SCHOLASTIC', 'ELIGIBILITY', 'PSA'].includes(doc.document_type)
                  const label = isLegacy
                    ? (section.fallbackLabels?.[index] || DOC_LABELS[doc.document_type])
                    : undefined
                  return <DocCard key={doc.id || index} doc={doc} label={label} onScan={handleScan} />
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ViewDocumentSubmitted
