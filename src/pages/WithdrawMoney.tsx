import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { KeyRound, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface WithdrawMoneyProps {
  username: string;
  onLogout: () => void;
}

const WithdrawMoney: React.FC<WithdrawMoneyProps> = ({ username, onLogout }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [transactionFee, setTransactionFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [email, setEmail] = useState(username);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBalance = async () => {
      const email = localStorage.getItem('email');

      if (!email) {
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
          body: JSON.stringify({ email: email }),
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

  useEffect(() => {
    const amountNum = parseFloat(amount);
    if (!isNaN(amountNum) && amountNum > 0) {
      const fee = amountNum * 0.03;
      setTransactionFee(fee);
      setTotalDeduction(amountNum + fee);
    } else {
      setTransactionFee(0);
      setTotalDeduction(0);
    }
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!amount) {
      setError('Please fill in the amount field');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (totalDeduction > (balance || 0)) {
      setError('Insufficient balance');
      return;
    }

    try {
      const response = await axios.post('https://mtima.onrender.com/api/v1/wtdr/', {
        email: email,
        amount: amountNum,
      });

      if (response.status === 200 || response.status === 201) {
        const { amount } = response.data;
        setSuccess(`Successfully Withdrawn MK${amount}`);
        setAmount('');
        setEmail(username);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError('Transaction failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.non_field_errors || 'An error occurred. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Withdraw Money</h2>
          
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
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            {amount && (
              <div className="mb-4">
                <p className="text-sm text-gray-700">Transaction Fee: MK{transactionFee.toFixed(2)}</p>
                <p className="text-sm text-gray-700 font-bold">Total Deduction: MK{totalDeduction.toFixed(2)}</p>
              </div>
            )}

            {error && <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">{error}</div>}
            {success && <div className="mb-4 p-2 bg-green-50 text-green-500 rounded-md text-sm">{success}</div>}
            
            <button
              type="submit"
              className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
            >
              Withdraw Money
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WithdrawMoney;