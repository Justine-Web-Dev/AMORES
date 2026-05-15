import React, { useState } from 'react'
import { api } from '../../../api/api'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import { RiFileExcel2Line } from "react-icons/ri"
import { HiOutlineClipboardCheck } from "react-icons/hi"
import './ApplicantEval.css'

function ApplicantEvaluation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortBy, setSortBy] = useState('name')
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()

  const statusColors = {
    "New Applicant": "bg-blue-100 text-blue-600",
    "Document Review": "bg-purple-100 text-purple-600",
    "Initial Screening": "bg-yellow-100 text-yellow-600",
    "Technical Interview": "bg-cyan-100 text-cyan-600",
    "Qualified": "bg-indigo-100 text-indigo-700",
    "Accepted": "bg-emerald-100 text-emerald-700",
    "Rejected": "bg-rose-100 text-rose-700",
    "Body Mass Index": "bg-blue-50 text-blue-500",
    "Physical Agility Test": "bg-orange-100 text-orange-600",
    "Neuro Examination": "bg-indigo-100 text-indigo-600",
    "Medical": "bg-pink-100 text-pink-600",
    "Drug Test": "bg-amber-100 text-amber-600",
    "Final Interview": "bg-teal-100 text-teal-600",
    "Oath Taking": "bg-emerald-100 text-emerald-600",
  };

 const [applicantInfo,setApplicantInfo] = useState([])
 const [open,setOpen] = useState(null)

  const fetchInfo = async (isSilent = false) =>{
      !isSilent && setLoading(true)
      try {
        const response = await api.get("users/applicants/all")
        setApplicantInfo(response.data)
        console.log(response.data)
      } catch (err) {
        console.error("Error fetching applicant info:", err)
      }finally{
        setLoading(false)
      }
    }

  useEffect(()=>{
    fetchInfo(false)
    const interval = setInterval(()=>{
      fetchInfo(true)
    },5000)

    return () => clearInterval(interval)
  },[])

  const toggleMenu = (id) =>{
    setOpen(open === id ? null : id)
  }


  const filteredAndSorted = applicantInfo
  .filter((applicant) => {
    // 1. ALWAYS exclude Rejected from the table display as per user request
    if (applicant.status === 'Rejected') return false;

    // 2. Filter by Search Term (Name)
    const fullName = `${applicant.firstname} ${applicant.lastname} ${applicant.middle_initial || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());

    // 3. Filter by Status Dropdown
    const matchesStatus = statusFilter === 'All' || applicant.status === statusFilter;

    return matchesSearch && matchesStatus;
  })
  .sort((a, b) => {
    // 4. Sorting Logic
    if (sortBy === 'name') {
      const nameA = `${a.firstname} ${a.lastname}`.toLowerCase();
      const nameB = `${b.firstname} ${b.lastname}`.toLowerCase();
      return nameA.localeCompare(nameB);
    } else if (sortBy === 'date') {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return dateB - dateA;
    }
    return 0;
  });

  const handleExportExcel = () => {
    
    const dataForExport = applicantInfo.filter(applicant => {
       const fullName = `${applicant.firstname} ${applicant.lastname} ${applicant.middle_initial || ''}`.toLowerCase();
       const matchesSearch = fullName.includes(searchTerm.toLowerCase());
       const matchesStatus = statusFilter === 'All' || applicant.status === statusFilter;
       return matchesSearch && matchesStatus;
    });

    const exportData = dataForExport.map(applicant => ({
      // Personal & Identity
      'Tracking Code': applicant.tracking_code,
      'First Name': applicant.firstname,
      'Last Name': applicant.lastname,
      'Middle Name': applicant.middle_name || 'N/A',
      'Age': applicant.age,
      'Gender': applicant.gender || 'N/A', // If you have this field
      'Email': applicant.email,
      'Contact #': applicant.cp_number,
      'Height': applicant.height,
      'Tribe': applicant.tribe || 'N/A',
      'Pag-IBIG No.': applicant.pag_ibig_number,
      'PhilHealth ID': applicant.phil_health_id_num,
      
      // Educational Background
      'School Name': applicant.name_of_school,
      'Program/Course': applicant.program,
      'Date Graduated': applicant.date_graduated,
      'Latin Honor': applicant.latin_honor || 'N/A',
      
      // Application Status & Logistics
      'Current Status': applicant.status,
      'Rejection Reason': applicant.rejection_reason || 'N/A',
      'Next Scheduled Date': applicant.scheduled_date || 'N/A',
      'Next Scheduled Time': applicant.scheduled_time || 'N/A',
      'Oath Taking Date': applicant.oath_taking_date || 'N/A',
      'Evaluation Remarks': applicant.evaluation_remarks || 'N/A',
      
      // Screening & Assessment Results
      'BMI Height (cm)': applicant.bmi_height || 'N/A',
      'BMI Weight (kg)': applicant.bmi_weight || 'N/A',
      'BMI Result': applicant.bmi_result || 'N/A',
      'PAT Score (%)': applicant.pat_score || 'N/A',
      'Neuro/Psych Results': applicant.psychological_result || 'N/A',
      'Medical Findings': applicant.medical_result || 'N/A',
      'Drug Test Result': applicant.drug_test_result || 'N/A',
      'Final Interview Score (%)': applicant.final_interview_score || 'N/A',
      
      // Metadata
      'Registration Date': applicant.created_at
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Master Applicant List");

    const wscols = [
      {wch: 15}, {wch: 20}, {wch: 20}, {wch: 20}, {wch: 5}, {wch: 10}, 
      {wch: 30}, {wch: 15}, {wch: 10}, {wch: 20}, {wch: 15}, {wch: 15},
      {wch: 30}, {wch: 30}, {wch: 15}, {wch: 15}, 
      {wch: 25}, {wch: 30}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 40},
      {wch: 15}, {wch: 15}, {wch: 15}, {wch: 15}, {wch: 40}, {wch: 40}, {wch: 15}, {wch: 20},
      {wch: 15}
    ];
    worksheet['!cols'] = wscols;

    // Generate and download
    const fileName = `Applicant_Master_Report_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

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
            <option value="Qualified">Qualified</option>
            <option value="Accepted">Accepted</option>
            <option value="Body Mass Index">Body Mass Index</option>
            <option value="Physical Agility Test">Physical Agility Test</option>
            <option value="Neuro Examination">Neuro Examination</option>
            <option value="Medical">Medical</option>
            <option value="Drug Test">Drug Test</option>
            <option value="Final Interview">Final Interview</option>
            <option value="Oath Taking">Oath Taking</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
          </select>

          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-all shadow-sm active:scale-95 text-sm font-medium"
            title="Export to Excel"
          >
            <RiFileExcel2Line size={24}/>
            Export to Excel
          </button>
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
                <th scope="col" className="th text-center">Applied On</th>
                <th scope="col" className="th">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                 <td colSpan="9" className="px-4 py-10">
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
                  <td colSpan="9" className="py-10 text-gray-500 italic">
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
