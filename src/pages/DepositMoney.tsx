import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, User, PlusCircle } from 'lucide-react';
import SimpleLoader from '../components/autopayments/SimpleLoader';
import DepositSuccessModal from '../components/deposit/DepositSuccessModal';
import DepositConfirmationModal from '../components/deposit/DepositConfirmationModal';

interface DepositMoneyProps {
  username: string;
  onLogout: () => void;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: any[]) => void;
}

const DepositMoney: React.FC<DepositMoneyProps> = ({ onLogout }) => {  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem('email') || '';
  const MAX_DEPOSIT_AMOUNT = 1400000;
  
  // Modal states
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({
    transactionId: '',
    amount: '',
    timestamp: ''
  });  // Live validation for deposit amount
  useEffect(() => {
    if (amount) {
      const amountNum = parseFloat(amount);
      if (amountNum > MAX_DEPOSIT_AMOUNT) {
        setError(`Amount exceeds the maximum deposit limit of MK ${MAX_DEPOSIT_AMOUNT.toLocaleString()}`);
      } else if (isNaN(amountNum) || amountNum <= 0) {
        setError('Please enter a valid amount');
      } else if (amountNum < 50) {
        setError('Minimum deposit amount is MK 50');
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  }, [amount]);

  useEffect(() => {
    // Check if email exists
    if (!userEmail) {
      setError('User email not found. Please log in again.');
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const txRef = queryParams.get('tx_ref');

    if (txRef) {
      const savedAmount = localStorage.getItem('depositAmount');

      if (savedAmount) {
        setIsLoading(true);
        verifyPayment(txRef, userEmail);
      } else {
        setError('Transaction information missing. Please try again.');
      }
    }
  }, [location, userEmail]);  const verifyPayment = async (txRef: string, email: string) => {
    try {
      console.log(`🔍 Verifying deposit payment for transaction: ${txRef} for user ${email}`);
      const response = await fetch(`https://api.paychangu.com/verify-payment/${txRef}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer SEC-TEST-nqbbmKfBLjAN7F4XExoJqpJ0ut1rBV5T',
        },
      });

      const result = await response.json();
      console.log('📥 Payment verification response:', result);

      if (result.status === 'success' && result.data.status === 'success') {
        console.log('✅ Deposit payment verification successful');
        const originalAmount = parseFloat(result.data.amount);
        const deductedAmount = originalAmount * 0.97; // Apply 3% fee
        console.log(`💰 Original amount: ${originalAmount}, After 3% fee: ${deductedAmount}`);
        
        try {          const depositResult = await sendPaymentDetails(email, deductedAmount);
          
          if (depositResult && depositResult.length > 0) {
            // Set transaction details from the API response
            setTransactionDetails({
              transactionId: depositResult[0].transaction_id || txRef,
              amount: depositResult[0].amount || deductedAmount.toFixed(2),
              timestamp: depositResult[0].time_stamp || new Date().toISOString()
            });
          } else {
            // Fallback if we don't have detailed information
            setTransactionDetails({
              transactionId: txRef,
              amount: deductedAmount.toFixed(2),
              timestamp: new Date().toISOString()
            });
          }
          
          // Show the success modal
          setShowSuccessModal(true);
          
          setSuccess('Payment successful. Amount has been added to your account.');
          localStorage.removeItem('depositAmount');
        } catch (depositError: any) {
          console.error('💥 Failed to deposit to account:', depositError);
          setError(`Payment processing failed: ${depositError?.message || 'Unknown error'}. Please contact support.`);
        }
      } else {
        console.error('❌ Deposit payment verification failed:', result);
        setError(`Transaction verification failed: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Error verifying payment:', err);
      setError('Error verifying payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };  interface DepositResponse {
    transaction_id: string;
    amount: string;
    time_stamp: string;
    trans_type: string;
  }

  const sendPaymentDetails = async (email: string, amount: number): Promise<DepositResponse[] | null> => {
    try {
      // Fix the API endpoint URL - adding trailing slash which is required
      const response = await fetch('https://mtima.onrender.com/api/v1/dpst/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amount.toFixed(2),
        }),
      });

      // Check if the API call was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Deposit API error (${response.status}):`, errorText);
        throw new Error(`Deposit failed with status ${response.status}: ${errorText}`);
      }

      setSuccess('Payment details processed and amount updated.');
      
      // Parse and return the response
      const responseData = await response.json();
      return responseData as DepositResponse[];
    } catch (err) {
      setError('Failed to send payment details. Please try again.');
      console.error(err);
      return null;
    }
  };  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/dashboard');
  };
  
  // Add new handler methods for confirmation
  const handleCancelDeposit = () => {
    setShowConfirmationModal(false);
  };
    const handleConfirmDeposit = async () => {
    console.log('Confirm deposit clicked, hiding modal and starting payment process');
    setShowConfirmationModal(false);
    setIsLoading(true);
    
    try {
      const amountNum = parseFloat(amount);
      const response = await fetch('https://api.paychangu.com/payment', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: 'Bearer SEC-TEST-nqbbmKfBLjAN7F4XExoJqpJ0ut1rBV5T',
        },
        body: JSON.stringify({
          currency: 'MWK',
          amount: amountNum.toString(),
          callback_url: 'https://pamomo-wallet.netlify.app/verifytrans',
          return_url: 'https://pamomo-wallet.netlify.app/deposit',
        }),
      });

      const result = await response.json();

      if (result.status === 'success' && result.data.checkout_url) {
        localStorage.setItem('depositAmount', amount);
        window.location.href = result.data.checkout_url;
      } else {
        setError('Transaction initiation failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Add debugging
    console.log('Form submitted, checking validation...');

    if (!amount) {
      setError('Please enter an amount');
      return;
    }

    if (!userEmail) {
      setError('User email not found. Please log in again.');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum < 50) {
      setError('Minimum deposit amount is MK 50');
      return;
    }

    if (amountNum > MAX_DEPOSIT_AMOUNT) {
      setError(`Amount exceeds the maximum deposit limit of MK ${MAX_DEPOSIT_AMOUNT.toLocaleString()}`);
      return;
    }
    
    // Show confirmation modal instead of proceeding immediately
    console.log('Validation passed, showing confirmation modal...');
    setShowConfirmationModal(true);
    console.log('showConfirmationModal set to:', true);
    
    // Prevent any other actions from happening until the confirmation modal is handled
    return;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />
      <div className="container mx-auto px-4 py-8">
        
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[300px]">
            <SimpleLoader size="large" />
            <p className="mt-4 text-gray-600 text-sm">Processing your deposit request...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Deposit Money</h2>

            {/* Display the user email (non-editable) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Account
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-600 sm:text-sm border p-2 cursor-not-allowed"
                  value={userEmail}
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Funds will be deposited to this account
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <p className="text-gray-400"><b>MK</b></p>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className={`pl-10 block w-full rounded-md shadow-sm focus:ring-[#8928A4] sm:text-sm border p-2 ${
                      parseFloat(amount) > MAX_DEPOSIT_AMOUNT 
                        ? 'border-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:border-[#8928A4]'
                    }`}
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    max={MAX_DEPOSIT_AMOUNT}
                    step="0.01"
                  />
                </div>                <div className="mt-1 flex justify-between">
                  <p className="text-xs text-gray-500">
                    Minimum: MK 50
                  </p>
                  <p className="text-xs text-gray-500">
                    Maximum: MK {MAX_DEPOSIT_AMOUNT.toLocaleString()}
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-2 bg-green-50 text-green-500 rounded-md text-sm">
                  {success}
                </div>
              )}              <button
                type="submit"
                className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] flex items-center justify-center"
                disabled={isLoading}
              >                {isLoading ? (
                  'Processing...'
                ) : (
                  <>
                    <div className="bg-purple-100 p-1.5 rounded-full mr-2 flex items-center justify-center">
                      <PlusCircle size={16} className="text-[#8928A4]" />
                    </div>
                    Deposit Money
                  </>
                )}
              </button>
            </form>
          </div>
        )}      </div>
        {/* Success Modal */}      <DepositSuccessModal
        show={showSuccessModal}
        amount={transactionDetails.amount}
        transactionId={transactionDetails.transactionId}
        timestamp={transactionDetails.timestamp}
        onClose={handleCloseSuccessModal}
      />
      
      {/* Confirmation Modal */}
      <DepositConfirmationModal
        show={showConfirmationModal}
        amount={amount}
        onConfirm={handleConfirmDeposit}
        onCancel={handleCancelDeposit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default DepositMoney;