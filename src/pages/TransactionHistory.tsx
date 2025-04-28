import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { ArrowLeft } from 'lucide-react';
import TransactionList from '../components/transhistory/TransactionList';
import SubscriptionBanner from '../components/transhistory/SubscriptionBanner';
import AnalyticsSection from '../components/transhistory/AnalyticsSection';
import { useTransactionData } from '../components/transhistory/hooks/useTransactionData';
import { useChartData } from '../components/transhistory/hooks/useChartData';

interface TransactionHistoryProps {
  username: string;
  onLogout: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const email = localStorage.getItem('email');
  const [subscription, setSubscription] = useState<any>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [graphType, setGraphType] = useState<'transaction' | 'week' | 'month'>('transaction');

  // Fetch user's subscription details
  useEffect(() => {
    const fetchSubscription = async () => {
      if (!email) return;
      
      try {
        setSubscriptionLoading(true);
        const response = await axios.post('https://mtima.onrender.com/api/v1/subscriptions/check-subscription/', {
          email
        });
        
        if (response.status === 200) {
          setSubscription(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch subscription details:', error);
        // Default to free plan if fetch fails
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
  }, [email]);

  // Check if analytics features are available based on subscription
  const hasAnalyticsAccess = () => {
    if (!subscription) return false;
    return subscription.plan === 'BASIC' || subscription.plan === 'PREMIUM';
  };
  
  // Check if advanced analytics are available
  const hasAdvancedAnalytics = () => {
    if (!subscription) return false;
    return subscription.plan === 'PREMIUM';
  };

  // Custom hooks for transaction data and chart data
  const { 
    transactions, 
    visibleTransactions, 
    loading, 
    error, 
    loadMoreTransactions,
    totalCredit,
    totalDebit
  } = useTransactionData(email, username, subscription);

  const { 
    chartData, 
    originalData, 
    yDomain, 
    resetZoom, 
    handleZoom 
  } = useChartData(transactions, graphType, email);

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

        <SubscriptionBanner subscription={subscription} loading={subscriptionLoading} />

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>
          
          <TransactionList 
            transactions={transactions}
            visibleTransactions={visibleTransactions}
            loading={loading}
            error={error}
            subscription={subscription}
            email={email}
            onLoadMore={loadMoreTransactions}
          />

          <AnalyticsSection
            hasAnalyticsAccess={hasAnalyticsAccess()}
            hasAdvancedAnalytics={hasAdvancedAnalytics()}
            subscription={subscription}
            graphType={graphType}
            setGraphType={setGraphType}
            chartData={chartData}
            originalData={originalData}
            yDomain={yDomain}
            resetZoom={resetZoom}
            onZoom={handleZoom}
            totalCredit={totalCredit}
            totalDebit={totalDebit}
          />
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;