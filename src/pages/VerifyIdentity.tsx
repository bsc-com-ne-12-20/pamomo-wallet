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
      
      <div className="container mx-auto px-4 py-6 sm:py-8">
      <button
  onClick={() => navigate('/dashboard')}
  className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium"
>
  <ArrowLeft size={16} className="mr-2" />
  Back to Dashboard
</button>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 md:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full mb-3 sm:mb-4">
                <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Verify Your Identity With Digital ID
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                To ensure the security of all users, we require identity verification before you can send, receive, or withdraw money.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-orange-800 mb-2">
                Why verify your identity?
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-orange-700">
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
              {/* Modified this section to be more responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-lg">
                <div className="mb-3 sm:mb-0">
                  <h4 className="font-medium text-gray-900">Digital ID Verification</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Quick and secure verification through eSignet</p>
                </div>
                <div className="w-full sm:w-auto flex justify-center sm:justify-end">
                  <EsignetSignInButton />
                </div>
              </div>

              <div className="text-center text-xs sm:text-sm text-gray-500 mt-4">
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