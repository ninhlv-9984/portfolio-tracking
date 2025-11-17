import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
}

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
];

export default function AllocationChart({ holdings }: Props) {
  // Prepare data for pie chart and sort by weight descending
  const chartData = holdings
    .map((holding) => ({
      name: holding.symbol,
      value: holding.weight || 0,
      amount: holding.currentValue || 0,
    }))
    .sort((a, b) => b.value - a.value); // Sort by weight descending

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white px-4 py-2 shadow-lg rounded border border-gray-200">
          <p className="font-semibold text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">{formatCurrency(data.amount)}</p>
          <p className="text-sm text-gray-600">{data.value.toFixed(2)}%</p>
        </div>
      );
    }
    return null;
  };

  // Only show holdings with >0.5% weight to avoid clutter
  const significantHoldings = chartData.filter(h => h.value >= 0.5);
  const otherHoldings = chartData.filter(h => h.value < 0.5);
  const otherTotal = otherHoldings.reduce((sum, h) => sum + h.value, 0);
  const otherAmount = otherHoldings.reduce((sum, h) => sum + h.amount, 0);

  const displayData = [...significantHoldings];
  if (otherHoldings.length > 0) {
    displayData.push({ name: 'Others', value: otherTotal, amount: otherAmount });
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio Allocation</h2>
      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={false}
            outerRadius={110}
            innerRadius={70}
            fill="#8884d8"
            dataKey="value"
            paddingAngle={2}
          >
            {displayData.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-6 space-y-2">
        {displayData.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-all hover:shadow-md cursor-pointer border border-transparent hover:border-gray-200">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="font-semibold text-gray-800">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="text-gray-900 font-bold text-lg">{item.value.toFixed(1)}%</div>
              <div className="text-gray-500 text-sm">{formatCurrency(item.amount)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
