import React from 'react'

function ConfirmRecoModal({setConfirmModalOpen, applicantToConfirm, handleUpdateRecommendation}) {
  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl border border-gray-100 transform transition-all">
            <h3 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-100 pb-3">
              Recommend {applicantToConfirm?.firstname} {applicantToConfirm?.lastname}?
            </h3>
            <p className="text-[15px] text-gray-600 mb-8 leading-relaxed">
              Marking this candidate as Recommended will automatically update their Physical Agility Test status to <span className="font-semibold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">Passed</span>.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmModalOpen(false);
                }}
                className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleUpdateRecommendation(applicantToConfirm, true);
                  setConfirmModalOpen(false);
                }}
                className="px-5 py-2.5 bg-[#2C2D86] hover:bg-blue-800 text-white rounded-lg text-sm font-semibold cursor-pointer transition-all active:scale-95 shadow-md shadow-blue-900/20"
              >
                Recommend Applicant
              </button>
            </div>
          </div>
        </div>
    </div>
  )
}

export default ConfirmRecoModal