import React, { useEffect, useState } from 'react'
import {api} from '../../../api/api'

function DashboardOverview() {
  const [users,setUsers] = useState([])
  const [applicants, setApplicants] = useState([])

  useEffect(()=>{
    const fetchApplicantLength = async () =>{
      const response = await api.get('users/get_applicant_info/')
      setApplicants(response.data)
    }
    fetchApplicantLength()

    const fetchUsers = async () =>{
      const response = await api.get("users/get_user/")
      setUsers(response.data)
      console.log(response.data)
    }
    fetchUsers()
  },[])

  const user_length = users.filter(user => user).length
  const applicant_length = applicants.filter(applicant => applicant).length

  return (
    <div className='module-content'>
      <h2>Dashboard Overview</h2>
      
      <div className='System-overview-container'>
        <h3>System Overview</h3>
        <div className='stat-card-container'>
          <div className="flex flex-col justify-center items-center total-users">
            <span className='text-[1.5rem]'>{user_length}</span>
            <span className='text-[#2C2D86] font-bold'>Users</span>
          </div>

          <div className="flex flex-col justify-center items-center total-applicants">
            <span className='text-[1.5rem]'>{applicant_length}</span>
            <span className='text-[#4A4DB8] font-bold'>Total Applicants</span>
          </div>
      </div>
        </div>
  
    </div>
  )
}

export default DashboardOverview