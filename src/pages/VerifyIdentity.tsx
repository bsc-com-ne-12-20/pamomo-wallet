import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ShieldCheck, ArrowLeft, CheckCircle2, Info } from 'lucide-react';
import EsignetSignInButton from '../components/EsignetSignInButton';

interface VerifyIdentityProps {
  username: string;
  onLogout: () => void;
  onVerify: () => void;
}

const VerifyIdentity: React.FC<VerifyIdentityProps> = ({ username, onLogout, onVerify }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />
      
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
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full mb-3 sm:mb-4">
                <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-[#8928A4]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Verify Your Identity With National ID
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
                To ensure the security of all users, we require identity verification before you can send, receive, or withdraw money.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
              <h3 className="text-base sm:text-lg font-semibold text-purple-800 mb-2">
                Why verify your identity?
              </h3>
              <ul className="space-y-2 text-sm sm:text-base text-purple-700">
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

            <div className="space-y-6">
              {/* National ID verification section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-gray-200">
                  <h4 className="font-medium text-gray-800">Digital National ID Verification</h4>
                  <p className="text-sm text-gray-600 mt-1">Verify using your Malawi National ID number - no physical ID required</p>
                </div>
                
                <div className="p-5">
                  <div className="flex flex-col space-y-5">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#8928A4]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">Enter your National ID number</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#8928A4]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">Verify with OTP sent to your registered mobile number</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-[#8928A4]" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-700">Get verified instantly and securely</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 p-3 rounded-md border border-purple-200 flex items-start">
                      <Info size={18} className="text-[#8928A4] mt-0.5 mr-2 shrink-0" />
                      <p className="text-sm text-purple-800">
                        Your information is securely encrypted and protected according to national data protection standards.
                      </p>
                    </div>
                    
                    <div className="flex justify-center mt-2">
                      {/* Custom styling for the EsignetSignInButton to match our site */}
                      <div className="w-full sm:w-auto">
                        <EsignetSignInButton />
                      </div>
                    </div>
                  </div>
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