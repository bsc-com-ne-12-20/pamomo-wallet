import React from 'react';
import { Check } from 'lucide-react';

interface DepositSuccessModalProps {
  show: boolean;
  amount: string;
  transactionId: string;
  timestamp: string;
  onClose: () => void;
}

const DepositSuccessModal: React.FC<DepositSuccessModalProps> = ({ 
  show, 
  amount, 
  transactionId,
  timestamp,
  onClose
}) => {
  if (!show) return null;

  // Format timestamp to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });
    } catch (error) {
      return dateString;
    }
  };

  // Format amount for display
  const formatAmount = (amountString: string) => {
    try {
      const parsedAmount = parseFloat(amountString);
      return isNaN(parsedAmount) ? '0.00' : parsedAmount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } catch (error) {
      return '0.00';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative bg-white max-w-md w-full rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Deposit Successful!</h3>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Amount Deposited</p>
            <p className="text-lg font-semibold text-gray-900">MK {formatAmount(amount)}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="text-md font-medium text-gray-900">{transactionId}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Date & Time</p>
            <p className="text-md font-medium text-gray-900">{formatDate(timestamp)}</p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DepositSuccessModal;
