import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import ChartControls from './ChartControls';
import TransactionChart from './TransactionChart';
import PieChartDisplay from './PieChartDisplay';

interface AnalyticsSectionProps {
  hasAnalyticsAccess: boolean;
  hasAdvancedAnalytics: boolean;
  subscription: any;
  graphType: 'transaction' | 'week' | 'month';
  setGraphType: (type: 'transaction' | 'week' | 'month') => void;
  chartData: any[];
  originalData: any[];
  yDomain: [number, number] | null;
  resetZoom: () => void;
  onZoom: (leftIndex: number, rightIndex: number) => void;
  totalCredit: number;
  totalDebit: number;
}

const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({
  hasAnalyticsAccess,
  hasAdvancedAnalytics,
  subscription,
  graphType,
  setGraphType,
  chartData,
  originalData,
  yDomain,
  resetZoom,
  onZoom,
  totalCredit,
  totalDebit,
}) => {
  const navigate = useNavigate();

  if (!hasAnalyticsAccess) {
    return (
      <div className="bg-[#f9f0fc] rounded-lg shadow-md p-4 md:p-6 mt-8 border border-[#8928A4] border-opacity-30">
        <div className="flex items-center">
          <TrendingUp size={24} className="text-[#8928A4] mr-3" />
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-800">Unlock Transaction Insights</h3>
            <p className="text-sm text-gray-600 mt-1">
              Upgrade to our Basic or Premium plan to access detailed transaction analytics and insights.
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/subscription')}
          className="mt-4 px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#6a1f7a] transition-colors"
        >
          View Subscription Plans
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-8">
        <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Transaction Trends</h3>
        <ChartControls
          graphType={graphType}
          setGraphType={setGraphType}
          resetZoom={resetZoom}
          chartData={chartData}
          originalData={originalData}
        />
        <TransactionChart chartData={chartData} graphType={graphType} yDomain={yDomain} onZoom={onZoom} />
      </div>

      {/* Only show pie chart for PREMIUM plans */}
      {hasAdvancedAnalytics ? (
        <PieChartDisplay totalCredit={totalCredit} totalDebit={totalDebit} />
      ) : (
        subscription?.plan === 'BASIC' && (
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-8 border border-[#8928A4] border-opacity-20">
            <div className="flex items-center">
              <div className="bg-[#f9f0fc] p-2 rounded-full mr-3">
                <PieChartIcon size={24} className="text-[#8928A4]" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Unlock Advanced Analytics</h3>
                <p className="text-sm text-gray-600">
                  Upgrade to Premium for detailed transaction breakdown charts and advanced analytics features.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="mt-4 px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#6a1f7a] transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        )
      )}
    </>
  );
};

export default AnalyticsSection;