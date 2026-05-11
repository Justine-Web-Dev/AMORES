import React, { useState } from 'react'
import { api } from '../../../api/api'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ApplicantEval.css'

function ApplicantEvaluation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const navigate = useNavigate()

  const statusColors = {
    "New Applicant": "bg-blue-100 text-blue-600",
    "Document Review": "bg-purple-100 text-purple-600",
    "Initial Screening": "bg-yellow-100 text-yellow-600",
    "Technical Interview": "bg-cyan-100 text-cyan-600",
    "Accepted": "bg-green-100 text-green-600",
    "Rejected": "bg-red-100 text-red-600",
  };

 const [applicantInfo,setApplicantInfo] = useState([])
 const [open,setOpen] = useState(null)

  const fetchInfo = async () =>{
      try {
        const response = await api.get("users/applicants/active")
        setApplicantInfo(response.data)
        console.log(response.data)
      } catch (err) {
        console.error("Error fetching applicant info:", err)
      }
    }

  useEffect(()=>{
    fetchInfo()
    const interval = setInterval(()=>{
      fetchInfo()
    },5000)

    return () => clearInterval(interval)
  },[])

  const toggleMenu = (id) =>{
    setOpen(open === id ? null : id)
  }


  const filteredAndSorted = applicantInfo
  .filter((applicant) => {
    // 1. Filter by Search Term (Name)
    const fullName = `${applicant.firstname} ${applicant.lastname} ${applicant.middle_initial || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());

    // 2. Filter by Status Dropdown
    const matchesStatus = statusFilter === 'All' || applicant.status === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    // 3. Sorting Logic
    if (sortBy === 'name') {
      const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
      const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'date') {
      // Sorts by newest date first (descending)
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    }
    return 0;
  });

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
            <option value="New Applicant">New Applicant</option>
            <option value="Document Review">Document Review</option>
            <option value="Initial Screening">Initial Screening</option>
            <option value="Technical Interview">Technical Interview</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>
        </div>

        <div className="shadow sm:rounded-lg border border-gray-200">
          <table className="w-full text-sm text-center text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                <th scope="col" className="th">Name</th>
                <th scope="col" className="th text-center">Age</th>
                <th scope="col" className="th">Program</th>
                <th scope="col" className="th">Name of School</th>
                <th scope="col" className="th whitespace-nowrap">Date Graduated</th>
                <th scope="col" className="th text-center">Status</th>
                <th scope="col" className="th text-center">Applied On</th>
                <th scope="col" className="th">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-gray-50 transition-colors text-center">
                    <td>{applicant.firstname} {applicant.lastname} {applicant.middle_initial}</td>
                    <td>{applicant.age}</td>
                    <td>{applicant.program}</td>
                    <td>{applicant.name_of_school}</td>
                    <td>{applicant.date_graduated}</td>
                    <td>
                      <span className={`status-label px-2 py-1 rounded-full text-xs font-semibold ${statusColors[applicant.status] || "bg-gray-100 text-gray-600"}`}>
                        {applicant.status}
                      </span>
                    </td>
                    <td>{applicant.created_at}</td>
                    <td className="px-4 py-4 text-center relative">
                      <div className="flex justify-center items-center">
                        <button 
                          onClick={() => toggleMenu(applicant.id)}
                          className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 active:scale-95"
                          title="More Options"
                        >
                          <span className="text-xl font-bold tracking-widest leading-none pb-2">...</span>
                        </button>
                      </div>

                      {open === applicant.id && (
                        <div className="absolute right-10 z-10 w-40 bg-white shadow-lg border border-gray-100 rounded-md actions">
                          <ul className="flex flex-col text-[14px] gap-[5px]">
                            <h1 className='font-bold text-black border-b pb-1 border-gray-200 action-title'>Actions</h1>
                            <button 
                              onClick={() => navigate(`../view-details/${applicant.id}`)}
                              className="text-left px-2 py-1 cursor-pointer view-details-btn-action">
                              View Details
                            </button>
                            <button 
                              onClick={() => navigate(`../view-details/${applicant.id}`)}
                              className="text-left  cursor-pointer view-details-btn-action">
                              Update Status
                            </button>
                          </ul>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="py-10 text-gray-500 italic col-8">
                    No applicants registered
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>

      </div>
    </div>
  )
}

export default ApplicantEvaluation
