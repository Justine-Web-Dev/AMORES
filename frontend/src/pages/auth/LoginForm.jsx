import React, { useState, useEffect } from 'react'
import '../../pages/auth/LoginForm.css'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import { api } from '../../../api/api'
import { FaEye, FaEyeSlash } from "react-icons/fa";

import logo from '../../assets/RRSU1 logo.png'
import LoginSuccessModal from '../../Modals/LoginSuccessModal'
import ErrorLoginModal from '../../Modals/ErrorLoginModal'

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      sessionStorage.setItem('token', urlToken);
      sessionStorage.setItem('role', 'SUPER_ADMIN');
      navigate('/Dashboard', { replace: true });
    }
  }, [location, navigate]);

  // Force light mode on the login page
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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
        const isAdmin = data.role === "Administrator" || (data.email && data.email.toLowerCase().startsWith("admin@"));
        let routeRole = isAdmin ? "Administrator" : (data.role || "Recruiter");
        if (data.role === 'SUPER_ADMIN') {
          routeRole = 'SUPER_ADMIN';
        }
        
        console.log("Login data:", data);

        sessionStorage.setItem("token", data.token);
        sessionStorage.setItem("role", routeRole);
        sessionStorage.setItem("must_change_password", data.must_change_password ? "true" : "false");
        
        if (data.role === 'SUPER_ADMIN') {
          const superAdminUrl = import.meta.env.VITE_SUPER_ADMIN_URL;
          if (superAdminUrl && !window.location.href.startsWith(superAdminUrl)) {
            window.location.href = `${superAdminUrl}/login?token=${data.token}`;
            return;
          }
          navigate("/Dashboard");
          return;
        }

        if (isAdmin) {
          navigate("/Dashboard")
        } else if (routeRole === "Interviewer") {
          navigate("/InterviewDashboard")
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

  const token = sessionStorage.getItem('token');
  const role = sessionStorage.getItem('role');
  
  if (token && role) {
    switch(role){
      case 'Administrator':
        return <Navigate to="/Dashboard" replace />
      case 'Interviewer':
        return <Navigate to="/InterviewDashboard" replace />
      case 'Recruiter':
        return <Navigate to="/PersonnelDashboard" replace />
      case 'SUPER_ADMIN':
        return <Navigate to="/Dashboard" replace />
    }
  }

  const params = new URLSearchParams(location.search);
  if (params.get('token')) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C2D86]"></div>
        <span className="ml-3 text-slate-500 font-medium">Redirecting to Dashboard...</span>
      </div>
    );
  }

  return (
    <div className='LoginForm'>
        <form onSubmit={handleLogin} className='form'>
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
            {/* Email Field Container */}
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

            {/* Password Field Container */}
            <div className='password-container relative flex flex-col'>
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
              
              {/* Removed Forgot Password Link */}
              <div className='flex justify-end mt-1'>
              </div>
            </div>

            {/* Action Submit Button */}
            <button 
              className={`login-btn mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`} 
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