import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface DepositConfirmationModalProps {
  show: boolean;
  amount: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const DepositConfirmationModal: React.FC<DepositConfirmationModalProps> = ({ 
  show,
  amount, 
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  // Add debug logging
  console.log('DepositConfirmationModal render:', { show, amount, isLoading });
  
  if (!show) return null;
  
  const amountNum = parseFloat(amount);
  const formattedAmount = amountNum.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Calculate the fee (3% of amount)
  const fee = amountNum * 0.03;
  const formattedFee = fee.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Calculate the net amount (what will be added to account)
  const netAmount = amountNum - fee;
  const formattedNetAmount = netAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="relative bg-white max-w-md w-full rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mb-4">
            <AlertCircle className="h-8 w-8 text-[#8928A4]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Confirm Deposit</h3>
          <p className="text-gray-500 text-center mt-2">
            Please confirm the amount you want to deposit to your account.
          </p>
        </div>
        
        <div className="space-y-3">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Deposit Amount</p>
            <p className="text-lg font-semibold text-gray-900">MK {formattedAmount}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Transaction Fee (3%)</p>
            <p className="text-md font-medium text-gray-900">MK {formattedFee}</p>
          </div>

          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Net Deposit (after fees)</p>
            <p className="text-lg font-bold text-[#8928A4]">MK {formattedNetAmount}</p>
          </div>
        </div>
        
        <div className="flex space-x-3 mt-6">
          <button
            onClick={onCancel}
            className="w-1/2 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-1/2 bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              'Confirm'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DepositConfirmationModal;
