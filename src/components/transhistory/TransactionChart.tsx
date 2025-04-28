import React, { useRef, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';
import { ChartTooltip } from './CustomTooltips';

interface TransactionChartProps {
  chartData: any[];
  graphType: 'transaction' | 'week' | 'month';
  yDomain: [number, number] | null;
  onZoom: (leftIndex: number, rightIndex: number) => void;
}

const TransactionChart: React.FC<TransactionChartProps> = ({ chartData, graphType, yDomain, onZoom }) => {
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Colors for the charts
  const COLORS = {
    credit: {
      line: '#3684eb',
      fill: 'rgba(54, 162, 235, 0.2)',
    },
    debit: {
      line: '#ff6384',
      fill: 'rgba(255, 99, 132, 0.2)',
    },
  };

  const handleMouseDown = (e: any) => {
    if (!e || !e.activeLabel) return;
    setRefAreaLeft(e.activeLabel);
  };

  const handleMouseMove = (e: any) => {
    if (!e || !e.activeLabel || !refAreaLeft) return;
    setRefAreaRight(e.activeLabel);
  };

  const handleMouseUp = () => {
    if (!refAreaLeft || !refAreaRight) return;

    // Find indices of the left and right ref areas
    let leftIndex = chartData.findIndex((item) => item.name === refAreaLeft);
    let rightIndex = chartData.findIndex((item) => item.name === refAreaRight);

    // Sort indices if needed
    if (leftIndex > rightIndex) {
      [leftIndex, rightIndex] = [rightIndex, leftIndex];
    }

    // Apply zoom only if a valid range is selected
    if (rightIndex - leftIndex > 0) {
      onZoom(leftIndex, rightIndex);
    }

    // Reset reference areas
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  return (
    <div className="h-60 md:h-80" ref={chartContainerRef}>
      {chartData.length > 0 && (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10 }}
              angle={-45}
              textAnchor="end"
              height={60}
              allowDataOverflow
            />
            <YAxis tick={{ fontSize: 10 }} domain={yDomain || [0, 'auto']} allowDataOverflow />
            <Tooltip content={<ChartTooltip graphType={graphType} />} />
            <Legend wrapperStyle={{ fontSize: '10px' }} />
            <Area
              type="monotone"
              dataKey="credit"
              name="Credit (CR)"
              stroke={COLORS.credit.line}
              fill={COLORS.credit.fill}
              stackId="1"
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="debit"
              name="Debit (DR)"
              stroke={COLORS.debit.line}
              fill={COLORS.debit.fill}
              stackId="2"
              activeDot={{ r: 5 }}
            />

            {/* Reference area for zoom selection */}
            {refAreaLeft && refAreaRight && (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
                fill="#8928A4"
                fillOpacity={0.1}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      )}
      <div className="mt-2 text-xs text-gray-500 text-center">
        <p>Tip: Click and drag on the chart to zoom into a specific range</p>
      </div>
    </div>
  );
};

export default TransactionChart;