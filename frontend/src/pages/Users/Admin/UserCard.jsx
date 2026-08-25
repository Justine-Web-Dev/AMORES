import React from 'react'

import { useState, useEffect } from 'react'

function UserCard({users, onEdit,search}) {
  const [open,setOpen] = useState(null)
    const toggleMenu = (id) =>{
    setOpen(open === id ? null : id)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-dropdown-container')) {
        setOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div>
       <table className="text-sm text-center text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100 ">
              <tr>
                <th scope="col" className="th">Name</th>
                <th scope="col" className="th">Username</th>
                <th scope="col" className="th text-center">Status</th>
                <th scope="col" className="th">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {
                search.length > 0 ?(
                  users.map((user)=>(
                  <tr key={user.id}>
                    <td>{user.name}</td>
                    <td>{user.username}</td>
                    <td>{user.role}</td>
                    <td className="px-4 py-4 text-center">
                      <div className="relative inline-block text-left action-dropdown-container">
                        <button 
                          onClick={() => toggleMenu(user.id)}
                          className="flex items-center justify-center w-9 h-9 mx-auto text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 active:scale-95"
                          title="More Options"
                        >
                          <span className="text-xl font-bold tracking-widest leading-none pb-2">...</span>
                        </button>

                      {open === user.id && (
                        <div className="absolute top-full right-0 mt-2 z-[9999] w-40 bg-white shadow-lg border border-gray-100 rounded-md actions">
                          <ul className="flex flex-col text-[14px] gap-[5px]">
                            <h1 className='font-bold text-black border-b pb-1 border-gray-200 action-title'>Actions</h1>
                            <button 
                              onClick={()=>onEdit(user)}
                              className="text-left px-2 py-1 cursor-pointer view-details-btn-action">
                              Edit
                            </button>
                            <button 
                              className="text-left px-2 py-1 cursor-pointer deactivate-btn-action text-red-500 hover:text-white">
                              Deactivate
                            </button>
                          </ul>
                        </div>
                      )}
                      </div>
                    </td>
                  </tr>
                ))):(
                  <tr>
                  <td colSpan="8" className="py-10 text-gray-500 italic col-8">
                    No users registered
                  </td>
                </tr>
                )
              }
              
            </tbody>
          </table> 

    </div>
  )
}

export default UserCard
