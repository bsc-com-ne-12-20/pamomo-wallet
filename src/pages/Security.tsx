import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code'; // Import QRCode component

const Security: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false); // State for 2FA status
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [totpUri, setTotpUri] = useState(''); // State to store the TOTP URI
  const [instructions, setInstructions] = useState(''); // State to store the instructions
  const navigate = useNavigate();

  // Check 2FA status from local storage on component mount
  useEffect(() => {
    const stored2FAStatus = localStorage.getItem('is2FAEnabled') === 'true';
    setIs2FAEnabled(stored2FAStatus);
  }, []);

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    // Simulate password change logic
    setTimeout(() => {
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handleEnable2FA = async () => {
    setError('');
    setSuccess('');
    setTotpUri('');
    setInstructions('');

    const email = localStorage.getItem('email'); // Get the user's email from local storage
    if (!email) {
      setError('User email not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post('http://mtima.onrender.com/api/v1/accounts/enable-2fa/', {
        email,
      });

      if (response.status === 200) {
        const data = response.data;
        setIs2FAEnabled(true);
        setTotpUri(data.totp_uri); // Store the TOTP URI
        setInstructions(data.instructions); // Store the instructions
        localStorage.setItem('is2FAEnabled', 'true'); // Update 2FA status in local storage
        setSuccess('2FA enabled successfully!');
      } else {
        setError('Failed to enable 2FA. Please try again.');
      }
    } catch (err) {
      console.error('Error enabling 2FA:', err);
      setError('An error occurred while enabling 2FA. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    setError('');
    setSuccess('');

    const email = localStorage.getItem('email'); // Get the user's email from local storage
    if (!email) {
      setError('User email not found. Please log in again.');
      return;
    }

    try {
      const response = await axios.post('http://mtima.onrender.com/api/v1/accounts/disable-2fa/', {
        email,
      });

      if (response.status === 200) {
        const data = response.data;
        setIs2FAEnabled(false); // Update the state to reflect that 2FA is disabled
        localStorage.setItem('is2FAEnabled', 'false'); // Update 2FA status in local storage
        setSuccess(data.message); // Display the success message from the response
        setTotpUri(''); // Clear the TOTP URI
        setInstructions(''); // Clear the instructions
      } else {
        setError('Failed to disable 2FA. Please try again.');
      }
    } catch (err) {
      console.error('Error disabling 2FA:', err);
      setError('An error occurred while disabling 2FA. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-lg bg-white rounded-lg shadow-md p-6">
        {/* Back to Dashboard Button */}
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 text-[#8928A4] hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-6">Security Settings</h2>

        {/* Change Password Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Change Password</h3>
          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm p-2"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm p-2"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm p-2"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">{success}</p>}
            <button
              type="submit"
              className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
            >
              Change Password
            </button>
          </form>
        </div>

        {/* Enable 2FA Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Two-Factor Authentication (2FA)</h3>
          <p className="text-sm text-gray-600 mb-4">
            {is2FAEnabled
              ? '2FA is currently enabled for your account.'
              : '2FA is currently disabled for your account.'}
          </p>
          {is2FAEnabled && totpUri && (
            <div className="mb-4 bg-purple-50 p-4 rounded-md">
              <div className="flex justify-center mb-4">
                <QRCode value={totpUri} size={150} /> {/* Render QR code for TOTP URI */}
              </div>
              <p className="text-sm font-bold text-gray-800 text-center break-words bg-white p-2 rounded-md">
                {totpUri}
              </p>
            </div>
          )}
          <button
            onClick={is2FAEnabled ? handleDisable2FA : handleEnable2FA}
            className={`w-full ${
              is2FAEnabled ? 'bg-red-500 hover:bg-red-600' : 'bg-[#8928A4] hover:bg-[#7a2391]'
            } text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]`}
          >
            {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
          </button>
        </div>

        {/* Additional Security Section */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Security</h3>
          <p className="text-sm text-gray-600 mb-4">
            Review your account's security settings and ensure your account is protected.
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600">
            <li>Ensure your email address is up-to-date.</li>
            <li>Use a strong and unique password.</li>
            <li>Enable Two-Factor Authentication (2FA) for added security.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Security;