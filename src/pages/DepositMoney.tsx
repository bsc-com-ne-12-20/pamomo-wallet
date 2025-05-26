import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { DollarSign, ArrowLeft, User } from 'lucide-react';
import Loader2 from '../components/Loader2';

interface DepositMoneyProps {
  username: string;
  onLogout: () => void;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: any[]) => void;
}

const DepositMoney: React.FC<DepositMoneyProps> = ({ username, onLogout }) => {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem('email') || '';

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
  }, [location, userEmail]);
  const verifyPayment = async (txRef: string, email: string) => {
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
        
        try {
          await sendPaymentDetails(email, deductedAmount);
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
  };
  const sendPaymentDetails = async (email: string, amount: number) => {
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
    } catch (err) {
      setError('Failed to send payment details. Please try again.');
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!amount) {
      setError('Please enter an amount');
      setIsLoading(false);
      return;
    }

    if (!userEmail) {
      setError('User email not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      setIsLoading(false);
      return;
    }

    try {
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
        </button>

        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 />
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
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <p className="text-gray-400"><b>MK</b></p>
                  </div>
                  <input
                    type="number"
                    id="amount"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                  />
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
              )}

              <button
                type="submit"
                className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Deposit Money'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositMoney;