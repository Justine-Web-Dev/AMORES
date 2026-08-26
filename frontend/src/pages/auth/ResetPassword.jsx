import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../../../api/api'
import logo from '../../assets/RRSU1 logo.png'
import ErrorLoginModal from '../../Modals/ErrorLoginModal'
import { FaEye, FaEyeSlash } from 'react-icons/fa'

function ResetPassword() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const [email, setEmail] = useState("")
  const [otpArray, setOtpArray] = useState(new Array(6).fill(""))
  const [otp, setOtp] = useState("")
  const [isVerified, setIsVerified] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isSuccessModal, setIsSuccessModal] = useState(false)
  const [resetToken, setResetToken] = useState("")
  const [timer, setTimer] = useState(() => {
    const savedTime = sessionStorage.getItem('resetPasswordTimer');
    if (savedTime) {
      const remaining = Math.floor((parseInt(savedTime, 10) - Date.now()) / 1000);
      return remaining > 0 ? remaining : 0;
    }
    sessionStorage.setItem('resetPasswordTimer', Date.now() + 120 * 1000);
    return 120;
  });

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber && hasSpecialChar;
  const doPasswordsMatch = newPassword === confirmPassword;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const second = seconds % 60;
    return `${minutes}:${second < 10 ? '0' : ''}${second}`;
  };

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email)
    } else {
      navigate('/forgot-password')
    }
  }, [location, navigate])

  useEffect(() => {
    let intervalId;
    if (timer > 0 && !isVerified) {
      intervalId = setInterval(() => {
        setTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(intervalId)
  }, [timer, isVerified])

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtpArray = [...otpArray];
    newOtpArray[index] = element.value;
    setOtpArray(newOtpArray);
    setOtp(newOtpArray.join(""));
    
    // Focus next input
    if (element.nextSibling && element.value) {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otpArray[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.some(isNaN)) return;
    
    const newOtpArray = new Array(6).fill("");
    pastedData.forEach((char, index) => {
      newOtpArray[index] = char;
    });
    setOtpArray(newOtpArray);
    setOtp(newOtpArray.join(""));
  };

  async function handleResend() {
    if (loading || timer > 0) return;
    setLoading(true);
    try {
      await api.post("users/forgot-password/", { email });
      setErrorMessage("A new verification code has been sent to your email.");
      setIsSuccessModal(true);
      setShowErrorModal(true);
      setTimer(120);
      sessionStorage.setItem('resetPasswordTimer', Date.now() + 120 * 1000);
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      setErrorMessage(msg);
      setIsSuccessModal(false);
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return;
    
    if (!isVerified) {
      setLoading(true)
      try {
        const response = await api.post("users/verify-otp/", { email, otp });
        setResetToken(response.data.reset_token);
        setIsVerified(true);
      } catch (error) {
        const msg = error.response?.data?.error || error.message;
        setErrorMessage(msg)
        setIsSuccessModal(false)
        setShowErrorModal(true)
      } finally {
        setLoading(false)
      }
      return;
    }
    
    if (!doPasswordsMatch) {
      setErrorMessage("Passwords do not match.");
      setIsSuccessModal(false);
      setShowErrorModal(true);
      return;
    }

    if (!isPasswordValid) {
      setErrorMessage("Please meet all the password requirements.");
      setIsSuccessModal(false);
      setShowErrorModal(true);
      return;
    }

    setLoading(true)
    setSuccess(false)
  
    try {
      await api.post("users/reset-password/", { 
        email, 
        reset_token: resetToken, 
        new_password: newPassword 
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const msg = error.response?.data?.error || error.message;
      setErrorMessage(msg)
      setIsSuccessModal(false)
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
          {isVerified && (
            <>
              <h2 className="text-2xl font-bold text-[#2C2D86]">Reset Password</h2>
              <p className="text-gray-500 text-sm text-center mt-2">
                Verification successful! Please enter your new password.
              </p>
            </>
          )}
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4">
            Password has been reset successfully. Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {!isVerified ? (
              <div className="flex flex-col items-center">
                <h3 className="text-2xl font-bold text-[#2C2D86] mb-2">Enter OTP</h3>
                <p className="text-sm text-gray-500 mb-6 text-center">
                  Enter the 6-digit code sent to you at<br/>
                  <span className="font-medium text-gray-700">{email}</span>
                </p>

                <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
                  {otpArray.map((data, index) => (
                    <input
                      key={index}
                      type="text"
                      name="otp"
                      maxLength="1"
                      value={data}
                      onChange={(e) => handleOtpChange(e.target, index)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      onFocus={(e) => e.target.select()}
                      className="w-12 h-14 border border-gray-300 rounded-md text-center text-xl font-semibold text-gray-800 focus:border-[#1956a6] focus:ring-1 focus:ring-[#1956a6] outline-none"
                    />
                  ))}
                </div>

                <div className="flex justify-between w-full mb-6 text-sm">
                  <button 
                    type="button" 
                    onClick={handleResend} 
                    disabled={timer > 0}
                    className={timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-[#1956a6] hover:underline'}
                  >
                    {timer > 0 ? `Resend in ${formatTime(timer)}` : 'Resend'}
                  </button>
                  <button type="button" onClick={() => navigate('/forgot-password')} className="text-[#1956a6] hover:underline">
                    Change Email
                  </button>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || otp.length < 6}
                  className={`w-full bg-[#1956a6] text-white py-3 rounded-md font-medium transition-colors hover:bg-[#134282] ${loading || otp.length < 6 ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Verifying...' : 'Confirm'}
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col">
                  <label htmlFor="new_password" className="text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="relative">
                    <input 
                      id="new_password"
                      type={showNewPassword ? "text" : "password"} 
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <div className="flex flex-col text-sm text-gray-500 mt-2 gap-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${hasMinLength ? 'border-green-500' : 'border-gray-400'}`}>
                        {hasMinLength && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                      </div>
                      <span className={hasMinLength ? 'text-green-600' : ''}>At least 8 characters</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${hasUppercase ? 'border-green-500' : 'border-gray-400'}`}>
                        {hasUppercase && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                      </div>
                      <span className={hasUppercase ? 'text-green-600' : ''}>One uppercase letter</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${hasNumber ? 'border-green-500' : 'border-gray-400'}`}>
                        {hasNumber && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                      </div>
                      <span className={hasNumber ? 'text-green-600' : ''}>One number</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full border flex items-center justify-center ${hasSpecialChar ? 'border-green-500' : 'border-gray-400'}`}>
                        {hasSpecialChar && <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>}
                      </div>
                      <span className={hasSpecialChar ? 'text-green-600' : ''}>One special character</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col">
                  <label htmlFor="confirm_password" className="text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <div className="relative">
                    <input 
                      id="confirm_password"
                      type={showConfirmPassword ? "text" : "password"} 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2C2D86] focus:border-transparent pr-10"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <p className={`text-xs mt-1 font-medium ${doPasswordsMatch ? 'text-green-500' : 'text-red-500'}`}>
                      {doPasswordsMatch ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className={`w-full bg-[#2C2D86] text-white py-2 rounded-md font-medium transition-colors hover:bg-[#1f2066] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </>
            )}
          </form>
        )}
      </div>

      <ErrorLoginModal 
        isOpen={showErrorModal} 
        onClose={() => setShowErrorModal(false)} 
        title="Error" 
        message={errorMessage} 
        isSuccess={isSuccessModal}
      />
    </div>
  )
}

export default ResetPassword
