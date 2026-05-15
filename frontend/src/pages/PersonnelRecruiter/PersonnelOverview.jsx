import React, { useEffect, useState } from 'react'
import { api } from '../../../api/api'
import { 
  PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Cell, AreaChart, Area 
} from 'recharts'

function PersonnelOverview() {
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Analytics States
  const [statusData, setStatusData] = useState([])
  const [statusCounts, setStatusCounts] = useState({})
  const [selectedBatch, setSelectedBatch] = useState('All')
  const [batches, setBatches] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [metrics, setMetrics] = useState({
    genderData: [],
    ageData: [],
    programData: [],
    schoolData: [],
    assessmentData: [],
    pendingEvaluations: 0,
    scheduledToday: 0
  })

  useEffect(() => {
    const fetchPersonnelData = async () => {
      try {
        const response = await api.get('users/get_applicant_info/')
        const data = response.data
        setApplicants(data)
        
        // Extract unique batches
        const uniqueBatches = [...new Set(data.map(a => a.batch || 1))].sort((a, b) => b - a)
        setBatches(uniqueBatches)
        
        processMetrics(data, 'All')
      } catch (err) {
        console.error('Error fetching personnel overview data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPersonnelData()
  }, [])

  const processMetrics = (allData, batchFilter) => {
    let data = allData
    if (batchFilter !== 'All') {
      data = allData.filter(a => (a.batch || 1) === parseInt(batchFilter))
    }
    
    // 1. Status Breakdown
    const statuses = {
      'New Applicant': 0,
      'Screening': 0,
      'Qualified': 0,
      'Accepted': 0,
      'Rejected': 0,
      'BMI': 0,
      'PAT': 0,
      'Psych': 0,
      'Medical': 0,
      'Drug Test': 0,
      'Final Interview': 0
    }
    const screeningStages = ['Document Review', 'Initial Screening', 'Technical Interview']
    
    data.forEach(a => {
      if (a.status === 'New Applicant') statuses['New Applicant']++
      else if (screeningStages.includes(a.status)) statuses['Screening']++
      else if (a.status === 'Qualified') statuses['Qualified']++
      else if (a.status === 'Accepted') statuses['Accepted']++
      else if (a.status === 'Rejected') statuses['Rejected']++
      else if (a.status === 'Body Mass Index') statuses['BMI']++
      else if (a.status === 'Physical Agility Test') statuses['PAT']++
      else if (a.status === 'Neuro Examination') statuses['Psych']++
      else if (a.status === 'Medical') statuses['Medical']++
      else if (a.status === 'Drug Test') statuses['Drug Test']++
      else if (a.status === 'Final Interview') statuses['Final Interview']++
    })
    
    // 1.5 Workload Metrics (Actionable)
    const today = new Date().toISOString().split('T')[0]
    const pendingEvaluations = data.filter(a => 
      ['Body Mass Index', 'Physical Agility Test', 'Neuro Examination', 'Medical', 'Drug Test', 'Final Interview'].includes(a.status)
    ).length
    const scheduledToday = data.filter(a => a.scheduled_date === today).length
    
    setStatusData(Object.keys(statuses)
      .filter(key => statuses[key] > 0 || ['New Applicant', 'Screening', 'Qualified', 'Accepted', 'Rejected'].includes(key))
      .map(name => ({ name, value: statuses[name] }))
    )
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

    // 6. Assessment Pipeline (Non-cumulative as per user request)
    const assessmentStages = [
      { name: 'New', status: 'New Applicant' },
      { name: 'Docs', status: 'Document Review' },
      { name: 'Screening', status: 'Initial Screening' },
      { name: 'Interview', status: 'Technical Interview' },
      { name: 'BMI', status: 'Body Mass Index' },
      { name: 'PAT', status: 'Physical Agility Test' },
      { name: 'Psych', status: 'Neuro Examination' },
      { name: 'Medical', status: 'Medical' },
      { name: 'Drug Test', status: 'Drug Test' },
      { name: 'F. Interview', status: 'Final Interview' }
    ]

    const assessmentData = assessmentStages.map((stage) => ({
      name: stage.name,
      completed: data.filter(a => a.status === stage.status).length
    }))

    setMetrics({
      genderData,
      ageData,
      programData: getTop5('program'),
      schoolData: getTop5('name_of_school'),
      assessmentData,
      pendingEvaluations,
      scheduledToday
    })
  }

  const CHART_COLORS = ['#2C2D86', '#EB612A', '#10B981', '#F59E0B', '#6366F1']

  if (loading) return <div className='p-10 text-center'>Loading Personnel Overview...</div>

  const handleBatchChange = (e) => {
    const val = e.target.value
    setSelectedBatch(val)
    processMetrics(applicants, val)
  }

  return (
    <div className='module-content'>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Personnel Dashboard Overview</h2>
          <p className="text-gray-500">Recruitment progress and applicant analytics.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
          <label className="text-sm font-bold text-gray-600 uppercase tracking-tight">Filter by Batch:</label>
          <select 
            value={selectedBatch} 
            onChange={handleBatchChange}
            className="bg-white border border-gray-200 rounded px-4 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#2C2D86] shadow-sm"
          >
            <option value="All">All Batches</option>
            {batches.map(b => (
              <option key={b} value={b}>Batch {b}</option>
            ))}
          </select>
        </div>
      </div>

      <div className='personnel-stats'>
        <div className='stat-card total-applications'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>Total Applications</span>
            <span className='summary-value text-xl font-bold'>{applicants.length}</span>
          </div>
        </div>
        
        <div className='stat-card new-applicants'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>New Applicants</span>
            <span className='summary-value text-xl font-bold'>{statusCounts['New Applicant']}</span>
          </div>
        </div>

        <div className='stat-card under-review'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>Screening</span>
            <span className='summary-value text-xl font-bold'>{statusCounts['Screening']}</span>
          </div>
        </div>

        <div className='stat-card qualified'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>Qualified</span>
            <span className='summary-value text-xl font-bold'>{statusCounts['Qualified']}</span>
          </div>
        </div>

        <div className='stat-card accepted'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>Accepted</span>
            <span className='summary-value text-xl font-bold'>{statusCounts['Accepted']}</span>
          </div>
        </div>

        <div className='stat-card rejected'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>Rejected</span>
            <span className='summary-value text-xl font-bold'>{statusCounts['Rejected']}</span>
          </div>
        </div>

        {/* Assessment Stages */}
        <div className='stat-card bmi'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>BMI</span>
            <span className='summary-value text-xl font-bold'>{statusCounts['BMI']}</span>
          </div>
        </div>
        <div className='stat-card pat'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>PAT</span>
            <span className='summary-value text-xl font-bold'>{statusCounts['PAT']}</span>
          </div>
        </div>
        <div className='stat-card drug-test'>
          <div className='flex flex-col-reverse items-center'>
            <span className='summary-label'>Drug Test</span>
            <span className='summary-value text-xl font-bold'>{statusCounts['Drug Test']}</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mt-8'>
        
        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Status Distribution</h3>
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
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Monthly Registrations</h3>
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

        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100'>
          <h3 className='mb-4 text-[#2C2D86] font-semibold'>Gender Breakdown</h3>
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

        <div className='chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2'>
          <h3 className='mb-2 text-[#2C2D86] font-semibold'>Assessment Pipeline Progress</h3>
          <p className="text-sm text-gray-500 mb-6">Current volume of applicants at each recruitment stage.</p>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={metrics.assessmentData}>
              <defs>
                <linearGradient id="colorCompP" x1="0" y1="0" x2="0" y2="1">
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
                fill="url(#colorCompP)" 
                name="Applicants"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  )
}

export default PersonnelOverview
