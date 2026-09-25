import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_COLORS } from '../utils/constants';

export const MonthlyBarChart = ({ monthlyTrends }) => {
  const { formatMoney } = useAuth();

  if (!monthlyTrends || monthlyTrends.length === 0) {
    return <div className="chart-empty-state">No monthly transaction data available yet.</div>;
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-chart-tooltip">
          <div className="tooltip-title">{label}</div>
          {payload.map((entry, index) => (
            <div key={`item-${index}`} className="tooltip-row">
              <span className="tooltip-dot" style={{ backgroundColor: entry.color }} />
              <span className="tooltip-name">{entry.name}:</span>
              <span className="tooltip-val">{formatMoney(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={monthlyTrends} margin={{ top: 15, right: 10, left: -15, bottom: 0 }}>
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryDonutChart = ({ byCategory }) => {
  const { formatMoney } = useAuth();

  const data = Object.entries(byCategory || {})
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (data.length === 0) {
    return <div className="chart-empty-state">No expense categories recorded yet.</div>;
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="custom-chart-tooltip">
          <div className="tooltip-title">{item.name}</div>
          <div className="tooltip-row">
            <span className="tooltip-val">{formatMoney(item.value)}</span>
            <span className="tooltip-pct">({pct}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="donut-chart-container">
      <div className="donut-chart-graphic">
        <ResponsiveContainer width="100%" height={210}>
          <PieChart>
            <Tooltip content={<CustomPieTooltip />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              stroke="var(--bg-card)"
              strokeWidth={2}
            >
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={CATEGORY_COLORS[entry.name] || '#64748b'}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="donut-legend-list">
        {data.slice(0, 5).map((item, idx) => {
          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
          const color = CATEGORY_COLORS[item.name] || '#64748b';
          return (
            <div key={idx} className="donut-legend-item">
              <span className="legend-indicator" style={{ backgroundColor: color }} />
              <span className="legend-label" title={item.name}>
                {item.name}
              </span>
              <span className="legend-pct">{pct}%</span>
              <span className="legend-amount">{formatMoney(item.value)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
