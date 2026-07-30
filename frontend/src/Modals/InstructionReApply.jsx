import React, { useState } from 'react'
import { api } from '../../api/api'

function InstructionReApply({ onClose, onProceed }) {
  const [trackingCode, setTrackingCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [retrievedData, setRetrievedData] = useState(null);

  const handleProceed = async () => {
    if (!trackingCode.trim()) {
      setError("Please enter your tracking code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Fetch application by tracking code
      const response = await api.get(`users/retrieve-application/?code=${trackingCode.toUpperCase()}`);
      if (response.data) {
        setRetrievedData(response.data);
        setShowSuccess(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Application not found or an error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-fade-in">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 sm:p-8 text-center animate-slide-up">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Data Retrieved Successfully!</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your previous application details have been loaded. You can now review and update them.
          </p>
          <button
            onClick={() => onProceed && onProceed(retrievedData)}
            className="w-full bg-[#2C2D86] text-white py-3 rounded-xl font-semibold hover:bg-[#1a1b52] transition-colors"
          >
            Continue to Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8 relative animate-slide-up">
        
        {/* Header */}
        <header className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#2C2D86] bg-[#2C2D86]/10 px-3 py-1 rounded-full">
            Re-application
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">
            Retrieve Your Previous Application
          </h2>
        </header>

        {/* Content Section */}
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            To retrieve your previous application, we'll need your tracking code. Don't worry this helps us securely load your existing information so you won't have to enter everything again.
          </p>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Tracking Code
            </label>
            <input
              type="text"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
              placeholder="e.g. TA-12345678"
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
            />
            {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
          </div>

          {/* Help Callout */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
              Can't find your code?
            </h3>
            <p className="text-xs text-amber-800 mt-1">
              Check the email you used for your first application. The tracking code is included in your application confirmation email.
            </p>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition-colors text-sm disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="button"
            onClick={handleProceed}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl font-semibold text-white bg-[#2C2D86] hover:bg-[#23246b] transition-all shadow-sm text-sm disabled:opacity-50 flex items-center justify-center min-w-[100px]"
          >
            {loading ? 'Retrieving...' : 'Retrieve'}
          </button>
        </div>

      </div>
    </div>
  )
}

export default InstructionReApply