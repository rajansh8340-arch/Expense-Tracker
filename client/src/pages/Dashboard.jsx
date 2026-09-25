import React from 'react';
import { Plus, ArrowRight, ArrowUpRight, ArrowDownRight, CreditCard, Sparkles, TrendingUp } from 'lucide-react';
import StatGrid from '../components/StatCard';
import { MonthlyBarChart, CategoryDonutChart } from '../components/Charts';
import { useAuth } from '../context/AuthContext';
import { CATEGORY_COLORS } from '../utils/constants';

export const Dashboard = ({ summary, onOpenAddModal, onNavigateToTransactions, onSeedData }) => {
  const { formatMoney } = useAuth();

  const recent = summary?.recent || [];
  const monthlyTrends = summary?.monthlyTrends || [];
  const byCategory = summary?.byCategory || {};

  return (
    <div className="dashboard-content-wrapper">
      {/* Top Stat Cards */}
      <StatGrid summary={summary} />

      {/* Visual Analytics Grid */}
      <div className="charts-grid-row">
        {/* Monthly Cashflow Comparison */}
        <div className="chart-card-panel">
          <div className="panel-header-row">
            <div>
              <span className="panel-eyebrow">CASHFLOW HISTORY</span>
              <h3 className="panel-title">Monthly Income vs Expenses</h3>
            </div>
            <div className="chart-legend-pills">
              <span className="legend-pill income-pill">
                <span className="dot" /> Income
              </span>
              <span className="legend-pill expense-pill">
                <span className="dot" /> Expenses
              </span>
            </div>
          </div>
          <MonthlyBarChart monthlyTrends={monthlyTrends} />
        </div>

        {/* Expense Category Breakdown */}
        <div className="chart-card-panel">
          <div className="panel-header-row">
            <div>
              <span className="panel-eyebrow">DISTRIBUTION</span>
              <h3 className="panel-title">Top Expense Categories</h3>
            </div>
            <span className="panel-badge-subtle">By Amount</span>
          </div>
          <CategoryDonutChart byCategory={byCategory} />
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity-panel">
        <div className="panel-header-row">
          <div>
            <span className="panel-eyebrow">ACTIVITY STREAM</span>
            <h3 className="panel-title">Recent Transactions</h3>
          </div>
          <div className="panel-actions">
            <button
              type="button"
              className="btn-outline-action"
              onClick={onNavigateToTransactions}
            >
              <span>View All</span>
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              className="btn-primary-sm"
              onClick={onOpenAddModal}
            >
              <Plus size={14} />
              <span>Add Entry</span>
            </button>
          </div>
        </div>

        {recent.length > 0 ? (
          <div className="recent-list">
            {recent.map((tx) => {
              const isIncome = tx.type === 'income';
              const catColor = CATEGORY_COLORS[tx.category] || '#64748b';
              const formattedDate = new Date(tx.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={tx._id} className="recent-row-item">
                  <div className={`recent-icon-pill ${isIncome ? 'income' : 'expense'}`}>
                    {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>

                  <div className="recent-info-block">
                    <div className="recent-title">{tx.title}</div>
                    <div className="recent-subtitle">
                      <span
                        className="recent-category"
                        style={{ color: catColor }}
                      >
                        {tx.category}
                      </span>
                      {tx.paymentMethod && (
                        <span className="recent-meta">· {tx.paymentMethod}</span>
                      )}
                    </div>
                  </div>

                  <div className="recent-date-block">{formattedDate}</div>

                  <div className={`recent-amount-block ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                    {isIncome ? '+' : '-'}
                    {formatMoney(tx.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-recent-state">
            <Sparkles size={28} className="empty-icon" />
            <p>No transactions recorded yet.</p>
            <div className="empty-buttons">
              <button className="btn-primary" onClick={onOpenAddModal}>
                <Plus size={15} /> Add First Entry
              </button>
              <button className="btn-secondary" onClick={onSeedData}>
                <Sparkles size={15} /> Seed Demo Transactions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
