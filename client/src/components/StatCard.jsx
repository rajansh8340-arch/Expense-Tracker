import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, PiggyBank, Target } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const StatGrid = ({ summary }) => {
  const { formatMoney } = useAuth();

  const balance = summary?.balance || 0;
  const income = summary?.income || 0;
  const expenses = summary?.expenses || 0;
  const savingsRate = summary?.savingsRate || 0;
  const monthlyBudget = summary?.monthlyBudget || 2500;
  const currentMonthExpense = summary?.currentMonthExpense || 0;

  const budgetPercent = Math.min(100, Math.round((currentMonthExpense / (monthlyBudget || 1)) * 100));
  const budgetColorClass =
    budgetPercent > 100 ? 'status-danger' : budgetPercent > 80 ? 'status-warning' : 'status-healthy';

  return (
    <div className="stat-cards-grid">
      {/* Hero Balance Card */}
      <div className="stat-card hero-balance-card">
        <div className="stat-card-header">
          <span className="stat-label">Net Balance</span>
          <div className="stat-icon-hero">
            <Wallet size={20} />
          </div>
        </div>
        <div className="stat-value hero-value">{formatMoney(balance)}</div>
        <div className="hero-subtext">
          <span className={`pill-badge ${balance >= 0 ? 'badge-positive' : 'badge-negative'}`}>
            <TrendingUp size={12} /> {balance >= 0 ? 'Positive Cashflow' : 'Deficit'}
          </span>
          <span className="stat-secondary-note">Across all tracked accounts</span>
        </div>
      </div>

      {/* Income Card */}
      <div className="stat-card stat-income-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Income</span>
          <div className="stat-icon-wrap income-icon">
            <ArrowUpRight size={18} />
          </div>
        </div>
        <div className="stat-value text-income">{formatMoney(income)}</div>
        <div className="stat-footer">
          <span className="pill-badge badge-positive">
            <PiggyBank size={12} /> {savingsRate}% Savings Rate
          </span>
        </div>
      </div>

      {/* Expense Card */}
      <div className="stat-card stat-expense-card">
        <div className="stat-card-header">
          <span className="stat-label">Total Expenses</span>
          <div className="stat-icon-wrap expense-icon">
            <ArrowDownRight size={18} />
          </div>
        </div>
        <div className="stat-value text-expense">{formatMoney(expenses)}</div>
        <div className="stat-footer">
          <span className="stat-secondary-note">
            {income > 0 ? `${Math.round((expenses / income) * 100)}% of income spent` : 'All time spending'}
          </span>
        </div>
      </div>

      {/* Budget Tracking Card */}
      <div className="stat-card stat-budget-card">
        <div className="stat-card-header">
          <span className="stat-label">Monthly Budget</span>
          <div className="stat-icon-wrap budget-icon">
            <Target size={18} />
          </div>
        </div>
        <div className="stat-value budget-value">
          {formatMoney(currentMonthExpense)}
          <span className="budget-target-sub"> / {formatMoney(monthlyBudget)}</span>
        </div>
        <div className="budget-progress-track">
          <div
            className={`budget-progress-bar ${budgetColorClass}`}
            style={{ width: `${budgetPercent}%` }}
          />
        </div>
        <div className="budget-footer-text">
          <span className={budgetColorClass}>{budgetPercent}% used this month</span>
          <span>{formatMoney(Math.max(0, monthlyBudget - currentMonthExpense))} left</span>
        </div>
      </div>
    </div>
  );
};

export default StatGrid;
