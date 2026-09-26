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
  ATTRITION_DOC: 'Attrition Certificate / Endorsement',
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
  {
    title: '5. Attrition Requirement',
    keys: ['ATTRITION_DOC'],
    fallbackLabels: ['Attrition Certificate / Endorsement'],
  },
]

const DocCard = ({ doc, label, onScan }) => {
  const [scanning, setScanning] = useState(false);
  let imgUrl = doc.file_url || doc.file;
  if (imgUrl && !imgUrl.startsWith('http')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
    const cleanBaseUrl = baseUrl.endsWith('/api') ? baseUrl.slice(0, -4) : baseUrl;
    imgUrl = imgUrl.startsWith('/') ? `${cleanBaseUrl}${imgUrl}` : `${cleanBaseUrl}/${imgUrl}`;
  }

  const handleScanClick = async () => {
    setScanning(true);
    await onScan(doc.id);
    setScanning(false);
  };

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden image-docs-container flex flex-col">
      <a href={imgUrl} target="_blank" rel="noopener noreferrer">
        <img
          src={imgUrl}
          alt={doc.document_type}
          className="w-full h-48 object-cover hover:opacity-80 transition-opacity cursor-pointer"
          referrerPolicy="no-referrer"
        />
      </a>
      <div className="p-3 flex-1 flex flex-col">
        <div className="flex justify-between items-start">
          <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide pr-2">
            {label || DOC_LABELS[doc.document_type] || doc.document_type}
          </p>
          {doc.ocr_text && (
            <span className={`whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] font-bold ${doc.ai_verified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {doc.ai_verified ? 'VALID' : 'AI FLAGGED'}
            </span>
          )}
        </div>
        <p className="text-[10px] mt-1 text-gray-400">
          Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
        </p>
        <p className="text-[10px] mt-0.5 text-gray-500 font-medium mb-3">
          Expires: <span className="text-orange-500 font-bold">
            {doc.expiration_date 
              ? new Date(doc.expiration_date).toLocaleDateString()
              : new Date(new Date(doc.uploaded_at).getTime() + 180 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </span>
        </p>

        <div className="mt-auto pt-2 border-t border-gray-100">
            <button 
                onClick={handleScanClick} 
                disabled={scanning || !!doc.ocr_text}
                className="w-full py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded transition-colors disabled:opacity-50 cursor-pointer"
            >
                {scanning ? 'Scanning...' : (doc.ocr_text ? 'Scanned' : 'Scan with AI')}
            </button>
        </div>
      </div>
    </div>
  )
}

function ViewDocumentSubmitted({ applicantId, onUpdate, onAiFlagged }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await api.get(`users/view-applicant-document/${applicantId}`)
        setDocuments(response.data)
        
        // Restore AI flagged reasons on load
        if (onAiFlagged) {
          response.data.forEach(doc => {
            if (doc.ocr_text && !doc.ai_verified && doc.ai_remarks) {
              onAiFlagged(doc.document_type, doc.ai_remarks)
            }
          })
        }
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
      
      if (!response.data.ai_verified && response.data.ai_remarks && onAiFlagged) {
        onAiFlagged(response.data.document_type, response.data.ai_remarks)
      } else if (onUpdate) {
        onUpdate()
      }
    } catch (err) {
      console.error("Error scanning document:", err)
      alert("Failed to scan document: " + (err.response?.data?.error || err.message))
    }
  }

  if (loading) {
    return (
      <div className='rounded-[12px] ViewDocumentSubmitted'>
        <h1 className="text-lg font-bold text-[1.7rem] submitted-doc-title">Submitted Documents</h1>
        <div className="space-y-6 mt-4">
          {[1, 2, 3].map((sectionIndex) => (
            <div key={sectionIndex}>
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-3 animate-pulse"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1, 2].map((cardIndex) => (
                  <div key={cardIndex} className="border rounded-lg shadow-sm bg-white overflow-hidden image-docs-container animate-pulse">
                    <div className="w-full h-48 bg-gray-200"></div>
                    <div className="p-3 space-y-2 mt-2">
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/4 mt-2"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

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
                  return <DocCard key={doc.id || index} doc={doc} label={label} onScan={handleScan} onUpdate={onUpdate} />
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
