import React from 'react';
import { Mail, QrCode, AlertTriangle } from 'lucide-react';
import TransactionDetails from './TransactionDetails';

interface SendMoneyFormProps {
  receiver: string;
  setReceiver: (receiver: string) => void;
  amount: string;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  handleSubmit: (e: React.FormEvent) => void;
  handleScanQRCode: () => void;
  transactionFee: number;
  totalDeduction: number;
  transactionLimit: number;
  showLimitWarning?: boolean;
  submitButtonText?: string;
}

const SendMoneyForm: React.FC<SendMoneyFormProps> = ({
  receiver,
  setReceiver,
  amount,
  handleAmountChange,
  error,
  handleSubmit,
  handleScanQRCode,
  transactionFee,
  totalDeduction,
  transactionLimit,
  showLimitWarning = false,
  submitButtonText = 'Send Money'
}) => {
  const amountNum = parseFloat(amount) || 0;
  const isApproachingLimit = amountNum > 0 && amountNum > (transactionLimit * 0.8);
  const isExceedingLimit = amountNum > 0 && amountNum > transactionLimit;

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="receiver" className="block text-sm font-medium text-gray-700 mb-1">
          Receiver's Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="email"
            id="receiver"
            className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
            placeholder="email@example.com"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
          <button
            type="button"
            onClick={handleScanQRCode}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8928A4] hover:text-[#7a2391]"
          >
            <QrCode size={20} />
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="amount" className="flex justify-between items-center text-sm font-medium text-gray-700 mb-1">
          <span>Amount</span>
          {showLimitWarning && (
            <span className="text-xs text-gray-500">
              Limit: MWK{transactionLimit.toLocaleString()}
            </span>
          )}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <p className="text-gray-400"><b>MK</b></p>
          </div>
          <input
            type="number"
            id="amount"
            className={`pl-10 block w-full rounded-md shadow-sm focus:ring-[#8928A4] sm:text-sm border p-2 ${
              isExceedingLimit 
                ? 'border-red-300 focus:border-red-500 bg-red-50' 
                : 'border-gray-300 focus:border-[#8928A4]'
            }`}
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            min="0.01"
            step="0.01"
          />
        </div>
        
        {isApproachingLimit && !isExceedingLimit && showLimitWarning && (
          <div className="mt-1 flex items-center text-xs text-yellow-700">
            <AlertTriangle size={12} className="mr-1" />
            <span>Approaching transaction limit</span>
          </div>
        )}
        
        {isExceedingLimit && showLimitWarning && (
          <div className="mt-1 flex items-center text-xs text-red-600">
            <AlertTriangle size={12} className="mr-1" />
            <span>Amount exceeds your transaction limit</span>
          </div>
        )}
      </div>
      
      {amount && (
        <TransactionDetails 
          transactionFee={transactionFee} 
          totalDeduction={totalDeduction} 
        />
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <button
        type="submit"
        className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
      >
        {submitButtonText}
      </button>
    </form>
  );
};

export default SendMoneyForm;