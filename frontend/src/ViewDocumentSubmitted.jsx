import React, { useState,useEffect } from 'react'
import './ViewDocumentCss.css'
import { api } from '../api/api'

function ViewDocumentSubmitted({applicantId}) {
  const [documents,setDocuments] = useState([])
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
      const fetchDocuments = async () =>{
        try{
           const response = await api.get(`users/view-applicant-document/${applicantId}`)
        setDocuments(response.data)
        }catch(err){
          console.error("Error fetching documents:", err);
        }finally{
          setLoading(false)
        }
      }

    if(applicantId){
      fetchDocuments()
    }

  },[applicantId])

  if (loading) return <div>Loading Documents...</div>

  return (
    <div className='rounded-[12px] ViewDocumentSubmitted'>
      <h1 className="text-lg font-bold text-[1.7rem] submitted-doc-title">Submitted Documents</h1>

      {documents.length === 0 ? (
        <p className="text-gray-500">No documents uploaded for this applicant.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div key={doc.id} className="border rounded-lg shadow-sm bg-[#fff] overflow-hidden image-docs-container">
              
              <a href={doc.file_url || doc.file} target="_blank" rel="noopener noreferrer">
                <img
                  src={doc.file_url || doc.file}
                  alt={doc.document_type}
                  className="w-full h-48 object-cover hover:opacity-80 transition-opacity cursor-pointer"
                />
              </a>

              <div className="p-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
                  {doc.document_type}
                </p>
                <p className="text-[10px] mt-1 text-gray-400">
                  Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ViewDocumentSubmitted
