import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, User, Mail, Check, AlertCircle } from 'lucide-react';
import Loader2 from '../components/Loader2';

// Maximum transaction limit in MWK
const MAX_TRANSACTION_LIMIT = 1200000;

interface ExternalWalletTransferProps {
  onLogout: () => void;
  setBalance?: (balance: number) => void;
  setTransactions?: (transactions: any[]) => void;
}

const ExternalWalletTransfer: React.FC<ExternalWalletTransferProps> = ({ onLogout }) => {
  const [amount, setAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [transferData, setTransferData] = useState<{amount: string, recipient: string}>({amount: '', recipient: ''});
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userEmail = localStorage.getItem('email') || '';
  
  // Check for recipient email in location state (from QR code scan)
  useEffect(() => {
    const state = location.state as { recipient?: string } | undefined;
    if (state?.recipient) {
      setRecipientEmail(state.recipient);
      // Clear the location state to prevent reapplying on refresh
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);
  useEffect(() => {
    // Check if email exists
    if (!userEmail) {
      setError('User email not found. Please log in again.');
      return;
    }

    // Check for successful transfer first
    const isTransferSuccess = localStorage.getItem('lastTransferSuccess') === 'true';
    if (isTransferSuccess) {
      const amount = localStorage.getItem('lastTransferAmount') || '';
      const recipient = localStorage.getItem('lastTransferRecipient') || '';
      console.log(`Showing success view for transfer: ${amount} to ${recipient}`);
      setTransferData({amount, recipient});
      setShowSuccessView(true);
      // Clear the success flag after showing the success view
      localStorage.removeItem('lastTransferSuccess');
      return;
    }

    const queryParams = new URLSearchParams(location.search);
    const txRef = queryParams.get('tx_ref');

    if (txRef) {
      console.log(`Found transaction reference in URL: ${txRef}`);
      const savedAmount = localStorage.getItem('externalTransferAmount');
      const savedRecipientEmail = localStorage.getItem('externalRecipientEmail');

      if (savedAmount && savedRecipientEmail) {
        console.log(`Stored transfer details found: Amount ${savedAmount} to ${savedRecipientEmail}`);
        setIsLoading(true);
        verifyPayment(txRef, savedRecipientEmail);
      } else {
        console.error('Transaction data missing in localStorage', { 
          amount: savedAmount, 
          recipientEmail: savedRecipientEmail 
        });
        setError('Transaction information missing. Please try again.');
      }
    }
  }, [location, userEmail]);  const verifyPayment = async (txRef: string, recipientEmail: string) => {
    try {
      console.log(`🔍 Verifying payment for transaction: ${txRef}`);
      console.log(`👤 Current user (sender): ${userEmail}`);
      console.log(`👥 Recipient user: ${recipientEmail}`);
      
      // Check if emails match (this should never happen)
      if (recipientEmail.toLowerCase() === userEmail.toLowerCase()) {
        const errorMessage = "CRITICAL ERROR: Recipient email matches sender email in external transfer!";
        console.error(errorMessage);
        setError('System error: External transfer cannot be sent to your own account');
        setIsLoading(false);
        return;
      }
      
      console.log('📤 Sending verification request to payment gateway...');
      const response = await fetch(`https://api.paychangu.com/verify-payment/${txRef}`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer SEC-TEST-nqbbmKfBLjAN7F4XExoJqpJ0ut1rBV5T',
        },
      });      const result = await response.json();
      console.log('📥 Payment verification response:', result);
      
      if (result.status === 'success' && result.data.status === 'success') {
        console.log('✅ Payment verification successful');
        const originalAmount = parseFloat(result.data.amount);
        const deductedAmount = originalAmount * 0.97; // Apply 3% fee
        console.log(`💰 Original amount: ${originalAmount}, After 3% fee: ${deductedAmount}`);
        
        // IMPORTANT: Make sure we're using the recipient's email, not the current user's email
        if (recipientEmail === userEmail) {
          console.error("ERROR: Recipient email matches current user - this is an external transfer!");
          setError('System error: Cannot send external transfer to your own account');
          setIsLoading(false);
          return;
        }
        
        try {          try {
            // Deposit the money directly to recipient's account using the same flow as DepositMoney.tsx
            await sendPaymentDetails(recipientEmail, deductedAmount);
            
            // Log successful transfer
            console.log(`✅ Deposit successful - sent ${deductedAmount.toFixed(2)} to ${recipientEmail}`);
            
            // Store successful transfer data for display
            localStorage.setItem('lastTransferSuccess', 'true');
            localStorage.setItem('lastTransferAmount', (deductedAmount).toFixed(2));
            localStorage.setItem('lastTransferRecipient', recipientEmail);
            // Clean up transfer data
            localStorage.removeItem('externalTransferAmount');
            localStorage.removeItem('externalRecipientEmail');
            
            // Set success message
            setSuccess(`Payment successful. Amount has been sent to ${recipientEmail}'s account.`);
            
            // Trigger success view
            setShowSuccessView(true);
          } catch (error: any) {
            console.error("💥 Failed to deposit to recipient account:", error);
            setError(`Payment processing failed: ${error?.message || 'Unknown error'}. Please contact support.`);
          }
        } catch (err) {
          console.error("Failed to deposit to recipient account:", err);
          setError('Payment was processed but deposit to recipient failed. Please contact support.');
        }      } else {
        console.error('❌ Payment verification failed:', result);
        setError(`Transaction verification failed: ${result.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('❌ Error verifying payment:', err);
      setError('Error verifying payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };const sendPaymentDetails = async (recipientEmail: string, amount: number) => {
    try {
      console.log(`Depositing payment to recipient account: ${recipientEmail}, amount: ${amount}`);
      
      // Double verify that recipientEmail is not the current user's email
      if (recipientEmail.toLowerCase() === userEmail.toLowerCase()) {
        console.error("ERROR: Attempted to deposit to current user account in external transfer");
        throw new Error('Cannot send external transfer to your own account');
      }
        // Use the deposit endpoint WITH the trailing slash (/) - which is critical for the API to work
      // Previous implementation was missing the trailing slash causing a 404 error
      const response = await fetch('https://mtima.onrender.com/api/v1/dpst/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: recipientEmail,  // This is the key difference - using recipient's email
          amount: amount.toFixed(2),
        }),
      });
      
      // Verify the API call was successful
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Deposit API error (${response.status}):`, errorText);
        throw new Error(`Deposit failed with status ${response.status}: ${errorText}`);
      }
      
      console.log(`Deposit completed successfully to ${recipientEmail}`);
      setSuccess(`Payment successful. Amount has been sent to ${recipientEmail}'s account.`);
    } catch (err) {
      console.error('Failed to deposit to recipient account:', err);
      setError('Failed to send payment details. Please try again.');
      throw err; // Re-throw so the caller can handle it
    }
  };

  const validateRecipientEmail = async (email: string): Promise<boolean> => {
    setIsValidatingEmail(true);
    try {
      const response = await fetch('https://mtima.onrender.com/api/v1/accounts/get-username/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setError('The recipient email does not exist in our system. Please check and try again.');
        return false;
      }
      
      // Email exists in the system
      return true;
    } catch (err) {
      console.error('Error validating email:', err);
      setError('Unable to verify the recipient. Please try again.');
      return false;
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!amount) {
      setError('Please enter an amount');
      setIsLoading(false);
      return;
    }

    if (!recipientEmail) {
      setError('Please enter recipient email address');
      setIsLoading(false);
      return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    
    // Prevent sending to your own account
    if (recipientEmail.toLowerCase() === userEmail.toLowerCase()) {
      setError('You cannot send money to your own account using external wallet transfer. Please use the Deposit feature instead.');
      setIsLoading(false);
      return;
    }
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      setIsLoading(false);
      return;
    }
    
    // Check if the amount exceeds the maximum transaction limit
    if (amountNum > MAX_TRANSACTION_LIMIT) {
      setError(`Transaction amount cannot exceed MK ${MAX_TRANSACTION_LIMIT.toLocaleString()}. Please enter a lower amount.`);
      setIsLoading(false);
      return;
    }

    // Validate if recipient email exists in the system
    const isValidRecipient = await validateRecipientEmail(recipientEmail);
    if (!isValidRecipient) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('https://api.paychangu.com/payment', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: 'Bearer SEC-TEST-nqbbmKfBLjAN7F4XExoJqpJ0ut1rBV5T',
        },
        body: JSON.stringify({
          currency: 'MWK',
          amount: amountNum.toString(),
          callback_url: 'https://pamomo-wallet.netlify.app/verifytrans',
          return_url: 'https://pamomo-wallet.netlify.app/external-transfer',
          metadata: {
            recipient_email: recipientEmail,
            sender_email: userEmail,
            payment_type: 'external_wallet_transfer'
          }
        }),
      });

      const result = await response.json();      if (result.status === 'success' && result.data.checkout_url) {
        console.log(`Starting external transfer to: ${recipientEmail}`);
        localStorage.setItem('externalTransferAmount', amount);
        localStorage.setItem('externalRecipientEmail', recipientEmail);
        
        // Double check that we're storing the correct recipient email
        const storedEmail = localStorage.getItem('externalRecipientEmail');
        if (storedEmail !== recipientEmail) {
          console.error(`Storage error: ${storedEmail} does not match ${recipientEmail}`);
          setError('An error occurred with the recipient information. Please try again.');
          setIsLoading(false);
          return;
        }
        
        window.location.href = result.data.checkout_url;
      } else {
        setError('Transaction initiation failed. Please try again.');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onLogout={onLogout} />
      <div className="container mx-auto px-4 py-8">
        
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center px-4 py-2 rounded-md bg-white text-[#8928A4] border border-[#8928A4] mb-6 hover:bg-[#f9f0fc] transition-colors duration-200 shadow-sm font-medium">
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>
        {isLoading ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto flex flex-col items-center justify-center min-h-[300px]">
            <Loader2 />
            <p className="mt-4 text-gray-600 text-sm">Processing your transfer request...</p>
          </div>
        ) : showSuccessView ? (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-green-600" />
              </div>              <h2 className="text-2xl font-bold text-gray-800 mb-2">Transfer Successful!</h2>
              <p className="text-gray-600 mb-2">Your money has been sent successfully to the recipient's account.</p>
              <p className="text-amber-700 font-medium mb-6">These funds have been transferred to the recipient's Pamomo account, not your own.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-gray-500">Amount Sent:</span>
                  <span className="font-semibold">MK {transferData.amount}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-sm text-gray-500">Recipient Account:</span>
                  <span className="font-semibold text-green-700">{transferData.recipient}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Date:</span>
                  <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-[#8928A4] text-white py-3 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] font-medium"
              >
                Back to Dashboard
              </button>
              
              <button
                onClick={() => {
                  setShowSuccessView(false);
                  setTransferData({amount: '', recipient: ''});
                }}
                className="w-full mt-3 bg-white text-[#8928A4] py-3 px-4 rounded-md border border-[#8928A4] hover:bg-[#f9f0fc] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] font-medium"
              >
                Send Another Payment
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Money via External Wallet</h2>              <div className="bg-purple-50 rounded-md p-4 mb-6">
              <p className="text-sm text-purple-700">
                <span className="font-medium">How it works:</span> Send money to any Pamomo user directly from your external digital wallet. 
                The recipient (whose email you enter below) will receive the funds in their Pamomo account. <span className="font-bold underline">This is for sending money to OTHER users, not for adding money to your own account</span>.
              </p>
            </div>

            {/* Display the user email (non-editable) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Account
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="pl-10 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm text-gray-600 sm:text-sm border p-2 cursor-not-allowed"
                  value={userEmail}
                  disabled
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                You are sending money from an external wallet
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Recipient email field */}              <div className="mb-4">
                <label htmlFor="recipientEmail" className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="recipientEmail"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                    placeholder="recipient@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    required
                  />
                  {isValidatingEmail && (
                    <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                      <div className="animate-pulse text-xs text-purple-600">Validating...</div>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs font-medium text-red-700">
                  IMPORTANT: Funds will be sent directly to this recipient's account (not your own account)
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <p className="text-gray-400"><b>MK</b></p>
                  </div>                  <input
                    type="number"
                    id="amount"
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] sm:text-sm border p-2"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="0.01"
                    max={MAX_TRANSACTION_LIMIT}
                    step="0.01"
                    required
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>Fee: 3%</span>
                  {amount && !isNaN(parseFloat(amount)) && (
                    <span className="font-medium">
                      Recipient gets: MK {(parseFloat(amount) * 0.97).toFixed(2)}
                    </span>
                  )}
                </div>
                <div className="mt-2 flex items-center text-xs text-amber-700 bg-amber-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Maximum transfer limit: MK {MAX_TRANSACTION_LIMIT.toLocaleString()}</span>
                </div>
              </div>              {error && (
                <div className="mb-4 p-2 bg-red-50 text-red-500 rounded-md text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-2 bg-green-50 text-green-500 rounded-md text-sm">
                  {success}
                </div>
              )}
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <p className="text-xs text-gray-500 mb-4">
                  By clicking "Send Money", you'll be redirected to our secure payment gateway to complete the transaction using your preferred external payment method.
                </p>
              </div>              <button
                type="submit"
                className="w-full bg-[#8928A4] text-white py-3 px-4 rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] font-medium"
                disabled={isLoading || isValidatingEmail}
              >
                {isLoading ? 'Processing...' : isValidatingEmail ? 'Validating Recipient...' : 'Send Money'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExternalWalletTransfer;
