import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { api } from '../../api/api';
import './GenerateReport.css';
import { FiDownload } from "react-icons/fi";

function GenerateReport() {
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  
  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('');

  // Specialized Selection Phase Pipeline 
  const STATUS_CHOICES = [
    'All',
    'New Applicant',
    'Qualified',
    'Accepted',
    'Rejected',
    'Body Mass Index',
    'Physical Agility Test',
    'Neuro Examination',
    'Medical',
    'Drug Test',
    'Final Interview',
    'Oath Taking',
  ];

  // Helper to format timestamps gracefully into readable dates (YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString;
    }
  };

  // Helper to style status badges dynamically depending on their evaluation tier
  const getStatusBadgeClass = (status) => {
    const base = "text-xs font-medium px-2.5 py-0.5 rounded border ";
    if (!status) return base + "bg-gray-100 text-gray-800 border-gray-200";
    
    switch (status) {
      case 'Accepted':
      case 'Oath Taking':
      case 'Qualified':
        return base + "bg-green-100 text-green-800 border-green-200";
      case 'Rejected':
        return base + "bg-red-100 text-red-800 border-red-200";
      case 'New Applicant':
        return base + "bg-blue-100 text-blue-800 border-blue-200";
      default:
        // Evaluation phase milestones (Medical, Neuro, Agility, etc.)
        return base + "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  const fetchApplicants = async () => {
    try {
      const response = await api.get('users/applicants/all/');
      setApplicants(response.data);
      setFilteredApplicants(response.data);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, []);

  useEffect(() => {
    let result = applicants;

    if (startDate) {
      result = result.filter(app => new Date(app.created_at) >= new Date(startDate));
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      result = result.filter(app => new Date(app.created_at) <= end);
    }

    if (statusFilter !== 'All') {
      result = result.filter(app => app.status === statusFilter);
    }

    if (batchFilter) {
      result = result.filter(app => app.batch && app.batch.toString() === batchFilter.toString());
    }

    setFilteredApplicants(result);
  }, [startDate, endDate, statusFilter, batchFilter, applicants]);

  const handleExport = () => {
    if (filteredApplicants.length === 0) {
      alert("No data to export!");
      return;
    }

    const exportData = filteredApplicants.map(app => ({
      'Tracking Code': app.tracking_code || 'N/A',
      'First Name': app.first_name || '',
      'Last Name': app.last_name || '',
      'Email': app.email || 'N/A',
      'Contact Number': app.contact_number || 'N/A',
      'Gender': app.gender || 'N/A',
      'Permanent Address': app.address || 'N/A',
      'Program': app.program || 'N/A',
      'Status': app.status || 'N/A',
      'Batch Number': app.batch || 'N/A',
      'Date Applied': formatDate(app.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants Report");
    
    XLSX.writeFile(workbook, `Applicants_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className='module-content'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex flex-col'>
          <h2 className='text-2xl font-bold text-gray-800'>Generate Report</h2>
          <p className='text-gray-500 text-sm'>Filter applicant data and export it to Excel format.</p>
        </div>
        <button 
          onClick={handleExport}
          className='flex justify-center gap-2 items-center w-[180px] h-[40px] bg-[#2C2D86] text-white rounded cursor-pointer hover:-translate-y-[2px] hover:shadow-lg transition font-medium'>
            <FiDownload size={18} />
            Export to Excel
        </button>
      </div>

      <div className='bg-white p-5 rounded-lg shadow-sm border border-gray-200 mb-6'>
        <h3 className='text-md font-semibold text-gray-700 mb-4 border-b border-gray-300 pb-2'>Filters</h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1 font-medium'>Start Date</label>
            <input 
              type='date' 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)}
              className='border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#2C2D86]'
            />
          </div>
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1 font-medium'>End Date</label>
            <input 
              type='date' 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)}
              className='border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#2C2D86]'
            />
          </div>
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1 font-medium'>Application Status</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className='border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#2C2D86]'
            >
              {STATUS_CHOICES.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div className='flex flex-col'>
            <label className='text-sm text-gray-600 mb-1 font-medium'>Batch Number</label>
            <input 
              type='number' 
              placeholder='e.g., 1'
              value={batchFilter} 
              onChange={(e) => setBatchFilter(e.target.value)}
              className='border border-gray-300 rounded p-2 text-sm focus:outline-none focus:border-[#2C2D86]'
            />
          </div>
        </div>
        <div className='flex justify-end mt-4'>
           <button 
              onClick={() => { setStartDate(''); setEndDate(''); setStatusFilter('All'); setBatchFilter(''); }}
              className='text-sm text-gray-500 hover:text-gray-800 underline cursor-pointer'
           >
              Clear Filters
           </button>
        </div>
      </div>

      <hr className='border-gray-300 my-4'/>

      <div className='my-4 overflow-x-auto rounded-t-lg border border-gray-200'>
        <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th scope="col" className="px-6 py-3 whitespace-nowrap">Tracking Code</th>
                <th scope="col" className="px-6 py-3">Applicant Name</th>
                <th scope="col" className="px-6 py-3">Program</th>
                <th scope="col" className="px-6 py-3 text-center">Batch</th>
                <th scope="col" className="px-6 py-3 text-center">Date Applied</th>
                <th scope="col" className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((app, index) => (
                <tr key={app.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{app.tracking_code || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{app.first_name || ''} {app.last_name || ''}</td>
                  <td className="px-6 py-4">{app.program || 'N/A'}</td>
                  <td className="px-6 py-4 text-center">{app.batch || 'N/A'}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">{formatDate(app.created_at)}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={getStatusBadgeClass(app.status)}>
                      {app.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-10 text-center text-gray-500 italic">
                    No applicants match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table> 
      </div>
      <div className='text-sm text-gray-500 mt-2 text-right'>
          Showing {filteredApplicants.length} {filteredApplicants.length === 1 ? 'applicant' : 'applicants'}
      </div>
    </div>
  );
}

export default GenerateReport;