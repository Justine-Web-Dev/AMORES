import React, { useState, useEffect } from 'react';
import { api } from '../../api/api';
import { FiBell, FiX } from "react-icons/fi";

function NotificationModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await api.get('users/notifications/');
      setNotifications(response.data);
      // Update last seen to current highest ID
      if (response.data.length > 0) {
        localStorage.setItem('lastSeenNotificationId', response.data[0].id);
        // Custom event so the bell icon can update its unread dot if needed
        window.dispatchEvent(new Event('notifications:read'));
      }
    } catch (err) {
      console.error("Error fetching notifications", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[800] bg-black/20 flex items-start justify-end p-4 md:p-6 transition-opacity'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col h-[75vh] md:h-[600px] overflow-hidden animate-[slideInRight_0.25s_ease-out] border border-gray-100'>
        <div className='flex justify-between items-center p-5 border-b border-gray-100 bg-white sticky top-0 z-10'>
          <h2 className='text-lg font-bold text-gray-900 flex items-center gap-2.5 tracking-tight'>
            <div className='bg-[#23246e]/10 p-2 rounded-full'>
              <FiBell className='text-[#23246e]' size={18} />
            </div>
            Notifications
          </h2>
          <button 
            onClick={onClose} 
            className='p-1.5 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors'
          >
            <FiX size={20} />
          </button>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-3 bg-[#f8fafc]'>
          {loading ? (
            <div className='flex flex-col items-center justify-center h-40 gap-3'>
              <div className='w-6 h-6 border-2 border-[#23246e] border-t-transparent rounded-full animate-spin'></div>
              <p className='text-sm text-gray-500 font-medium'>Loading activity...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-40 text-center'>
              <div className='bg-gray-100 p-4 rounded-full mb-3'>
                <FiBell className='text-gray-300' size={24} />
              </div>
              <p className='text-sm text-gray-500 font-medium'>You're all caught up!</p>
              <p className='text-xs text-gray-400 mt-1'>No recent activity to show.</p>
            </div>
          ) : (
            notifications.map((notif, index) => (
              <div 
                key={notif.id} 
                className='bg-white p-4 rounded-xl border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_2px_15px_-3px_rgba(6,81,237,0.1)] transition-all flex flex-col gap-2 animate-[slideInRight_0.4s_ease-out_both]'
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <p className='text-sm text-gray-800 leading-relaxed font-medium'>{notif.message}</p>
                <div className='flex justify-between items-center mt-1 border-t border-gray-50 pt-3'>
                  <span className={`text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full ${
                    notif.notification_type === 'NEW_APPLICANT' 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'bg-indigo-50 text-indigo-600'
                  }`}>
                    {notif.notification_type === 'NEW_APPLICANT' ? 'New Applicant' : 'Evaluation Update'}
                  </span>
                  <span className='text-[11px] font-medium text-gray-400'>
                    {new Date(notif.created_at).toLocaleDateString()} at {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationModal;