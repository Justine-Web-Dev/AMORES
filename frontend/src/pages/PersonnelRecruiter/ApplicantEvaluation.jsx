import React, { useState } from 'react'
import { api } from '../../../api/api'
import { useEffect } from 'react'

function ApplicantEvaluation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')

 const [applicantInfo,setApplicantInfo] = useState([])

  useEffect(()=>{
    const fetchInfo = async () =>{
      const response = await api.get("users/get_applicant_info")
      setApplicantInfo(response.data)
      console.log(response.data)
    }
    fetchInfo()
  },[])


  return (
    <div>
      <div className='module-content'>
        <h2>Applicant Evaluation</h2>
        <p>Utilize smart filtering to search, sort, and categorize applicants according to their current status.</p>

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="filter-select">
            <option value="All">All Statuses</option>
            <option value="Under Review">Under Review</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interviewed">Interviewed</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className='h-[200px] border'>
          
        </div>

      </div>
    </div>
  )
}

export default ApplicantEvaluation