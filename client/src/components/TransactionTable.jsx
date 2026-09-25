import React, { useState } from 'react';
import {
  Search,
  Plus,
  Download,
  Trash2,
  Edit2,
  Filter,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Calendar,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, CATEGORY_COLORS } from '../utils/constants';
import api from '../services/api';

export const TransactionTable = ({
  transactions,
  filters,
  setFilters,
  onAdd,
  onEdit,
  onRefresh,
  showToast,
}) => {
  const { formatMoney } = useAuth();
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [clearAllConfirm, setClearAllConfirm] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const allCategories = Array.from(new Set([...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]));

  const handleDelete = async (id) => {
    setActionBusy(true);
    try {
      await api.delete(`/transactions/${id}`);
      showToast?.('Transaction deleted successfully', 'info');
      setDeleteConfirmId(null);
      onRefresh();
    } catch (err) {
      showToast?.('Failed to delete transaction', 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const handleClearAll = async () => {
    setActionBusy(true);
    try {
      const res = await api.delete('/transactions/actions/clear-all');
      showToast?.(res.data.message || 'All transactions cleared', 'info');
      setClearAllConfirm(false);
      onRefresh();
    } catch (err) {
      showToast?.('Failed to clear transactions', 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const handleSeedData = async () => {
    setActionBusy(true);
    try {
      const res = await api.post('/transactions/actions/seed');
      showToast?.(res.data.message || 'Sample transactions added!', 'success');
      onRefresh();
    } catch (err) {
      showToast?.('Failed to seed transactions', 'error');
    } finally {
      setActionBusy(false);
    }
  };

  const handleExportCSV = async () => {
    if (!transactions || transactions.length === 0) {
      showToast?.('No transactions to export', 'error');
      return;
    }
    try {
      showToast?.('Exporting transactions to CSV...', 'info');
      const res = await api.get('/transactions/actions/export', { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ledgerly-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast?.('Exported CSV file successfully!', 'success');
    } catch (err) {
      showToast?.('Failed to export CSV. Please try again.', 'error');
    }
  };

  return (
    <div className="table-card-container">
      {/* Table Toolbar */}
      <div className="table-toolbar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, description or category..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
          {filters.search && (
            <button
              className="search-clear-btn"
              onClick={() => setFilters({ ...filters, search: '' })}
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filters-cluster">
          <select
            value={filters.type || ''}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="filter-select"
          >
            <option value="">All Types</option>
            <option value="expense">Expenses Only</option>
            <option value="income">Income Only</option>
          </select>

          <select
            value={filters.category || ''}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filters.sort || 'newest'}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>
        </div>

        <div className="toolbar-actions">
          <button
            type="button"
            className="btn-outline-action"
            onClick={handleExportCSV}
            title="Export CSV"
          >
            <Download size={15} />
            <span>Export</span>
          </button>

          <button
            type="button"
            className="btn-outline-action"
            onClick={handleSeedData}
            disabled={actionBusy}
            title="Load sample transactions for testing"
          >
            <Sparkles size={15} />
            <span>Load Demo Data</span>
          </button>

          <button type="button" className="btn-primary" onClick={onAdd}>
            <Plus size={16} />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Header with counter */}
      <div className="table-header-info">
        <span className="results-count">
          Showing <strong>{transactions.length}</strong> transactions
        </span>
        {transactions.length > 0 && (
          <button
            type="button"
            className="btn-text-danger"
            onClick={() => setClearAllConfirm(true)}
          >
            Clear all
          </button>
        )}
      </div>

      {/* Transactions List */}
      {transactions.length > 0 ? (
        <div className="transaction-rows-wrapper">
          {transactions.map((tx) => {
            const isIncome = tx.type === 'income';
            const catColor = CATEGORY_COLORS[tx.category] || '#64748b';
            const txDate = new Date(tx.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div key={tx._id} className="tx-table-row">
                {/* Type Icon */}
                <div className={`tx-type-pill ${isIncome ? 'income' : 'expense'}`}>
                  {isIncome ? <ArrowUpRight size={17} /> : <ArrowDownRight size={17} />}
                </div>

                {/* Main Details */}
                <div className="tx-details-col">
                  <div className="tx-title-text">{tx.title}</div>
                  <div className="tx-subtitle-row">
                    <span
                      className="tx-category-badge"
                      style={{
                        backgroundColor: `${catColor}1a`,
                        color: catColor,
                        borderColor: `${catColor}33`,
                      }}
                    >
                      {tx.category}
                    </span>
                    {tx.paymentMethod && (
                      <span className="tx-meta-tag">
                        <CreditCard size={11} /> {tx.paymentMethod}
                      </span>
                    )}
                    {tx.description && (
                      <span className="tx-description-note" title={tx.description}>
                        · {tx.description}
                      </span>
                    )}
                  </div>
                </div>

                {/* Date */}
                <div className="tx-date-col">
                  <Calendar size={13} className="text-muted" />
                  <span>{txDate}</span>
                </div>

                {/* Amount */}
                <div className={`tx-amount-col ${isIncome ? 'amount-income' : 'amount-expense'}`}>
                  {isIncome ? '+' : '-'}
                  {formatMoney(tx.amount)}
                </div>

                {/* Actions */}
                <div className="tx-actions-col">
                  <button
                    className="action-btn-subtle"
                    onClick={() => onEdit(tx)}
                    title="Edit transaction"
                    aria-label="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    className="action-btn-subtle text-danger"
                    onClick={() => setDeleteConfirmId(tx._id)}
                    title="Delete transaction"
                    aria-label="Delete"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <Filter size={32} />
          </div>
          <h3>No transactions found</h3>
          <p className="text-muted">
            {filters.search || filters.type || filters.category
              ? 'Try adjusting your filters or search terms to find what you are looking for.'
              : 'Start keeping track of your finances by adding your first transaction or loading sample demo data.'}
          </p>
          <div className="empty-state-actions">
            <button className="btn-primary" onClick={onAdd}>
              <Plus size={16} /> Add First Transaction
            </button>
            <button className="btn-secondary" onClick={handleSeedData} disabled={actionBusy}>
              <Sparkles size={16} /> Load Demo Data
            </button>
          </div>
        </div>
      )}

      {/* Delete Single Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-dialog modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-box danger">
              <AlertTriangle size={24} />
            </div>
            <h3>Delete this transaction?</h3>
            <p className="text-muted">
              Are you sure you want to delete this record? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={actionBusy}
              >
                {actionBusy ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {clearAllConfirm && (
        <div className="modal-backdrop" onClick={() => setClearAllConfirm(false)}>
          <div className="modal-dialog modal-dialog-sm" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon-box danger">
              <AlertTriangle size={24} />
            </div>
            <h3>Clear all transactions?</h3>
            <p className="text-muted">
              This will remove all {transactions.length} transactions from your account. You can always reload sample demo data anytime.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setClearAllConfirm(false)}
                disabled={actionBusy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={handleClearAll}
                disabled={actionBusy}
              >
                {actionBusy ? 'Clearing...' : 'Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
