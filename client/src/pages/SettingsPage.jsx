import React, { useState } from 'react';
import {
  User,
  DollarSign,
  Target,
  KeyRound,
  Database,
  Sparkles,
  Trash2,
  Check,
  Save,
  ShieldCheck,
  Server,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export const SettingsPage = ({ showToast, onRefreshAll }) => {
  const { user, updateUser, formatMoney, currencySymbol } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 2500);
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [dbActionBusy, setDbActionBusy] = useState(false);

  React.useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCurrency(user.currency || 'USD');
      setMonthlyBudget(user.monthlyBudget !== undefined ? user.monthlyBudget : 2500);
    }
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        currency,
        monthlyBudget: parseFloat(monthlyBudget) || 2500,
      };
      if (newPassword && newPassword.length >= 6) {
        payload.newPassword = newPassword;
      }

      await updateUser(payload);
      setNewPassword('');
      showToast?.('Settings updated successfully!', 'success');
      onRefreshAll?.();
    } catch (err) {
      showToast?.(err.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setBusy(false);
    }
  };

  const handleSeedData = async () => {
    setDbActionBusy(true);
    try {
      const res = await api.post('/transactions/actions/seed');
      showToast?.(res.data.message || 'Sample transactions loaded!', 'success');
      onRefreshAll?.();
    } catch (err) {
      showToast?.('Failed to seed transactions', 'error');
    } finally {
      setDbActionBusy(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm('Are you sure you want to clear all your transactions from the database?')) {
      return;
    }
    setDbActionBusy(true);
    try {
      const res = await api.delete('/transactions/actions/clear-all');
      showToast?.(res.data.message || 'All transactions cleared', 'info');
      onRefreshAll?.();
    } catch (err) {
      showToast?.('Failed to clear data', 'error');
    } finally {
      setDbActionBusy(false);
    }
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <div className="settings-page-wrapper">
      <div className="settings-cards-grid">
        {/* Profile and Preferences Card */}
        <div className="settings-panel-card">
          <div className="panel-header-row">
            <div>
              <span className="panel-eyebrow">PREFERENCES</span>
              <h3 className="panel-title">Personal Settings</h3>
            </div>
            <div className="avatar-chip">{userInitial}</div>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-group">
              <label htmlFor="settings-name">Display Name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  id="settings-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settings-email">Email Address</label>
              <input
                id="settings-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="input-disabled"
                title="Email cannot be changed"
              />
              <span className="form-helper-text">Registered account identifier</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="settings-currency">Preferred Currency</label>
                <div className="input-with-icon">
                  <DollarSign size={16} className="input-icon" />
                  <select
                    id="settings-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                    <option value="INR">INR (₹) - Indian Rupee</option>
                    <option value="JPY">JPY (¥) - Japanese Yen</option>
                    <option value="CAD">CAD (CA$) - Canadian Dollar</option>
                    <option value="AUD">AUD (A$) - Australian Dollar</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="settings-budget">Monthly Budget Target</label>
                <div className="input-with-icon">
                  <Target size={16} className="input-icon" />
                  <input
                    id="settings-budget"
                    type="number"
                    min="0"
                    step="50"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="settings-pass">
                Update Password <span className="label-sub">(Leave blank to keep current)</span>
              </label>
              <div className="input-with-icon">
                <KeyRound size={16} className="input-icon" />
                <input
                  id="settings-pass"
                  type="password"
                  placeholder="Enter 6+ characters to update"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                />
              </div>
            </div>

            <div className="form-submit-row">
              <button type="submit" className="btn-primary" disabled={busy}>
                <Save size={16} />
                <span>{busy ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Database & Application Info Card */}
        <div className="settings-side-column">
          {/* Database Tools */}
          <div className="settings-panel-card">
            <div className="panel-header-row">
              <div>
                <span className="panel-eyebrow">DATA MANAGEMENT</span>
                <h3 className="panel-title">Database Controls</h3>
              </div>
              <Database size={18} className="text-accent" />
            </div>

            <p className="text-muted text-sm">
              Populate your workspace with 20 realistic sample transactions or reset your transaction history.
            </p>

            <div className="db-actions-stack">
              <button
                type="button"
                className="btn-outline-action full-width"
                onClick={handleSeedData}
                disabled={dbActionBusy}
              >
                <Sparkles size={16} />
                <span>{dbActionBusy ? 'Processing...' : 'Load Sample Demo Records'}</span>
              </button>

              <button
                type="button"
                className="btn-danger-outline full-width"
                onClick={handleClearData}
                disabled={dbActionBusy}
              >
                <Trash2 size={16} />
                <span>Clear All Transactions</span>
              </button>
            </div>
          </div>

          {/* Architecture Highlights */}
          <div className="settings-panel-card info-card-gradient">
            <div className="panel-header-row">
              <div>
                <span className="panel-eyebrow">TECH STACK</span>
                <h3 className="panel-title">MERN Stack Specs</h3>
              </div>
              <Layers size={18} />
            </div>

            <div className="stack-specs-list">
              <div className="spec-row">
                <span className="spec-key">MongoDB & Mongoose</span>
                <span className="spec-val">Isolated User Collections</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Express.js API</span>
                <span className="spec-val">RESTful + Centralized Handlers</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">React 18 + Vite</span>
                <span className="spec-val">Modular Hooks + Recharts</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Node Authentication</span>
                <span className="spec-val">Bcrypt Hashing + JWT 7-Day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
