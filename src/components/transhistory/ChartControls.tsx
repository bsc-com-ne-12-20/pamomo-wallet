import React from 'react';
import { ZoomOut } from 'lucide-react';

interface ChartControlsProps {
  graphType: 'transaction' | 'week' | 'month';
  setGraphType: (type: 'transaction' | 'week' | 'month') => void;
  resetZoom: () => void;
  chartData: any[];
  originalData: any[];
}

const ChartControls: React.FC<ChartControlsProps> = ({
  graphType,
  setGraphType,
  resetZoom,
  chartData,
  originalData,
}) => {
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => {
            setGraphType('transaction');
            resetZoom();
          }}
          className={`px-3 py-1 text-xs md:text-sm rounded-md ${
            graphType === 'transaction' ? 'bg-[#8928A4] text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Per Transaction
        </button>
        <button
          onClick={() => {
            setGraphType('week');
            resetZoom();
          }}
          className={`px-3 py-1 text-xs md:text-sm rounded-md ${
            graphType === 'week' ? 'bg-[#8928A4] text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Per Week
        </button>
        <button
          onClick={() => {
            setGraphType('month');
            resetZoom();
          }}
          className={`px-3 py-1 text-xs md:text-sm rounded-md ${
            graphType === 'month' ? 'bg-[#8928A4] text-white' : 'bg-gray-200 text-gray-800'
          }`}
        >
          Per Month
        </button>
      </div>

      <div className="flex justify-end mb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={resetZoom}
            className="flex items-center text-xs md:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
            disabled={chartData.length === originalData.length}
          >
            <ZoomOut size={14} className="mr-1" />
            Reset Zoom
          </button>
          <div className="text-xs text-gray-500">
            {chartData.length !== originalData.length && `Showing ${chartData.length} of ${originalData.length} data points`}
          </div>
        </div>
      </div>
    </>
  );
};

export default ChartControls;