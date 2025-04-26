import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Pie, PieChart, Cell, ReferenceArea
} from 'recharts';

interface Transaction {
  id: string;
  type: 'transfer' | 'deposit' | 'withdrawal';
  sender?: string;
  receiver?: string;
  amount: number;
  fee?: number;
  time_stamp: string;
  display_time?: string;
}

interface TransactionHistoryProps {
  username: string;
  onLogout: () => void;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ username, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [visibleTransactions, setVisibleTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; needsVerification?: boolean }>({ message: '' });
  const [graphType, setGraphType] = useState<'transaction' | 'week' | 'month'>('transaction');
  const navigate = useNavigate();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  
  // For zoom functionality
  const [zoomLeft, setZoomLeft] = useState<number | null>(null);
  const [zoomRight, setZoomRight] = useState<number | null>(null);
  const [refAreaLeft, setRefAreaLeft] = useState<string | null>(null);
  const [refAreaRight, setRefAreaRight] = useState<string | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [yDomain, setYDomain] = useState<[number, number] | null>(null);
  
  const email = localStorage.getItem('email');

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

  const PIE_COLORS = ['rgba(54, 162, 235, 0.6)', 'rgba(255, 99, 132, 0.6)'];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const formatChartDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!email) {
        setError({ message: 'Authentication required: Please log in to view your transactions' });
        setLoading(false);
        return;
      }

      try {
        const transferResponse = await axios.get(`https://mtima.onrender.com/api/v1/trsf/history/?email=${email}`);
        const withdrawalResponse = await axios.get(`https://mtima.onrender.com/api/v1/wtdr/history/?email=${email}`);
        const depositResponse = await axios.get(`https://mtima.onrender.com/api/v1/dpst/history/?email=${email}`);

        const transferData = transferResponse.data.map((tx: any) => ({
          id: tx.trans_id,
          type: 'transfer',
          sender: tx.sender,
          receiver: tx.receiver,
          amount: parseFloat(tx.amount),
          time_stamp: tx.time_stamp,
          display_time: formatDate(tx.time_stamp)
        }));

        const withdrawalData = withdrawalResponse.data.map((tx: any) => ({
          id: tx.trans_id,
          type: 'withdrawal',
          amount: parseFloat(tx.amount),
          fee: parseFloat(tx.withdrawal_fee),
          time_stamp: tx.time_stamp,
          display_time: formatDate(tx.time_stamp)
        }));

        const depositData = depositResponse.data.map((tx: any) => ({
          id: tx.transaction_id,
          type: 'deposit',
          amount: parseFloat(tx.amount),
          time_stamp: tx.time_stamp,
          display_time: formatDate(tx.time_stamp)
        }));

        const allTransactions = [...transferData, ...withdrawalData, ...depositData];
        allTransactions.sort((a, b) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime());

        setTransactions(allTransactions);
        setVisibleTransactions(allTransactions.slice(0, 5));
      } catch (err: any) {
        setError({ message: err.response?.data?.message || 'Failed to fetch transactions. Please try again later.' });
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [username, email]);

  useEffect(() => {
    if (transactions.length > 0) {
      const preparedData = prepareChartData();
      setChartData(preparedData);
      setOriginalData(preparedData);
      
      // Calculate initial y-domain based on data
      calculateYDomain(preparedData);
    }
  }, [transactions, graphType]);

  const calculateYDomain = (data: any[]) => {
    if (data.length === 0) return;
    
    // Find max credit and debit values
    let maxCredit = 0;
    let maxDebit = 0;
    
    data.forEach(item => {
      if (item.credit > maxCredit) maxCredit = item.credit;
      if (item.debit > maxDebit) maxDebit = item.debit;
    });
    
    // Set y-domain with some padding (20%)
    const maxValue = Math.max(maxCredit, maxDebit);
    setYDomain([0, maxValue * 1.2]);
  };

  const loadMoreTransactions = () => {
    const nextVisibleCount = visibleTransactions.length + 5;
    setVisibleTransactions(transactions.slice(0, nextVisibleCount));
  };

  const formatMonthYear = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
  };

  const formatWeekYear = (dateString: string) => {
    const date = new Date(dateString);
    const week = Math.ceil(date.getDate() / 7);
    return `W${week}, ${date.getFullYear()}`;
  };

  const prepareChartData = () => {
    if (graphType === 'transaction') {
      // Sort transactions by oldest first for the graph
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.time_stamp).getTime() - new Date(b.time_stamp).getTime()
      );
      
      // Convert to format needed by recharts
      return sortedTransactions.map((tx, index) => {
        const date = new Date(tx.time_stamp);
        const formattedTime = formatChartDate(tx.time_stamp);
        
        // Determine if this is a credit or debit transaction
        const isCredit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === email);
        const isDebit = tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender === email);
        
        return {
          name: formattedTime,
          fullDate: date.toLocaleString(),
          credit: isCredit ? tx.amount : 0,
          debit: isDebit ? tx.amount : 0,
          index // Add index for easier zoom reference
        };
      });
    } else {
      // For week/month grouping
      const groupBy = graphType === 'month' ? formatMonthYear : formatWeekYear;
      const groupedData: Record<string, { credit: number; debit: number }> = {};
      
      // Create a copy of transactions and sort by oldest first
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.time_stamp).getTime() - new Date(b.time_stamp).getTime()
      );
      
      // Group by week or month
      sortedTransactions.forEach((tx) => {
        const key = groupBy(tx.time_stamp);

        if (!groupedData[key]) {
          groupedData[key] = { credit: 0, debit: 0 };
        }

        if (tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === email)) {
          groupedData[key].credit += tx.amount;
        } else if (tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender === email)) {
          groupedData[key].debit += tx.amount;
        }
      });

      // For week/month grouping, ensure chronological order
      const orderedLabels = Object.keys(groupedData).sort((a, b) => {
        if (graphType === 'month') {
          const [monthA, yearA] = a.split(' ');
          const [monthB, yearB] = b.split(' ');
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          if (yearA !== yearB) {
            return parseInt(yearA) - parseInt(yearB);
          }
          return months.indexOf(monthA) - months.indexOf(monthB);
        } else {
          // For week format "W1, 2023"
          const weekYearA = a.match(/W(\d+), (\d+)/);
          const weekYearB = b.match(/W(\d+), (\d+)/);
          if (!weekYearA || !weekYearB) return 0;
          
          const [, weekA, yearA] = weekYearA;
          const [, weekB, yearB] = weekYearB;
          
          if (yearA !== yearB) {
            return parseInt(yearA) - parseInt(yearB);
          }
          return parseInt(weekA) - parseInt(weekB);
        }
      });
      
      // Convert to format needed by recharts
      return orderedLabels.map((key, index) => ({
        name: key,
        credit: groupedData[key].credit,
        debit: groupedData[key].debit,
        index // Add index for easier zoom reference
      }));
    }
  };

  // For zoom functionality
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
    let leftIndex = chartData.findIndex(item => item.name === refAreaLeft);
    let rightIndex = chartData.findIndex(item => item.name === refAreaRight);
    
    // Sort indices if needed
    if (leftIndex > rightIndex) {
      [leftIndex, rightIndex] = [rightIndex, leftIndex];
    }

    // Apply zoom only if a valid range is selected
    if (rightIndex - leftIndex > 0) {
      const zoomedData = chartData.slice(leftIndex, rightIndex + 1);
      setChartData(zoomedData);
      
      // Calculate new y-domain for better visibility
      calculateYDomain(zoomedData);
    }
    
    // Reset reference areas
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const resetZoom = () => {
    setChartData(originalData);
    calculateYDomain(originalData);
    setRefAreaLeft(null);
    setRefAreaRight(null);
  };

  const totalCredit = transactions
    .filter((tx) => tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === email))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebit = transactions
    .filter((tx) => tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender === email))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const pieData = [
    { name: 'Credit (CR)', value: totalCredit },
    { name: 'Debit (DR)', value: totalDebit }
  ];

  // Custom tooltip for the area chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-sm">
          <p className="text-xs font-medium">{graphType === 'transaction' ? payload[0]?.payload.fullDate : label}</p>
          {payload.map((entry: any, index: number) => (
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

  // Custom renderer for Pie chart labels - more responsive for small screens
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
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

  // Custom tooltip for pie chart
  const PieCustomTooltip = ({ active, payload }: any) => {
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

  // Calculate the pie chart size based on screen size
  const getPieChartSize = () => {
    // Get current viewport width
    const viewportWidth = window.innerWidth;
    
    if (viewportWidth < 350) return { width: 160, height: 160 };
    if (viewportWidth < 480) return { width: 200, height: 200 };
    if (viewportWidth < 640) return { width: 240, height: 240 };
    if (viewportWidth < 768) return { width: 260, height: 260 };
    return { width: 300, height: 300 };
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} onLogout={onLogout} />

      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center text-[#8928A4] mb-6 hover:underline"
        >
          <ArrowLeft size={16} className="mr-1" />
          Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Transaction History</h2>

          {loading && <p className="text-gray-500 text-center">Loading transactions...</p>}

          {error.message && (
            <div className="text-center py-8">
              <p className="text-gray-600">{error.message}</p>
            </div>
          )}

          {!loading && !error.message && visibleTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          )}

          {!loading && !error.message && visibleTransactions.length > 0 && (
            <>
              {/* Mobile Transaction List View */}
              <div className="block md:hidden">
                <div className="space-y-4">
                  {visibleTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</span>
                        <span className="text-sm font-bold">
                          Mk{transaction.amount.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">
                        {transaction.display_time}
                      </div>
                      <div className="text-xs text-gray-700">
                        {transaction.type === 'transfer'
                          ? `From: ${transaction.sender} To: ${transaction.receiver}`
                          : transaction.type === 'withdrawal'
                          ? `Fee: Mk${transaction.fee?.toFixed(2)}`
                          : 'Deposit'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Transaction Table View */}
              <div className="hidden md:block overflow-x-auto mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.display_time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 capitalize">
                          {transaction.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {transaction.type === 'transfer'
                            ? `From: ${transaction.sender} To: ${transaction.receiver}`
                            : transaction.type === 'withdrawal'
                            ? `Fee: Mk${transaction.fee?.toFixed(2)}`
                            : 'Deposit'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          Mk{transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {visibleTransactions.length < transactions.length && (
                <div className="text-center mb-8">
                  <button
                    onClick={loadMoreTransactions}
                    className="px-6 py-2 bg-[#8928A4] text-white rounded-md hover:bg-[#6a1f7a] transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mt-8">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 mb-4">Transaction Trends</h3>
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
                      {chartData.length !== originalData.length && 
                        `Showing ${chartData.length} of ${originalData.length} data points`
                      }
                    </div>
                  </div>
                </div>
                
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
                        <YAxis 
                          tick={{ fontSize: 10 }} 
                          domain={yDomain || [0, 'auto']}
                          allowDataOverflow
                        />
                        <Tooltip content={<CustomTooltip />} />
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
                </div>
                
                <div className="mt-2 text-xs text-gray-500 text-center">
                  <p>Tip: Click and drag on the chart to zoom into a specific range</p>
                </div>
              </div>

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
                          label={renderCustomizedLabel}
                          outerRadius="80%"
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={PIE_COLORS[index % PIE_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<PieCustomTooltip />} />
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionHistory;