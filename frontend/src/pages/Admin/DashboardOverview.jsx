import React, { useEffect, useState } from 'react'
import { api } from '../../../api/api'
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts'

function DashboardOverview() {
  const [users, setUsers] = useState([])
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Analytics States
  const [statusData, setStatusData] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [selectedYear, setSelectedYear] = useState('All')
  const [years, setYears] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [metrics, setMetrics] = useState({
    genderData: [],
    ageData: [],
    programData: [],
    schoolData: [],
    assessmentData: []
  })

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [applicantsRes, usersRes] = await Promise.all([
          api.get('users/get_applicant_info/'),
          api.get('users/get_user/')
        ])
        
        const applicantsData = applicantsRes.data
        setApplicants(applicantsData)
        setUsers(usersRes.data)
        
        // Extract unique years from created_at timestamp
        const uniqueYears = [
          ...new Set(
            applicantsData
              .map(a => a.created_at ? new Date(a.created_at).getFullYear() : null)
              .filter(Boolean)
          )
        ].sort((a, b) => b - a)
        
        setYears(uniqueYears)
        processMetrics(applicantsData, 'All')
      } catch (err) {
        console.error("Error fetching dashboard overview data:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboardData()
  }, [])

  const processMetrics = (allData, yearFilter) => {
    let data = allData
    if (yearFilter !== 'All') {
      data = allData.filter(a => {
        if (!a.created_at) return false
        return new Date(a.created_at).getFullYear() === parseInt(yearFilter)
      })
    }
    
    // 1. Status Breakdown
    const statuses = {
      'New Applicant': 0,
      'Screening': 0,
      'Qualified': 0,
      'Accepted': 0,
      'Rejected': 0,
      'Oath Taking': 0 // Added Oath Taking tracker
    }
    const screeningStages = ['Document Review', 'Initial Screening', 'Technical Interview']
    
    data.forEach(a => {
      if (a.status === 'New Applicant') statuses['New Applicant']++
      else if (screeningStages.includes(a.status)) statuses['Screening']++
      else if (a.status === 'Qualified') statuses['Qualified']++
      else if (a.status === 'Accepted') statuses['Accepted']++
      else if (a.status === 'Rejected') statuses['Rejected']++
      else if (a.status === 'Oath Taking') statuses['Oath Taking']++ // Processes explicit Oath Taking values
      else if (a.status === 'Body Mass Index') statuses['BMI'] = (statuses['BMI'] || 0) + 1
      else if (a.status === 'Physical Agility Test') statuses['PAT'] = (statuses['PAT'] || 0) + 1
      else if (a.status === 'Neuro Examination') statuses['Neuro'] = (statuses['Neuro'] || 0) + 1
      else if (a.status === 'Medical') statuses['Medical'] = (statuses['Medical'] || 0) + 1
      else if (a.status === 'Drug Test') statuses['Drug Test'] = (statuses['Drug Test'] || 0) + 1
      else if (a.status === 'Final Interview') statuses['Final Interview'] = (statuses['Final Interview'] || 0) + 1
    })
    
    setStatusData(Object.keys(statuses).map(name => ({ name, value: statuses[name] })))
    setStatusCounts(statuses)

    // 2. Monthly Registration
    const monthlyCount = {}
    data.forEach(a => {
      if (a.created_at) {
        const date = new Date(a.created_at)
        const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' })
        monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1
      }
    })
    setMonthlyData(Object.keys(monthlyCount).map(month => ({ month, applicants: monthlyCount[month] })))

    // 3. Gender Distribution
    const genderCount = {}
    data.forEach(a => {
      const g = a.gender || 'Not Specified'
      genderCount[g] = (genderCount[g] || 0) + 1
    })
    const genderData = Object.keys(genderCount).map(key => ({ name: key, value: genderCount[key] }))

    // 4. Age Distribution
    const ageGroups = { '18-22': 0, '23-27': 0, '28-32': 0, '33+': 0 }
    data.forEach(a => {
      const age = parseInt(a.age)
      if (age <= 22) ageGroups['18-22']++
      else if (age <= 27) ageGroups['23-27']++
      else if (age <= 32) ageGroups['28-32']++
      else ageGroups['33+']++
    })
    const ageData = Object.keys(ageGroups).map(key => ({ range: key, count: ageGroups[key] }))

    // 5. Program & School Distribution (Top 5)
    const getTop5 = (attr) => {
      const counts = {}
      data.forEach(a => {
        const val = a[attr] || 'Other'
        counts[val] = (counts[val] || 0) + 1
      })
      return Object.keys(counts)
        .map(name => ({ name, count: counts[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }

    const assessmentStages = [
      { name: 'New', status: 'New Applicant' },
      { name: 'Docs', status: 'Document Review' },
      { name: 'Screening', status: 'Initial Screening' },
      { name: 'BMI', status: 'Body Mass Index' },
      { name: 'PAT', status: 'Physical Agility Test' },
      { name: 'Neuro', status: 'Neuro Examination' },
      { name: 'Medical', status: 'Medical' },
      { name: 'Drug Test', status: 'Drug Test' },
      { name: 'F. Interview', status: 'Final Interview' },
      { name: 'Oath Taking', status: 'Oath Taking' }
    ]

    const assessmentData = assessmentStages.map((stage) => {
      const count = data.filter(a => a.status === stage.status).length
      return { name: stage.name, completed: count }
    })

    setMetrics({
      genderData,
      ageData,
      programData: getTop5('program'),
      schoolData: getTop5('name_of_school'),
      assessmentData
    })
  }

  const user_length = users.length
  const applicant_length = applicants.length
  
  // Expanded CHART_COLORS to support the extra status category smoothly
  const CHART_COLORS = ['#2C2D86', '#EB612A', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6']

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-[#2C2D86]/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[#2C2D86] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[#2C2D86] font-medium tracking-wide">Loading Dashboard Overview...</p>
      </div>
    )
  }

  const handleYearChange = (e) => {
    const val = e.target.value
    setSelectedYear(val)
    processMetrics(applicants, val)
  }

  return (
    <div className='module-content'>
      <div className="flex justify-between items-center mb-6 lg:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500">System metrics and recruitment analytics at a glance.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Filter by Year:</label>
          <select 
            value={selectedYear} 
            onChange={handleYearChange}
            className="bg-white border border-gray-200 rounded px-4 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#2C2D86] shadow-sm"
          >
            <option value="All">All Years</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className='System-overview-container'>
        <h3 className="text-lg font-semibold mb-4 text-[#2C2D86]">System Summary</h3>
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
              <span className='summary-label'>Successful Applicants</span>
              <span className='summary-value'>{statusCounts['Accepted']}</span>
            </div>
          </div>
          <div className='admin-summary-card rejected'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Disqualified</span>
              <span className='summary-value'>{statusCounts['Rejected']}</span>
            </div>
          </div>
          {/* New Oath Taking visual metric card block */}
          <div className='admin-summary-card oath-taking'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Oath Taking</span>
              <span className='summary-value'>{statusCounts['Oath Taking'] || 0}</span>
            </div>
          </div>
          <div className='admin-summary-card bmi'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>BMI</span>
              <span className='summary-value'>{statusCounts['BMI'] || 0}</span>
            </div>
          </div>
          <div className='admin-summary-card pat'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>PAT</span>
              <span className='summary-value'>{statusCounts['PAT'] || 0}</span>
            </div>
          </div>
          <div className='admin-summary-card psych'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Neuro</span>
              <span className='summary-value'>{statusCounts['Neuro'] || 0}</span>
            </div>
          </div>
          <div className='admin-summary-card medical'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Medical</span>
              <span className='summary-value'>{statusCounts['Medical'] || 0}</span>
            </div>
          </div>
          <div className='admin-summary-card drug-test'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Drug Test</span>
              <span className='summary-value'>{statusCounts['Drug Test'] || 0}</span>
            </div>
          </div>
          <div className='admin-summary-card final-interview'>
            <div className='flex flex-col-reverse items-center'>
              <span className='summary-label'>Final Interview</span>
              <span className='summary-value'>{statusCounts['Final Interview'] || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mt-6 lg:mt-8'>
        
        {/* Row 1: Status and Monthly */}
        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Applicant Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%" cy="50%"
                innerRadius={60} outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Monthly Applicant Registration</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="applicants" fill="#2C2D86" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Row 2: Demographics */}
        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Gender Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.genderData}
                cx="50%" cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {metrics.genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Age Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.ageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="count" fill="#EB612A" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Row 3: Education (Top 5) */}
        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Top 5 Programs</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.programData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="count" fill="#2C2D86" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Top 5 Schools</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics.schoolData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 11}} />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Full Width: Pipeline */}
        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2'>
          <h3 className='mb-2 text-[#2C2D86] font-semibold'>Assessment Pipeline Progress</h3>
          <p className="text-sm text-gray-500 mb-6">Volume of applicants processed through key assessment stages.</p>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={metrics.assessmentData}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2C2D86" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#2C2D86" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                interval={0} 
                angle={-45} 
                textAnchor="end" 
                height={60} 
                tick={{fontSize: 12}}
              />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="completed" 
                stroke="#2C2D86" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorComp)" 
                name="Applicants"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}

export default DashboardOverview