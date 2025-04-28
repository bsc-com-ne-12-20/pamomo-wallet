import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, UserRound, Mail, Phone, Calendar, User, Users, Download, RefreshCw } from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';

interface UserProfile {
  name: string;
  email: string;
  phone_number: string;
  gender: string;
  created_at: string;
  picture: string;
}

interface PersonalProfileProps {
  username: string;
  onLogout: () => void;
}

const PersonalProfile: React.FC<PersonalProfileProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ 
    message: string; 
    needsVerification?: boolean; 
    isNotFound?: boolean 
  }>({ message: '' });
  
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const email = localStorage.getItem('email');
      if (!email) {
        throw new Error('Authentication required: Please log in to view your profile');
      }

      const response = await fetch('https://mtima.onrender.com/callback/user-info/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError({
            message: 'Verification Required: Your account needs to be verified to access this feature',
            needsVerification: true,
          });
          return;
        } else if (response.status === 404) {
          setError({
            message: 'Please complete verification to see your profile!',
            needsVerification: true,
            isNotFound: true,
          });
          return;
        }
        throw new Error(`Service unavailable (Status: ${response.status})`);
      }

      const data = await response.json();
      setUserData(data);
      setError({ message: '' });
    } catch (err) {
      if (!(err as any).needsVerification) {
        setError({
          message: 'Service Temporarily Unavailable: Please try again later or contact support',
        });
        toast.error('Failed to load profile. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not available';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      return 'Invalid date format';
    }
  };

  const getGenderIcon = () => {
    if (!userData?.gender) return <UserRound size={18} className="text-purple-600" />;

    const genderLower = userData.gender.toLowerCase();

    if (genderLower === 'male') {
      return <User size={18} className="text-purple-600" />;
    } else if (genderLower === 'female') {
      return <Users size={18} className="text-purple-600" />;
    } else {
      return <UserRound size={18} className="text-purple-600" />;
    }
  };

  const downloadQRCode = () => {
    if (!userData?.email) {
      toast.error('Email information is required for QR code generation');
      return;
    }
    
    // Get the SVG element
    const svg = document.getElementById('qrCode');
    if (!svg) {
      toast.error('QR code not available for download');
      return;
    }
    
    try {
      // Create a canvas with proper dimensions
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        toast.error('Canvas context unavailable');
        return;
      }
      
      // Set canvas dimensions (with higher resolution for better quality)
      canvas.width = 440;  // 2x size for better quality
      canvas.height = 440;
      
      // Convert SVG to a data URL
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svgBlob);
      
      // Create an Image object
      const img = new Image();
      img.onload = () => {
        // Fill with white background first
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the image
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to PNG data URL
        const pngUrl = canvas.toDataURL('image/png');
        
        // Create download link
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-${userData.name || 'user'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up
        DOMURL.revokeObjectURL(url);
        toast.success('QR code downloaded successfully');
      };
      
      img.onerror = () => {
        toast.error('Failed to generate QR code image');
        DOMURL.revokeObjectURL(url);
      };
      
      img.src = url;
    } catch (error) {
      toast.error('Failed to download QR code');
      console.error('QR code download error:', error);
    }
  };

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mb-4"></div>
      <div className="text-gray-600 font-medium">Loading your profile information...</div>
    </div>
  );

  const renderErrorState = () => (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {error.isNotFound ? 'Profile Not Found' : 'Action Required'}
          </h3>
          <p className="text-gray-600 mb-6">{error.message}</p>

          {error.needsVerification ? (
            <Link
              to="/verify"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              Complete Verification
            </Link>
          ) : (
            <button
              onClick={fetchUserProfile}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
            >
              <RefreshCw size={16} className="mr-2" />
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderEmptyProfile = () => (
    <div className="flex justify-center">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <UserRound className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Information</h3>
        <p className="text-gray-600 mb-6">You don't have any profile data yet. Please verify your account to continue.</p>
        <Link
          to="/verify"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
        >
          Verify Account
        </Link>
      </div>
    </div>
  );

  const renderInfoItem = (icon: React.ReactNode, label: string, value: string) => (
    <div className="flex items-start group p-2 rounded-lg transition-colors hover:bg-purple-50">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
        {icon}
      </div>
      <div className="ml-4">
        <h4 className="text-sm font-medium text-gray-500">{label}</h4>
        <p className="text-gray-900 mt-1 font-medium">{value || 'Not provided'}</p>
      </div>
    </div>
  );

  const renderUserProfile = () => (
    <div className="flex justify-center">
      <div className="w-full max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
          <div className="text-center p-6 bg-gradient-to-r from-purple-700 to-purple-900 text-white">
            <h2 className="text-2xl font-bold">USER PROFILE</h2>
          </div>

          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 bg-gradient-to-b from-purple-700 to-purple-900 text-white flex flex-col items-center justify-center py-8 px-4">
              <div className="relative mb-4">
                <div className="rounded-full w-32 h-32 overflow-hidden border-4 border-white shadow-lg">
                  <img
                    src={userData?.picture || 'https://via.placeholder.com/150'}
                    alt={userData?.name || 'User'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md">
                  <div className="bg-green-500 rounded-full w-4 h-4"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-center">{userData?.name}</h3>
              <span className="text-purple-200 text-sm mt-1">Active Member</span>
            </div>

            <div className="w-full md:w-2/3 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-purple-700">Personal Information</h3>
                <button
                  onClick={fetchUserProfile}
                  className="text-purple-600 hover:text-purple-800 flex items-center text-sm"
                >
                  <RefreshCw size={14} className="mr-1" />
                  Refresh
                </button>
              </div>
              
              <div className="space-y-4">
                {renderInfoItem(getGenderIcon(), "Gender", userData?.gender || 'Not specified')}
                {renderInfoItem(<Mail size={18} className="text-purple-600" />, "Email", userData?.email || '')}
                {renderInfoItem(<Phone size={18} className="text-purple-600" />, "Phone Number", userData?.phone_number || '')}
                {renderInfoItem(<Calendar size={18} className="text-purple-600" />, "Customer Since", formatDate(userData?.created_at || ''))}
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center mt-10 border-t pt-6">
                <h4 className="text-lg font-medium text-gray-700 mb-4">Your QR Code</h4>
                <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="0"
                    height="0"
                    className="absolute"
                  >
                    <defs>
                      <linearGradient id="gradientColor" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style={{ stopColor: '#8928A4', stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: '#6a1f7a', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#4a148c', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="relative">
                    <QRCode
                      id="qrCode"
                      value={userData?.email || ''}
                      size={220}
                      bgColor="#FFFFFF"
                      fgColor="#8928A4"
                      level="H"
                    />
                  </div>
                </div>
                {/* Download Button */}
                <button
                  onClick={downloadQRCode}
                  className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors flex items-center"
                >
                  <Download size={16} className="mr-2" />
                  Download QR Code
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />
      <div className="container mx-auto px-4 py-10">
        <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium">
                <ArrowLeft size={16} className="mr-2" />
                Back to Dashboard
        </button>

        {loading ? renderLoadingState() : 
          error.message ? renderErrorState() : 
          !userData ? renderEmptyProfile() : renderUserProfile()}
      </div>
    </div>
  );
};

export default PersonalProfile;