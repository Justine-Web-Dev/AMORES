import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './FormCss.css'

function Form() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    lastname: '', firstname: '', middle_name: '', age: '',
    cp_number: '', program: '', name_of_school: '',
    date_graduated: '', email: '', latin_honor: '',
    pag_ibig_number: '', phil_health_id_num: '', height: '', tribe_affiliated: ''
  })

  // Load saved form data from localStorage on mount
  useEffect(() => {
    const savedFormData = localStorage.getItem('applicationFormData')
    if (savedFormData) {
      try {
        setFormData(JSON.parse(savedFormData))
      } catch (err) {
        console.error("Error loading saved form data:", err)
      }
    }
  }, [])

  const handleChange = (e) => {
    const updatedData = { ...formData, [e.target.name]: e.target.value }
    setFormData(updatedData)
    // Auto-save to localStorage
    localStorage.setItem('applicationFormData', JSON.stringify(updatedData))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Navigate to document submission with form data
    navigate('/document-submission', { state: { formData } })
  }

  const requiredFields = [
    'lastname', 'firstname', 'middle_name', 'age', 'cp_number',
    'program', 'name_of_school', 'date_graduated', 'email',
    'pag_ibig_number', 'phil_health_id_num', 'height', 'tribe_affiliated'
  ]

  const isFormValid = requiredFields.every((key) => {
    const value = formData[key]
    return value !== null && value !== undefined && value.toString().trim() !== ''
  })
  
  return (
    <div className='form-application-container min-h-screen  '>
      <form className='my-form max-w-4xl mx-auto bg-white my-11 rounded-lg shadow-sm' onSubmit={handleSubmit}>
        <h1 className='text-2xl md:text-[24px] font-semibold title-application-form mb-6'>Application Form</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Lastname</label>
            <input
              name='lastname'
              value={formData.lastname}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Lastname" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Firstname</label>
            <input
              name='firstname'
              value={formData.firstname}
              onChange={handleChange} className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Firstname" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Middle Name</label>
            <input
              name='middle_name'
              value={formData.middle_name}
              onChange={handleChange} className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="M.N." required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Age</label>
            <input
              name='age'
              value={formData.age}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="number" placeholder="Age" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">CP #</label>
            <input
              name='cp_number'
              value={formData.cp_number}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="number" placeholder="CP #" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Program</label>
            <input 
              name='program'
              value={formData.program}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Program" required />
          </div>

          <div className="flex flex-col gap-1 md:col-span-2">
            <label className="text-sm text-gray-600">Name of school</label>
            <input 
              name='name_of_school'
              value={formData.name_of_school}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Name of school" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Date graduated</label>
            <input
              name='date_graduated'
              value={formData.date_graduated}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="date" required />
          </div>

          <div className='flex flex-col gap-1 md:col-span-2'>
            <label className='text-sm text-gray-600'>Email</label>
            <input 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" 
              type="email" 
              placeholder='example@gmail.com' 
              required 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Latin honor <span className='px-2 rounded bg-gray-200'>optional</span></label>
            <input
              name='latin_honor'
              value={formData.latin_honor}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Latin honor" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Pag-ibig #</label>
            <input 
              name="pag_ibig_number"
              value={formData.pag_ibig_number}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="number" placeholder="Pag-ibig #" required 
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">PhilHealth ID #</label>
            <input
              name='phil_health_id_num'
              value={formData.phil_health_id_num}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="number" placeholder="PhilHealth ID #" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-600">Height (e.g. 160cm)</label>
            <input
              name='height'
              value={formData.height}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Height" required />
          </div>

          
          <div className="flex flex-col gap-1 md:col-span-3">
            <label className="text-sm text-gray-600">Tribe affiliated <span className='px-2 rounded bg-gray-200'>optional</span></label>
            <input 
              name='tribe_affiliated'
              value={formData.tribe_affiliated}
              onChange={handleChange}
              className="border rounded px-3 py-2 text-sm w-full" type="text" placeholder="Tribe affiliated" required />
          </div>

          
          <div className="md:col-span-3 flex justify-center md:justify-end mt-4">
            <button
              className="w-full md:w-[220px] h-10 rounded bg-[#2C2D86] text-white font-bold text-sm cursor-pointer hover:bg-[#3a3b9e] transition-colors submit-application-btn"
              type="submit"
              disabled={!isFormValid}
            >
              Next Step
            </button>
          </div>

        </div>
      </form>

    </div>
  )
}

export default Form
