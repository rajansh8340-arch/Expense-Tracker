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
} from 'recharts';
import {
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Target,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_COLORS } from '../utils/constants';

export const AnalyticsPage = ({ summary }) => {
  const { formatMoney } = useAuth();

  const income = summary?.income || 0;
  const expenses = summary?.expenses || 0;
  const balance = summary?.balance || 0;
  const savingsRate = summary?.savingsRate || 0;
  const monthlyTrends = summary?.monthlyTrends || [];
  const byCategory = summary?.byCategory || {};
  const incomeByCategory = summary?.incomeByCategory || {};
  const byPaymentMethod = summary?.byPaymentMethod || {};

  // Expense breakdown sorted
  const expenseCategories = Object.entries(byCategory)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalExpenseVal = expenseCategories.reduce((acc, c) => acc + c.value, 0);

  // Income sources sorted
  const incomeCategories = Object.entries(incomeByCategory)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalIncomeVal = incomeCategories.reduce((acc, c) => acc + c.value, 0);

  // Payment methods sorted
  const paymentMethods = Object.entries(byPaymentMethod)
    .filter(([_, val]) => val > 0)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  const totalPaymentVal = paymentMethods.reduce((acc, c) => acc + c.value, 0);

  return (
    <div className="analytics-page-wrapper">
      {/* Financial Health Scorecard */}
      <div className="analytics-scorecard-grid">
        <div className="scorecard-item">
          <div className="scorecard-icon income">
            <ArrowUpRight size={18} />
          </div>
          <div className="scorecard-info">
            <span className="scorecard-label">Total Inflow</span>
            <span className="scorecard-val text-income">{formatMoney(income)}</span>
          </div>
        </div>

        <div className="scorecard-item">
          <div className="scorecard-icon expense">
            <ArrowDownRight size={18} />
          </div>
          <div className="scorecard-info">
            <span className="scorecard-label">Total Outflow</span>
            <span className="scorecard-val text-expense">{formatMoney(expenses)}</span>
          </div>
        </div>

        <div className="scorecard-item">
          <div className="scorecard-icon balance">
            <TrendingUp size={18} />
          </div>
          <div className="scorecard-info">
            <span className="scorecard-label">Net Surplus</span>
            <span className={`scorecard-val ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
              {formatMoney(balance)}
            </span>
          </div>
        </div>

        <div className="scorecard-item">
          <div className="scorecard-icon savings">
            <Target size={18} />
          </div>
          <div className="scorecard-info">
            <span className="scorecard-label">Savings Ratio</span>
            <span className="scorecard-val text-accent">{savingsRate}%</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="analytics-charts-row">
        {/* Monthly Income vs Expense Bar Chart */}
        <div className="analytics-card chart-large">
          <div className="card-header-styled">
            <div>
              <span className="panel-eyebrow">MONTHLY PERFORMANCE</span>
              <h3>Cashflow Comparison</h3>
            </div>
          </div>
          <div className="chart-container-fluid">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyTrends} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'var(--text-muted)' }}
                  tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                />
                <Tooltip
                  formatter={(val) => formatMoney(val)}
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '8px',
                    color: 'var(--text-main)',
                  }}
                />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={30} />
                <Bar dataKey="expenses" name="Expenses" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Sources Breakdown */}
        <div className="analytics-card chart-small">
          <div className="card-header-styled">
            <div>
              <span className="panel-eyebrow">INCOME COMPOSITION</span>
              <h3>Income Sources</h3>
            </div>
          </div>
          {incomeCategories.length > 0 ? (
            <div className="donut-analytic-wrapper">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={incomeCategories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                  >
                    {incomeCategories.map((entry, idx) => (
                      <Cell key={idx} fill={CATEGORY_COLORS[entry.name] || '#10b981'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => formatMoney(val)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mini-legend-grid">
                {incomeCategories.map((item, idx) => (
                  <div key={idx} className="mini-legend-row">
                    <span
                      className="legend-dot"
                      style={{ backgroundColor: CATEGORY_COLORS[item.name] || '#10b981' }}
                    />
                    <span className="legend-name">{item.name}</span>
                    <span className="legend-val">{formatMoney(item.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="chart-empty-state">No income streams recorded yet.</div>
          )}
        </div>
      </div>

      {/* Two Columns: Category Ranked List & Payment Methods */}
      <div className="analytics-details-row">
        {/* Category Spending Details */}
        <div className="analytics-card">
          <div className="card-header-styled">
            <div>
              <span className="panel-eyebrow">SPENDING DYNAMICS</span>
              <h3>Expense Categories Ranked</h3>
            </div>
            <span className="panel-badge-subtle">{expenseCategories.length} Categories</span>
          </div>

          <div className="category-progress-list">
            {expenseCategories.map((item, idx) => {
              const pct = totalExpenseVal > 0 ? Math.round((item.value / totalExpenseVal) * 100) : 0;
              const color = CATEGORY_COLORS[item.name] || '#64748b';

              return (
                <div key={idx} className="category-rank-row">
                  <div className="rank-info-header">
                    <div className="rank-title-group">
                      <span className="rank-num">#{idx + 1}</span>
                      <span className="rank-cat-dot" style={{ backgroundColor: color }} />
                      <span className="rank-cat-name">{item.name}</span>
                    </div>
                    <div className="rank-amount-group">
                      <span className="rank-amount">{formatMoney(item.value)}</span>
                      <span className="rank-pct">({pct}%)</span>
                    </div>
                  </div>
                  <div className="rank-progress-track">
                    <div
                      className="rank-progress-fill"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Methods Breakdown */}
        <div className="analytics-card">
          <div className="card-header-styled">
            <div>
              <span className="panel-eyebrow">TRANSACTION MEDIUM</span>
              <h3>Payment Methods Used</h3>
            </div>
            <span className="panel-badge-subtle">{paymentMethods.length} Channels</span>
          </div>

          <div className="payment-methods-list">
            {paymentMethods.map((pm, idx) => {
              const pct = totalPaymentVal > 0 ? Math.round((pm.value / totalPaymentVal) * 100) : 0;

              return (
                <div key={idx} className="payment-method-row">
                  <div className="pm-icon-wrap">
                    <CreditCard size={17} />
                  </div>
                  <div className="pm-details">
                    <div className="pm-name-row">
                      <span className="pm-name">{pm.name}</span>
                      <span className="pm-amount">{formatMoney(pm.value)}</span>
                    </div>
                    <div className="pm-bar-track">
                      <div className="pm-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="pm-pct-sub">{pct}% of total volume</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
