import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, DollarSign, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface SendMoneyProps {
  onLogout: () => void;
}

const SendMoney: React.FC<SendMoneyProps> = ({ onLogout }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionFee, setTransactionFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    const amountNum = parseFloat(value) || 0;
    const fee = amountNum * 0.03;
    setTransactionFee(fee);
    setTotalDeduction(amountNum + fee);
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const username = localStorage.getItem('username');

      if (!username) {
        setError('You are not logged in. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('https://mtima.onrender.com/api/v1/accounts/get-balance/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: username }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        setBalance(data.balance);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!receiver || !amount) {
      setError('Please fill in all fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > (balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    try {
      const senderEmail = localStorage.getItem('username');
      const response = await axios.post("https://mtima.onrender.com/api/v1/trsf/", {
        sender_email: senderEmail,
        receiver_email: receiver,
        amount: amountNum
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 201) {
        const { amount } = response.data;
        setSuccess(`Successfully sent MK${amount} to ${receiver}.`);
        setReceiver('');
        setAmount('');
        setTransactionFee(0);
        setTotalDeduction(0);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (error) {
      setError('An error occurred while processing your transaction.');
    }
  };

  const username = localStorage.getItem('username') || 'User';

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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Money</h2>
          
          {loading ? (
            <p>Loading balance...</p>
          ) : (
            <div className="bg-purple-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Available Balance</p>
              <p className="text-xl font-bold text-[#8928A4]">MK{balance?.toLocaleString()}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="receiver" className="block text-sm font-medium text-gray-700 mb-1">
                Receiver's Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="receiver"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                  placeholder="email@example.com"
                  value={receiver}
                  onChange={(e) => setReceiver(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <h1 className="text-[grey]"><b>MK</b></h1>
                </div>
                <input
                  type="number"
                  id="amount"
                  className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>
            
            {amount && (
              <div className="mb-4 text-sm text-gray-700">
                <p>Transaction Fee: <span className="font-bold">MK{transactionFee.toFixed(2)}</span></p>
                <p>Total Deduction: <span className="font-bold">MK{totalDeduction.toFixed(2)}</span></p>
              </div>
            )}

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
              Send Money
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;