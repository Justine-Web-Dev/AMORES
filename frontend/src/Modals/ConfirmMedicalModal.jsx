import React from 'react'

function ConfirmMedicalModal({ setConfirmMedicalModal, applicantToConfirm, isPassed, handleUpdateRecommendation }) {
  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-100 transform transition-all">
          <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-100 pb-3">
            Mark {applicantToConfirm?.firstname} {applicantToConfirm?.lastname} as {isPassed ? "Passed" : "Failed"}?
          </h3>
          <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
            {isPassed
              ? <>Marking this applicant as <span className="font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Passed</span> will move them to the Drug Test stage.</>
              : <>Marking this applicant as <span className="font-semibold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">Failed</span> will mark them as failed due to Medical Examination.</>
            }
          </p>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setConfirmMedicalModal(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                handleUpdateRecommendation(applicantToConfirm, isPassed);
                setConfirmMedicalModal(false);
              }}
              className={`px-5 py-2.5 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all active:scale-95 shadow-md ${
                isPassed
                  ? "bg-[#2C2D86] hover:bg-blue-800 shadow-blue-900/20"
                  : "bg-red-600 hover:bg-red-700 shadow-red-900/20"
              }`}
            >
              {isPassed ? "Confirm Passed" : "Confirm Failed"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmMedicalModal
