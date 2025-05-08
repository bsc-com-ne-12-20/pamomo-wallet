import React from 'react';
import { Clock, Calendar, Pause, Play, Trash2, Crown } from 'lucide-react';
import { SimpleLoader } from './SimpleLoader';

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
  recipient_type?: 'personal' | 'service';
  service_provider?: string;
}

interface AutoPaymentsListProps {
  payments: AutoPayment[];
  loading: boolean;
  subscription: any;
  onToggleStatus: (id: string, currentStatus: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onShowHistory: (id: string) => void;
}

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

const formatAmount = (amount: string | number): string => {
  if (typeof amount === 'string') {
    return parseFloat(amount).toFixed(2);
  }
  return amount.toFixed(2);
};

const AutoPaymentsList: React.FC<AutoPaymentsListProps> = ({
  payments,
  loading,
  subscription,
  onToggleStatus,
  onDelete,
  onShowHistory
}) => {
  if (loading) {
    return <SimpleLoader />;
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 italic">
        No auto payments set up yet.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 mt-6">
      {payments.map(payment => (
        <div key={payment.id} className="border rounded-lg p-4 shadow-sm bg-white">
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
          
          {subscription && subscription.plan === 'PREMIUM' ? (
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => onShowHistory(payment.id)}
                className="p-2 rounded text-blue-600 hover:bg-blue-50"
              >
                <Clock size={16} />
              </button>
              <button 
                onClick={() => onToggleStatus(payment.id, payment.status)}
                className={`p-2 rounded ${
                  payment.status === 'ACTIVE' 
                    ? 'text-yellow-600 hover:bg-yellow-50' 
                    : 'text-green-600 hover:bg-green-50'
                }`}
              >
                {payment.status === 'ACTIVE' ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button 
                onClick={() => onDelete(payment.id)}
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
  );
};

export default AutoPaymentsList;