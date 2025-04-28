import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  graphType: 'transaction' | 'week' | 'month';
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({ active, payload, label, graphType }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
        <p className="text-xs font-medium">{graphType === 'transaction' ? payload[0]?.payload.fullDate : label}</p>
        {payload.map((entry, index) => (
          entry.value > 0 && (
            <p key={index} className="text-xs" style={{ color: entry.color }}>
              {entry.name}: Mk{entry.value.toFixed(2)}
            </p>
          )
        ))}
      </div>
    );
  }
  return null;
};

interface PieTooltipProps {
  active?: boolean;
  payload?: any[];
}

export const PieTooltip: React.FC<PieTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
        <p className="text-xs font-medium">{payload[0].name}</p>
        <p className="text-xs" style={{ color: payload[0].color }}>
          Amount: Mk{payload[0].value.toFixed(2)}
        </p>
        <p className="text-xs">
          {(payload[0].payload.percent * 100).toFixed(1)}% of total
        </p>
      </div>
    );
  }
  return null;
};

export const renderCustomizedPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  // On small screens, only show percentage without the label text
  const isMobile = window.innerWidth < 640;
  
  // For very small amounts (less than 1%), don't show labels
  if (percent < 0.01) return null;

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize={isMobile ? "10px" : "12px"}
    >
      {isMobile ? `${(percent * 100).toFixed(0)}%` : `${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  );
};