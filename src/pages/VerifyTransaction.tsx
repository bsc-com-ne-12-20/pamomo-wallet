import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const VerifyTransaction: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [transactionAmount, setTransactionAmount] = useState<number | null>(null);
  const [error, setError] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const txRef = queryParams.get('tx_ref');

    const savedEmail = localStorage.getItem('recipientEmail');
    if (savedEmail) {
      setCustomerEmail(savedEmail);
    }

    if (txRef && savedEmail) {
      verifyPayment(txRef, savedEmail);
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

      if (result.status === 'success' && result.data.status === 'success') {
        const deductedAmount = parseFloat(result.data.amount) * 0.97;
        setTransactionAmount(deductedAmount);
        setStatus('success');

        setTimeout(() => {
          sendPaymentDetails(deductedAmount, email);
        }, 2000);
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

      localStorage.removeItem('recipientEmail');
      localStorage.removeItem('depositAmount');
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to send payment details. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-8 w-96">
        <div className="text-center mb-6">
          {status === 'loading' && (
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          )}
          {status === 'success' && (
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
          )}
          {status === 'failed' && (
            <CheckCircle size={48} className="text-red-500 mx-auto mb-4" />
          )}

          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {status === 'loading' ? 'Verifying Payment...' : 'Payment Verified'}
          </h2>

          {status === 'failed' && <p className="text-red-500">{error}</p>}

          {status === 'success' && (
            <div>
              <p className="text-gray-700 mb-4">
                Payment was successful. The amount after 3% deduction is:
              </p>
              <p className="text-xl font-bold text-gray-800 mb-4">
                MWK {transactionAmount?.toFixed(2)}
              </p>
              <p className="text-gray-500">Redirecting you back to the dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyTransaction;
