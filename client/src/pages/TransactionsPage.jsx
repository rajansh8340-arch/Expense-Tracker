import React, { useState, useEffect, useCallback } from 'react';
import TransactionTable from '../components/TransactionTable';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const TransactionsPage = ({ onOpenAddModal, onEditTransaction, showToast, refreshTrigger }) => {
  const { formatMoney } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    sort: 'newest',
  });

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/transactions', { params: filters });
      setTransactions(res.data);
    } catch (err) {
      showToast?.('Failed to load transactions', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, refreshTrigger]);

  // Calculate filtered stats
  const filteredIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="transactions-page-wrapper">
      {/* Quick Summary Chips Banner */}
      <div className="transactions-summary-strip">
        <div className="summary-strip-card">
          <span className="strip-label">Filtered Entries</span>
          <span className="strip-value">{transactions.length}</span>
        </div>
        <div className="summary-strip-card">
          <span className="strip-label">Filtered Inflow</span>
          <span className="strip-value text-income">+{formatMoney(filteredIncome)}</span>
        </div>
        <div className="summary-strip-card">
          <span className="strip-label">Filtered Outflow</span>
          <span className="strip-value text-expense">-{formatMoney(filteredExpense)}</span>
        </div>
        <div className="summary-strip-card">
          <span className="strip-label">Net Movement</span>
          <span className={`strip-value ${filteredIncome >= filteredExpense ? 'text-income' : 'text-expense'}`}>
            {formatMoney(filteredIncome - filteredExpense)}
          </span>
        </div>
      </div>

      {/* Main Table Card */}
      <TransactionTable
        transactions={transactions}
        filters={filters}
        setFilters={setFilters}
        onAdd={onOpenAddModal}
        onEdit={onEditTransaction}
        onRefresh={fetchTransactions}
        showToast={showToast}
      />
    </div>
  );
};

export default TransactionsPage;
