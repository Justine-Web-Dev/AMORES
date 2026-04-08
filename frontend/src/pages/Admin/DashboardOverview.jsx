import React, { useEffect, useState } from 'react'
import {api} from '../../../api/api'
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

function DashboardOverview() {
  const [users, setUsers] = useState([])
  const [applicants, setApplicants] = useState([])
  const [statusData, setStatusData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    const fetchApplicantLength = async () => {
      const response = await api.get('users/get_applicant_info/')
      setApplicants(response.data)
      
      // Process status data for pie chart
      const statuses = {
        'New Applicant': 0,
        'Under Review': 0,
        'Accepted': 0,
        'Rejected': 0
      }
      
      response.data.forEach(applicant => {
        if (applicant.status in statuses) {
          statuses[applicant.status]++
        }
      })
      
      const statusChartData = Object.keys(statuses).map(status => ({
        name: status,
        value: statuses[status]
      }))
      setStatusData(statusChartData)
      
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

  const COLORS = ['#2196F3', '#FFC107','#4CAF50' , '#F44336']

  return (
    <div className='module-content'>
      <h2>Dashboard Overview</h2>
      
      <div className='System-overview-container'>
        <h3>System Overview</h3>
        <div className='stat-card-container'>
          <div className="flex flex-col justify-center items-center total-users">
            <span className='text-[1.5rem]'>{user_length}</span>
            <span className='text-[#2C2D86] font-bold'>Users</span>
          </div>

          <div className="flex flex-col justify-center items-center total-applicants">
            <span className='text-[1.5rem]'>{applicant_length}</span>
            <span className='text-[#4A4DB8] font-bold'>Total Applicants</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className='charts-container' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
        
        {/* Pie Chart for Applicant Status */}
        <div className='chart-card' style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2C2D86', fontWeight: '600' }}>Applicant Status Distribution</h3>
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

        {/* Line Chart for Monthly Applicants */}
        <div className='chart-card' style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginBottom: '1rem', color: '#2C2D86', fontWeight: '600' }}>Monthly Applicant Registration</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="applicants" stroke="#EB612A" strokeWidth={2} dot={{ fill: '#EB612A' }} name="Applicants" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default DashboardOverview