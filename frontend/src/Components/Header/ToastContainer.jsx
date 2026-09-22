import React, { useState, useEffect } from 'react';
import { api } from '../../../api/api';
import { FiBell, FiX } from "react-icons/fi";

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    let ws = null;
    let reconnectTimeout = null;
    
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

    const connectWebSocket = () => {
      let wsBaseURL = api.defaults.baseURL.replace(/\/api\/?$/, '');
      if (wsBaseURL.startsWith('https://')) {
        wsBaseURL = wsBaseURL.replace('https://', 'wss://');
      } else if (wsBaseURL.startsWith('http://')) {
        wsBaseURL = wsBaseURL.replace('http://', 'ws://');
      }
      ws = new WebSocket(`${wsBaseURL}/ws/notifications/`);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.notification) {
            const newNotif = data.notification;
            const lastSeenId = parseInt(localStorage.getItem('lastToastNotificationId') || '0', 10);
            
            if (newNotif.id > lastSeenId) {
              localStorage.setItem('lastToastNotificationId', newNotif.id.toString());
              window.dispatchEvent(new Event('notifications:unread')); // Update bell icon
              
              // Add to toasts
              setToasts(prev => [...prev, { ...newNotif, uniqueId: Date.now() }]);
              // Trigger a re-fetch for the modal if needed
              window.dispatchEvent(new Event('notifications:refresh'));
            }
          }
        } catch (err) {
          console.error('Error parsing notification message', err);
        }
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected. Reconnecting in 3s...');
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (err) => {
        console.error('WebSocket encountered error:', err);
        ws.close();
      };
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null; // Prevent reconnect loop on unmount
        ws.close();
      }
    };
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
            <div className={`h-1.5 w-full ${toast.notification_type === 'NEW_APPLICANT' ? 'bg-blue-500' : toast.notification_type === 'SCHEDULED' ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
            <div className="p-4 flex gap-3 items-start">
              <div className={`mt-0.5 p-2 rounded-full ${toast.notification_type === 'NEW_APPLICANT' ? 'bg-blue-50 text-blue-600' : toast.notification_type === 'SCHEDULED' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                <FiBell size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-gray-900">
                  {toast.notification_type === 'NEW_APPLICANT' ? 'New Applicant' : toast.notification_type === 'SCHEDULED' ? 'Scheduled' : 'Evaluation Update'}
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
