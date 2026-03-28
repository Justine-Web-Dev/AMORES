import React, { useEffect, useState } from 'react'
import {api} from '../../../api/api'

function DashboardOverview() {
  const [users,setUsers] = useState([])

  useEffect(()=>{
    const fetchUsers = async () =>{
      const response = await api.get("users/get_user/")
      setUsers(response.data)
      console.log(response.data)
    }
    fetchUsers()
  },[])

  const user_length = users.filter(user => user).length

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

          <div className="total-applicants">
            Total Applicant
          </div>
      </div>
        </div>
  
    </div>
  )
}

export default DashboardOverview