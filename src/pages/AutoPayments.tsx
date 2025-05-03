import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, Plus, Calendar, Clock, ArrowUpRight, Pause, Play, Trash2, Crown } from 'lucide-react';
import Loader2 from '../components/Loader2';
import axios from 'axios';
import { API_BASE_URL, TRANSACTION_LIMITS } from '../utils/constants';

interface AutoPaymentsProps {
  username: string;
  onLogout: () => void;
}

interface AutoPayment {
  id: string;
  recipient_email: string;
  recipient_name: string;
  amount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  next_payment_date: string;
  description: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  last_payment_date?: string;
  last_payment_status?: string;
}

interface PaymentHistoryItem {
  id: string;
  auto_payment_id: string;
  recipient_email: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  error_message?: string;
  timestamp: string;
}

const AutoPayments: React.FC<AutoPaymentsProps> = ({ username, onLogout }) => {
  const [autoPayments, setAutoPayments] = useState<AutoPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  
  const navigate = useNavigate();

  // Debug interceptor for API calls
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      config => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, config.data || '');
        return config;
      },
      error => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
      }
    );
    
    const responseInterceptor = axios.interceptors.response.use(
      response => {
        console.log(`✅ API Response: ${response.status} ${response.config.url}`, response.data);
        return response;
      },
      error => {
        console.error(`❌ Response Error: ${error.response?.status} ${error.config.url}`, 
                      error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
    
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Fetch user's auto payments
  useEffect(() => {
    const fetchAutoPayments = async () => {
      try {
        const email = localStorage.getItem('email');
        if (!email) {
          setError('Authentication required: Please log in to view your auto payments');
          setLoading(false);
          return;
        }

        // Remove duplicate /api/v1
        const response = await axios.get(`${API_BASE_URL}/autopayments/?email=${email}`);
        console.log('Auto payments fetched:', response.data);
        setAutoPayments(response.data);
      } catch (err: any) {
        console.error('Failed to fetch auto payments:', err.response || err);
        setError(err.response?.data?.message || 'Failed to fetch auto payments');
      } finally {
        setLoading(false);
      }
    };

    fetchAutoPayments();
  }, []);

  // Fetch user's subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;
      
      try {
        setSubscriptionLoading(true);
        const response = await axios.post(`${API_BASE_URL}/subscriptions/check-subscription/`, {
          email
        });
        
        if (response.status === 200) {
          setSubscription(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription details:', error);
        setSubscription({
          plan: 'FREE',
          period: 'LIFETIME',
          status: 'ACTIVE',
          expiry_date: 'NEVER',
          auto_renew: false
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      const endpoint = newStatus === 'ACTIVE' ? 'resume' : 'pause';
      
      // Correct endpoint format
      const response = await axios.post(`${API_BASE_URL}/autopayments/${id}/${endpoint}/`);
      
      if (response.status === 200) {
        // Update the local state
        setAutoPayments(autoPayments.map(payment => 
          payment.id === id ? { ...payment, status: newStatus as 'ACTIVE' | 'PAUSED' } : payment
        ));
      }
    } catch (err: any) {
      console.error('Failed to update payment status:', err.response || err);
      setError(err.response?.data?.message || 'Failed to update auto payment status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this auto payment?')) {
      return;
    }
    
    try {
      // Correct endpoint format
      const response = await axios.delete(`${API_BASE_URL}/autopayments/${id}/`);
      
      if (response.status === 200) {
        // Remove from local state
        setAutoPayments(autoPayments.filter(payment => payment.id !== id));
      }
    } catch (err: any) {
      console.error('Failed to delete auto payment:', err.response || err);
      setError(err.response?.data?.message || 'Failed to delete auto payment');
    }
  };

  const formatFrequency = (frequency: string) => {
    switch (frequency) {
      case 'DAILY': return 'Daily';
      case 'WEEKLY': return 'Weekly';
      case 'BIWEEKLY': return 'Every 2 weeks';
      case 'MONTHLY': return 'Monthly';
      default: return frequency;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Add this helper function near your other formatting functions
  const formatAmount = (amount: string | number): string => {
    if (typeof amount === 'string') {
      return parseFloat(amount).toFixed(2);
    }
    return amount.toFixed(2);
  };

  // Add function to fetch payment history for a specific auto payment
  const fetchPaymentHistory = async (paymentId: string) => {
    setLoadingHistory(true);
    try {
      // Correct endpoint format - adjust if your backend uses a different endpoint
      const response = await axios.get(`${API_BASE_URL}/autopayments/${paymentId}/history/`);
      if (response.status === 200) {
        setPaymentHistory(response.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch payment history:', err.response || err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Add function to handle showing payment history
  const handleShowHistory = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    fetchPaymentHistory(paymentId);
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
        
        {/* Change banner to show this is a premium feature */}
        {subscription && subscription.plan !== 'PREMIUM' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
            <div className="mr-3 p-2 bg-yellow-100 rounded-full">
              <Crown size={24} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Auto payments are exclusively available for Premium subscribers
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Upgrade to Premium to set up recurring automatic payments and never miss a bill payment again.
                <button 
                  onClick={() => navigate('/subscription')}
                  className="ml-1 text-[#8928A4] hover:underline"
                >
                  Upgrade now
                </button>
              </p>
            </div>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800">Auto Payments</h2>
            
            {/* Change button to only show for Premium users */}
            {subscription && subscription.plan === 'PREMIUM' && (
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="flex items-center px-4 py-2 rounded-md bg-[#8928A4] text-white hover:bg-[#7a2391] transition-colors duration-200 shadow-sm font-medium"
              >
                <Plus size={16} className="mr-2" />
                {showCreateForm ? 'Cancel' : 'Create Auto Payment'}
              </button>
            )}
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 />
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-600 mb-4">
              {error}
            </div>
          ) : (
            <>
              {/* Only show form for Premium users */}
              {showCreateForm && subscription && subscription.plan === 'PREMIUM' && (
                <AutoPaymentForm 
                  onSubmit={(newPayment) => {
                    setAutoPayments([...autoPayments, newPayment]);
                    setShowCreateForm(false);
                  }}
                  onCancel={() => setShowCreateForm(false)}
                  subscription={subscription}
                />
              )}
              
              {/* Show payments only if premium or if has existing payments */}
              {autoPayments.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {autoPayments.map(payment => (
                    <div key={payment.id} className="border rounded-lg p-4 shadow-sm bg-white">
                      {/* Existing payment card content remains the same */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-800">{payment.recipient_name || payment.recipient_email}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                          payment.status === 'PAUSED' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p>Amount: <span className="font-medium text-gray-800">MK{formatAmount(payment.amount)}</span></p>
                        <div className="flex items-center mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>Frequency: {formatFrequency(payment.frequency)}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Next payment: {formatDate(payment.next_payment_date)}</span>
                        </div>
                      </div>
                      
                      {payment.description && (
                        <p className="text-xs text-gray-500 mb-3 border-t pt-2">{payment.description}</p>
                      )}
                      
                      {/* Only allow actions for Premium users */}
                      {subscription && subscription.plan === 'PREMIUM' ? (
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => handleShowHistory(payment.id)}
                            className="p-2 rounded text-blue-600 hover:bg-blue-50"
                          >
                            <Clock size={16} />
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(payment.id, payment.status)}
                            className={`p-2 rounded ${
                              payment.status === 'ACTIVE' 
                                ? 'text-yellow-600 hover:bg-yellow-50' 
                                : 'text-green-600 hover:bg-green-50'
                            }`}
                          >
                            {payment.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                          <button 
                            onClick={() => handleDelete(payment.id)}
                            className="p-2 rounded text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="border-t pt-3 mt-2">
                          <p className="text-xs text-yellow-600 flex items-center">
                            <Crown size={14} className="mr-1" />
                            Upgrade to Premium to manage your auto payments
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border rounded-md bg-gray-50">
                  {subscription && subscription.plan === 'PREMIUM' ? (
                    <>
                      <p className="text-gray-500">No auto payments set up yet.</p>
                      <button
                        onClick={() => setShowCreateForm(true)}
                        className="mt-2 text-[#8928A4] hover:underline"
                      >
                        Create your first auto payment
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Crown size={32} className="text-yellow-500 mb-2" />
                      <p className="text-gray-500">Auto payments are a Premium feature.</p>
                      <button 
                        onClick={() => navigate('/subscription')}
                        className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-[#8928A4] text-white rounded-md shadow hover:from-purple-700 hover:to-[#7a2391] transition-all"
                      >
                        Upgrade to Premium
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">About Auto Payments</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h4 className="font-medium text-[#8928A4]">What are auto payments?</h4>
              <p className="text-gray-600 mt-1">
                Auto payments allow you to schedule recurring transfers to the same recipient automatically. This is perfect for regular payments like rent, subscriptions, or allowances.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#8928A4]">How are payments processed?</h4>
              <p className="text-gray-600 mt-1">
                On the scheduled date, we automatically process the payment from your Pamomo wallet balance to the recipient. Make sure you have sufficient funds available.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-[#8928A4]">What if my wallet doesn't have enough funds?</h4>
              <p className="text-gray-600 mt-1">
                If your wallet has insufficient balance, the auto payment will fail. You'll receive a notification when this happens, and the payment will be attempted again the next day.
              </p>
            </div>
            
            {/* Add premium feature highlight */}
            <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center mb-2">
                <Crown size={18} className="text-purple-600 mr-2" />
                <h4 className="font-medium text-purple-800">Premium Feature</h4>
              </div>
              <p className="text-purple-700 text-sm">
                Auto Payments is exclusively available to Premium subscribers. This feature helps you automate your recurring payments, saving you time and ensuring you never miss important payments.
              </p>
            </div>
          </div>
        </div>

        {selectedPaymentId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Payment History</h3>
                <button 
                  onClick={() => setSelectedPaymentId(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
              
              {loadingHistory ? (
                <div className="flex justify-center py-8">
                  <Loader2 />
                </div>
              ) : paymentHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentHistory.map(history => (
                        <tr key={history.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            {formatDate(history.timestamp)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                            MK{formatAmount(history.amount)}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              history.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {history.status}
                            </span>
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                            {history.error_message || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No payment history found for this auto payment.
                </div>
              )}
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedPaymentId(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Auto Payment Form Component
interface AutoPaymentFormProps {
  onSubmit: (payment: AutoPayment) => void;
  onCancel: () => void;
  subscription: any;
}

const AutoPaymentForm: React.FC<AutoPaymentFormProps> = ({ onSubmit, onCancel, subscription }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const getTransactionLimit = (): number => {
    if (!subscription) return TRANSACTION_LIMITS.FREE;
    return TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS] || TRANSACTION_LIMITS.FREE;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!recipient || !amount || !startDate) {
      setError('Please fill in all required fields');
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (amountNum > getTransactionLimit()) {
      setError(`Amount exceeds your plan's transaction limit of MK${getTransactionLimit().toLocaleString()}`);
      return;
    }
    
    setLoading(true);
    
    try {
      const email = localStorage.getItem('email');
      
      // Format the date as ISO string (YYYY-MM-DD) to match what backend expects
      const formattedStartDate = startDate; // should already be in YYYY-MM-DD format from date input
      
      const payload = {
        user_email: email,
        recipient_email: recipient,
        amount: amountNum,
        frequency: frequency,
        start_date: formattedStartDate,
        next_payment_date: formattedStartDate, // Add this field which is required by your backend
        description: description
      };
      
      console.log('Creating auto payment with data:', payload);
      
      // Fix the API endpoint path to match your backend
      const response = await axios.post(`${API_BASE_URL}/autopayments/create/`, payload);
      
      console.log('Auto payment creation response:', response);
      
      if (response.status === 201) {
        onSubmit(response.data);
      }
    } catch (err: any) {
      console.error('Auto payment creation failed:', err.response || err);
      
      // Handle different error response formats
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data.non_field_errors) {
          setError(err.response.data.non_field_errors.join(', '));
        } else if (err.response.data.next_payment_date) {
          setError(`Next Payment Date: ${err.response.data.next_payment_date[0]}`);
        } else if (err.response.data.amount) {
          setError(`Amount: ${err.response.data.amount[0]}`);
        } else if (err.response.data.start_date) {
          setError(`Start date: ${err.response.data.start_date[0]}`);
        } else {
          // If other field errors exist, show the first one
          const firstErrorKey = Object.keys(err.response.data)[0];
          if (firstErrorKey) {
            const errorMsg = err.response.data[firstErrorKey];
            setError(`${firstErrorKey}: ${Array.isArray(errorMsg) ? errorMsg[0] : errorMsg}`);
          } else {
            setError('Failed to create auto payment');
          }
        }
      } else {
        setError('Failed to create auto payment');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate tomorrow's date for the min date attribute
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
      <h3 className="font-medium text-gray-800 mb-4">Create New Auto Payment</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email *
            </label>
            <input
              type="email"
              id="recipient"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-sm p-2 border"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount (MK) *
            </label>
            <input
              type="number"
              id="amount"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-sm p-2 border"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0.01"
              step="0.01"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Limit: MK{getTransactionLimit().toLocaleString()}
            </p>
          </div>
          
          <div>
            <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">
              Frequency *
            </label>
            <select
              id="frequency"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-sm p-2 border"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              required
            >
              <option value="DAILY">Daily</option>
              <option value="WEEKLY">Weekly</option>
              <option value="BIWEEKLY">Every 2 Weeks</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-sm p-2 border"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={minDate}
              required
            />
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-sm p-2 border"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Monthly rent payment"
            />
          </div>
        </div>
        
        {error && (
          <div className="mt-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-[#8928A4] rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Auto Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AutoPayments;