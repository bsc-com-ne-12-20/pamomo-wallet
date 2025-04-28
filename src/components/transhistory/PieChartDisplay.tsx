import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieTooltip, renderCustomizedPieLabel } from './CustomTooltips';

interface PieChartDisplayProps {
  totalCredit: number;
  totalDebit: number;
}

const PieChartDisplay: React.FC<PieChartDisplayProps> = ({ totalCredit, totalDebit }) => {
  const PIE_COLORS = ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'];

  const pieData = [
    { name: 'Credit (CR)', value: totalCredit },
    { name: 'Debit (DR)', value: totalDebit },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-8">
      <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Transaction Breakdown</h3>

      {/* Fully responsive pie chart container */}
      <div className="w-full flex justify-center items-center">
        <div className="w-full aspect-square max-w-xs sm:max-w-sm md:max-w-md">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedPieLabel}
                outerRadius="80%"
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary boxes for credit/debit - more responsive grid */}
      <div className="mt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Total Credit</p>
            <p className="text-sm md:text-base font-bold text-blue-600">Mk{totalCredit.toFixed(2)}</p>
          </div>
          <div className="bg-red-50 p-3 rounded-md">
            <p className="text-xs text-gray-500">Total Debit</p>
            <p className="text-sm md:text-base font-bold text-red-600">Mk{totalDebit.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Legend for pie chart - helpful on small screens */}
      <div className="mt-4">
        <div className="flex flex-wrap justify-center gap-6">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-400 mr-2"></div>
            <span className="text-xs text-gray-600">Credit (CR)</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
            <span className="text-xs text-gray-600">Debit (DR)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PieChartDisplay;