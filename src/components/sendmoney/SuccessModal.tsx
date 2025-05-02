import React from 'react';
import { Check } from 'lucide-react'; // Add this import

interface SuccessModalProps {
  show: boolean;
  amount: string;
  receiver: string;
  receiverUsername: string;
  onClose: () => void;
  isRecurring?: boolean; // New prop
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  show, 
  amount, 
  receiver, 
  receiverUsername, 
  onClose,
  isRecurring = false 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative bg-white max-w-md w-full rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-sm text-gray-600 text-center mb-1">
            You have successfully sent <span className="font-semibold">MK{parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span> to {receiverUsername || receiver}
          </p>
          {isRecurring && (
            <div className="mt-3 bg-purple-50 p-3 rounded-md w-full">
              <p className="text-sm text-purple-700 font-medium">Recurring Payment Set Up</p>
              <p className="text-xs text-purple-600">
                Auto payments have been configured and will continue according to your schedule.
              </p>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-[#8928A4] text-white rounded-md hover:bg-[#722389] transition-colors shadow-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;