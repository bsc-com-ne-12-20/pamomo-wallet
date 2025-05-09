import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WithdrawalConfirmationModalProps {
  amount: string;
  agentCode: string;
  fee: number;
  totalDeduction: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const WithdrawalConfirmationModal: React.FC<WithdrawalConfirmationModalProps> = ({
  amount,
  agentCode,
  fee,
  totalDeduction,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="relative bg-white max-w-md w-full rounded-lg p-6 shadow-xl">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Withdrawal</h3>
        
        <div className="space-y-4">
          <div className="flex items-start p-3 bg-yellow-50 rounded-md border border-yellow-200">
            <AlertTriangle size={20} className="text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">
              Please confirm your withdrawal details. Once confirmed, this transaction cannot be reversed.
            </p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Agent Code</p>
            <p className="text-lg font-semibold text-gray-900">{agentCode}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Amount to Withdraw</p>
            <p className="text-lg font-semibold text-gray-900">MK{parseFloat(amount).toLocaleString()}</p>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-600 mb-1">Transaction Fee</p>
            <p className="text-md text-gray-900">MK{fee.toFixed(2)}</p>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-md border border-purple-100">
            <p className="text-sm font-medium text-gray-800 mb-1">Total Deduction</p>
            <p className="text-lg font-bold text-[#8928A4]">MK{totalDeduction.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
          >
            Confirm Withdrawal
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalConfirmationModal;