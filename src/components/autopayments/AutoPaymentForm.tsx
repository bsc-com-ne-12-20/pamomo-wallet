import React, { useState } from 'react';
import { Mail, Calendar } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, TRANSACTION_LIMITS } from '../../utils/constants';

interface AutoPaymentFormProps {
  onSubmit: (payment: any) => void;
  onCancel: () => void;
  subscription: any;
  recipientType: 'personal' | 'service';
  initialEmail?: string;
  initialProvider?: string;
}

const AutoPaymentForm: React.FC<AutoPaymentFormProps> = ({ 
  onSubmit, 
  onCancel, 
  subscription, 
  recipientType,
  initialEmail = '',
  initialProvider = ''
}) => {
  const [recipient, setRecipient] = useState(initialEmail);
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY'>('MONTHLY');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState(initialProvider ? `Auto payment for ${initialProvider}` : '');
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
      
      const formattedStartDate = startDate;
      
      const payload = {
        user_email: email,
        recipient_email: recipient,
        amount: amountNum,
        frequency: frequency,
        start_date: formattedStartDate,
        next_payment_date: formattedStartDate,
        description: description,
        recipient_type: recipientType,
        provider_name: initialProvider || undefined
      };
      
      console.log('Creating auto payment with data:', payload);
      
      const response = await axios.post(`${API_BASE_URL}/autopayments/create/`, payload);
      
      console.log('Auto payment creation response:', response);
      
      if (response.status === 201) {
        onSubmit(response.data);
      }
    } catch (err: any) {
      console.error('Auto payment creation failed:', err.response || err);
      
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

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // Simple loader component that matches the website color
  const SimpleLoader = () => (
    <div className="flex justify-center items-center py-6">
      <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-[#8928A4]"></div>
    </div>
  );
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border">
      {loading ? (
        <SimpleLoader />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
                Recipient Email *
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
                  readOnly={!!initialEmail}
                  required
                />
              </div>
              {initialProvider && (
                <p className="mt-1 text-xs text-gray-500">
                  Payment for: {initialProvider}
                </p>
              )}
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (MK) *
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
                  required
                />
              </div>
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
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
      )}
    </div>
  );
};

export default AutoPaymentForm;