import React, { useState, useEffect } from 'react'
import { api } from '../../../api/api'
import { FaSearch, FaFilter, FaHistory, FaUser, FaInfoCircle, FaCalendarAlt } from 'react-icons/fa'

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [searchTerm, actionFilter, logs]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/audit-logs/');
      setLogs(response.data);
      setFilteredLogs(response.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let tempLogs = logs;
    if (searchTerm) {
      tempLogs = tempLogs.filter(log => 
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.action?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (actionFilter !== 'All') {
      tempLogs = tempLogs.filter(log => log.action === actionFilter);
    }
    setFilteredLogs(tempLogs);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'LOGIN': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'USER_REGISTRATION': return 'bg-green-100 text-green-700 border-green-200';
      case 'STATUS_UPDATE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'SETTINGS_UPDATE': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'USER_DELETE': return 'bg-red-100 text-red-700 border-red-200';
      case 'APPLICANT_REGISTRATION': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'USER_UPDATE': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const uniqueActions = ['All', ...new Set(logs.map(log => log.action))];

  return (
    <div className='module-content p-6 min-h-screen bg-gray-50'>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-[#2C2D86] flex items-center gap-3">
            <FaHistory className="text-[#EB612A]" />
            Audit Logs
          </h2>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Track system activity and user actions across the platform.</p>
        </div>
        <button 
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md hover:bg-gray-50 transition-all font-medium disabled:opacity-50"
        >
          <div className={`${loading ? 'animate-spin' : ''}`}>↻</div>
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        {/* Filters Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 flex gap-2">
            <input 
              type="text" 
              placeholder="Search by user, action, or details..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent outline-none transition-all shadow-sm"
            />
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2 text-gray-600 font-medium">
              <FaFilter className="text-gray-400" />
              <span>Filter:</span>
            </div>
            <select 
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#2C2D86] outline-none transition-all shadow-sm min-w-[160px]"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 text-gray-500 uppercase text-xs font-bold tracking-wider">
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-[#2C2D86]/20 border-t-[#2C2D86] rounded-full animate-spin"></div>
                      <span className="text-gray-500 font-medium">Loading activity logs...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-700 text-sm">
                        <FaCalendarAlt className="text-gray-300" />
                        <span className="font-medium">{formatTimestamp(log.timestamp)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <div className="w-8 h-8 rounded-full bg-[#2C2D86]/10 flex items-center justify-center text-[#2C2D86]">
                          <FaUser size={12} />
                        </div>
                        {log.user || 'System'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2 max-w-md">
                        <FaInfoCircle className="text-gray-300 mt-1 flex-shrink-0" />
                        <span className="text-gray-600 text-sm leading-relaxed">{log.details}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <FaHistory size={48} className="mb-2 opacity-20" />
                      <p className="text-lg font-medium">No activity logs found</p>
                      <p className="text-sm">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Showing <span className="font-bold text-gray-700">{filteredLogs.length}</span> of <span className="font-bold text-gray-700">{logs.length}</span> activities
          </span>
        </div>
      </div>
    </div>
  )
}

export default AuditLogs