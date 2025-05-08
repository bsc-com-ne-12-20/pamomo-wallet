import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Search, Receipt, AlertCircle, Landmark, Zap, Droplet, Wifi, Phone, Home, ShoppingBag, Car } from 'lucide-react';
import ServiceProviderView, { ServiceProvider, ServiceCategory } from '../components/autopayments/ServiceProviderView';

interface BillPaymentProps {
  username: string;
  onLogout: () => void;
}

const BillPayment: React.FC<BillPaymentProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState<number | null>(null);
  const [stage, setStage] = useState<'select-provider' | 'payment-form' | 'confirmation' | 'success'>('select-provider');
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [billRefNumber, setBillRefNumber] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentNote, setPaymentNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);

  // Fetch user balance
  useEffect(() => {
    const fetchBalance = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;

      try {
        const response = await fetch('https://mtima.onrender.com/api/v1/accounts/get-balance/', {
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
      } catch (err) {
        console.error(err);
        setBalance(null);
      }
    };

    fetchBalance();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
    onLogout();
    navigate('/login', { replace: true });
  };

  const handleBack = () => {
    if (stage === 'payment-form') {
      setStage('select-provider');
      setSelectedProvider(null);
    } else if (stage === 'confirmation') {
      setStage('payment-form');
    } else if (stage === 'success') {
      // Reset and go back to the beginning
      setStage('select-provider');
      setSelectedProvider(null);
      setBillRefNumber('');
      setAmount('');
      setPaymentNote('');
    } else {
      navigate('/dashboard');
    }
  };

  const handleSelectProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setStage('payment-form');
  };

  const handleServiceTypeSelect = (serviceType: string | null) => {
    setSelectedServiceType(serviceType);
  };

  const handleProceedToConfirmation = () => {
    if (!billRefNumber.trim()) {
      setError('Bill reference number is required');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (balance !== null && parseFloat(amount) > balance) {
      setError('Insufficient balance for this payment');
      return;
    }

    setError(null);
    setStage('confirmation');
  };

  const handlePayBill = async () => {
    if (!selectedProvider || !billRefNumber || !amount) return;

    setLoading(true);
    setError(null);
    
    const email = localStorage.getItem('email');
    if (!email) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    // Simulate API call for bill payment
    try {
      // This would be replaced with an actual API call in production
      setTimeout(() => {
        // Simulating successful payment
        setLoading(false);
        setStage('success');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError('Failed to process payment. Please try again.');
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (stage) {
      case 'select-provider':
        return (
          <ServiceProviderView 
            onBack={handleBack}
            onSelectProvider={handleSelectProvider}
            onServiceTypeSelect={handleServiceTypeSelect}
            selectedServiceType={selectedServiceType}
          />
        );

      case 'payment-form':
        return (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="mb-6">
              <button 
                onClick={handleBack}
                className="flex items-center justify-center px-4 py-3 rounded-md text-[#8928A4] bg-[#f9f0fc] hover:bg-[#f3e0fa] transition-colors text-base w-full md:w-auto"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>

              <h3 className="font-medium text-lg text-gray-800 mt-4">Pay Bill</h3>
              <p className="text-sm text-gray-500">Fill in the details to pay your bill</p>
            </div>

            {selectedProvider && (
              <div className="mb-6 flex items-center p-4 border rounded-lg bg-purple-50">
                <div className="p-2 rounded-full bg-purple-100 mr-4">
                  {selectedProvider.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{selectedProvider.name}</h4>
                  <p className="text-sm text-gray-500">{selectedProvider.email}</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="billRef" className="block text-sm font-medium text-gray-700 mb-1">
                  Bill Reference Number
                </label>
                <input
                  type="text"
                  id="billRef"
                  className="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm p-3 bg-white hover:border-gray-400 transition-colors"
                  placeholder="Enter account/reference number"
                  value={billRefNumber}
                  onChange={(e) => setBillRefNumber(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (MK)
                </label>
                <input
                  type="number"
                  id="amount"
                  className="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm p-3 bg-white hover:border-gray-400 transition-colors"
                  placeholder="Enter amount to pay"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Note (Optional)
                </label>
                <textarea
                  id="note"
                  rows={2}
                  className="block w-full rounded-md border-2 border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm p-3 bg-white hover:border-gray-400 transition-colors"
                  placeholder="Add a note for this payment"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                />
              </div>

              <div className="text-right mt-6">
                <button
                  onClick={handleProceedToConfirmation}
                  className="bg-[#8928A4] hover:bg-[#7a2391] text-white font-medium py-2 px-6 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        );

      case 'confirmation':
        return (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="mb-6">
              <button 
                onClick={handleBack}
                className="flex items-center justify-center px-4 py-3 rounded-md text-[#8928A4] bg-[#f9f0fc] hover:bg-[#f3e0fa] transition-colors text-base w-full md:w-auto"
              >
                <ArrowLeft size={20} className="mr-2" />
                Back
              </button>

              <h3 className="font-medium text-lg text-gray-800 mt-4">Confirm Payment</h3>
              <p className="text-sm text-gray-500">Please review the details before confirming</p>
            </div>

            <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start border-b pb-3">
                <span className="text-sm text-gray-600">Service Provider:</span>
                <span className="text-sm font-medium text-gray-800">{selectedProvider?.name}</span>
              </div>
              
              <div className="flex justify-between items-start border-b pb-3">
                <span className="text-sm text-gray-600">Reference Number:</span>
                <span className="text-sm font-medium text-gray-800">{billRefNumber}</span>
              </div>
              
              <div className="flex justify-between items-start border-b pb-3">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-medium text-gray-800">MK{parseFloat(amount).toLocaleString()}</span>
              </div>
              
              {paymentNote && (
                <div className="flex justify-between items-start border-b pb-3">
                  <span className="text-sm text-gray-600">Note:</span>
                  <span className="text-sm font-medium text-gray-800">{paymentNote}</span>
                </div>
              )}

              <div className="flex justify-between items-start pt-2">
                <span className="text-base font-medium text-gray-700">Total Payment:</span>
                <span className="text-base font-bold text-[#8928A4]">MK{parseFloat(amount).toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="my-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
                <AlertCircle size={16} className="mr-2" />
                {error}
              </div>
            )}

            <div className="mt-6 space-y-3">
              <button
                onClick={handlePayBill}
                disabled={loading}
                className={`w-full flex justify-center items-center bg-[#8928A4] hover:bg-[#7a2391] text-white font-medium py-3 px-6 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Processing...' : 'Pay Now'}
              </button>

              <button
                onClick={handleBack}
                disabled={loading}
                className={`w-full flex justify-center items-center bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md shadow-sm focus:outline-none ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-gray-50'}`}
              >
                Edit Payment
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
            <p className="text-gray-600 mb-6">
              Your payment of <span className="font-bold">MK{parseFloat(amount).toLocaleString()}</span> to <span className="font-bold">{selectedProvider?.name}</span> has been successfully processed.
            </p>

            <div className="space-y-4 border rounded-lg p-4 bg-gray-50 w-full max-w-md">
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Reference Number:</span>
                <span className="text-sm font-medium text-gray-800">{billRefNumber}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Transaction ID:</span>
                <span className="text-sm font-medium text-gray-800">{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span className="text-sm text-gray-600">Date & Time:</span>
                <span className="text-sm font-medium text-gray-800">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3 w-full max-w-md">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full flex justify-center items-center bg-[#8928A4] hover:bg-[#7a2391] text-white font-medium py-3 px-6 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={handleBack}
                className="w-full flex justify-center items-center bg-white border border-gray-300 text-gray-700 font-medium py-3 px-6 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                Make Another Payment
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          {stage !== 'select-provider' && (
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <Landmark className="mr-2" size={24} /> Bill Payment
            </h2>
          )}
        </div>
        
        {renderContent()}
      </div>
    </div>
  );
};

export default BillPayment;