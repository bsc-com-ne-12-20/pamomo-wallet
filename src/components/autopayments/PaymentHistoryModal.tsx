import React from 'react';
import { SimpleLoader } from './SimpleLoader';


// Update the interface to match the API response structure
interface PaymentHistoryItem {
  // Original fields
  id?: string;
  auto_payment_id?: string;
  recipient_email?: string;
  amount: number;
  status?: 'SUCCESS' | 'FAILED';
  error_message?: string;
  timestamp: string;
  
  // New fields from the API
  plan?: string;
  plan_display?: string;
  period?: string;
  period_display?: string;
}

interface PaymentHistoryModalProps {
  onClose: () => void;
  loading: boolean;
  history: PaymentHistoryItem[];
  paymentId: string; // Adding the payment ID
}

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

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ onClose, loading, history, paymentId }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-purple-800">Auto Payment Transaction History</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>        <div className="mb-4">
          <div className="flex items-center mb-2">
            <span className="text-sm font-semibold text-gray-700 mr-2">Payment ID:</span>
            <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">{paymentId}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Showing transaction history for this auto payment</span>
            {history.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                {history.length} transaction{history.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>        </div>
        
        {loading ? (
          <SimpleLoader size="large" />
        ) : history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {history.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-purple-700">
                      {item.plan_display || item.plan || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                      {item.period_display || item.period || '-'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      MK {formatAmount(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No transaction history found for this auto payment.</p>
            <p className="text-xs mt-2">Payment ID: {paymentId}</p>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;