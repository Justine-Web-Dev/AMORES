import React from 'react'
import { FiAlertTriangle } from "react-icons/fi";

function ConfirmDocs({ isOpen, onConfirm, onCancel }) {

  if (!isOpen) return null;

  return (
    <div
      className='fixed inset-0 z-[600] bg-black/40 flex items-center justify-center'
    >
      <div
        className='flex flex-col items-center bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 animate-[fadeIn_0.15s_ease-out]'
      >
        <div className='bg-orange-50 p-4 rounded-full border border-orange-200 w-fit'>
          <FiAlertTriangle size={32} className='text-orange-500' />
        </div>

        <div className='mt-4 text-center'>
          <p className='text-lg font-semibold text-gray-900'>Submit documents for review?</p>
          <p className='mt-2 text-sm text-gray-500 leading-relaxed'>
            Once confirmed, your files are locked and can't be edited. Please review them carefully before continuing.
          </p>
        </div>

        <div className='mt-6 flex justify-end gap-3 w-full'>
          <button
            onClick={onCancel}
            className='flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer hover:translate-y-[-2px] transition-transform duration-200'
          >
            Go back
          </button>
          <button
            onClick={onConfirm}
            className='flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-[#23246e] rounded-lg hover:bg-[#25267f] transition-colors cursor-pointer shadow-sm hover:translate-y-[-2px] transition-transform duration-200'
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDocs