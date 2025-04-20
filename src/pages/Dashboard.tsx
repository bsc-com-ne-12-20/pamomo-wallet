import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { SendIcon, History, PlusCircle, Eye, EyeOff } from 'lucide-react';
import verifyIcon from '../components/images/verify.png';
import axios from 'axios';

interface DashboardProps {
  username: string;
  onLogout: () => void;
}

interface Transaction {
  trans_id: string;
  sender: string;
  receiver: string;
  amount: string;
  transaction_fee: string;
  time_stamp: string;
}

const Dashboard: React.FC<DashboardProps> = ({ username, onLogout }) => {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [showNotVerifiedMessage, setShowNotVerifiedMessage] = useState<boolean>(false);
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedReceiver, setSelectedReceiver] = useState<string>('');
  const [sendAmount, setSendAmount] = useState<string>('');
  const [transactionFee, setTransactionFee] = useState<number>(0);
  const [totalDeduction, setTotalDeduction] = useState<number>(0);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState<boolean>(false);
  const [showBalance, setShowBalance] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>('');

  const navigate = useNavigate();

  // Function to get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      return 'Good morning';
    } else if (hour >= 12 && hour < 18) {
      return 'Good afternoon';
    } else {
      return 'Good evening';
    }
  };

  // Set the greeting when the component mounts and update it periodically
  useEffect(() => {
    setGreeting(getGreeting());
    
    // Update greeting every minute in case user keeps the dashboard open across time periods
    const intervalId = setInterval(() => {
      setGreeting(getGreeting());
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('email');
    onLogout();
    navigate('/login', { replace: true });
  };

  const fetchBalance = async () => {
    const email = localStorage.getItem('email');

    if (!email) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('https://mtima.onrender.com/api/v1/accounts/get-balance/', {
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
      console.error(err);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchTransactions = async () => {
    const email = localStorage.getItem('email');
  
    if (!email) {
      return;
    }
  
    try {
      const response = await fetch(`https://mtima.onrender.com/api/v1/trsf/history/?email=${email}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }
  
      const data = await response.json();
  
      // Filter transactions where the logged-in user is the sender
      const filteredTransactions = data.filter((transaction: Transaction) => transaction.sender === email);
  
      // Sort transactions by time_stamp in descending order (most recent first)
      const sortedTransactions = filteredTransactions.sort(
        (a, b) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime()
      );
  
      // Get the most recent 5 transactions
      setTransactions(sortedTransactions.slice(0, 5));
    } catch (err) {
      console.error(err);
      setTransactions([]);
    }
  };

  useEffect(() => {
    const checkVerification = async (email: string) => {
      try {
        const response = await fetch('https://mtima.onrender.com/callback/check-verification/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.is_verified;
      } catch (error) {
        console.error("Verification check failed:", error);
        return false;
      }
    };

    const email = localStorage.getItem('email');
    if (email) {
      checkVerification(email).then(verified => {
        setIsVerified(verified);
        if (!verified) {
          setShowNotVerifiedMessage(true);
        }
      });
    }

    fetchBalance();
    fetchTransactions();
  }, []);

  const toggleBalanceVisibility = () => {
    setShowBalance(!showBalance);
  };

  const handleSendAgain = (receiverEmail: string) => {
    setSelectedReceiver(receiverEmail);
    setSendAmount('');
    setTransactionFee(0);
    setTotalDeduction(0);
    setShowModal(true);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSendAmount(value);
    const amountNum = parseFloat(value) || 0;
    const fee = amountNum * 0.03; // 3% transaction fee
    setTransactionFee(fee);
    setTotalDeduction(amountNum + fee);
  };

  const handleSend = async () => {
    if (!sendAmount || parseFloat(sendAmount) <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (parseFloat(sendAmount) > (balance || 0)) {
      alert('Insufficient balance.');
      return;
    }

    setIsSending(true);

    try {
      const senderEmail = localStorage.getItem('email');
      const response = await axios.post("https://mtima.onrender.com/api/v1/trsf/", {
        sender_email: senderEmail,
        receiver_email: selectedReceiver,
        amount: parseFloat(sendAmount),
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.status === 201) {
        setShowModal(false);
        setShowSuccessPopup(true); // Show success pop-up
      } else {
        alert('Transaction failed. Please try again.');
      }
    } catch (error) {
      alert('An error occurred while processing your transaction.');
      console.error('Transaction error:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handlePopupClose = () => {
    setShowSuccessPopup(false);
    fetchBalance(); // Refresh the balance
    fetchTransactions(); // Refresh the transactions
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={handleLogout} />
      
      <div className="container mx-auto px-4 py-4 sm:py-8 relative z-10">
        {showNotVerifiedMessage && (
          <div className="bg-red-200 text-red-800 p-3 sm:p-4 rounded-lg mb-4 text-sm sm:text-base">
            You are <strong>Not Verified</strong>. Please verify your account to access all features. 
            <Link to="/verify" className="text-[#8928A4] font-bold ml-1 hover:underline">Verify</Link>!
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                {greeting}, {username}
                {isVerified && <img src={verifyIcon} className="inline ml-2 h-6 w-6 sm:h-8 sm:w-8" alt="Verified" />}
              </h2>
              <p className="text-sm sm:text-base text-gray-600">Dashboard</p>
            </div>
            <div className="w-full sm:w-auto">
              <div className="bg-[#8928A4] text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg relative">
                <div className="flex justify-between items-center">
                  <p className="text-xs sm:text-sm">Available Balance</p>
                  <button 
                    onClick={toggleBalanceVisibility}
                    className="ml-2 p-1 bg-white bg-opacity-20 rounded-full"
                    aria-label={showBalance ? "Hide balance" : "Show balance"}
                  >
                    {showBalance ? (
                      <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    ) : (
                      <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    )}
                  </button>
                </div>
                {loading ? (
                  <p className="text-xl sm:text-3xl font-bold">MK##,###.##</p>
                ) : (
                  <p className="text-xl sm:text-3xl font-bold">
                    {showBalance ? (
                      `MK${balance !== null ? balance?.toLocaleString() : '##,###.##'}`
                    ) : (
                      'MK********'
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          <Link to="/deposit" className="bg-white rounded-lg shadow-md p-3 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-full sm:mr-4 mb-2 sm:mb-0">
                <PlusCircle className="h-5 w-5 sm:h-6 sm:w-6 text-[#8928A4]" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold">Deposit Money</h3>
                <p className="text-xs sm:text-sm text-gray-600">Deposit or Pay</p>
              </div>
            </div>
          </Link>

          <Link to="/send" className="bg-white rounded-lg shadow-md p-3 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-full sm:mr-4 mb-2 sm:mb-0">
                <SendIcon className="h-5 w-5 sm:h-6 sm:w-6 text-[#8928A4]" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold">Send Money</h3>
                <p className="text-xs sm:text-sm text-gray-600">Transfer to anyone</p>
              </div>
            </div>
          </Link>

          <Link to="/withdraw" className="bg-white rounded-lg shadow-md p-3 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-full sm:mr-4 mb-2 sm:mb-0">
                <p className="h-5 w-5 sm:h-6 sm:w-6 text-[#8928A4] flex items-center justify-center"><b>MK</b></p>
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold">Withdraw Money</h3>
                <p className="text-xs sm:text-sm text-gray-600">Cash out funds</p>
              </div>
            </div>
          </Link>

          <Link to="/history" className="bg-white rounded-lg shadow-md p-3 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col sm:flex-row items-center sm:items-start">
              <div className="bg-purple-100 p-2 sm:p-3 rounded-full sm:mr-4 mb-2 sm:mb-0">
                <History className="h-5 w-5 sm:h-6 sm:w-6 text-[#8928A4]" />
              </div>
              <div className="text-center sm:text-left">
                <h3 className="text-base sm:text-lg font-semibold">Transaction History</h3>
                <p className="text-xs sm:text-sm text-gray-600">View all transactions</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Transactions */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <ul className="divide-y divide-gray-200">
                {transactions.map((transaction) => (
                  <li key={transaction.trans_id} className="py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="mb-2 sm:mb-0">
                        <p className="text-xs sm:text-sm text-gray-600">
                          Sent to: <span className="font-bold">{transaction.receiver}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(transaction.time_stamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
                        <p className="text-xs sm:text-sm font-bold text-red-500">
                          -MK{parseFloat(transaction.amount).toLocaleString()}
                        </p>
                        <button
                          onClick={() => handleSendAgain(transaction.receiver)}
                          className="bg-[#8928A4] text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4] w-full sm:w-auto"
                        >
                          Send Again
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-500">No recent transactions found.</p>
          )}
        </div>
      </div>

      {/* Send Again Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-sm w-full">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Send Money</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 break-words">
              Sending to: <span className="font-bold">{selectedReceiver}</span>
            </p>
            <div className="mb-3 sm:mb-4">
              <label htmlFor="amount" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                id="amount"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#8928A4] focus:ring-[#8928A4] text-xs sm:text-sm p-2"
                placeholder="Enter amount"
                value={sendAmount}
                onChange={handleAmountChange}
              />
            </div>
            {sendAmount && (
              <div className="mb-3 sm:mb-4 text-xs sm:text-sm text-gray-700">
                <p>Transaction Fee: <span className="font-bold">MK{transactionFee.toFixed(2)}</span></p>
                <p>Total Deduction: <span className="font-bold">MK{totalDeduction.toFixed(2)}</span></p>
              </div>
            )}
            <div className="flex justify-end space-x-3 sm:space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="bg-[#8928A4] text-white px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
              >
                {isSending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Pop-Up */}
      {showSuccessPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-sm w-full">
            <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-3 sm:mb-4">Transaction Successful</h2>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              MK<span className="font-bold">{sendAmount}</span> has been sent successfully to <span className="font-bold break-words">{selectedReceiver}</span>.
            </p>
            <button
              onClick={handlePopupClose}
              className="w-full bg-[#8928A4] text-white py-1 sm:py-2 px-4 text-xs sm:text-sm rounded-md hover:bg-[#7a2391] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8928A4]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;