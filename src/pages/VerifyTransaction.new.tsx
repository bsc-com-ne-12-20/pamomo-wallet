import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import { DEPOSIT_FEE_PERCENTAGE } from '../utils/constants';

interface VerifyTransactionProps {
  username: string;
  onLogout: () => void;
}

interface TransactionDetails {
  amount: number;
  currency: string;
  status: string;
  reference: string;
  paymentMethod?: string;
  cardNumber?: string;
  mobileNumber?: string;
  provider?: string | null;
  timestamp?: string;
}

const VerifyTransaction: React.FC<VerifyTransactionProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');  const [txRef, setTxRef] = useState('');
  const [transactionDetails, setTransactionDetails] = useState<TransactionDetails | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [isProcessingDeposit, setIsProcessingDeposit] = useState(false);
  const [depositSuccess, setDepositSuccess] = useState<boolean | null>(null);
  const [depositMessage, setDepositMessage] = useState('');
  const maxAttempts = 3;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const txRefParam = queryParams.get('tx_ref');
    
    if (!txRefParam) {
      setError('No transaction reference provided');
      setIsLoading(false);
      return;
    }
    
    setTxRef(txRefParam);
    verifyTransaction(txRefParam);
  }, [location]);
  const verifyTransaction = async (reference: string) => {
    setIsLoading(true);
    setError('');
    
    try {
      console.log(`Verifying transaction: ${reference}`);
      
      const response = await fetch(`https://api.paychangu.com/verify-payment/${reference}`, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Authorization': `Bearer SEC-TEST-nqbbmKfBLjAN7F4XExoJqpJ0ut1rBV5T`,
        },
      });
      
      const result = await response.json();
      console.log('Verification API response:', result);
      
      if (result.status === 'success' && result.data?.status === 'success') {
        const data = result.data;
        console.log('Verification successful, transaction data:', data);
        
        // Extract relevant transaction details
        setTransactionDetails({
          amount: data.amount,
          currency: data.currency,
          status: data.status,
          reference: data.reference,
          paymentMethod: data.authorization?.channel,
          cardNumber: data.authorization?.card_number,
          mobileNumber: data.authorization?.mobile_number,
          provider: data.authorization?.provider,
          timestamp: data.authorization?.completed_at || data.updated_at
        });
          // Process deposit (amount minus 3%)
        await processDeposit(data.amount, reference);
      } else if (attempts < maxAttempts - 1) {
        // If verification not successful yet but we have more attempts, try again
        setAttempts(prev => prev + 1);
        setError('Payment verification in progress. Retrying...');
        setTimeout(() => verifyTransaction(reference), 3000);
      } else {
        setError(result.message || 'Failed to verify payment after multiple attempts');
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      setError('An error occurred while verifying your payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (txRef && attempts < maxAttempts) {
      setAttempts(prev => prev + 1);
      verifyTransaction(txRef);
    } else {
      setError('Maximum verification attempts reached');
    }
  };  const processDeposit = async (amount: number, reference: string) => {
    setIsProcessingDeposit(true);
    
    try {
      const email = localStorage.getItem('email');
      console.log('User email from localStorage:', email);
      
      if (!email) {
        setDepositSuccess(false);
        setDepositMessage('User email not found. Please log in again.');
        return;
      }

      // Calculate amount minus 3%
      const depositAmount = amount * (1 - DEPOSIT_FEE_PERCENTAGE);
      console.log(`Original amount: ${amount}, Fee: ${amount * DEPOSIT_FEE_PERCENTAGE}, Deposit amount: ${depositAmount}`);
      
      // Send payment details using fetch, matching the exact implementation in DepositMoney.tsx
      try {
        const response = await fetch('https://mtima.onrender.com/api/v1/dpst', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            amount: depositAmount.toFixed(2),
          }),
        });
        
        if (response.ok) {
          console.log('Deposit successful');
          setDepositSuccess(true);
          setDepositMessage('Payment details processed and amount updated.');
          
          // Fetch updated balance
          const balanceRes = await fetch('https://mtima.onrender.com/api/v1/accounts/get-balance/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
            }),
          });

          if (balanceRes.ok) {
            const balanceData = await balanceRes.json();
            console.log('Updated Balance:', balanceData);
            if (balanceData && balanceData.balance !== undefined) {
              localStorage.setItem('currentBalance', balanceData.balance.toString());
            }
          } else {
            console.warn('Could not fetch updated balance');
          }
          
          // Redirect to transfer complete page after successful deposit
          setTimeout(() => {
            navigate(`/transfer/complete?tx_ref=${reference}`, { replace: true });
          }, 2000);
        } else {
          const errorText = await response.text();
          console.error('Deposit failed:', errorText);
          setDepositSuccess(false);
          setDepositMessage('Failed to process deposit. Please contact support.');
        }
      } catch (err) {
        console.error('Failed to send payment details:', err);
        setDepositSuccess(false);
        setDepositMessage('Failed to send payment details. Please try again.');
      }
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      setDepositSuccess(false);
      setDepositMessage('An error occurred while processing your deposit.');
    } finally {
      setIsProcessingDeposit(false);
    }
  };
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Verifying Transaction</h2>
            {isLoading || isProcessingDeposit ? (
            <div className="flex flex-col items-center justify-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8928A4]"></div>
              <p className="text-gray-600 mt-4">
                {isLoading ? 'Verifying payment status...' : 'Processing deposit...'}
              </p>
              {isLoading && (
                <p className="text-sm text-gray-500 mt-2">Attempt {attempts + 1} of {maxAttempts}</p>
              )}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-6">
              <div className="rounded-full bg-yellow-100 p-3 mb-4">
                <XCircle size={40} className="text-yellow-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Verification Issue</h3>
              <p className="text-center text-gray-600 mb-6">{error}</p>
              
              {attempts < maxAttempts && (
                <button 
                  onClick={handleRetry} 
                  className="flex items-center px-4 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#7a2391]"
                >
                  <RefreshCw size={16} className="mr-2" /> 
                  Retry Verification
                </button>
              )}
            </div>          ) : transactionDetails ? (
            <div className="flex flex-col items-center">
              <div className="rounded-full bg-green-100 p-3 mb-4">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">Payment Verified</h3>
              
              {depositSuccess === true ? (
                <p className="text-center text-green-600 mb-6">
                  {depositMessage} Redirecting to completion page...
                </p>
              ) : depositSuccess === false ? (
                <p className="text-center text-red-600 mb-6">
                  {depositMessage}
                </p>
              ) : (
                <p className="text-center text-gray-600 mb-6">
                  Your payment has been verified and deposit is being processed...
                </p>
              )}
              
              <div className="bg-gray-50 p-4 rounded-md w-full">
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Total Amount:</span>
                  <span className="font-medium">
                    {transactionDetails.currency} {transactionDetails.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between py-2">
                  <span className="text-sm text-gray-500">Fee (3%):</span>
                  <span className="font-medium text-gray-700">
                    {transactionDetails.currency} {(transactionDetails.amount * DEPOSIT_FEE_PERCENTAGE).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between py-2 border-t border-gray-100 pt-2 mt-1">
                  <span className="text-sm font-medium text-gray-700">Deposited Amount:</span>
                  <span className="font-bold text-[#8928A4]">
                    {transactionDetails.currency} {(transactionDetails.amount * (1 - DEPOSIT_FEE_PERCENTAGE)).toLocaleString()}
                  </span>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Reference:</span>
                    <span className="font-medium">{transactionDetails.reference}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Status:</span>
                    <span className="font-medium text-green-600">
                      {transactionDetails.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Method:</span>
                    <span className="font-medium">{transactionDetails.paymentMethod || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-sm text-gray-500">Date:</span>
                    <span className="font-medium">{formatDate(transactionDetails.timestamp)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600">
              <p>No transaction information found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyTransaction;
