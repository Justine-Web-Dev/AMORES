import React, {  useState } from 'react'
import './LoginForm.css'
import {useNavigate} from 'react-router-dom'
import { api } from '../../api/api'
import { FaEye, FaEyeSlash } from "react-icons/fa";

import logo from '../assets/RRSU1 logo.png'
import LoginSuccessModal from '../Modals/LoginSuccessModal'
import ErrorLoginModal from '../Modals/ErrorLoginModal'

function LoginForm() {
  const [username,setUsername] = useState("")
  const [password,setPassword] = useState("")
  const [isLoggedIn,setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e){
    e.preventDefault()
    if (loading) return;
    setLoading(true)
  
    try {
      const response = await api.post("users/login_user/", {
        username,
        password
      });

    const data = response.data;

    localStorage.setItem("token", data.token);
    setIsLoggedIn(true)

    setTimeout(()=>{
      setIsLoggedIn(false)
    },3000)

    setUsername("");
    setPassword("");

    setTimeout(() => {
      if (data.role === "Admin" || data.username === "Admin") {
        navigate("/Dashboard")
      } else {
        navigate("/PersonnelDashboard")
      }
    }, 3000)

  } catch (error) {
    const msg = error.response?.data?.error || error.message;
    setErrorMessage(msg)
    setShowErrorModal(true)
  } finally {
    setLoading(false)
  }
}

  return (
    <div className='LoginForm'>
        <form action="" onSubmit={handleLogin} className='form'>
          <div className="logo-container">
            <img src={logo} alt="logo RRSU1" height={'80px'} width={'120px'}/>
            <p className='logo-name'>PNP- AMORES</p>
            <hr className='border-gray-300'/>
            <div className='title'>
              <h1>Personnel  Login</h1>
              <p className='text-gray-300'>Enter your credentials to access your dashboard.</p>
            </div>
          </div>

          <div className='credentials'>
            <div className='username-container'>
              <label htmlFor="">Username</label>
              <input type="text"
                value={username}
                onChange={(e)=> setUsername(e.target.value)}
              placeholder='Username'
              required
              />
            </div>

            <div className='password-container relative'>
              <label htmlFor="">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e)=>setPassword(e.target.value)}
                  placeholder='Password'
                  required
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#2C2D86] transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                </button>
              </div>
            </div>

            <button 
              className={`login-btn ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} 
              type='submit' 
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>

        {isLoggedIn && <LoginSuccessModal />}
        
        <ErrorLoginModal 
          isOpen={showErrorModal} 
          onClose={() => setShowErrorModal(false)} 
          title="Login Failed" 
          message={errorMessage} 
        />
    </div>
  )
}

export default LoginForm
