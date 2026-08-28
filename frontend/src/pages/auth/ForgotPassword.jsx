import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../../api/api'
import logo from '../../assets/RRSU1 logo.png'
import ErrorLoginModal from '../../Modals/ErrorLoginModal'
import { FaEnvelope } from 'react-icons/fa'

function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return;
    setLoading(true)
    setSuccess(false)
  
    try {
      await api.post("users/forgot-password/", { email });
      navigate('/reset-password', { state: { email } });
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      setErrorMessage(msg)
      setShowErrorModal(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md border border-gray-200">
        <div className="flex flex-col items-center mb-6">
          <img src={logo} alt="logo RRSU1" height={'80px'} width={'120px'} className="mb-2"/>
          <h2 className="text-2xl font-bold text-[#2C2D86]">Forgot Password</h2>
          <p className="text-gray-500 text-sm text-center mt-2">
            Enter your registered email address to receive a verification code.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <label htmlFor="email" className="text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <FaEnvelope size={18} />
              </span>
              <input 
                id="email"
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#2C2D86] text-white py-2 rounded-md font-medium transition-colors hover:bg-[#1f2066] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Sending code...' : 'Send Verification Code'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="text-sm text-[#2C2D86] hover:underline">
            Back to Login
          </a>
        </div>
      </div>

      <ErrorLoginModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        title="Error" 
        message={errorMessage} 
      />
    </div>
  )
}

export default ForgotPassword
