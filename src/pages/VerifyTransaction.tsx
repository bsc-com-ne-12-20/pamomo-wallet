import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, Check } from 'lucide-react';
import SimpleLoader from '../components/autopayments/SimpleLoader';

const VerifyTransaction: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [transactionAmount, setTransactionAmount] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [showSuccessDetails, setShowSuccessDetails] = useState<boolean>(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const txRef = queryParams.get('tx_ref');

    // Get email from the logged in user instead of recipientEmail
    const userEmail = localStorage.getItem('email');

    if (userEmail) {
      setCustomerEmail(userEmail);
      setTimestamp(new Date().toISOString()); // Set current timestamp
    }

    if (txRef && userEmail) {
      setTransactionId(txRef); // Store transaction reference
      verifyPayment(txRef, userEmail);
    } else {
      setError('Invalid transaction reference or missing email.');
      setStatus('failed');
    }
  }, [location]);
  const verifyPayment = async (txRef: string, email: string) => {
    try {
      const response = await fetch(`https://api.paychangu.com/verify-payment/${txRef}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer SEC-TEST-nqbbmKfBLjAN7F4XExoJqpJ0ut1rBV5T',
        },
      });

      const result = await response.json();
      console.log('Payment verification response:', result);

      if (result.status === 'success' && result.data.status === 'success') {
        const deductedAmount = parseFloat(result.data.amount) * 0.97;
        setTransactionAmount(deductedAmount);
        setStatus('success');
        
        // Set payment timestamp from response if available
        if (result.data.created_at) {
          setTimestamp(result.data.created_at);
        }

        setTimeout(() => {
          sendPaymentDetails(deductedAmount, email);
        }, 1500);
      } else {
        setError('Payment verification failed.');
        setStatus('failed');
      }
    } catch (err) {
      setError('Error verifying payment. Please try again.');
      setStatus('failed');
      console.error(err);
    }
  };
  const sendPaymentDetails = async (amount: number, email: string) => {
    try {
      const dpstRes = await fetch('https://mtima.onrender.com/api/v1/dpst/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          amount: amount.toFixed(2),
        }),
      });

      if (!dpstRes.ok) {
        const err = await dpstRes.text();
        console.error('Deposit failed:', err);
        throw new Error('Deposit failed');
      }

      // Optionally, verify updated balance
      const balanceRes = await fetch('https://mtima.onrender.com/api/v1/accounts/get-balance/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
        }),
      });

      if (!balanceRes.ok) {
        console.warn('Could not fetch updated balance');
      } else {
        const balanceData = await balanceRes.json();
        console.log('Updated Balance:', balanceData);
      }

      // Remove depositAmount from localStorage, but don't remove email as it's still needed
      localStorage.removeItem('depositAmount');
      
      // Instead of navigating directly, show the success details
      setShowSuccessDetails(true);
    } catch (err) {
      setError('Failed to send payment details. Please try again.');
      console.error(err);
    }
  };
  
  // Format timestamp to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format amount for display
  const formatAmount = (amount: number | null) => {
    if (amount === null) return '0.00';
    try {
      return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch (error) {
      return '0.00';
    }
  };
    // Navigate to dashboard
  const goToDashboard = () => {
    navigate('/dashboard');
  };  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-[#8928A4] text-white p-4">
        <div className="container mx-auto flex items-center">
          <h1 className="text-xl font-bold">Verify Transaction</h1>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col justify-center items-center px-4 py-8">
        {/* Loading or Error Display */}
        {!showSuccessDetails && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
            <div className="text-center mb-6">
              {status === 'loading' && (
                <SimpleLoader size="large" />
              )}
              {status === 'success' && !showSuccessDetails && (
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
              )}
              {status === 'failed' && (
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <XCircle size={32} className="text-red-500" />
                </div>
              )}

              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {status === 'loading' ? 'Verifying Payment...' : 'Payment Verified'}
              </h2>

              {status === 'failed' && <p className="text-red-500">{error}</p>}

              {status === 'success' && !showSuccessDetails && (
                <div>
                  <p className="text-gray-700 mb-4">
                    Payment verification successful.
                  </p>
                  <p className="text-gray-500">Preparing your transaction details...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessDetails && status === 'success' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50"></div>
            <div className="relative bg-white max-w-md w-full rounded-lg p-6 shadow-xl">
              <div className="flex flex-col items-center justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Deposit Successful!</h3>
              </div>
              
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Amount Deposited</p>
                  <p className="text-lg font-semibold text-gray-900">MK {formatAmount(transactionAmount)}</p>
                </div>
                
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="text-md font-medium text-gray-900">{transactionId}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Date & Time</p>
                  <p className="text-md font-medium text-gray-900">{formatDate(timestamp)}</p>
                </div>

                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600 mb-1">Account</p>
                  <p className="text-md font-medium text-gray-900">{customerEmail}</p>
                </div>
              </div>
                <button
                onClick={goToDashboard}
                className="mt-6 w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyTransaction;
