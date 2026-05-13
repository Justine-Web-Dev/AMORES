import React, { useEffect, useState } from 'react'
import { api } from '../../../api/api'
import { PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

function PersonnelOverview() {
  const [applications, setApplications] = useState([])
  const [statusData, setStatusData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const response = await api.get('users/get_applicant_info/')
        const data = response.data
        setApplications(data)

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

        const monthlyCount = {}

        data.forEach(applicant => {
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

          if (applicant.created_at) {
            const date = new Date(applicant.created_at)
            const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' })
            monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1
          }
        })

        setStatusData(Object.keys(statuses).map(status => ({ name: status, value: statuses[status] })))
        setMonthlyData(Object.keys(monthlyCount).map(month => ({ month, applicants: monthlyCount[month] })))
      } catch (err) {
        console.error('Error fetching personnel applications:', err)
      }
    }

    fetchApplications()
  }, [])

  const screeningStages = [
    'Document Review',
    'Initial Screening',
    'Technical Interview'
  ]

  const application_length = applications.length
  const status_new_applicant = applications.filter(application => application.status === 'New Applicant').length
  const screeningCount = applications.filter(application => screeningStages.includes(application.status)).length
  const qualifiedCount = applications.filter(application => application.status === 'Qualified').length
  const acceptedCount = applications.filter(application => application.status === 'Accepted').length
  const rejectedCount = applications.filter(application => application.status === 'Rejected').length

  return (
    <div>
      <div className='module-content'>
        <h2>Personnel Dashboard Overview</h2>
        <p>Welcome to the Personnel Recruitment Dashboard</p>

        <div className='personnel-stats'>
          <div className='stat-card total-applications'>
            <h4 className='flex flex-col justify-center items-center'>
              <span className='text-[18px]'>{application_length}</span>
              Total Applications
            </h4>
          </div>
          
          <div className='stat-card new-applicants'>
            <h4 className='flex flex-col justify-center items-center'>
              <span className='text-[18px]'>{status_new_applicant}</span>
              New Applicants
            </h4>
          </div>

          <div className='stat-card under-review'>
            <h4 className='flex flex-col justify-center items-center'>
              <span className='text-[18px]'>{screeningCount}</span>
              Screening
            </h4>
          </div>

          <div className='stat-card accepted'>
            <h4 className='flex flex-col justify-center items-center'>
              <span className='text-[18px]'>{qualifiedCount}</span>
              Qualified
            </h4>
          </div>

          <div className='stat-card accepted'>
            <h4 className='flex flex-col justify-center items-center'>
              <span className='text-[18px]'>{acceptedCount}</span>
              Accepted
            </h4>
          </div>

          <div className='stat-card rejected'>
            <h4 className='flex flex-col justify-center items-center'>
              <span className='text-[18px]'>{rejectedCount}</span>
              Rejected
            </h4>
          </div>
        </div>

        <div className='charts-container' style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
          <div className='chart-card' style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#2C2D86', fontWeight: '600' }}>Applicant Status Distribution</h3>
            <ResponsiveContainer width='100%' height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx='50%'
                  cy='50%'
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill='#8884d8'
                  dataKey='value'
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#2196F3', '#FFC107', '#6366F1', '#10B981', '#F43F5E'][index % 5]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className='chart-card' style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '1rem', color: '#2C2D86', fontWeight: '600' }}>Monthly Applicant Registration</h3>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type='monotone' dataKey='applicants' stroke='#EB612A' strokeWidth={2} dot={{ fill: '#EB612A' }} name='Applicants' />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PersonnelOverview
