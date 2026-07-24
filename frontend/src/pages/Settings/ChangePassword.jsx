import React, { useState } from 'react';
import { api } from '../../../api/api';
import { FaShieldHalved } from 'react-icons/fa6';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useSearchParams } from 'react-router-dom';

function ChangePassword() {
  const [searchParams] = useSearchParams();
  const isForced = searchParams.get('force') === 'true';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    const uppercaseRegex = /[A-Z]/;
    const specialCharRegex = /[!@#$%^&*(),.?":{}|<>]/;
    const numberRegex = /[0-9]/;

    if (!uppercaseRegex.test(newPassword)) {
      setError("New password must contain at least one uppercase letter.");
      setIsLoading(false);
      return;
    }

    if (!specialCharRegex.test(newPassword)) {
      setError("New password must contain at least one special character.");
      setIsLoading(false);
      return;
    }

    if (!numberRegex.test(newPassword)) {
      setError("New password must contain at least one number.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post('/users/change_password/', {
        current_password: currentPassword,
        new_password: newPassword,
      });
      
      setMessage(response.data.message || 'Password successfully updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        <FaShieldHalved className="text-2xl text-[#2C2D86]" />
        <h2 className="text-2xl font-bold text-slate-800">Security Settings</h2>
      </div>
        
        <p className="text-sm text-slate-500 mb-8">
          Update your password and secure your account. Ensure you use a strong, random password.
        </p>

        <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              {isForced && !message && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
                  <p className="text-sm text-amber-700 font-bold">Action Required</p>
                  <p className="text-sm text-amber-600 mt-1">
                    You are logging in with a system-generated password. For security purposes, please change it now before continuing.
                  </p>
                </div>
              )}
              {message && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-md">
                  <p className="text-sm text-green-700 font-medium">{message}</p>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-md">
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="currentPassword">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#2C2D86] focus:border-[#2C2D86] transition-all outline-none"
                      placeholder="Enter your current password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#2C2D86] focus:border-[#2C2D86] transition-all outline-none"
                      placeholder="Enter your new password"
                    />
                  </div>
                  {newPassword.length > 0 && (
                    <ul className="text-xs mt-2 space-y-1">
                      <li className={newPassword.length >= 8 ? 'text-green-600 font-medium' : 'text-slate-500'}>
                        {newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-500'}>
                        {/[A-Z]/.test(newPassword) ? '✓' : '○'} One uppercase letter
                      </li>
                      <li className={/[0-9]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-500'}>
                        {/[0-9]/.test(newPassword) ? '✓' : '○'} One number
                      </li>
                      <li className={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? 'text-green-600 font-medium' : 'text-slate-500'}>
                        {/[!@#$%^&*(),.?":{}|<>]/.test(newPassword) ? '✓' : '○'} One special character
                      </li>
                    </ul>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#2C2D86] focus:border-[#2C2D86] transition-all outline-none"
                      placeholder="Confirm your new password"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && (
                    <p className={`text-xs mt-1.5 font-medium ${newPassword === confirmPassword ? 'text-green-600' : 'text-red-500'}`}>
                      {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-6 py-2.5 rounded-xl text-white font-medium transition-all duration-200 shadow-md flex items-center justify-center gap-2 ${
                    isLoading 
                      ? 'bg-[#23246e] opacity-75 cursor-not-allowed' 
                      : 'bg-[#2C2D86] hover:bg-[#1a1b5c] hover:shadow-lg'
                  }`}
                >
                  {isLoading ? 'Updating...' : 'Save Changes'}
                </button>
              </div>
            </form>
        </div>
    </div>
  );
}

export default ChangePassword;
