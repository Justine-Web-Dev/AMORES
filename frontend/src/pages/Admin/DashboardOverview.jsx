import React, { useEffect, useState } from 'react'
import {api} from '../../../api/api'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

function DashboardOverview() {
  const [users, setUsers] = useState([])
  const [applicants, setApplicants] = useState([])
  const [statusData, setStatusData] = useState([])
  const [statusCounts, setStatusCounts] = useState({
    'New Applicant': 0,
    'Screening': 0,
    'Qualified': 0,
    'Accepted': 0,
    'Rejected': 0
  })
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    const fetchApplicantLength = async () => {
      const response = await api.get('users/get_applicant_info/')
      setApplicants(response.data)
      
      const statuses = {
        'New Applicant': 0,
        'Screening': 0,
        'Qualified': 0,
        'Accepted': 0,
        'Rejected': 0
      }

      const screeningStages = [
        'Document Review',
        'Initial Screening',
        'Technical Interview'
      ]
      
      response.data.forEach(applicant => {
        if (applicant.status === 'New Applicant') {
          statuses['New Applicant']++
        } else if (screeningStages.includes(applicant.status)) {
          statuses['Screening']++
        } else if (applicant.status === 'Qualified') {
          statuses['Qualified']++
        } else if (applicant.status === 'Accepted') {
          statuses['Accepted']++
        } else if (applicant.status === 'Rejected') {
          statuses['Rejected']++
        }
      })
      
      const statusChartData = Object.keys(statuses).map(status => ({
        name: status,
        value: statuses[status]
      }))
      setStatusData(statusChartData)
      setStatusCounts(statuses)
      
      // Process monthly data
      const monthlyCount = {}
      response.data.forEach(applicant => {
        if (applicant.created_at) {
          const date = new Date(applicant.created_at)
          const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' })
          monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1
        }
      })
      
      const monthlyChartData = Object.keys(monthlyCount).map(month => ({
        month: month,
        applicants: monthlyCount[month]
      }))
      setMonthlyData(monthlyChartData)
    }
    fetchApplicantLength()

    const fetchUsers = async () => {
      const response = await api.get("users/get_user/")
      setUsers(response.data)
      console.log(response.data)
    }
    fetchUsers()
  }, [])

  const user_length = users.filter(user => user).length
  const applicant_length = applicants.filter(applicant => applicant).length

  const COLORS = ['#2196F3', '#FFC107', '#6366F1', '#10B981', '#F43F5E']

  return (
    <div className='module-content'>
      <h2>Dashboard Overview</h2>

      <div className='System-overview-container mt-8'>
        <h3>System Overview</h3>
        <div className='stat-card-container top-summary-cards'>
          <div className='admin-summary-card users'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Users</span>
              <span className='summary-value'>{user_length}</span>
            </div>
          </div>
          <div className='admin-summary-card total-applicants'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Total Applicants</span>
              <span className='summary-value'>{applicant_length}</span>
            </div>
          </div>
          <div className='admin-summary-card new-applicants'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>New Applicants</span>
              <span className='summary-value'>{statusCounts['New Applicant']}</span>
            </div>
          </div>
          <div className='admin-summary-card under-review'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Screening</span>
              <span className='summary-value'>{statusCounts['Screening']}</span>
            </div>
          </div>
          <div className='admin-summary-card accepted'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Qualified</span>
              <span className='summary-value'>{statusCounts['Qualified']}</span>
            </div>
          </div>
          <div className='admin-summary-card accepted'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Accepted</span>
              <span className='summary-value'>{statusCounts['Accepted']}</span>
            </div>
          </div>
          <div className='admin-summary-card rejected'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Rejected</span>
              <span className='summary-value'>{statusCounts['Rejected']}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className='charts-container grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8'>
        
        {/* Pie Chart for Applicant Status */}
        <div className='chart-card bg-white p-6 rounded-xl shadow-md border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold text-lg'>Applicant Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart for Monthly Applicants */}
        <div className='chart-card bg-white p-6 rounded-xl shadow-md border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold text-lg'>Monthly Applicant Registration</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="applicants" 
                fill="#2C2D86" 
                name="Applicants" 
                radius={[4, 4, 0, 0]} 
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview
