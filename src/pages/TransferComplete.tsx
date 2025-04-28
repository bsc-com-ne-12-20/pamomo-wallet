import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import Loader2 from '../components/Loader2';
import axios from 'axios';
import { API_BASE_URL, PAYMENT_API_KEY, PAYMENT_API_URL } from '../utils/constants';

interface TransferCompleteProps {
  username: string;
  onLogout: () => void;
}

const TransferComplete: React.FC<TransferCompleteProps> = ({ username, onLogout }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [message, setMessage] = useState('');
  const [amount, setAmount] = useState('');
  const [receiver, setReceiver] = useState('');
  const [receiverUsername, setReceiverUsername] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const verifyTransfer = async () => {
      const queryParams = new URLSearchParams(location.search);
      const txRef = queryParams.get('tx_ref');

      if (!txRef) {
        setSuccess(false);
        setMessage('Invalid transaction reference.');
        setIsLoading(false);
        return;
      }

      try {
        // First verify the payment with the payment gateway
        const verifyResponse = await fetch(`${PAYMENT_API_URL}/verify-payment/${txRef}`, {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${PAYMENT_API_KEY}`,
          }
        });

        const verifyResult = await verifyResponse.json();

        if (verifyResult.status !== 'success' || verifyResult.data.status !== 'success') {
          setSuccess(false);
          setMessage('Payment verification failed. Please try again.');
          setIsLoading(false);
          return;
        }

        // Extract metadata and amount from verification result
        const metadata = verifyResult.data.metadata || {};
        const receiverEmail = metadata.receiver_email;
        const senderEmail = metadata.sender_email || localStorage.getItem('email');
        const paidAmount = parseFloat(verifyResult.data.amount);

        // Get transfer details from localStorage as backup
        const storedAmount = localStorage.getItem('transferAmount') || '';
        const storedReceiver = localStorage.getItem('transferReceiver') || '';
        const storedReceiverUsername = localStorage.getItem('transferReceiverUsername') || '';

        setAmount(storedAmount);
        setReceiver(receiverEmail || storedReceiver);
        setReceiverUsername(storedReceiverUsername);

        // Now process the transfer through our API
        const transferResponse = await axios.post(`${API_BASE_URL}/external-transfer/`, {
          sender_email: senderEmail,
          receiver_email: receiverEmail || storedReceiver,
          amount: paidAmount,
          payment_reference: txRef
        });

        if (transferResponse.status === 201 || transferResponse.status === 200) {
          setSuccess(true);
          setMessage('Transfer completed successfully!');
        } else {
          setSuccess(false);
          setMessage('Transfer processing failed. Please contact support.');
        }

      } catch (error) {
        console.error('Error processing transfer:', error);
        setSuccess(false);
        setMessage('An error occurred while processing your transfer.');
      } finally {
        setIsLoading(false);
        // Clean up localStorage
        localStorage.removeItem('transferAmount');
        localStorage.removeItem('transferReceiver');
        localStorage.removeItem('transferReceiverUsername');
      }
    };

    verifyTransfer();
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />
      
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
        
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Transfer Status</h2>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 />
              <p className="mt-4 text-gray-600">Processing your transfer...</p>
            </div>
          ) : (
            <div className="text-center">
              {success === true ? (
                <div className="flex flex-col items-center">
                  <CheckCircle size={64} className="text-green-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Transfer Successful!</h3>
                  <p className="text-gray-600 mb-4">{message}</p>
                  
                  <div className="bg-gray-50 p-4 rounded-md w-full mb-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Amount:</span>
                      <span className="font-medium">MK{amount}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-500">Recipient:</span>
                      <span className="font-medium">{receiverUsername || receiver}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <XCircle size={64} className="text-red-500 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Transfer Failed</h3>
                  <p className="text-gray-600 mb-6">{message}</p>
                </div>
              )}
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#8928A4] text-white py-2 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferComplete;