import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Mail, DollarSign, ArrowLeft } from 'lucide-react';

interface SendMoneyProps {
  balance: number;
  onSend: (receiver: string, amount: number) => boolean;
  username: string;
  onLogout: () => void;
}

const SendMoney: React.FC<SendMoneyProps> = ({ balance, onSend, username, onLogout }) => {
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
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

    if (amountNum > balance) {
      setError('Insufficient balance');
      return;
    }

    const success = onSend(receiver, amountNum);
    if (success) {
      setSuccess(`Successfully sent $${amountNum} to ${receiver}`);
      setReceiver('');
      setAmount('');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setError('Transaction failed. Please try again.');
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Money</h2>
          
          <div className="bg-purple-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600">Available Balance</p>
            <p className="text-xl font-bold text-[#8928A4]">${balance.toLocaleString()}</p>
          </div>
          
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
              Send Money
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendMoney;