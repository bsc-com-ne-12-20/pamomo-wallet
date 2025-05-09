// filepath: c:\Users\innow\OneDrive\Desktop\Project Demo\pamomo-wallet\src\components\WithdrawalSuccessModal.tsx
import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';

interface WithdrawalSuccessModalProps {
  show: boolean;
  amount: string;
  agentCode?: string;
  onClose: () => void;
}

const WithdrawalSuccessModal: React.FC<WithdrawalSuccessModalProps> = ({ 
  show, 
  amount,
  agentCode,
  onClose
}) => {
  const [transactionId, setTransactionId] = useState<string>('');
  
  useEffect(() => {
    if (show) {
      // Generate a transaction ID for the withdrawal
      const timestamp = new Date().getTime();
      const randomPart = Math.floor(10000 + Math.random() * 90000);
      setTransactionId(`WTDR-${timestamp.toString().slice(-6)}-${randomPart}`);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative bg-white max-w-md w-full rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Withdrawal Successful!</h3>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Amount Withdrawn</p>
            <p className="text-lg font-semibold text-gray-900">MK{parseFloat(amount).toLocaleString()}</p>
          </div>
          
          {agentCode && (
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600 mb-1">Agent Code</p>
              <p className="text-lg font-semibold text-gray-900">{agentCode}</p>
            </div>
          )}

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
            <p className="text-md font-medium text-gray-900">{transactionId}</p>
          </div>
          
          <div className="bg-green-50 p-3 rounded-md border border-green-100">
            <p className="text-sm font-medium text-green-800 mb-1">Visit Agent to Complete Withdrawal</p>
            <p className="text-xs text-green-700">
              Show the agent your transaction ID and verify your identity to receive your cash.
            </p>
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

export default WithdrawalSuccessModal;