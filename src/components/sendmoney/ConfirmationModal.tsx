import React from 'react';
import Loader2 from '../Loader2';

interface ConfirmationModalProps {
  show: boolean;
  receiver: string;
  receiverUsername: string;
  amount?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  receiver,
  receiverUsername,
  amount,
  onConfirm,
  onCancel,
  isLoading
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Confirm Recipient</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 />
          </div>
        ) : (          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              You are about to send money to:
            </p>
            <div className="bg-purple-50 p-3 rounded-md">
              <p className="font-bold text-[#8928A4]">{receiverUsername}</p>
              <p className="text-sm text-gray-700">{receiver}</p>
              {amount && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <p className="text-sm text-gray-600">Amount:</p>
                  <p className="font-bold text-[#8928A4]">MK {parseFloat(amount).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;