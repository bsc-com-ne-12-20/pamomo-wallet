import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hexagon, User, Lock } from 'lucide-react';
import axios from 'axios';

interface LoginProps {
  onLogin: (email: string, password: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() === '' || password.trim() === '') {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Use this endpoint for login https://mtima.onrender.com/api/v1/accounts/login/ with 2FA 
      const response = await axios.post('https://mtima.onrender.com/api/v1/accounts/login/', {
          email,
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    
      console.log("Status Code:", response.status);
      console.log("Response Data:", response.data);
    
      const data = response.data;
      if (data?.['2fa_required']) {
        const pre2faUserId = data['pre_2fa_user_id'];
        if (pre2faUserId) {
          // Use sessionStorage instead of localStorage for OTP-related data
          // This ensures it's cleared when the browser is closed
          sessionStorage.setItem('email', email);
          sessionStorage.setItem('pre_2fa_user_id', pre2faUserId);
          sessionStorage.setItem('is2FAEnabled', 'true');
          
          // Store minimal data in localStorage
          localStorage.setItem('email', email);
          
          navigate('/otp-verification', {
            state: {
              email,
              pre_2fa_user_id: pre2faUserId,
            },
          });
        } else {
          setError('Pre-2FA User ID not found in the response.');
        }
      } else if (data?.key || data?.token) {
        const token = data.key || data.token;
        localStorage.setItem('authToken', token);
        localStorage.setItem('email', email);
    
        const success = await onLogin(email, token);
        if (success) {
          navigate('/dashboard', { replace: true });
        } else {
          setError('Login failed. Please try again.');
        }
      } else {
        setError('Login failed. No authentication key received.');
        console.error('No authentication key received:', data);
      }
    } catch (error: any) {
      console.log("Error Status Code:", error.response?.status || 'No status');
      console.log("Error Response:", error.response?.data);
      const detail =
        error.response?.data?.non_field_errors?.[0] ||
        error.response?.data?.detail ||
        'Invalid credentials. Please try again.';
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  } 

  // Simple loader component that matches the website color
  const SimpleLoader = () => (
    <div className="flex justify-center items-center h-32">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8928A4]"></div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {isLoading ? (
        <SimpleLoader />
      ) : (
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="flex justify-center">
              <Hexagon size={64} className="text-[#8928A4]" />
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Pamomo
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Secure Digital Wallet
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] focus:z-10 sm:text-sm"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#8928A4] hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
              >
                Sign in
              </button>
            </div>

            <div className="text-center text-sm">
              <span className="text-gray-600">Don't have an account?</span>{' '}
              <Link to="/register" className="text-[#8928A4] hover:text-[#7a2391] font-medium">
                Sign up
              </Link>
            </div>            <div className="text-center text-sm">
              <Link to="/forgot-password" className="text-[#8928A4] hover:text-[#7a2391] font-medium">
                Forgot Password?
              </Link>
            </div>
            <div className="text-center text-sm mt-2">
              <Link to="/otp-fix" className="text-gray-600 hover:text-gray-800 text-xs">
                Having issues with OTP login?
              </Link>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Login;