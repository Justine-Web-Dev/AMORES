import React, { useEffect, useState } from 'react'
import { api } from '../../api/api'
import { useNavigate } from 'react-router-dom'

function DeclinedApplicants() {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('date')
  const [applicantInfo, setApplicantInfo] = useState([])
  const [open, setOpen] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const statusColors = {
    'New Applicant': 'bg-blue-100 text-blue-600',
    'Under Review': 'bg-yellow-100 text-yellow-600',
    'Qualified': 'bg-indigo-100 text-indigo-700',
    'Accepted': 'bg-emerald-100 text-emerald-700',
    'Rejected': 'bg-rose-100 text-rose-700',
  }

  const fetchInfo = async (isSilent = false) => {
    !isSilent && setLoading(true)
    try {
      const response = await api.get('users/get_applicant_info')
      setApplicantInfo(response.data)
    } catch (err) {
      console.error('Error fetching applicant info:', err)
    }finally{
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInfo(false)
    const interval = setInterval(() => {
      fetchInfo(true)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const toggleMenu = (id) => {
    setOpen(open === id ? null : id)
  }

  const filteredAndSorted = applicantInfo
    .filter((applicant) => applicant.status === 'Rejected')
    .filter((applicant) => {
      const fullName = `${applicant.firstname} ${applicant.lastname} ${applicant.middle_initial || ''}`.toLowerCase()
      return fullName.includes(searchTerm.toLowerCase())
    })
    .sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.firstname} ${a.lastname}`.toLowerCase()
        const nameB = `${b.firstname} ${b.lastname}`.toLowerCase()
        return nameA.localeCompare(nameB)
      } else if (sortBy === 'date') {
        const dateA = new Date(a.created_at)
        const dateB = new Date(b.created_at)
        return dateB - dateA
      }
      return 0
    })

  return (
    <div>
      <div className="module-content">
        <h2>Declined Applicants</h2>
        <p>Review all applicants whose status is rejected, with search and sorting controls for faster decision-making.</p>

        <div className="filter-controls">
          <input
            type="text"
            placeholder="Search declined applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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
                <th scope="col" className="th text-center">Gender</th>
                <th scope="col" className="th">Program</th>
                <th scope="col" className="th">Name of School</th>
                <th scope="col" className="th whitespace-nowrap">Date Graduated</th>
                <th scope="col" className="th text-center">Status</th>
                <th scope="col" className="th text-center">Reason</th>
                <th scope="col" className="th text-center">Applied On</th>
                <th scope="col" className="th"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                 <td colSpan="10" className="px-4 py-10">
                  <div className="flex justify-center items-center w-full">
                    <div className='border-[4px] border-gray-100 border-t-[#2C2D86] h-[30px] w-[30px] rounded-full animate-spin'></div>
                  </div>
                </td>
                </tr>
              ) : filteredAndSorted.length > 0 ? (
                filteredAndSorted.map((applicant) => (
                  <tr key={applicant.id} className="hover:bg-gray-50 transition-colors text-center">
                    <td>{applicant.firstname} {applicant.lastname} {applicant.middle_initial}</td>
                    <td>{applicant.age}</td>
                    <td>{applicant.gender}</td>
                    <td>{applicant.program}</td>
                    <td>{applicant.name_of_school}</td>
                    <td>{applicant.date_graduated}</td>
                    <td>
                      <span className={`status-label px-2 py-1 rounded-full text-xs font-semibold ${statusColors[applicant.status] || "bg-gray-100 text-gray-600"}`}>
                        {applicant.status}
                      </span>
                    </td>
                    <td>{applicant.rejection_reason || "N/A"}</td>
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
                  <td colSpan="10" className="py-10 text-gray-500 italic">
                    No declined applicants found.
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

export default DeclinedApplicants
