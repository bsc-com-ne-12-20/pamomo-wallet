import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Hexagon } from 'lucide-react';

interface OtpVerificationProps {
    handleOtpSuccess: () => void;
  }

const OtpVerification: React.FC<OtpVerificationProps> = ({ handleOtpSuccess }) => {
  const [otp, setOtp] = useState<string[]>(new Array(6).fill('')); // For 6-digit OTP input
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const pre_2fa_user_id = location.state?.pre_2fa_user_id || localStorage.getItem('pre_2fa_user_id');
  const email = location.state?.email || localStorage.getItem('email');

  // Handle OTP input change
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = e.target.value;
    setOtp(newOtp);

    // Focus the next input field if the current one is filled
    if (e.target.value.length === 1 && index < otp.length - 1) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`) as HTMLInputElement;
      nextInput?.focus();
    }
    
    // If the current input is cleared, focus the previous one
    if (e.target.value === '' && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  };

  // In OtpVerification.tsx - Update the handleOtpSubmit function

const handleOtpSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (otp.some((digit) => digit === '') || otp.length !== 6 || !pre_2fa_user_id) {
    setError('Please enter a valid 6-digit OTP or missing user info.');
    return;
  }

  setIsLoading(true);
  setError('');

  try {
    // Attempt to verify OTP
    const response = await axios.post('https://mtima.onrender.com/api/v1/accounts/verify-otp/', {
      otp: otp.join(''), // Join the OTP digits as a string
      pre_2fa_user_id: Number(pre_2fa_user_id),
    });

    const data = response.data;

    if (data?.token) {
      // Store auth token in localStorage
      localStorage.setItem('authToken', data.token);
      localStorage.removeItem('pre_2fa_user_id');
      localStorage.setItem('email', email);
      
      // Call the success handler to update the state in parent components
      handleOtpSuccess();
      
      // Set an additional flag to indicate authentication is complete
      localStorage.setItem('isAuthenticated', 'true');
      
      // Navigate to dashboard with replace to prevent back navigation to OTP page
      navigate('/dashboard', { replace: true });
    } else {
      setError('Unexpected response from server.');
    }
  } catch (err: any) {
    // Error handling remains the same
    console.error('Error response data:', err.response?.data);
    const backendError = err.response?.data?.error || 'An error occurred during OTP verification.';
    setError(backendError);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="p-8 text-center">
        <div className="flex justify-center">
          <Hexagon size={64} className="text-[#8928A4]" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Pamomo</h2>
        <p className="mt-2 text-center text-sm text-gray-600"> Secure Digital Wallet</p>

        <h2 className="mt-8 text-2xl font-bold mb-2 text-gray-800 dark:text-white">Verify OTP</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Enter the 6-digit code from your authenticator app
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleOtpSubmit(e); }} className="w-full mt-8 space-y-6">
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((_, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                className="w-12 h-12 text-center border-2 border-gray-300 rounded-md shadow-sm focus:border-[#8928A4] focus:ring-2 focus:ring-[#8928A4]"
                type="text"
                maxLength={1}
                pattern="[0-9]*"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otp[index]}
                onChange={(e) => handleOtpChange(e, index)}
              />
            ))}
          </div>

          {error && <div className="text-red-500 text-sm text-center mb-6">{error}</div>}

          {isLoading ? (
            <button
              type="button"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8928A4] hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
              disabled
            >
              Verifying...
            </button>
          ) : (
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8928A4] hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
            >
              Verify OTP
            </button>
          )}

          <div className="text-sm text-gray-600 dark:text-gray-300 mb-6 mt-4">
            {/* some text here */}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OtpVerification;
