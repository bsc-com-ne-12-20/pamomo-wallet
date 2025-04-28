import { useState, useEffect } from 'react';

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

interface UseChartDataResult {
  chartData: any[];
  originalData: any[];
  yDomain: [number, number] | null;
  resetZoom: () => void;
  handleZoom: (leftIndex: number, rightIndex: number) => void;
}

export const useChartData = (
  transactions: Transaction[], 
  graphType: 'transaction' | 'week' | 'month',
  email: string | null
): UseChartDataResult => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [originalData, setOriginalData] = useState<any[]>([]);
  const [yDomain, setYDomain] = useState<[number, number] | null>(null);

  const formatChartDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

  const calculateYDomain = (data: any[]) => {
    if (data.length === 0) return;
    
    let maxCredit = 0;
    let maxDebit = 0;
    
    data.forEach(item => {
      if (item.credit > maxCredit) maxCredit = item.credit;
      if (item.debit > maxDebit) maxDebit = item.debit;
    });
    
    const maxValue = Math.max(maxCredit, maxDebit);
    setYDomain([0, maxValue * 1.2]);
  };

  const prepareChartData = () => {
    if (graphType === 'transaction') {
      // Sort transactions by oldest first for the graph
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.time_stamp).getTime() - new Date(b.time_stamp).getTime()
      );
      
      return sortedTransactions.map((tx, index) => {
        const date = new Date(tx.time_stamp);
        const formattedTime = formatChartDate(tx.time_stamp);
        
        const isCredit = tx.type === 'deposit' || (tx.type === 'transfer' && tx.receiver === email);
        const isDebit = tx.type === 'withdrawal' || (tx.type === 'transfer' && tx.sender === email);
        
        return {
          name: formattedTime,
          fullDate: date.toLocaleString(),
          credit: isCredit ? tx.amount : 0,
          debit: isDebit ? tx.amount : 0,
          index
        };
      });
    } else {
      const groupBy = graphType === 'month' ? formatMonthYear : formatWeekYear;
      const groupedData: Record<string, { credit: number; debit: number }> = {};
      
      const sortedTransactions = [...transactions].sort((a, b) => 
        new Date(a.time_stamp).getTime() - new Date(b.time_stamp).getTime()
      );
      
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
      
      return orderedLabels.map((key, index) => ({
        name: key,
        credit: groupedData[key].credit,
        debit: groupedData[key].debit,
        index
      }));
    }
  };

  useEffect(() => {
    if (transactions.length > 0) {
      const preparedData = prepareChartData();
      setChartData(preparedData);
      setOriginalData(preparedData);
      calculateYDomain(preparedData);
    }
  }, [transactions, graphType]);

  const resetZoom = () => {
    setChartData(originalData);
    calculateYDomain(originalData);
  };

  const handleZoom = (leftIndex: number, rightIndex: number) => {
    const zoomedData = chartData.slice(leftIndex, rightIndex + 1);
    setChartData(zoomedData);
    calculateYDomain(zoomedData);
  };

  return {
    chartData,
    originalData,
    yDomain,
    resetZoom,
    handleZoom
  };
};