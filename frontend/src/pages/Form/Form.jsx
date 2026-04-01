import React from 'react'
import './FormCss.css'

function Form() {
  return (
    <div className='form-application-container'>
      <form className='my-form'>
        <h1 className='text-[24px] font-semibold title-application-form'>Application Form</h1>
        <div className="grid grid-cols-3 gap-4">
         
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Lastname</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Lastname" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Firstname</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Firstname" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Middle name</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="M.N." required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Age</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="number" placeholder="Age" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Qualifier</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Qualifier" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">CP #</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="number" placeholder="CP #" required />
          </div>

          <div className='flex flex-col gap-1 sm:col-span-3'>
            <label className='text-sm text-gray-600'>Email</label>
            <input type="email" placeholder='email@gmail.com'/>
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-sm text-gray-600">Course</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Course" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Date graduated</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="date" required />
          </div>

          <div className="flex flex-col gap-1 col-span-2">
            <label className="text-sm text-gray-600">Name of school</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Name of school" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Latin honor</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Latin honor" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Pag-ibig #</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="number" placeholder="Pag-ibig #" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">PhilHealth ID #</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="number" placeholder="PhilHealth ID #" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Height (e.g. 160cm)</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Height" required />
          </div>

          <div className="flex flex-col gap-1 col-span-3">
            <label className="text-sm text-gray-600">Tribe affiliated</label>
            <input className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Tribe affiliated" required />
          </div>

          <div className="col-span-3 flex justify-end">
            <button
              className="w-[220px] h-10 rounded bg-[#2C2D86] text-white font-bold text-sm"
              type="submit"
            >
              Submit Application
            </button>
          </div>

        </div>
      </form>
    </div>
  )
}

export default Form
