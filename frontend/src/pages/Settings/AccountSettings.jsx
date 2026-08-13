import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiUser, FiShield, FiCamera, FiX, FiCheck, FiArrowLeft } from 'react-icons/fi';
import ChangePassword from './ChangePassword';
import logoAcc from '../../assets/RRSU1 logo.png';
import { api } from '../../../api/api';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../../utils/cropImage';

function AccountSettings() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');

  const getDashboardPath = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes('personnel')) return '/PersonnelDashboard';
    if (path.includes('interview')) return '/InterviewDashboard';
    return '/Dashboard';
  };

  const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Function to decode JWT token
  const parseJwt = (token) => {
    try {
      if (!token) return null;
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const token = sessionStorage.getItem('token');
  const payload = parseJwt(token);
  const name = payload?.name || 'User';
  const rawRole = payload?.role || '';
  const email = payload?.email || '';
  
  const role = (rawRole === 'Administrator') ? 'Administrator' : 
               (rawRole === 'Recruitment Personnel') ? 'Recruitment Staff' : 'Staff';
               
  const userId = payload?.user_id;
  const [profilePic, setProfilePic] = useState(payload?.profile_picture || logoAcc);
  const [previewPic, setPreviewPic] = useState(payload?.profile_picture || logoAcc);
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Cropper State
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImageSrc(imageUrl);
      setShowCropper(true);
      // We don't set selectedFile here, we do it after cropping
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedImageBlob], 'profile_pic.jpg', { type: 'image/jpeg' });
      setSelectedFile(croppedFile);
      setPreviewPic(URL.createObjectURL(croppedImageBlob));
      setShowCropper(false);
    } catch (e) {
      console.error(e);
      alert('Failed to crop image.');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!selectedFile || !userId) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('profile_picture', selectedFile);

    try {
      const response = await api.put(`/users/update_user/${userId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Update token in localStorage so it persists across reloads/navigations
      if (response.data.token) {
        sessionStorage.setItem('token', response.data.token);
      }
      
      // Update UI with new profile picture
      if (response.data.profile_picture) {
        setProfilePic(response.data.profile_picture);
        setPreviewPic(response.data.profile_picture);
        setSelectedFile(null);
        window.dispatchEvent(new CustomEvent('profilePictureUpdated', { detail: response.data.profile_picture }));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile changes.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-10 bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto">
        
        {showCropper && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h3 className="font-semibold text-lg text-slate-800">Crop Profile Picture</h3>
                <button onClick={handleCropCancel} className="text-slate-500 hover:text-slate-700 transition-colors">
                  <FiX className="text-2xl" />
                </button>
              </div>
              
              <div className="relative w-full h-80 bg-slate-100">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-600">Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(e.target.value)}
                    className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleCropCancel}
                    className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropSave}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#2C2D86] rounded-lg hover:bg-indigo-800 transition-colors flex items-center gap-2"
                  >
                    <FiCheck /> Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <button 
                    onClick={() => navigate(getDashboardPath())} 
                    className="p-1.5 mr-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                    title="Go Back"
                  >
                    <FiArrowLeft className="text-2xl" />
                  </button>
                  <FiUser className="text-2xl text-[#2C2D86]" />
                  <h2 className="text-2xl font-bold text-slate-800">Profile Information</h2>
                </div>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                  <div className="shrink-0 relative group">
                    <img src={previewPic} alt="Profile Avatar" className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-md object-cover" />
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                      onClick={() => !isUploading && fileInputRef.current.click()}
                    >
                      <FiCamera className="text-white text-2xl" />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </div>
                  
                  <div className="flex-1 space-y-5 w-full">
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-1">Full Name</label>
                      <p className="text-lg font-medium text-slate-800">{name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-1">Email Address</label>
                      <p className="text-lg font-medium text-slate-800">{email || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-500 mb-1">Role</label>
                      <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-sm font-semibold rounded-lg">
                        {role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save Profile Button */}
                <div className="mt-8 flex justify-end border-t border-slate-100 pt-6">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={!selectedFile || isUploading}
                    className={`px-6 py-2.5 rounded-xl font-semibold transition-all shadow-sm flex items-center gap-2 ${(!selectedFile || isUploading) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-[#2C2D86] text-white hover:bg-indigo-800'}`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Profile'
                    )}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <ChangePassword />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountSettings;
