import React, { useState } from 'react'
import './LoginForm.css'
import { useNavigate, Navigate } from 'react-router-dom'
import { api } from '../../api/api'
import { FaEye, FaEyeSlash } from "react-icons/fa";

import logo from '../assets/RRSU1 logo.png'
import LoginSuccessModal from '../Modals/LoginSuccessModal'
import ErrorLoginModal from '../Modals/ErrorLoginModal'

function LoginForm() {
  // Swapped out username state for email
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    if (loading) return;
    setLoading(true)
  
    try {
      const response = await api.post("users/login_user/", {
        email,
        password
      });

      const data = response.data;

      setIsLoggedIn(true)
      setEmail("");
      setPassword("");

      setTimeout(() => {
        setIsLoggedIn(false)
      }, 3000)

      setTimeout(() => {
        localStorage.setItem("token", data.token);
        
        // Dynamic fallback logic checking data.email instead of data.username
        const isAdmin = data.role === "Administrator" || data.email === "Admin"; 
        const userRole = data.role || (isAdmin ? "Administrator" : "Recruiter");
        localStorage.setItem("role", userRole);

        if (userRole === "Administrator") {
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

  // Synchronous route guard to prevent layout/paint flash (blink)
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  
  // More robust check: only redirect if both token and a valid role exist.
  if (token && role) {
    if (role === 'Administrator') return <Navigate to="/Dashboard" replace />;
    if (role === 'Recruiter') return <Navigate to="/PersonnelDashboard" replace />;
  }

  return (
    <div className='LoginForm'>
        <form action="" onSubmit={handleLogin} className='form'>
          <div className="logo-container">
            <img src={logo} alt="logo RRSU1" height={'80px'} width={'120px'}/>
            <p className='logo-name'>PNP- AMORES</p>
            <hr className='border-gray-300'/>
            <div className='title'>
              <h1>Personnel Login</h1>
              <p className='text-gray-300'>Enter your credentials to access your dashboard.</p>
            </div>
          </div>

          <div className='credentials'>
            {/* Updated state connections and placeholders from Username to Email */}
            <div className='username-container'>
              <label htmlFor="emailInput">Email</label>
              <input 
                id="emailInput"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your Email'
                required
              />
            </div>


            <div className='password-container relative'>
              <label htmlFor="passwordInput">Password</label>
              <div className="relative">
                <input 
                  id="passwordInput"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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