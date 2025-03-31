import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchParams] = useSearchParams();

  // Get token from URL if present
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) setResetToken(tokenFromUrl);
  }, [searchParams]);

  // Redirect to login after success
  useEffect(() => {
    if (isSuccess) {
      // Clear any auth tokens that might trigger dashboard redirect
      localStorage.removeItem('authToken');
      sessionStorage.removeItem('authToken');
      
      // Force full page reload to login
      const timer = setTimeout(() => {
        window.location.href = '/login'; // Absolute path
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match!');
      setIsLoading(false);
      return;
    }

    if (!resetToken) {
      setMessage('Reset token is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        'https://mtima.onrender.com/api/password_reset/confirm/',
        { token: resetToken, password: newPassword },
        { headers: { 'Content-Type': 'application/json' } }
      );

      if (response.status === 200) {
        setMessage('Password reset successful! Redirecting to login...');
        setIsSuccess(true);
      }
    } catch (error) {
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.message || error.response?.data?.detail || 'Request failed'
        : 'Error resetting password';
      setMessage(errorMessage);
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset Password
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Form inputs remain the same as previous example */}
          <div>
            <input
              id="resetToken"
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] sm:text-sm"
              placeholder="Reset Token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
            />
          </div>
          
          <div>
            <input
              id="newPassword"
              type="password"
              required
              minLength={8}
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] sm:text-sm"
              placeholder="New Password (min 8 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          
          <div>
            <input
              id="confirmPassword"
              type="password"
              required
              minLength={8}
              className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#8928A4] focus:border-[#8928A4] sm:text-sm"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-md text-white bg-[#8928A4] hover:bg-[#7a2391] ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Processing...' : 'Reset Password'}
            </button>
          </div>

          {message && (
            <div className={`text-center text-sm ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
              {message}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;