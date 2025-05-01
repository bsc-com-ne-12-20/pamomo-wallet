import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader2 from '../components/Loader2';
import { ArrowLeft, AlertTriangle, Wallet, CreditCard, Check } from 'lucide-react';
import axios from 'axios';
import jsQR from 'jsqr';

// Import components
import BalanceDisplay from '../components/sendmoney/BalanceDisplay';
import SendMoneyForm from '../components/sendmoney/SendMoneyForm';
import QRScannerModal from '../components/sendmoney/QRScannerModal';
import ConfirmationModal from '../components/sendmoney/ConfirmationModal';
import SuccessModal from '../components/sendmoney/SuccessModal';
import { 
  API_BASE_URL, 
  TRANSACTION_LIMITS, 
  TRANSFER_FEE_PERCENTAGE,
  PAYMENT_API_URL,
  PAYMENT_API_KEY
} from '../utils/constants';

interface SubscriptionPlan {
  plan: string;
  period: string;
  status: string;
  expiry_date: string;
  auto_renew: boolean;
  current_balance?: number;
}

interface SendMoneyProps {
  onLogout: () => void;
  isVerified: boolean;
}

type PaymentMethod = 'pamomo_wallet' | 'external_wallet';

const SendMoney: React.FC<SendMoneyProps> = ({ onLogout, isVerified }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [receiver, setReceiver] = useState('');
  const [receiverUsername, setReceiverUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionFee, setTransactionFee] = useState(0);
  const [totalDeduction, setTotalDeduction] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [fetchingUsername, setFetchingUsername] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pamomo_wallet');
  const [showPaymentMethodSelection, setShowPaymentMethodSelection] = useState(true);
  const [makeRecurring, setMakeRecurring] = useState(false);
  const [frequency, setFrequency] = useState('DAILY');
  const [startDate, setStartDate] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const minDate = new Date().toISOString().split('T')[0];

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAmount(value);
    const amountNum = parseFloat(value) || 0;
    const fee = amountNum * TRANSFER_FEE_PERCENTAGE;
    setTransactionFee(fee);
    setTotalDeduction(amountNum + fee);
  };

  const handleScanQRCode = () => {
    setShowQRScanner(true);
  };

  const fetchUsername = async (email: string) => {
    setFetchingUsername(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/accounts/get-username/`, {
        email
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 200) {
        setReceiverUsername(response.data.username);
      } else {
        setError('Failed to fetch username');
        setReceiverUsername('Unknown User');
      }
    } catch (error) {
      console.error("Error fetching username:", error);
      setReceiverUsername('Unknown User');
    } finally {
      setFetchingUsername(false);
    }
  };

  const handleScanResult = async (result: string | null) => {
    if (result) {
      setReceiver(result);
      setShowQRScanner(false);
      
      await fetchUsername(result);
      setShowConfirmation(true);
    }
  };

  const confirmQrCode = () => {
    setShowConfirmation(false);
  };

  const cancelQrCode = () => {
    setShowConfirmation(false);
    setReceiver('');
    setReceiverUsername('');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, img.width, img.height);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);
            if (qrCode) {
              setReceiver(qrCode.data);
              setShowQRScanner(false);
              
              await fetchUsername(qrCode.data);
              setShowConfirmation(true);
            } else {
              setError('No QR code found in the image.');
            }
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch user's subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      const email = localStorage.getItem('email');
      if (!email) return;
      
      try {
        setSubscriptionLoading(true);
        const response = await axios.post(`${API_BASE_URL}/subscriptions/check-subscription/`, {
          email
        });
        
        if (response.status === 200) {
          setSubscription(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription details:', error);
        setSubscription({
          plan: 'FREE',
          period: 'LIFETIME',
          status: 'ACTIVE',
          expiry_date: 'NEVER',
          auto_renew: false
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };
    
    fetchSubscription();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      const email = localStorage.getItem('email');

      if (!email) {
        setLoading(false);
        return;
      }

      if (!isVerified) {
        navigate('/verify');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/accounts/get-balance/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        setBalance(data.balance);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [isVerified, navigate]);

  const checkTransactionLimit = (amountNum: number): boolean => {
    if (!subscription) return true;
    
    const limit = TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS] || TRANSACTION_LIMITS.FREE;
    return amountNum <= limit;
  };

  const getTransactionLimit = (): number => {
    if (!subscription) return TRANSACTION_LIMITS.FREE;
    return TRANSACTION_LIMITS[subscription.plan as keyof typeof TRANSACTION_LIMITS] || TRANSACTION_LIMITS.FREE;
  };

  const handleSubmitPamomoWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSending(true);

    if (!receiver || !amount) {
      setError('Please fill in all fields');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    if (!checkTransactionLimit(amountNum)) {
      setError(`Transaction amount exceeds your ${subscription?.plan} plan limit of MWK${getTransactionLimit().toLocaleString()}. Please upgrade your subscription to send larger amounts.`);
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    if (amountNum > (balance || 0)) {
      setError('Insufficient balance');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    try {
      const senderEmail = localStorage.getItem('email');
      const response = await axios.post(`${API_BASE_URL}/trsf/`, {
        sender_email: senderEmail,
        receiver_email: receiver,
        amount: amountNum
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 201) {
        setTimeout(() => {
          setIsSending(false);
          setShowSuccessPopup(true);
        }, 3000);
      } else {
        setError('Transaction failed. Please try again.');
        setTimeout(() => setIsSending(false), 3000);
      }
    } catch (error) {
      setError('An error occurred while processing your transaction.');
      setTimeout(() => setIsSending(false), 3000);
    }
  };

  const handleSubmitExternalWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSending(true);

    if (!receiver || !amount) {
      setError('Please fill in all fields');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    if (!checkTransactionLimit(amountNum)) {
      setError(`Transaction amount exceeds your ${subscription?.plan} plan limit of MWK${getTransactionLimit().toLocaleString()}. Please upgrade your subscription to send larger amounts.`);
      setTimeout(() => setIsSending(false), 3000);
      return;
    }

    // For external wallet, we use the payment gateway
    try {
      const senderEmail = localStorage.getItem('email');
      
      // Store transfer info in localStorage
      localStorage.setItem('transferAmount', amount);
      localStorage.setItem('transferReceiver', receiver);
      localStorage.setItem('transferReceiverUsername', receiverUsername);

      const response = await fetch(`${PAYMENT_API_URL}/payment`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: `Bearer ${PAYMENT_API_KEY}`,
        },
        body: JSON.stringify({
          currency: 'MWK',
          amount: amountNum.toString(),
          callback_url: 'https://pamomo-wallet.netlify.app/verifytransfer',
          return_url: 'https://pamomo-wallet.netlify.app/transfer/complete',
          metadata: {
            receiver_email: receiver,
            sender_email: senderEmail,
            transaction_type: 'transfer'
          }
        }),
      });

      const result = await response.json();

      if (result.status === 'success' && result.data.checkout_url) {
        window.location.href = result.data.checkout_url;
      } else {
        setError('Transaction initiation failed. Please try again.');
        setTimeout(() => setIsSending(false), 3000);
      }
    } catch (error) {
      setError('An error occurred while processing your transaction.');
      setTimeout(() => setIsSending(false), 3000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (paymentMethod === 'pamomo_wallet') {
      return handleSubmitPamomoWallet(e);
    } else {
      return handleSubmitExternalWallet(e);
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setShowPaymentMethodSelection(false);
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    navigate('/dashboard');
  };

  const handleUpgradeClick = () => {
    navigate('/subscription');
  };

  const handleBackToPaymentSelection = () => {
    setShowPaymentMethodSelection(true);
    setError('');
  };

  const username = localStorage.getItem('username') || 'User';

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
        
        {subscription && subscription.plan !== 'PREMIUM' && !subscriptionLoading && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center">
            <AlertTriangle size={20} className="text-yellow-500 mr-3 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Transaction Limit: {subscription.plan === 'FREE' 
                  ? `MWK${TRANSACTION_LIMITS.FREE.toLocaleString()}` 
                  : `MWK${TRANSACTION_LIMITS.BASIC.toLocaleString()}`}
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                Your current subscription limits you to 
                {subscription.plan === 'FREE' 
                  ? ` MWK${TRANSACTION_LIMITS.FREE.toLocaleString()}` 
                  : ` MWK${TRANSACTION_LIMITS.BASIC.toLocaleString()}`} per transaction.
                <button 
                  onClick={handleUpgradeClick}
                  className="ml-1 text-[#8928A4] hover:underline"
                >
                  Upgrade now
                </button>
              </p>
            </div>
          </div>
        )}
        
        {isSending ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <Loader2 />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Money</h2>
            
            {showPaymentMethodSelection ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">Select your payment method:</p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => handlePaymentMethodSelect('pamomo_wallet')}
                    className="w-full bg-white border-2 border-[#8928A4] p-4 rounded-lg flex items-center text-left hover:bg-[#f9f0fc] transition-colors"
                  >
                    <Wallet className="text-[#8928A4] mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">Pamomo Wallet</p>
                      <p className="text-xs text-gray-500">Use your available balance: MK{balance?.toLocaleString() || '0'}</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => handlePaymentMethodSelect('external_wallet')}
                    className="w-full bg-white border border-gray-300 p-4 rounded-lg flex items-center text-left hover:bg-gray-50 transition-colors"
                  >
                    <CreditCard className="text-gray-600 mr-3" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">External Payment</p>
                      <p className="text-xs text-gray-500">Pay using mobile money, credit card, or other options</p>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 bg-blue-50 p-3 rounded-lg flex items-center">
                  {paymentMethod === 'pamomo_wallet' ? (
                    <Wallet className="text-[#8928A4] mr-3" />
                  ) : (
                    <CreditCard className="text-gray-600 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      Payment Method: {paymentMethod === 'pamomo_wallet' ? 'Pamomo Wallet' : 'External Payment'}
                    </p>
                    <button 
                      onClick={handleBackToPaymentSelection}
                      className="text-xs text-[#8928A4] hover:underline mt-1"
                    >
                      Change payment method
                    </button>
                  </div>
                </div>

                {paymentMethod === 'pamomo_wallet' && (
                  <BalanceDisplay balance={balance} loading={loading} />
                )}

                <SendMoneyForm
                  receiver={receiver}
                  setReceiver={setReceiver}
                  amount={amount}
                  handleAmountChange={handleAmountChange}
                  error={error}
                  handleSubmit={handleSubmit}
                  handleScanQRCode={handleScanQRCode}
                  transactionFee={transactionFee}
                  totalDeduction={totalDeduction}
                  transactionLimit={getTransactionLimit()}
                  showLimitWarning={!subscriptionLoading && !!subscription && subscription.plan !== 'PREMIUM'}
                  submitButtonText={paymentMethod === 'pamomo_wallet' 
                    ? 'Send from Pamomo Wallet' 
                    : 'Continue to Payment'}
                />

                {subscription && subscription.plan !== 'FREE' && (
                  <div className="flex items-center mt-4 mb-2">
                    <input
                      type="checkbox"
                      id="makeRecurring"
                      className="rounded text-[#8928A4] focus:ring-[#8928A4] h-4 w-4"
                      checked={makeRecurring}
                      onChange={(e) => setMakeRecurring(e.target.checked)}
                    />
                    <label htmlFor="makeRecurring" className="ml-2 text-sm text-gray-700">
                      Set up as recurring auto payment
                    </label>
                  </div>
                )}

                {makeRecurring && (
                  <div className="bg-gray-50 p-3 rounded-md mb-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="frequency" className="block text-xs font-medium text-gray-700 mb-1">
                          Frequency
                        </label>
                        <select
                          id="frequency"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-xs p-1.5 border"
                          value={frequency}
                          onChange={(e) => setFrequency(e.target.value as any)}
                        >
                          <option value="DAILY">Daily</option>
                          <option value="WEEKLY">Weekly</option>
                          <option value="BIWEEKLY">Every 2 Weeks</option>
                          <option value="MONTHLY">Monthly</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="startDate" className="block text-xs font-medium text-gray-700 mb-1">
                          Start Date
                        </label>
                        <input
                          type="date"
                          id="startDate"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-xs p-1.5 border"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          min={minDate}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        id="description"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-xs p-1.5 border"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="e.g. Monthly rent payment"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <QRScannerModal
          show={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          onScanResult={handleScanResult}
          handleImageUpload={handleImageUpload}
        />

        <ConfirmationModal
          show={showConfirmation}
          receiver={receiver}
          receiverUsername={receiverUsername}
          onConfirm={confirmQrCode}
          onCancel={cancelQrCode}
          isLoading={fetchingUsername}
        />

        <SuccessModal
          show={showSuccessPopup}
          amount={amount}
          receiver={receiver}
          receiverUsername={receiverUsername}
          onClose={handlePopupClose}
        />
      </div>
    </div>
  );
};

export default SendMoney;