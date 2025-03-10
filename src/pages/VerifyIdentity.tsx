import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import EsignetSignInButton from '../components/EsignetSignInButton';

interface VerifyIdentityProps {
  username: string;
  onLogout: () => void;
  onVerify: () => void;
}

const VerifyIdentity: React.FC<VerifyIdentityProps> = ({ username, onLogout, onVerify }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const handleVerification = () => {
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setIsVerifying(false);
      onVerify();
      navigate('/dashboard');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center text-[#8928A4] mb-6 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </button>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                <ShieldCheck className="w-8 h-8 text-orange-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Identity With Digital ID
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                To ensure the security of all users, we require identity verification before you can send, receive, or withdraw money.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Why verify your identity?
              </h3>
              <ul className="space-y-2 text-orange-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Protect against fraud and unauthorized access
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Comply with financial regulations
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  Enable secure money transfers
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">Digital ID Verification</h4>
                  <p className="text-sm text-gray-600">Quick and secure verification through eSignet</p>
                </div>
                <EsignetSignInButton />
              </div>

              <div className="text-center text-sm text-gray-500 mt-4">
                <p>
                  By verifying your identity, you agree to our{' '}
                  <a href="#" className="text-[#8928A4] hover:underline">Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" className="text-[#8928A4] hover:underline">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyIdentity;