import React, { useEffect } from 'react';
import { Mail, QrCode, AlertTriangle, SendHorizontal } from 'lucide-react';
import TransactionDetails from './TransactionDetails';

interface SendMoneyFormProps {
  receiver: string;
  setReceiver: (receiver: string) => void;
  amount: string;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  setError: (error: string) => void;  // Added setError for live validation
  handleSubmit: (e: React.FormEvent) => void;
  handleScanQRCode: () => void;
  transactionFee: number;
  totalDeduction: number;
  transactionLimit: number;
  showLimitWarning?: boolean;
  submitButtonText?: string;
  isPaymentGateway?: boolean;
  balance?: number | null;  // Added balance for live validation
}

const SendMoneyForm: React.FC<SendMoneyFormProps> = ({
  receiver,
  setReceiver,
  amount,
  handleAmountChange,
  error,
  setError,
  handleSubmit,
  handleScanQRCode,
  transactionFee,
  totalDeduction,
  transactionLimit,
  showLimitWarning = false,
  submitButtonText = 'Send Money',
  isPaymentGateway = false,
  balance = null
}) => {
  const amountNum = parseFloat(amount) || 0;
  const PAYMENT_GATEWAY_LIMIT = 1000000; // 1,000,000 MWK limit for payment gateway
  const effectiveLimit = isPaymentGateway ? Math.min(transactionLimit, PAYMENT_GATEWAY_LIMIT) : transactionLimit;
  const isApproachingLimit = amountNum > 0 && amountNum > (effectiveLimit * 0.8);
  const isExceedingLimit = amountNum > 0 && amountNum > effectiveLimit;
  
  // Live validation using useEffect
  useEffect(() => {
    if (!amount) {
      setError('');
      return;
    }
    
    const amountValue = parseFloat(amount);
    
    // Validate amount format
    if (isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    // Validate against balance
    if (balance !== null && amountValue > balance) {
      setError('Insufficient balance');
      return;
    }
    
    // Validate against payment gateway limit
    if (isPaymentGateway && amountValue > PAYMENT_GATEWAY_LIMIT) {
      setError(`Amount exceeds the payment gateway limit of MWK${PAYMENT_GATEWAY_LIMIT.toLocaleString()}`);
      return;
    }
    
    // Validate against transaction limit
    if (amountValue > transactionLimit) {
      setError(`Amount exceeds your transaction limit of MWK${transactionLimit.toLocaleString()}`);
      return;
    }
    
    // Clear error if all validations pass
    setError('');
  }, [amount, balance, transactionLimit, isPaymentGateway, PAYMENT_GATEWAY_LIMIT, setError]);

  return (    <form onSubmit={handleSubmit}>
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
            required
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
              Limit: MWK{effectiveLimit.toLocaleString()}
              {isPaymentGateway && effectiveLimit === PAYMENT_GATEWAY_LIMIT && (
                <span className="ml-1">(Payment gateway max)</span>
              )}
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
            <span>
              {isPaymentGateway && amountNum > PAYMENT_GATEWAY_LIMIT
                ? `Amount exceeds the payment gateway limit of MWK${PAYMENT_GATEWAY_LIMIT.toLocaleString()}`
                : 'Amount exceeds your transaction limit'}
            </span>
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
      )}      <button
        type="submit"
        className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] flex items-center justify-center"
        disabled={isExceedingLimit || !!error}
      >
        <div className="bg-white bg-opacity-20 p-1.5 rounded-full mr-2 flex items-center justify-center">
          <SendHorizontal size={16} className="text-white" />
        </div>
        {submitButtonText}
      </button>
    </form>
  );
};

export default SendMoneyForm;
