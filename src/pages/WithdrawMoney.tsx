import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Store, ArrowLeft, AlertTriangle, QrCode, Banknote } from 'lucide-react';
import axios from 'axios';
import { 
  TRANSACTION_LIMITS, 
  WITHDRAWAL_FEE_PERCENTAGE,
  API_BASE_URL 
} from '../utils/constants';

// Import our success and confirmation modals
import WithdrawalSuccess from '../components/WithdrawalSuccess';
import WithdrawalConfirmationModal from '../components/WithdrawalConfirmationModal';
import QRScannerModal from '../components/sendmoney/QRScannerModal';
import AgentCodeConfirmationModal from '../components/AgentCodeConfirmationModal';

interface WithdrawMoneyProps {
  username: string;
  onLogout: () => void;
  isVerified: boolean;
}

interface SubscriptionPlan {
  plan: string;
  period: string;
  status: string;
  expiry_date: string;
  auto_renew: boolean;
  current_balance?: number;
}

const WithdrawMoney: React.FC<WithdrawMoneyProps> = ({ username, onLogout, isVerified }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionFee, setTransactionFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [agentCode, setAgentCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [savedAgentCode, setSavedAgentCode] = useState('');
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showAgentCodeConfirmation, setShowAgentCodeConfirmation] = useState(false);  const [scannedAgentCode, setScannedAgentCode] = useState('');
  const [isVerifyingAgentCode, setIsVerifyingAgentCode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Fetch subscription details
    const fetchSubscription = async () => {
      setSubscriptionLoading(true);
      try {
        const email = localStorage.getItem('email');
        if (!email) return;
        
        const response = await axios.post(`${API_BASE_URL}/subscriptions/check-subscription/`, {
          email
        });
        
        if (response.status === 200) {
          setSubscription(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription details:', error);
        // Default to free plan if fetch fails
        setSubscription({
          plan: 'FREE',
          period: 'LIFETIME',
          status: 'ACTIVE',
          expiry_date: 'NEVER',
          auto_renew: false
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      const email = localStorage.getItem('email');

      if (!email) {
        setError('You are not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      // Check if user is verified
      if (!isVerified) {
        navigate('/verify');
        return;
      }      try {
        const response = await fetch(`${API_BASE_URL}/accounts/get-balance/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        setBalance(data.balance);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch balance');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [isVerified, navigate]);

  useEffect(() => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0) {
      const fee = amountNum * WITHDRAWAL_FEE_PERCENTAGE;
      setTransactionFee(fee);
      setTotalDeduction(amountNum + fee);
    } else {
      setTransactionFee(0);
      setTotalDeduction(0);
    }
  }, [amount]);

  const getTransactionLimit = (): number => {
    if (!subscription) return TRANSACTION_LIMITS.FREE;
    return TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS] || TRANSACTION_LIMITS.FREE;
  };

  const checkTransactionLimit = (amountNum: number): boolean => {
    if (!subscription) return true;
    
    const limit = TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS] || TRANSACTION_LIMITS.FREE;
    return amountNum <= limit;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate inputs before showing confirmation
    if (!amount) {
      setError('Please fill in the amount field');
      return;
    }

    if (!agentCode) {
      setError('Please enter the agent code');
      return;
    }

    const agentCodeRegex = /^\d{6}$/;
    if (!agentCodeRegex.test(agentCode)) {
      setError('Please enter a valid 6-digit agent code');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!checkTransactionLimit(amountNum)) {
      setError(`Transaction amount exceeds your ${subscription?.plan} plan limit of MWK${getTransactionLimit().toLocaleString()}. Please upgrade your subscription.`);
      return;
    }

    if (totalDeduction > (balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    // All validations passed, show confirmation modal
    setShowConfirmationModal(true);
  };
  const processWithdrawal = async () => {
    setIsProcessing(true);
    setShowConfirmationModal(false);

    try {
      const email = localStorage.getItem('email');
      const amountNum = parseFloat(amount);
      
      const response = await axios.post(`https://securemomo-middleware.onrender.com/api/v1/wtdr/`, {
        sender_email: email,
        amount: amountNum,
        agentCode: agentCode,
      });

      if (response.status === 200 || response.status === 201) {
        const { amount } = response.data;
        
        // Store current agent code for the success modal
        setSavedAgentCode(agentCode);
        
        // Clear form fields
        setAmount('');
        setAgentCode('');
        
        // Set data for success modal
        setWithdrawalAmount(amount.toString());
        
        // Show success modal
        setShowSuccessPopup(true);
      } else {
        setError('Transaction failed. Please try again.');
      }    
    } catch (err: any) {
      // Handle specific error status codes
      if (err.response) {
        if (err.response.status === 404) {
          setError('Agent code not found. Please verify the code and try again.');
        } else if (err.response?.data?.non_field_errors) {
          setError(err.response.data.non_field_errors);
        } else {
          setError('An error occurred while processing your withdrawal. Please try again.');
        }
      } else {
        setError('Network error. Please check your connection and try again.');
      }
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCancelWithdrawal = () => {
    setShowConfirmationModal(false);
  };

  const handleUpgradeClick = () => {
    navigate('/subscription');
  };

  const formatMwk = (amount: number): string => {
    return `MWK${amount.toLocaleString()}`;
  };

  // Simple spinning loader component that matches the app's primary color
  const SimpleLoader = () => (
    <div className="flex justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#8928A4]"></div>
    </div>
  );

  // Handle QR code scanning
  const handleScanQRCode = () => {
    setShowQRScanner(true);
  };
  
  // Handle the QR scan result
  const handleScanResult = (result: string | null) => {
    if (result) {
      // Extract the agent code from the result
      // Assuming QR code directly contains the 6-digit agent code
      const agentCodeRegex = /^\d{6}$/;
      if (agentCodeRegex.test(result)) {
        setScannedAgentCode(result);
        setShowQRScanner(false);
        setShowAgentCodeConfirmation(true);
      } else {
        setError('Invalid agent code format in QR code');
        setShowQRScanner(false);
      }
    }
  };

  // Handle image upload for QR scanning
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Process the image (in a real app, this would use a QR code library to decode)
      console.log("QR code image uploaded:", file.name);
      // For demo purposes, just close the modal
      setShowQRScanner(false);
    }
  };

  // Confirm the scanned agent code
  const confirmAgentCode = () => {
    setAgentCode(scannedAgentCode);
    setShowAgentCodeConfirmation(false);
  };

  // Cancel the scanned agent code
  const cancelAgentCode = () => {
    setScannedAgentCode('');
    setShowAgentCodeConfirmation(false);
  };
  useEffect(() => {
    // Check if we have agent code in location state (from QR code)
    const state = location.state as { agentCode?: string } | undefined;
    if (state?.agentCode) {
      // Don't immediately set the agent code, wait for confirmation
      setScannedAgentCode(state.agentCode);
      
      // Show the agent code confirmation modal for the user to verify
      setShowAgentCodeConfirmation(true);
      
      // Clear the location state to prevent reapplying on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
        
        {subscription && subscription.plan !== 'PREMIUM' && !subscriptionLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertTriangle size={20} className="text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Transaction Limit: {formatMwk(TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS])}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Your current subscription limits you to{' '}
                {formatMwk(TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS])} per transaction.
                <button 
                  onClick={handleUpgradeClick}
                  className="ml-1 text-[#8928A4] hover:underline"
                >
                  Upgrade now
                </button>
              </p>
            </div>
          </div>
        )}
        
        {isProcessing ? (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto flex flex-col items-center justify-center">
            <SimpleLoader />
            <p className="mt-4 text-gray-600">Processing your withdrawal...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Withdraw Money</h2>
            
            {loading ? (
              <div className="bg-purple-50 p-4 rounded-lg mb-6 animate-pulse">
                <p className="text-sm text-gray-600">Available Balance</p>
                <div className="h-6 bg-purple-200 rounded w-1/3"></div>
              </div>
            ) : (
              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-600">Available Balance</p>
                <p className="text-xl font-bold text-[#8928A4]">MK{balance?.toLocaleString()}</p>
              </div>
            )}
            <form onSubmit={handleSubmit}>              <div className="mb-4">
                <label htmlFor="agentCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Store className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="agentCode"
                    className="pl-10 pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                    placeholder="Enter 6-digit agent code"
                    value={agentCode}
                    onChange={(e) => setAgentCode(e.target.value)}
                    maxLength={6}
                    pattern="\d{6}"
                  />
                  <button
                    type="button"
                    onClick={handleScanQRCode}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8928A4] hover:text-[#7a2391]"
                  >
                    <QrCode size={20} />
                  </button>
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Enter the 6-digit code provided by the agent or scan QR code
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="amount" className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
                  <span>Amount</span>
                  {subscription && subscription.plan !== 'PREMIUM' && (
                    <span className="text-xs text-gray-500">
                      Limit: {formatMwk(getTransactionLimit())}
                    </span>
                  )}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <p className="text-gray-400"><b>MK</b></p>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-[#8928A4] sm:text-sm border p-2 ${
                      parseFloat(amount) > getTransactionLimit() 
                        ? 'border-red-300 focus:border-red-500 bg-red-50' 
                        : 'border-gray-300 focus:border-[#8928A4]'
                    }`}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                  />
                </div>
                
                {parseFloat(amount) > getTransactionLimit() && (
                  <div className="mt-1 flex items-center text-xs text-red-600">
                    <AlertTriangle size={12} className="mr-1" />
                    <span>Amount exceeds your subscription limit</span>
                  </div>
                )}
                
                {parseFloat(amount) > (getTransactionLimit() * 0.8) && parseFloat(amount) <= getTransactionLimit() && subscription?.plan !== 'PREMIUM' && (
                  <div className="mt-1 flex items-center text-xs text-yellow-700">
                    <AlertTriangle size={12} className="mr-1" />
                    <span>Approaching transaction limit</span>
                  </div>
                )}
              </div>
              
              {amount && (
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-700">
                    Transaction Fee ({(WITHDRAWAL_FEE_PERCENTAGE * 100).toFixed()}%): 
                    <span className="font-medium"> MK{transactionFee.toFixed(2)}</span>
                  </p>
                  <p className="text-sm text-gray-700 font-bold mt-1">
                    Total Deduction: <span className="text-[#8928A4]">MK{totalDeduction.toFixed(2)}</span>
                  </p>
                </div>
              )}

              {error && <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">{error}</div>}
              {success && <div className="mb-4 p-2 bg-green-50 text-green-500 rounded-md text-sm">{success}</div>}
                <button
                type="submit"
                className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] flex items-center justify-center"
              >
                <div className="bg-white bg-opacity-20 p-1.5 rounded-full mr-2 flex items-center justify-center">
                  <Banknote size={16} className="text-white" />
                </div>
                Withdraw Money
              </button>
            </form>
          </div>
        )}
      </div>

      {showSuccessPopup && (
        <WithdrawalSuccess
          amount={withdrawalAmount}
          agentCode={savedAgentCode}
          onClose={() => setShowSuccessPopup(false)}
        />
      )}

      {showConfirmationModal && (
        <WithdrawalConfirmationModal
          amount={amount}
          agentCode={agentCode}
          fee={transactionFee}
          totalDeduction={totalDeduction}
          onConfirm={processWithdrawal}
          onCancel={handleCancelWithdrawal}
        />
      )}      {showQRScanner && (
        <QRScannerModal
          show={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScanResult={handleScanResult}
          handleImageUpload={handleImageUpload}
        />
      )}

      {showAgentCodeConfirmation && (
        <AgentCodeConfirmationModal
          show={showAgentCodeConfirmation}
          agentCode={scannedAgentCode}
          onConfirm={confirmAgentCode}
          onCancel={cancelAgentCode}
          isLoading={isVerifyingAgentCode}
        />
      )}
    </div>
  );
};

export default WithdrawMoney;