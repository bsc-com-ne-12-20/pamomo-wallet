import React from 'react';
import { SimpleLoader } from './SimpleLoader';

interface PaymentHistoryItem {
  id: string;
  auto_payment_id: string;
  recipient_email: string;
  amount: number;
  status: 'SUCCESS' | 'FAILED';
  error_message?: string;
  timestamp: string;
}

interface PaymentHistoryModalProps {
  onClose: () => void;
  loading: boolean;
  history: PaymentHistoryItem[];
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

const PaymentHistoryModal: React.FC<PaymentHistoryModalProps> = ({ onClose, loading, history }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Payment History</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        {loading ? (
          <SimpleLoader size="large" />
        ) : history.length > 0 ? (
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
                {history.map(item => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.timestamp)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      MK{formatAmount(item.amount)}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.status === 'SUCCESS' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {item.error_message || "-"}
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