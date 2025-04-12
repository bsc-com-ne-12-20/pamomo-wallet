import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, UserRound, Mail, Phone, Calendar, User, Users } from 'lucide-react';
import QRCode from 'react-qr-code'; // Correct import for QRCode component

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
  const [error, setError] = useState<{ message: string; needsVerification?: boolean; isNotFound?: boolean }>({ message: '' });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
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
      } catch (err) {
        if (!(err as any).needsVerification) {
          setError({
            message: 'Service Temporarily Unavailable: Please try again later or contact support',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [username]);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getGenderIcon = () => {
    if (!userData?.gender) return <UserRound size={18} className="text-[#8928A4] mr-2" />;

    const genderLower = userData.gender.toLowerCase();

    if (genderLower === 'male') {
      return <User size={18} className="text-[#8928A4] mr-2" />;
    } else if (genderLower === 'female') {
      return <Users size={18} className="text-[#8928A4] mr-2" />;
    } else {
      return <UserRound size={18} className="text-[#8928A4] mr-2" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />
      <div className="container mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-[#8928A4] mb-6 hover:underline transition-colors"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-[#8928A4] opacity-20 rounded-full mb-4"></div>
              <div className="text-gray-500">Loading your profile information...</div>
            </div>
          </div>
        ) : error.message ? (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
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

                {error.needsVerification && (
                  <div className="space-y-4">
                    <Link
                      to="/verify"
                      className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#8928A4] hover:bg-[#6a1f7a] transition-colors"
                    >
                      Complete Verification
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : !userData ? (
          <div className="flex justify-center">
            <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <UserRound className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Information</h3>
              <p className="text-gray-600 mb-6">The user may not have any profile data!</p>
              <Link
                to="/verify"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#8928A4] hover:bg-[#6a1f7a] transition-colors"
              >
                Verify Account
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-full max-w-3xl">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="text-center py-6 bg-gradient-to-r from-[#8928A4] to-[#6a1f7a] text-white">
                  <h2 className="text-2xl font-bold">USER PROFILE</h2>
                </div>

                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 bg-gradient-to-b from-[#8928A4] to-[#6a1f7a] text-white flex flex-col items-center justify-center py-8 px-4">
                    <div className="relative mb-4">
                      <img
                        src={userData.picture || 'https://via.placeholder.com/150'}
                        alt={userData.name}
                        className="rounded-full w-32 h-32 object-cover border-4 border-white shadow-md"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'https://via.placeholder.com/150';
                        }}
                      />
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                        <div className="bg-green-500 rounded-full w-4 h-4"></div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-center">{userData.name}</h3>
                  </div>

                  <div className="w-full md:w-2/3 p-8">
                    <h3 className="text-xl font-semibold text-[#8928A4] mb-6">Personal Information</h3>
                    <div className="space-y-6">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                          {getGenderIcon()}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-500">Gender</h4>
                          <p className="text-gray-900 mt-1">{userData.gender || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                          <Mail size={18} className="text-[#8928A4]" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-500">Email</h4>
                          <p className="text-gray-900 mt-1">{userData.email}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                          <Phone size={18} className="text-[#8928A4]" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-500">Phone Number</h4>
                          <p className="text-gray-900 mt-1">{userData.phone_number || 'Not provided'}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center">
                          <Calendar size={18} className="text-[#8928A4]" />
                        </div>
                        <div className="ml-4">
                          <h4 className="text-sm font-medium text-gray-500">Customer Since</h4>
                          <p className="text-gray-900 mt-1">{formatDate(userData.created_at)}</p>
                        </div>
                      </div>

                      {/* QR Code Section */}
                      <div className="flex flex-col items-center mt-8">
  <h4 className="text-lg font-medium text-gray-700 mb-4">Your QR Code</h4>
  <div className="relative">
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
    <QRCode
      value={userData.email}
      size={220} // Enlarged size for better visibility
      bgColor="#ffffff"
      fgColor="url(#gradientColor)" // Apply enhanced gradient color
    />
    <div className="absolute inset-0 flex items-center justify-center">
      <img
        src="https://i.ibb.co/Pvz4mskG/hexagon.png"
        alt="Logo"
        className="w-12 h-12 rounded-full" // Slightly larger logo
      />
    </div>
  </div>
</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalProfile;