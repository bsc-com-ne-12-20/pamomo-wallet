import React, { useEffect, useState } from 'react';
import { Check } from 'lucide-react';

interface SuccessModalProps {
  show: boolean;
  amount: string;
  receiver: string;
  receiverUsername: string;
  onClose: () => void;
  isRecurring?: boolean;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  show, 
  amount, 
  receiver, 
  receiverUsername, 
  onClose,
  isRecurring = false 
}) => {
  const [transactionId, setTransactionId] = useState<string>('');
  
  useEffect(() => {
    if (show) {
      // Try to get values from localStorage in case they were set by the payment handler
      const storedReceiver = localStorage.getItem('transferReceiver') || receiver;
      const storedUsername = localStorage.getItem('transferReceiverUsername') || receiverUsername;
      const storedTransactionId = localStorage.getItem('transactionId') || '';
      
      if (storedTransactionId) {
        setTransactionId(storedTransactionId);
      }
    }
  }, [show, receiver, receiverUsername]);

  if (!show) return null;  const displayReceiver = localStorage.getItem('transferReceiver') || receiver;
  const displayUsername = localStorage.getItem('transferReceiverUsername') || receiverUsername;
  const storedAmount = localStorage.getItem('transferAmount');
  const lastTransactionAmount = localStorage.getItem('lastTransactionAmount');
  
  // Use multiple sources to get a valid amount, in priority order
  const displayAmount = (() => {
    // Priority 1: Use direct amount prop if it's valid
    if (amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
      return amount;
    }
    // Priority 2: Use transferAmount from localStorage if valid
    if (storedAmount && !isNaN(parseFloat(storedAmount)) && parseFloat(storedAmount) > 0) {
      return storedAmount;
    }
    // Priority 3: Use lastTransactionAmount from localStorage if valid
    if (lastTransactionAmount && !isNaN(parseFloat(lastTransactionAmount)) && parseFloat(lastTransactionAmount) > 0) {
      return lastTransactionAmount;
    }
    // Fallback: Return zero
    return "0";
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative bg-white max-w-md w-full rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        </div>
        
        <div className="space-y-3">          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Amount</p>            <p className="text-lg font-semibold text-gray-900">
              MK{(() => {
                const parsedAmount = parseFloat(displayAmount);
                // Format with commas and 2 decimal places
                return isNaN(parsedAmount) ? '0.00' : parsedAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
              })()}
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Recipient</p>
            <p className="text-lg font-semibold text-gray-900">{displayUsername}</p>
            <p className="text-xs text-gray-500">{displayReceiver}</p>
          </div>

          {transactionId && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
              <p className="text-md font-medium text-gray-900">{transactionId}</p>
            </div>
          )}
          
          {isRecurring && (
            <div className="bg-green-50 p-3 rounded-md border border-green-100">
              <p className="text-sm font-medium text-green-800 mb-1">Auto Payment Scheduled</p>
              <p className="text-xs text-green-700">
                Your recurring payment has been set up successfully. You can manage all auto payments in the Auto Payments section.
              </p>
            </div>
          )}
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

export default SuccessModal;