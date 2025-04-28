import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  ArrowLeft, UserRound, Mail, Phone, Calendar, User, Users, 
  Download, RefreshCw, Crown, Clock, CreditCard, Shield, 
  AlertTriangle, CheckCircle
} from 'lucide-react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import { API_BASE_URL, TRANSACTION_LIMITS } from '../utils/constants';

interface UserProfile {
  name: string;
  email: string;
  phone_number: string;
  gender: string;
  created_at: string;
  picture: string;
}

interface SubscriptionPlan {
  plan: string;
  period: string;
  status: string;
  expiry_date: string;
  auto_renew: boolean;
  current_balance?: number;
}

interface PersonalProfileProps {
  username: string;
  onLogout: () => void;
}

const PersonalProfile: React.FC<PersonalProfileProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
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

      const response = await fetch(`${API_BASE_URL}/callback/user-info/`, {
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
          // For demo purposes, use mock data if API returns 404
          setUserData({
            name: username || 'Demo User',
            email: email,
            phone_number: '+265 999 888 777',
            gender: 'Not Specified',
            created_at: new Date().toISOString(),
            picture: 'https://avatar.iran.liara.run/public/13'
          });
          setError({ message: '' });
          return;
        }
        throw new Error(`Service unavailable (Status: ${response.status})`);
      }

      const data = await response.json();
      setUserData(data);
      setError({ message: '' });
    } catch (err) {
      if (!(err as any).needsVerification) {
        // For demo purposes, use mock data if API call fails
        const email = localStorage.getItem('email');
        setUserData({
          name: username || 'Demo User',
          email: email || 'user@example.com',
          phone_number: '+265 999 888 777',
          gender: 'Not Specified',
          created_at: new Date().toISOString(),
          picture: 'https://via.placeholder.com/150'
        });
        setError({ message: '' });
        
        // Still show a toast for transparency
        toast.info('Using sample data - API unavailable');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscription details
  const fetchSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const email = localStorage.getItem('email');
      if (!email) {
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/subscriptions/check-subscription/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        // Default to free plan if fetch fails
        setSubscription({
          plan: 'FREE',
          period: 'LIFETIME',
          status: 'ACTIVE',
          expiry_date: 'NEVER',
          auto_renew: false,
          current_balance: 2500
        });
        
        if (response.status === 404) {
          // Show a toast that we're using demo data
          toast.info('Using default subscription data - API unavailable');
        }
      }
    } catch (error) {
      console.error('Failed to fetch subscription details:', error);
      // Default to free plan if fetch fails
      setSubscription({
        plan: 'FREE',
        period: 'LIFETIME',
        status: 'ACTIVE',
        expiry_date: 'NEVER',
        auto_renew: false,
        current_balance: 2500
      });
      toast.info('Using default subscription data');
    } finally {
      setSubscriptionLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchSubscription();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'NEVER') return 'Lifetime';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString(undefined, options);
    } catch (error) {
      return dateString;
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

  // Get subscription badge color based on plan
  const getSubscriptionBadgeColor = () => {
    if (!subscription) return 'bg-gray-100 text-gray-600';
    
    switch (subscription.plan) {
      case 'PREMIUM':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500 text-white';
      case 'BASIC':
        return 'bg-blue-100 text-blue-800';
      case 'FREE':
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  // Get transaction limit based on subscription plan
  const getTransactionLimit = () => {
    if (!subscription) return TRANSACTION_LIMITS.FREE;
    
    switch (subscription.plan) {
      case 'PREMIUM':
        return 'Unlimited';
      case 'BASIC':
        return `MWK ${TRANSACTION_LIMITS.BASIC.toLocaleString()}`;
      case 'FREE':
      default:
        return `MWK ${TRANSACTION_LIMITS.FREE.toLocaleString()}`;
    }
  };

  // Get feature availability based on subscription plan
  const getFeatureAvailability = (feature: string) => {
    if (!subscription) return false;
    
    switch (feature) {
      case 'analytics':
        return subscription.plan === 'BASIC' || subscription.plan === 'PREMIUM';
      case 'advancedAnalytics':
        return subscription.plan === 'PREMIUM';
      case 'unlimitedHistory':
        return subscription.plan === 'PREMIUM';
      case 'unlimitedTransactions':
        return subscription.plan === 'PREMIUM';
      default:
        return false;
    }
  };

  // Render subscription info section with enhanced details
  const renderSubscriptionInfo = () => {
    if (subscriptionLoading) {
      return (
        <div className="border-t mt-6 pt-6 px-2 animate-pulse">
          <h4 className="text-lg font-medium text-gray-700 mb-4">Subscription Details</h4>
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      );
    }

    if (!subscription) return null;

    return (
      <div className="border-t mt-6 pt-6 px-2">
        <div className="flex justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-700">Subscription Details</h4>
          <button
            onClick={fetchSubscription}
            className="text-purple-600 hover:text-purple-800 flex items-center text-sm"
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </button>
        </div>

        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSubscriptionBadgeColor()}`}>
            <Crown size={14} className="mr-1" />
            {subscription.plan} Plan
          </span>
          {subscription.status === 'ACTIVE' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 ml-2">
              <CheckCircle size={14} className="mr-1" />
              Active
            </span>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {renderInfoItem(<Clock size={18} className="text-purple-600" />, "Expires On", formatDate(subscription.expiry_date))}
          {renderInfoItem(<Shield size={18} className="text-purple-600" />, "Transaction Limit", getTransactionLimit())}
          {renderInfoItem(<CreditCard size={18} className="text-purple-600" />, "Auto-Renew", subscription.auto_renew ? 'Enabled' : 'Disabled')}
          {subscription.current_balance !== undefined && 
            renderInfoItem(<Crown size={18} className="text-purple-600" />, "Current Balance", `MWK ${subscription.current_balance.toLocaleString()}`)
          }
        </div>

        {/* Feature list based on subscription */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Your Plan Features</h5>
          <ul className="space-y-2">
            <li className="flex items-center text-sm">
              <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
              <span>Basic wallet functionality</span>
            </li>
            <li className={`flex items-center text-sm ${!getFeatureAvailability('analytics') ? 'text-gray-400' : ''}`}>
              {getFeatureAvailability('analytics') ? (
                <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span>Transaction Analytics</span>
            </li>
            <li className={`flex items-center text-sm ${!getFeatureAvailability('advancedAnalytics') ? 'text-gray-400' : ''}`}>
              {getFeatureAvailability('advancedAnalytics') ? (
                <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span>Advanced Analytics</span>
            </li>
            <li className={`flex items-center text-sm ${!getFeatureAvailability('unlimitedTransactions') ? 'text-gray-400' : ''}`}>
              {getFeatureAvailability('unlimitedTransactions') ? (
                <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span>Unlimited Transaction Amount</span>
            </li>
            <li className={`flex items-center text-sm ${!getFeatureAvailability('unlimitedHistory') ? 'text-gray-400' : ''}`}>
              {getFeatureAvailability('unlimitedHistory') ? (
                <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
              ) : (
                <AlertTriangle size={16} className="text-gray-400 mr-2 flex-shrink-0" />
              )}
              <span>Unlimited Transaction History</span>
            </li>
          </ul>
        </div>

        <div className="mt-6">
          <Link
            to="/subscription"
            className="inline-block w-full text-center px-4 py-2 border border-purple-600 text-sm font-medium rounded-md text-purple-600 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
          >
            {subscription.plan !== 'PREMIUM' ? 'Upgrade Subscription' : 'Manage Subscription'}
          </Link>
        </div>
      </div>
    );
  };

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
              
              {/* Show subscription status in profile sidebar */}
              {subscription && (
                <div className={`text-xs px-3 py-1 rounded-full mt-2 font-medium ${
                  subscription.plan === 'PREMIUM' 
                    ? 'bg-yellow-400 text-yellow-900' 
                    : subscription.plan === 'BASIC'
                    ? 'bg-blue-400 text-white' 
                    : 'bg-white text-purple-800'
                }`}>
                  {subscription.plan} Member
                </div>
              )}
              
              <span className="text-purple-200 text-sm mt-2">Active Member</span>
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

              {/* Subscription Information */}
              {renderSubscriptionInfo()}

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