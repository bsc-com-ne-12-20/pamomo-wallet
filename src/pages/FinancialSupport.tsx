import React, { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, Mail, Phone, Clock, HelpCircle, FileText, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface CustomerSupportPageProps {
  username: string;
  onLogout: () => void;
}

const CustomerSupportPage: React.FC<CustomerSupportPageProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('chat');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading delay for the iframe
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle tab switching
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsLoading(true);
    
    // Reset loading state after a delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-16 sm:pt-20">        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-4 sm:mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium text-sm"
        >
          <ArrowLeft size={14} className="mr-1 sm:mr-2" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-4xl mx-auto">          {/* Header with improved design - mobile responsive */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 pb-3 border-b border-gray-200">
            <div className="flex items-center mb-2 sm:mb-0">
              <div className="bg-purple-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3">
                <MessageSquare size={20} className="text-[#8928A4]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Customer Support</h2>
                <p className="text-xs sm:text-sm text-gray-500">We're here to help you with any questions</p>
              </div>
            </div>
            <div className="flex items-center text-xs sm:text-sm text-gray-500 ml-8 sm:ml-0">
              <Clock size={14} className="inline mr-1" />
              <span>24/7 Support</span>
            </div>
          </div>
            {/* Tab navigation - made mobile responsive */}
          <div className="flex flex-wrap border-b border-gray-200 mb-6">
            <button
              onClick={() => handleTabChange('chat')}
              className={`py-2 px-3 sm:py-3 sm:px-6 font-medium text-xs sm:text-sm flex items-center ${
                activeTab === 'chat' 
                  ? 'text-[#8928A4] border-b-2 border-[#8928A4]' 
                  : 'text-gray-500 hover:text-[#8928A4]'
              }`}
            >
              <MessageSquare size={16} className="mr-1 sm:mr-2" />
              <span className="sm:inline">Live Chat</span>
            </button>
            <button
              onClick={() => handleTabChange('faq')}
              className={`py-2 px-3 sm:py-3 sm:px-6 font-medium text-xs sm:text-sm flex items-center ${
                activeTab === 'faq' 
                  ? 'text-[#8928A4] border-b-2 border-[#8928A4]' 
                  : 'text-gray-500 hover:text-[#8928A4]'
              }`}
            >
              <HelpCircle size={16} className="mr-1 sm:mr-2" />
              <span className="sm:inline">FAQ</span>
            </button>
            <button
              onClick={() => handleTabChange('docs')}
              className={`py-2 px-3 sm:py-3 sm:px-6 font-medium text-xs sm:text-sm flex items-center ${
                activeTab === 'docs' 
                  ? 'text-[#8928A4] border-b-2 border-[#8928A4]' 
                  : 'text-gray-500 hover:text-[#8928A4]'
              }`}
            >
              <FileText size={16} className="mr-1 sm:mr-2" />
              <span className="sm:inline">Docs</span>
            </button>
          </div>
          
          {/* Chat tab content */}
          {activeTab === 'chat' && (            <div className="relative">
              {/* Loading overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white z-10 animate-fade-in">
                  <div className="flex flex-col items-center">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full border-4 border-[#8928A4] border-t-transparent animate-spin"></div>
                    <p className="mt-3 text-sm sm:text-base text-[#8928A4] font-medium animate-pulse">Loading support chat...</p>
                  </div>
                </div>
              )}
              
              {/* Chat iframe with reduced height and responsive sizing */}
              <div className="border rounded-lg overflow-hidden" style={{ height: "400px" }}>
                <iframe
                  src="https://www.chatbase.co/chatbot-iframe/En8X6Ub3qsqKpqA6dWkqj"
                  width="100%"
                  style={{ height: "100%", minHeight: "400px" }}
                  frameBorder="0"
                  title="Momo Customer Support"
                  className={isLoading ? 'opacity-0' : 'animate-fade-in'}
                ></iframe>
              </div>
            </div>
          )}
          
          {/* FAQ tab content */}
          {activeTab === 'faq' && (
            <div className={`space-y-4 ${isLoading ? 'opacity-0' : 'animate-fade-in'}`}>
              {isLoading ? null : (
                <>                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                      <HelpCircle size={16} className="text-[#8928A4] mr-1.5 sm:mr-2 flex-shrink-0" />
                      How do I deposit money into my Momo wallet?
                    </h3>
                    <p className="text-gray-600 pl-6 sm:pl-7 text-xs sm:text-sm">
                      You can deposit money through mobile money services, bank transfers, 
                      or cash deposit at authorized agents. Navigate to the "Deposit" section 
                      in your dashboard and follow the instructions.
                    </p>
                  </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                      <HelpCircle size={16} className="text-[#8928A4] mr-1.5 sm:mr-2 flex-shrink-0" />
                      How do I send money to another user?
                    </h3>
                    <p className="text-gray-600 pl-6 sm:pl-7 text-xs sm:text-sm">
                      From your dashboard, click on "Send Money" then enter the recipient's 
                      phone number or email, specify the amount, and confirm the transaction. 
                      You can also use the QR code feature for faster transfers.
                    </p>
                  </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                      <HelpCircle size={16} className="text-[#8928A4] mr-1.5 sm:mr-2 flex-shrink-0" />
                      What are the transaction limits?
                    </h3>
                    <p className="text-gray-600 pl-6 sm:pl-7 text-xs sm:text-sm">
                      Transaction limits depend on your subscription tier:
                      <ul className="list-disc list-inside mt-2 space-y-1">                        <li>Free tier: Up to MK2,000 per transaction</li>
                        <li>Basic tier: Up to MK100,000 per transaction</li>
                        <li>Premium tier: Unlimited transaction amounts</li>
                      </ul>
                    </p>
                  </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                      <HelpCircle size={16} className="text-[#8928A4] mr-1.5 sm:mr-2 flex-shrink-0" />
                      How do I withdraw money from my Momo wallet?
                    </h3>
                    <p className="text-gray-600 pl-6 sm:pl-7 text-xs sm:text-sm">
                      Go to the "Withdraw" section from your dashboard, select your preferred 
                      withdrawal method (mobile money, bank transfer, etc.), enter the amount, 
                      and follow the verification process to complete the transaction.
                    </p>
                  </div>
                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-2 flex items-center text-sm sm:text-base">
                      <HelpCircle size={16} className="text-[#8928A4] mr-1.5 sm:mr-2 flex-shrink-0" />
                      What should I do if my transaction fails?
                    </h3>
                    <p className="text-gray-600 pl-6 sm:pl-7 text-xs sm:text-sm">
                      First, check your transaction history to verify the status. If the money 
                      was deducted but the recipient didn't receive it, please contact our 
                      customer support with your transaction ID for immediate assistance.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Documentation tab content */}
          {activeTab === 'docs' && (
            <div className={`space-y-6 ${isLoading ? 'opacity-0' : 'animate-fade-in'}`}>
              {isLoading ? null : (
                <>
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-lg text-gray-800 mb-3">User Guide</h3>
                    <p className="text-gray-600 mb-4">
                      A comprehensive guide covering all aspects of using the Momo Wallet platform,
                      from account creation to advanced features.
                    </p>
                    <a 
                      href="#" 
                      className="flex items-center text-[#8928A4] font-medium hover:underline"
                    >
                      View User Guide
                      <ExternalLink size={16} className="ml-1" />
                    </a>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-lg text-gray-800 mb-3">Security Best Practices</h3>
                    <p className="text-gray-600 mb-4">
                      Learn how to keep your account secure, including setting up two-factor authentication,
                      recognizing potential scams, and managing secure transactions.
                    </p>
                    <a 
                      href="#" 
                      className="flex items-center text-[#8928A4] font-medium hover:underline"
                    >
                      View Security Guide
                      <ExternalLink size={16} className="ml-1" />
                    </a>
                  </div>
                  
                  <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                    <h3 className="font-medium text-lg text-gray-800 mb-3">API Documentation</h3>
                    <p className="text-gray-600 mb-4">
                      For developers looking to integrate with the Momo Wallet platform,
                      our API documentation provides comprehensive technical details.
                    </p>
                    <a 
                      href="#" 
                      className="flex items-center text-[#8928A4] font-medium hover:underline"
                    >
                      View API Docs
                      <ExternalLink size={16} className="ml-1" />
                    </a>
                  </div>
                </>
              )}
            </div>
          )}
            {/* Contact Information with improved design for mobile */}
          <div className="mt-6 p-4 sm:p-5 bg-gradient-to-r from-purple-50 to-white rounded-lg border border-purple-100">
            <h3 className="text-base sm:text-lg font-medium text-gray-800 mb-3 sm:mb-4 flex items-center">
              <Phone size={18} className="mr-2 text-[#8928A4]" />
              Contact Us Directly
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="bg-[#f9f0fc] p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3">
                    <Mail size={16} className="text-[#8928A4]" />
                  </div>
                  <h4 className="font-medium text-sm sm:text-base">Email Support</h4>
                </div>
                <p className="text-gray-600 mb-1.5 sm:mb-2 text-xs sm:text-sm">24/7 email support:</p>
                <a href="mailto:securemomo.africa@gmail.com" className="text-[#8928A4] font-medium hover:underline text-xs sm:text-sm break-all">
                  securemomo.africa@gmail.com
                </a>
                <p className="text-xs text-gray-500 mt-1.5 sm:mt-2">Response time: 1-2 hours</p>
              </div>
              
              <div className="p-3 sm:p-4 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2 sm:mb-3">
                  <div className="bg-[#f9f0fc] p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3">
                    <Phone size={16} className="text-[#8928A4]" />
                  </div>
                  <h4 className="font-medium text-sm sm:text-base">Phone Support</h4>
                </div>
                <p className="text-gray-600 mb-1.5 sm:mb-2 text-xs sm:text-sm">Call our support team:</p>
                <div className="space-y-1">
                  <a href="tel:+265994921108" className="text-[#8928A4] block font-medium hover:underline text-xs sm:text-sm">
                    +265 994 921 108
                  </a>
                  <a href="tel:+265885259888" className="text-[#8928A4] block font-medium hover:underline text-xs sm:text-sm">
                    +265 885 259 888
                  </a>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 sm:mt-2">Hours: 8AM - 8PM (Mon-Sat)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupportPage;
