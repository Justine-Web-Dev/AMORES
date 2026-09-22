import React, { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import { FiBell, FiX } from "react-icons/fi";

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // Initial fetch to establish the "last seen" ID
    const initFetch = async () => {
      try {
        const response = await api.get(`users/notifications/?t=${new Date().getTime()}`);
        if (response.data.length > 0) {
          const latestId = response.data[0].id;
          if (!localStorage.getItem('lastToastNotificationId')) {
            localStorage.setItem('lastToastNotificationId', latestId.toString());
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    initFetch();

    // Poll every 15 seconds for new notifications
    const interval = setInterval(async () => {
      try {
        const response = await api.get(`users/notifications/?t=${new Date().getTime()}`);
        if (response.data.length > 0) {
          const currentLatest = response.data[0];
          const lastSeenId = parseInt(localStorage.getItem('lastToastNotificationId') || '0', 10);
          
          if (currentLatest.id > lastSeenId) {
            // New notification found!
            localStorage.setItem('lastToastNotificationId', currentLatest.id.toString());
            window.dispatchEvent(new Event('notifications:unread')); // Update bell icon
            
            // Add to toasts
            setToasts(prev => [...prev, { ...currentLatest, uniqueId: Date.now() }]);
          }
        }
      } catch (err) {
        console.error("Error polling notifications", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.uniqueId !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        // Auto remove after 5 seconds
        setTimeout(() => removeToast(toast.uniqueId), 5000);

        return (
          <div 
            key={toast.uniqueId} 
            className="pointer-events-auto w-80 bg-white rounded-xl border border-gray-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden toast-slide-in"
          >
            <div className={`h-1.5 w-full ${toast.notification_type === 'NEW_APPLICANT' ? 'bg-blue-500' : 'bg-indigo-500'}`}></div>
            <div className="p-4 flex gap-3 items-start">
              <div className={`mt-0.5 p-2 rounded-full ${toast.notification_type === 'NEW_APPLICANT' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                <FiBell size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">
                  {toast.notification_type === 'NEW_APPLICANT' ? 'New Applicant' : 'Evaluation Update'}
                </p>
                <p className="text-sm text-gray-600 mt-1 leading-snug">{toast.message}</p>
              </div>
              <button onClick={() => removeToast(toast.uniqueId)} className="text-gray-400 hover:text-red-500 transition-colors">
                <FiX size={18} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
