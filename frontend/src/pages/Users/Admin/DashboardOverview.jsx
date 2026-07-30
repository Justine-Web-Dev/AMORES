import React, { useEffect, useState, useMemo } from "react";
import { api } from "../../../../api/api";
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  LabelList
} from "recharts";

function DashboardOverview() {
  const [users, setUsers] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytics States
  const [statusData, setStatusData] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedBatch, setSelectedBatch] = useState("All");
  const [years, setYears] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [metrics, setMetrics] = useState({
    genderData: [],
    ageData: [],
    programData: [],
    schoolData: [],
    provinceData: [],
    assessmentData: [],
  });
  const [filteredApplicantCount, setFilteredApplicantCount] = useState(0);

  const availableBatches = useMemo(() => {
    let filteredApplicants = applicants;
    if (selectedYear !== "All") {
      filteredApplicants = applicants.filter((a) => {
        if (!a.created_at) return false;
        return new Date(a.created_at).getFullYear() === parseInt(selectedYear);
      });
    }
    const uniqueBatches = [
      ...new Set(
        filteredApplicants
          .map((a) => a.batch)
          .filter(Boolean)
      ),
    ].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
    
    return uniqueBatches.slice(0, 2);
  }, [applicants, selectedYear]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [applicantsRes, usersRes] = await Promise.all([
          api.get("users/get_applicant_info/"),
          api.get("users/get_user/"),
        ]);

        const applicantsData = applicantsRes.data;
        setApplicants(applicantsData);
        setUsers(usersRes.data);

        const uniqueYears = [
          ...new Set(
            applicantsData
              .map((a) =>
                a.created_at ? new Date(a.created_at).getFullYear() : null,
              )
              .filter(Boolean),
          ),
        ].sort((a, b) => b - a);

        setYears(uniqueYears);
        processMetrics(applicantsData, "All", "All");
      } catch (err) {
        console.error("Error fetching dashboard overview data:", err);
      } finally {
        loading && setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const processMetrics = (allData, yearFilter, batchFilter) => {
    let data = allData;

    if (yearFilter !== "All") {
      data = data.filter((a) => {
        if (!a.created_at) return false;
        return new Date(a.created_at).getFullYear() === parseInt(yearFilter);
      });
    }

    if (batchFilter !== "All") {
      data = data.filter((a) => String(a.batch) === String(batchFilter));
    }
    
    setFilteredApplicantCount(data.length);

    const statuses = {
      "New Applicant": 0,
      Screening: 0,
      Qualified: 0,
      Accepted: 0,
      Failed: 0,
      "Oath Taking": 0,
    };

    const screeningStages = [
      "Technical Interview",
    ];

    data.forEach((a) => {
      if (a.status === "New Applicant") statuses["New Applicant"]++;
      else if (screeningStages.includes(a.status)) statuses["Screening"]++;
      else if (a.status === "Qualified") statuses["Qualified"]++;
      else if (a.status === "Accepted") statuses["Accepted"]++;
      else if (a.status === "Failed") statuses["Failed"]++;
      else if (a.status === "Oath Taking") statuses["Oath Taking"]++; 
      else if (a.status === "Body Mass Index")
        statuses["BMI"] = (statuses["BMI"] || 0) + 1;
      else if (a.status === "Physical Agility Test")
        statuses["PAT"] = (statuses["PAT"] || 0) + 1;
      else if (a.status === "Neuro Examination")
        statuses["Neuro"] = (statuses["Neuro"] || 0) + 1;
      else if (a.status === "Medical")
        statuses["Medical"] = (statuses["Medical"] || 0) + 1;
      else if (a.status === "Drug Test")
        statuses["Drug Test"] = (statuses["Drug Test"] || 0) + 1;
      else if (a.status === "Final Interview")
        statuses["Final Interview"] = (statuses["Final Interview"] || 0) + 1;
    });

    setStatusData(
      Object.keys(statuses)
        .filter((name) => statuses[name] > 0)
        .map((name) => {
          let displayName = name;
          if (name === "Accepted") displayName = "Successful Applicants";
          if (name === "Failed") displayName = "Disqualified";
          return { name: displayName, value: statuses[name] };
        })
    );
    setStatusCounts(statuses);

    const monthlyCount = {};
    data.forEach((a) => {
      if (a.created_at) {
        const date = new Date(a.created_at);
        const monthYear = date.toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        monthlyCount[monthYear] = (monthlyCount[monthYear] || 0) + 1;
      }
    });
    setMonthlyData(
      Object.keys(monthlyCount).map((month) => ({
        month,
        applicants: monthlyCount[month],
      })),
    );

    const genderCount = {};
    data.forEach((a) => {
      const g = a.gender || "Not Specified";
      genderCount[g] = (genderCount[g] || 0) + 1;
    });
    const genderData = Object.keys(genderCount).map((key) => ({
      name: key,
      value: genderCount[key],
    }));

    const ageGroups = { "18-22": 0, "23-27": 0, "28-32": 0, "33+": 0 };
    data.forEach((a) => {
      const age = parseInt(a.age);
      if (age <= 22) ageGroups["18-22"]++;
      else if (age <= 27) ageGroups["23-27"]++;
      else if (age <= 32) ageGroups["28-32"]++;
      else ageGroups["33+"]++;
    });
    const ageData = Object.keys(ageGroups).map((key) => ({
      range: key,
      count: ageGroups[key],
    }));

    const getTop5 = (attr, excludeOther = false) => {
      const counts = {};
      data.forEach((a) => {
        const val = a[attr];
        if (excludeOther && (!val || val === "Other")) return;
        
        const finalVal = val || "Other";
        counts[finalVal] = (counts[finalVal] || 0) + 1;
      });
      return Object.keys(counts)
        .map((name) => ({ name, count: counts[name] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    };

    const assessmentStages = [
      { name: "New", status: "New Applicant" },
      { name: "BMI", status: "Body Mass Index" },
      { name: "PAT", status: "Physical Agility Test" },
      { name: "Neuro", status: "Neuro Examination" },
      { name: "Medical", status: "Medical" },
      { name: "Drug Test", status: "Drug Test" },
      { name: "F. Interview", status: "Final Interview" },
      { name: "Oath Taking", status: "Oath Taking" },
    ];

    const assessmentData = assessmentStages.map((stage) => {
      const count = data.filter((a) => a.status === stage.status).length;
      return { name: stage.name, completed: count };
    });

    setMetrics({
      genderData,
      ageData,
      programData: getTop5("program"),
      schoolData: getTop5("name_of_school"),
      provinceData: getTop5("province", true),
      assessmentData,
    });
  };

  const user_length = users.length;
  const applicant_length = applicants.length;

  const CHART_COLORS = [
    "#2C2D86",
    "#EB612A",
    "#10B981",
    "#F59E0B",
    "#6366F1",
    "#8B5CF6",
    "#EC4899",
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex items-center justify-center w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-[#2C2D86]/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-t-[#2C2D86] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-[#2C2D86] font-medium tracking-wide">
          Loading Dashboard Overview...
        </p>
      </div>
    );
  }

  const handleYearChange = (e) => {
    const val = e.target.value;
    setSelectedYear(val);

    let newFilteredApplicants = applicants;
    if (val !== "All") {
      newFilteredApplicants = applicants.filter((a) => {
        if (!a.created_at) return false;
        return new Date(a.created_at).getFullYear() === parseInt(val);
      });
    }
    const newAvailableBatches = [
      ...new Set(
        newFilteredApplicants
          .map((a) => a.batch)
          .filter(Boolean)
      ),
    ].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true })).slice(0, 2);

    let newBatch = selectedBatch;
    if (selectedBatch !== "All" && !newAvailableBatches.includes(selectedBatch)) {
      newBatch = "All";
      setSelectedBatch("All");
    }
    
    processMetrics(applicants, val, newBatch);
  };

  const handleBatchChange = (e) => {
    const val = e.target.value;
    setSelectedBatch(val);
    processMetrics(applicants, selectedYear, val);
  };

  return (
    <div className="module-content">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 lg:mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
          <p className="text-gray-500">System metrics and recruitment analytics at a glance.</p>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-100 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-tight">Year:</label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="bg-white border border-gray-200 rounded px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#2C2D86] shadow-sm"
            >
              <option value="All">All Years</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-2 border-t md:border-t-0 pt-2 md:pt-0 target-border-gray-200">
            <label className="text-xs font-bold text-gray-600 uppercase tracking-tight">Batch:</label>
            <select
              value={selectedBatch}
              onChange={handleBatchChange}
              className="bg-white border border-gray-200 rounded px-3 py-1.5 text-sm font-medium outline-none focus:ring-2 focus:ring-[#2C2D86] shadow-sm"
            >
              <option value="All">All Batches</option>
              {availableBatches.map((batch) => <option key={batch} value={batch}>{batch}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="System-overview-container">
        <h3 className="text-lg font-semibold mb-4 text-[#2C2D86]">System Summary</h3>
        <div className="stat-card-container top-summary-cards">
          <div className="admin-summary-card users">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Users</span>
              <span className="summary-value">{user_length}</span>
            </div>
          </div>
          <div className="admin-summary-card total-applicants">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Total Applicants</span>
              <span className="summary-value">{filteredApplicantCount}</span>
            </div>
          </div>
          <div className="admin-summary-card new-applicants">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">New Applicants</span>
              <span className="summary-value">{statusCounts["New Applicant"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card under-review">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Screening</span>
              <span className="summary-value">{statusCounts["Screening"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card qualified">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Qualified</span>
              <span className="summary-value">{statusCounts["Qualified"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card accepted">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Successful Applicants</span>
              <span className="summary-value">{statusCounts["Accepted"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card rejected">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Disqualified</span>
              <span className="summary-value">{statusCounts["Failed"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card bmi">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">BMI</span>
              <span className="summary-value">{statusCounts["BMI"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card pat">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">PAT</span>
              <span className="summary-value">{statusCounts["PAT"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card psych">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Neuro</span>
              <span className="summary-value">{statusCounts["Neuro"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card medical">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Medical</span>
              <span className="summary-value">{statusCounts["Medical"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card drug-test">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Drug Test</span>
              <span className="summary-value">{statusCounts["Drug Test"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card final-interview">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Final Interview</span>
              <span className="summary-value">{statusCounts["Final Interview"] || 0}</span>
            </div>
          </div>
          <div className="admin-summary-card oath-taking">
            <div className="flex flex-col-reverse items-center">
              <span className="summary-label">Oath Taking</span>
              <span className="summary-value">{statusCounts["Oath Taking"] || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 mt-6 lg:mt-8">
        <div className="chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="mb-4 text-[#2C2D86] font-semibold">Applicant Status Distribution</h3>
          <ResponsiveContainer debounce={200} width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, value, percent }) => percent > 0 ? `${name}: ${value} (${(percent * 100).toFixed(0)}%)` : ""}
              >
                {statusData.map((entry, index) => {
                  const colors = {
                    'Disqualified': '#EF4444',
                    'Successful Applicants': '#166534',
                    'Qualified': '#22C55E',
                    'New Applicant': '#2196F3',
                    'Screening': '#FFC107',
                    'BMI': '#3B82F6',
                    'PAT': '#F97316',
                    'Neuro': '#8B5CF6',
                    'Medical': '#EC4899',
                    'Drug Test': '#F59E0B',
                    'Final Interview': '#14B8A6',
                    'Oath Taking': '#1E3A8A'
                  };
                  return <Cell key={`cell-${index}`} fill={colors[entry.name] || CHART_COLORS[index % CHART_COLORS.length]} />;
                })}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="mb-4 text-[#2C2D86] font-semibold">Monthly Applicant Registration</h3>
          <ResponsiveContainer debounce={200} width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="applicants" fill="#2C2D86" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="mb-4 text-[#2C2D86] font-semibold">Gender Distribution</h3>
          <ResponsiveContainer debounce={200} width="100%" height={300}>
            <PieChart>
              <Pie
                data={metrics.genderData}
                cx="50%"
                cy="50%"
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

        <div className="chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="mb-4 text-[#2C2D86] font-semibold">Age Distribution</h3>
          <ResponsiveContainer debounce={200} width="100%" height={300}>
            <BarChart data={metrics.ageData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="count" fill="#EB612A" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="mb-4 text-[#2C2D86] font-semibold">Top 5 Programs</h3>
          <ResponsiveContainer debounce={200} width="100%" height={300}>
            <BarChart data={metrics.programData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="count" fill="#2C2D86" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="mb-4 text-[#2C2D86] font-semibold">Top 5 Schools</h3>
          <ResponsiveContainer debounce={200} width="100%" height={300}>
            <BarChart data={metrics.schoolData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="count" fill="#6366F1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* CHANGED TO FULL WIDTH HORIZONTAL CHART LAYOUT */}
        <div className="chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2 transition-all hover:shadow-md">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-4 gap-2">
            <div>
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Geographic Breakdown: Top 5 Provinces</h3>
              <p className="text-xs text-gray-500 mt-0.5">Distribution of applicants based on regional data entries.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full w-fit">
              Filtered Submissions
            </span>
          </div>
          
          <div className="w-full min-h-[280px] bg-gray-50/40 p-4 rounded-xl border border-gray-100/50 flex items-center">
            <ResponsiveContainer debounce={200} width="100%" height={280}>
              <BarChart 
                data={metrics.provinceData} 
                layout="vertical"
                margin={{ top: 10, right: 40, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eef0f3" />
                <XAxis 
                  type="number" 
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12, fill: "#4B5563", fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(44, 45, 134, 0.04)", radius: 4 }}
                  contentStyle={{ 
                    backgroundColor: "#FFFFFF", 
                    border: "1px solid #E5E7EB", 
                    borderRadius: "8px",
                    fontSize: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Bar 
                  dataKey="count" 
                  fill="#2C2D86" 
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                >
                  <LabelList 
                    dataKey="count" 
                    position="right" 
                    className="fill-[#2C2D86] font-bold text-xs"
                    dx={10}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <h3 className="mb-2 text-[#2C2D86] font-semibold">Assessment Pipeline Progress</h3>
          <p className="text-sm text-gray-500 mb-6">Volume of applicants processed through key assessment stages.</p>
          <ResponsiveContainer debounce={200} width="100%" height={350}>
            <AreaChart data={metrics.assessmentData}>
              <defs>
                <linearGradient id="colorComp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2C2D86" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#2C2D86" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" interval={0} angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="completed" stroke="#2C2D86" strokeWidth={3} fillOpacity={1} fill="url(#colorComp)" name="Applicants" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;