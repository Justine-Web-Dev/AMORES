import React, { useState } from 'react';
import { api } from '../../api/api';

function DraftCodeApplication({ onClose, onProceed }) {
  const [draftCode, setDraftCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [retrievedData, setRetrievedData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!draftCode.trim()) {
      setError('Please enter a draft code.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await api.get(`users/applications/draft/${draftCode.trim()}/`);
      
      const formData = response.data.form_data;
      setRetrievedData(formData);
      setShowSuccess(true);
    } catch (err) {
      setError('Invalid draft code or draft not found.');
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
          <h2 className="text-xl font-bold text-gray-900 mb-2">Draft Retrieved!</h2>
          <p className="text-sm text-gray-600 mb-6">
            Your draft has been successfully loaded. You can now continue your application.
          </p>
          <button
            onClick={() => {
              if (onProceed) {
                onProceed(retrievedData);
              } else {
                localStorage.setItem('applicationFormData', JSON.stringify(retrievedData));
                window.location.href = '/form';
              }
            }}
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
            Draft Application
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-3">
            Retrieve Your Draft
          </h2>
        </header>

        {/* Content Section */}
        <div className="space-y-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Enter the draft code you received when you saved your progress to continue your application.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-700">
              Draft Code
            </label>
            <input
              type="text"
              value={draftCode}
              onChange={(e) => setDraftCode(e.target.value)}
              placeholder="e.g. DRF-XXXXXX"
              className="border border-gray-300 rounded-lg px-4 py-3 text-sm w-full focus:outline-none focus:ring-2 focus:ring-[#2C2D86] transition"
            />
            {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
          </form>

          {/* Help Callout */}
          <section className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
              Can't find your code?
            </h3>
            <p className="text-xs text-amber-800 mt-1">
              If you didn't copy your draft code, you will need to start a new application.
            </p>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={() => {
              if (onClose) {
                onClose();
              } else {
                window.location.href = '/';
              }
            }}
            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 text-sm font-medium text-white bg-[#2C2D86] hover:bg-[#1a1b52] rounded-lg shadow-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Retrieving...
              </>
            ) : (
              'Retrieve Draft'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DraftCodeApplication;