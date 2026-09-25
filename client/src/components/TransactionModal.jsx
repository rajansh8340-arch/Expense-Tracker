import React, { useState, useEffect } from 'react';
import { X, Plus, Save, Sparkles, Calendar, DollarSign, Tag, CreditCard, AlignLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, PAYMENT_METHODS, QUICK_TAGS } from '../utils/constants';
import api from '../services/api';

export const TransactionModal = ({ editItem, onClose, onSaved, showToast }) => {
  const { currencySymbol } = useAuth();
  const isEdit = Boolean(editItem);

  const getTodayDateString = (dateVal) => {
    const d = dateVal ? new Date(dateVal) : new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food & Dining',
    date: getTodayDateString(),
    paymentMethod: 'Credit Card',
    description: '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title || '',
        amount: editItem.amount !== undefined ? String(editItem.amount) : '',
        type: editItem.type || 'expense',
        category: editItem.category || 'Food & Dining',
        date: getTodayDateString(editItem.date),
        paymentMethod: editItem.paymentMethod || 'Credit Card',
        description: editItem.description || '',
      });
    }
  }, [editItem]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const categories = formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  const handleTypeChange = (newType) => {
    const defaultCat = newType === 'expense' ? 'Food & Dining' : 'Salary';
    setFormData((prev) => ({
      ...prev,
      type: newType,
      category: defaultCat,
    }));
  };

  const applyQuickTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      title: tag.title,
      category: tag.category,
      amount: tag.amount,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(formData.amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }

    if (!formData.title.trim()) {
      setError('Please enter a title for the transaction.');
      return;
    }

    setBusy(true);
    try {
      if (isEdit) {
        await api.patch(`/transactions/${editItem._id}`, formData);
        showToast?.('Transaction updated successfully!', 'success');
      } else {
        await api.post('/transactions', formData);
        showToast?.('Transaction added successfully!', 'success');
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save transaction. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge-chip">{isEdit ? 'EDIT RECORD' : 'NEW TRANSACTION'}</span>
            <h2>{isEdit ? 'Update Transaction' : 'Record Transaction'}</h2>
          </div>
          <button className="icon-btn-ghost" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="type-segmented-control">
          <button
            type="button"
            className={`type-segment ${formData.type === 'expense' ? 'active-expense' : ''}`}
            onClick={() => handleTypeChange('expense')}
          >
            Expense
          </button>
          <button
            type="button"
            className={`type-segment ${formData.type === 'income' ? 'active-income' : ''}`}
            onClick={() => handleTypeChange('income')}
          >
            Income
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        {!isEdit && (
          <div className="quick-tags-container">
            <div className="quick-tags-label">
              <Sparkles size={13} />
              <span>Quick presets:</span>
            </div>
            <div className="quick-tags-list">
              {QUICK_TAGS[formData.type].map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-tag-chip"
                  onClick={() => applyQuickTag(tag)}
                >
                  {tag.title} ({currencySymbol}{tag.amount})
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Amount and Title */}
          <div className="form-group amount-group">
            <label htmlFor="amount">Amount ({currencySymbol})</label>
            <div className="input-with-symbol">
              <span className="currency-prefix">{currencySymbol}</span>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                autoFocus={!isEdit}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Title / Description</label>
            <div className="input-with-icon">
              <Tag size={16} className="input-icon" />
              <input
                id="title"
                type="text"
                placeholder="e.g. Trader Joe's Groceries"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Category & Payment Method */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="paymentMethod">Payment Method</label>
              <select
                id="paymentMethod"
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Note */}
          <div className="form-group">
            <label htmlFor="date">Transaction Date</label>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Notes <span className="label-sub">(Optional)</span>
            </label>
            <textarea
              id="description"
              rows={2}
              placeholder="Add extra context, receipt details or tags..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {error && <div className="form-error-alert">{error}</div>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? (
                'Saving...'
              ) : isEdit ? (
                <>
                  <Save size={16} /> Save Changes
                </>
              ) : (
                <>
                  <Plus size={16} /> Add Transaction
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionModal;
