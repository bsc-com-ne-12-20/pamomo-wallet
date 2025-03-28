import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, DollarSign, ArrowLeft } from 'lucide-react';

interface DepositMoneyProps {
  username: string;
  onLogout: () => void;
  setBalance: (balance: number) => void;
  setTransactions: (transactions: any[]) => void;
}

const DepositMoney: React.FC<DepositMoneyProps> = ({ username, onLogout }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const txRef = queryParams.get('tx_ref');

    if (txRef) {
      const savedEmail = localStorage.getItem('recipientEmail');
      const savedAmount = localStorage.getItem('depositAmount');

      if (savedEmail && savedAmount) {
        setRecipient(savedEmail);
        verifyPayment(txRef, savedEmail);
      } else {
        setError('Recipient information missing. Please try again.');
      }
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
        await sendPaymentDetails(email, deductedAmount);
        setSuccess('Payment successful. Amount deducted and sent.');
        localStorage.removeItem('recipientEmail');
        localStorage.removeItem('depositAmount');
      } else {
        setError('Transaction verification failed.');
      }
    } catch (err) {
      setError('Error verifying payment. Please try again.');
      console.error(err);
    }
  };

  const sendPaymentDetails = async (email: string, amount: number) => {
    try {
      await fetch('https://mtima.onrender.com/api/v1/dpst', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          amount: amount.toFixed(2),
        }),
      });

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

    if (!recipient || !amount) {
      setError('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
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
        localStorage.setItem('recipientEmail', recipient);
        localStorage.setItem('depositAmount', amount);
        window.location.href = result.data.checkout_url;
      } else {
        setError('Transaction initiation failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }
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

        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Deposit Money</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient's Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="recipient"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                  placeholder="email@example.com"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
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
            >
              Deposit Money
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DepositMoney;
