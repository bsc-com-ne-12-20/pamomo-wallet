import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { TRANSACTION_LIMITS } from '../../utils/constants';

interface SubscriptionBannerProps {
  subscription: {
    plan: string;
    period: string;
    status: string;
    expiry_date: string;
    auto_renew: boolean;
    current_balance?: number;
  } | null;
  loading: boolean;
}

const SubscriptionBanner: React.FC<SubscriptionBannerProps> = ({ subscription, loading }) => {
  const navigate = useNavigate();

  if (loading || !subscription || subscription.plan === 'PREMIUM') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border-l-4 border-[#8928A4]">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <div>
          <p className="text-sm text-gray-600">Current Subscription</p>
          <p className="font-medium text-[#8928A4]">{subscription.plan} Plan</p>
        </div>

        <div className="mt-2 sm:mt-0">
          {subscription.plan === 'FREE' && (
            <div className="flex items-center">
              <AlertTriangle size={16} className="text-yellow-500 mr-2" />
              <span className="text-sm text-yellow-700">
                Limited to MWK{TRANSACTION_LIMITS.FREE.toLocaleString()} per transaction
              </span>
            </div>
          )}
          {subscription.plan === 'BASIC' && (
            <div className="flex items-center">
              <AlertTriangle size={16} className="text-yellow-500 mr-2" />
              <span className="text-sm text-yellow-700">
                Limited to MWK{TRANSACTION_LIMITS.BASIC.toLocaleString()} per transaction
              </span>
            </div>
          )}

          <button onClick={() => navigate('/subscription')} className="text-[#8928A4] text-sm hover:underline mt-1">
            Upgrade subscription
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionBanner;