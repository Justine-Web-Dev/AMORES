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
    "Under Review": "bg-yellow-100 text-yellow-600",
    "Accepted": "bg-green-100 text-green-600",
    "Rejected": "bg-red-100 text-red-600",
};

 const [applicantInfo,setApplicantInfo] = useState([])
 const [open,setOpen] = useState(null)

  const fetchInfo = async () =>{
      try {
        const response = await api.get("users/get_applicant_info")
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
            <option value="New Applicant">New Applicant</option>
            <option value="Accepeted">Accepeted</option>
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
                <th scope="col" className="th"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {
                applicantInfo.map((applicant) =>(
                  <tr key={applicant.id} className="hover:bg-gray-50 transition-colors text-center">
                    <td>{applicant.firstname} {applicant.lastname} {applicant.middle_initial}</td>
                    <td>{applicant.age}</td>
                    <td>{applicant.program}</td>
                    <td>{applicant.name_of_school}</td>
                    <td>{applicant.date_graduated}</td>
                    <td><span className={`status-label ${statusColors[applicant.status]}`}>{applicant.status}</span></td>
                    <td>{applicant.created_at}</td>
                    <td className="px-4 py-4 text-center relative">
                      <div className="flex justify-center items-center">
                        <button 
                        onClick={()=> toggleMenu(applicant.id)}
                          className="flex items-center justify-center w-9 h-9 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 active:scale-95"
                          title="More Options"
                        >
                          <span className="text-xl font-bold tracking-widest leading-none pb-2">...</span>
                        </button>
                      </div>

                        {
                          open === applicant.id && (
                            <div className="absolute right-10 w-30 bg-white shadow rounded actions">
                              <ul className="flex justify-start flex-col text-[14px] gap-[5px]">
                                <h1 className='font-bold text-black'>Actions</h1>
                                <button 
                                onClick={() => navigate(`../view-details/${applicant.id}`)}
                                className=" h-[30px] cursor-pointer view-details-btn-action">
                                  View Details
                                </button>
                                <button 
                                onClick={() => navigate(`../view-details/${applicant.id}`)}
                                className="h-[30px] cursor-pointer update-status-btn-action">
                                  Update Status
                                </button>
                              </ul>
                            </div>
                            )
                        }
                    </td>
                  </tr>
                ))
              }

            </tbody>
          </table>
          </div>

      </div>
    </div>
  )
}

export default ApplicantEvaluation