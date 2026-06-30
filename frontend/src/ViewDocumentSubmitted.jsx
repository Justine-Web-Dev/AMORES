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

const DocCard = ({ doc, label }) => (
  <div className="border rounded-lg shadow-sm bg-white overflow-hidden image-docs-container">
    <a href={doc.file_url || doc.file} target="_blank" rel="noopener noreferrer">
      <img
        src={doc.file_url || doc.file}
        alt={doc.document_type}
        className="w-full h-48 object-cover hover:opacity-80 transition-opacity cursor-pointer"
      />
    </a>
    <div className="p-3">
      <p className="text-xs font-semibold text-gray-800 uppercase tracking-wide">
        {label || DOC_LABELS[doc.document_type] || doc.document_type}
      </p>
      <p className="text-[10px] mt-1 text-gray-400">
        Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
      </p>
    </div>
  </div>
)

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
                  return <DocCard key={doc.id} doc={doc} label={label} />
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
