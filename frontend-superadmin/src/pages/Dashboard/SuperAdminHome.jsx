import React, { useState, useEffect, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import { api } from '../../../../frontend/api/api';
import {
  FaUsers, FaShieldAlt, FaServer, FaKey, FaHistory,
  FaDatabase, FaArrowRight, FaCheckCircle, FaExclamationTriangle,
  FaUserShield, FaChartLine, FaLock, FaBan, FaCog, FaGlobe, FaMemory, FaMicrochip
} from 'react-icons/fa';
import { FiShield, FiActivity } from 'react-icons/fi';

function SuperAdminHome() {
  const [users, setUsers] = useState([]);
  const [health, setHealth] = useState({ status: 'Connecting...', metrics: {} });
  const [recentLogs, setRecentLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Core metrics needed for the top of the dashboard to render
        const [usersRes, healthRes] = await Promise.allSettled([
          api.get('users/get_user/?archived=all'),
          api.get('users/system-health/'),
        ]);
        if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
        if (healthRes.status === 'fulfilled') setHealth(healthRes.value.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false); // Drop the loading screen as soon as core metrics arrive
      }

      // Load heavier lists silently in the background
      api.get('users/audit-logs/')
        .then(res => {
          setRecentLogs(res.data.slice(0, 6));
          setLogsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLogsLoading(false);
        });
      api.get('users/api-keys/').then(res => setApiKeys(res.data)).catch(console.error);
    };
    fetchAll();

    const healthInterval = setInterval(async () => {
      try {
        const res = await api.get('users/system-health/');
        setHealth(res.data);
      } catch (err) {
        console.error("Health poll failed", err);
      }
    }, 5000);

    return () => clearInterval(healthInterval);
  }, []);

  // Generate mock historical data based on the current live metric to demonstrate charting capabilities
  const generateChartData = (baseValue) => {
    const data = [];
    let current = baseValue;
    for (let i = 24; i >= 0; i--) {
      // Fluctuate randomly within +/- 15%
      const fluctuation = current * 0.15;
      const val = Math.max(0, current + (Math.random() * fluctuation * 2 - fluctuation));
      data.push({
        time: `${i}h ago`,
        value: Number(val.toFixed(2))
      });
      current = val;
    }
    return data.reverse();
  };

  const chartData = useMemo(() => {
    if (!health) return { cpu: [], memory: [] };
    return {
      cpu: generateChartData(health.metrics?.cpu_percent || 0),
      memory: generateChartData(health.metrics?.memory_percent || 0)
    };
  }, [health?.metrics?.cpu_percent]);

  // Derived metrics
  const activeUsers = users.filter(u => !u.is_archived).length;
  const totalUsers = users.length;
  const inactiveUsers = users.filter(u => u.is_archived).length;
  const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN').length;
  const admins = users.filter(u => u.role === 'Administrator').length;

  // Mock sparkline data for visual interest
  const mockSparkline = Array.from({ length: 12 }, (_, i) => ({
    v: Math.max(10, Math.round(Math.random() * 80 + 30))
  }));

  const parseJwt = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
    } catch { return null; }
  };
  const token = sessionStorage.getItem('token');
  const payload = parseJwt(token);
  const adminName = payload?.name || 'Super Admin';

  const getTimeGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getActionBadge = (action) => {
    const map = {
      'LOGIN': 'bg-blue-100 text-blue-700',
      'LOGOUT': 'bg-slate-100 text-slate-600',
      'USER_REGISTRATION': 'bg-green-100 text-green-700',
      'USER_UPDATE': 'bg-cyan-100 text-cyan-700',
      'USER_DELETE': 'bg-red-100 text-red-700',
      'BACKUP': 'bg-purple-100 text-purple-700',
    };
    return map[action] || 'bg-gray-100 text-gray-600';
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[500px] flex-col gap-4">
      <div className="w-14 h-14 border-4 border-[#2C2D86]/20 border-t-[#2C2D86] rounded-full animate-spin"></div>
      <p className="text-gray-400 font-medium text-sm">Loading Command Center...</p>
    </div>
  );

  return (
    <div className="p-6 w-full space-y-8">

      {/* ─── Hero Welcome Banner ─── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#2C2D86] via-[#3f40a3] to-[#5254b8] p-8 text-white shadow-xl">
        <div className="absolute -right-20 -top-20 w-72 h-72 bg-white/5 rounded-full"></div>
        <div className="absolute -right-4 -bottom-16 w-48 h-48 bg-white/5 rounded-full"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-1">{getTimeGreeting()}</p>
            <h1 className="text-3xl font-black mb-2">{adminName}</h1>
            <p className="text-indigo-200 text-sm">Super Admin Command Center &mdash; Full system governance and oversight.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-sm font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              System {health?.status || 'Online'}
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-2.5 text-sm font-semibold">
              <FiShield />
              Security Active
            </div>
          </div>
        </div>
      </div>

      {/* ─── KPI Stats Row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          {
            label: 'Total Users', value: totalUsers,
            icon: <FaUsers size={20} />, color: 'text-indigo-600', bg: 'bg-indigo-50',
            sub: `${totalUsers} total registered`, link: '/Dashboard/accounts'
          },
          {
            label: 'Active Users', value: activeUsers,
            icon: <FaShieldAlt size={20} />, color: 'text-green-600', bg: 'bg-green-50',
            sub: `${activeUsers} currently active`, link: '/Dashboard/accounts'
          },
          {
            label: 'Inactive Users', value: inactiveUsers,
            icon: <FaLock size={20} />, color: 'text-orange-600', bg: 'bg-orange-50',
            sub: `${inactiveUsers} deactivated`, link: '/Dashboard/accounts'
          },
          {
            label: 'Super Admins', value: superAdmins,
            icon: <FaUserShield size={20} />, color: 'text-purple-600', bg: 'bg-purple-50',
            sub: `${admins} Administrators`, link: '/Dashboard/accounts'
          },
        ].map(card => (
          <Link to={card.link} key={card.label}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className={`${card.bg} ${card.color} p-3 rounded-xl`}>{card.icon}</div>
              <FaArrowRight className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-black text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ─── System Health Detailed View ─── */}
      {health && (
        <div className="space-y-6 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FiActivity className="text-indigo-500" /> System Health & Operations
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Monitoring Active
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 lg:gap-6">
            <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-green-50 to-green-100 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-3 lg:gap-4 relative z-10">
                <div className={`p-3 lg:p-4 rounded-xl ${health.status === 'healthy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} shadow-sm shrink-0`}>
                  <FaServer size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1 truncate">Status</p>
                  <h3 className="text-lg lg:text-2xl font-black uppercase text-gray-800 truncate">{health.status}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-3 lg:gap-4 relative z-10">
                <div className="p-3 lg:p-4 rounded-xl bg-blue-100 text-blue-600 shadow-sm shrink-0">
                  <FaDatabase size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1 truncate">DB Latency</p>
                  <h3 className="text-lg lg:text-2xl font-black text-gray-800 truncate">{health.metrics?.db_latency_ms || 0} <span className="text-xs lg:text-sm font-medium text-gray-400">ms</span></h3>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-teal-50 to-teal-100 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-3 lg:gap-4 relative z-10">
                <div className="p-3 lg:p-4 rounded-xl bg-teal-100 text-teal-600 shadow-sm shrink-0">
                  <FaServer size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1 truncate">DB Storage</p>
                  <h3 className="text-lg lg:text-2xl font-black text-gray-800 truncate">{health.metrics?.db_size_mb || 0} <span className="text-xs lg:text-sm font-medium text-gray-400">MB</span></h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-purple-50 to-purple-100 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-3 lg:gap-4 relative z-10">
                <div className="p-3 lg:p-4 rounded-xl bg-purple-100 text-purple-600 shadow-sm shrink-0">
                  <FaMicrochip size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1 truncate">CPU Usage</p>
                  <h3 className="text-lg lg:text-2xl font-black text-gray-800 truncate">{health.metrics?.cpu_percent || 0}<span className="text-xs lg:text-sm font-medium text-gray-400">%</span></h3>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 lg:p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center gap-3 lg:gap-4 relative z-10">
                <div className="p-3 lg:p-4 rounded-xl bg-yellow-100 text-yellow-600 shadow-sm shrink-0">
                  <FaMemory size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[10px] lg:text-xs font-bold uppercase tracking-wider mb-1 truncate">RAM Usage</p>
                  <h3 className="text-lg lg:text-2xl font-black text-gray-800 truncate">{health.metrics?.memory_percent || 0}<span className="text-xs lg:text-sm font-medium text-gray-400">%</span></h3>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-6">CPU Utilization (24h)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.cpu} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#6b7280', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-6">Memory Utilization (24h)</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.memory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ca8a04" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ca8a04" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#6b7280', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#ca8a04" strokeWidth={2} fillOpacity={1} fill="url(#colorMem)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Quick Actions ─── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FaCog className="text-indigo-500" /> Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {[
            { label: 'User Management', icon: <FaUsers className="text-indigo-500" />, to: '/Dashboard/accounts', desc: 'Manage all users' },
            { label: 'Audit Trail', icon: <FaHistory className="text-blue-500" />, to: '/Dashboard/audit-logs', desc: 'View security logs' }
          ].map(action => (
            <Link
              key={action.label}
              to={action.to}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-colors group border border-gray-50 hover:border-indigo-100"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg group-hover:bg-white shadow-sm transition-colors">
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">{action.label}</p>
                <p className="text-xs text-gray-400">{action.desc}</p>
              </div>
              <FaArrowRight className="text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all flex-shrink-0" size={12} />
            </Link>
          ))}
        </div>
      </div>

      {/* ─── User Breakdown + Recent Audit Logs ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* User Role Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FaChartLine className="text-indigo-500" /> User Breakdown
            </h3>
            <Link to="/Dashboard/accounts" className="text-xs text-indigo-600 font-semibold hover:underline">View All</Link>
          </div>

          <div className="space-y-3">
            {[
              { role: 'Super Admin', count: users.filter(u => u.role === 'SUPER_ADMIN').length, color: '#7c3aed', bg: 'bg-purple-100' },
              { role: 'Administrator', count: users.filter(u => u.role === 'Administrator').length, color: '#2563eb', bg: 'bg-blue-100' },
              { role: 'Recruitment Personnel', count: users.filter(u => u.role === 'Recruitment Personnel').length, color: '#0891b2', bg: 'bg-cyan-100' },
              { role: 'Recruitment Screening Committee (Interviewer)', count: users.filter(u => u.role === 'Recruitment Screening Committee (Interviewer)').length, color: '#16a34a', bg: 'bg-green-100' },
            ].map(item => {
              const pct = totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0;
              return (
                <div key={item.role}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-600">{item.role}</span>
                    <span className="font-bold text-gray-800">{item.count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: item.color }}></div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 grid grid-cols-2 gap-3 text-center">
            <div className="bg-green-50 rounded-xl p-3">
              <p className="text-xl font-black text-green-600">{activeUsers}</p>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-wide mt-0.5">Active</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-3">
              <p className="text-xl font-black text-orange-500">{inactiveUsers}</p>
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wide mt-0.5">Inactive</p>
            </div>
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FaHistory className="text-blue-500" /> Recent Audit Activity
            </h3>
            <Link to="/Dashboard/audit-logs" className="text-xs text-indigo-600 font-semibold hover:underline flex items-center gap-1">
              Full Trail <FaArrowRight size={10} />
            </Link>
          </div>

          <div className="space-y-3">
            {logsLoading ? (
              // Skeleton Loader
              [...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl animate-pulse">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0 mt-0.5"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-4 bg-gray-200 rounded-full w-16"></div>
                      <div className="h-3 bg-gray-100 rounded-full w-24"></div>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
                  </div>
                  <div className="w-12 h-3 bg-gray-100 rounded-full flex-shrink-0"></div>
                </div>
              ))
            ) : recentLogs.length > 0 ? recentLogs.map(log => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-8 h-8 bg-[#2C2D86]/10 rounded-full flex items-center justify-center text-[#2C2D86] flex-shrink-0 mt-0.5">
                  <FaHistory size={12} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                    <span className="text-xs text-gray-400">{log.user || 'System'}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{log.details}</p>
                </div>
                <span className="text-[10px] text-gray-300 whitespace-nowrap flex-shrink-0">
                  {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <FaHistory size={28} className="mb-2 opacity-30" />
                <p className="text-sm">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>
      </div>



    </div>
  );
}

export default SuperAdminHome;
