import React, { useState, useEffect } from 'react';
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
  Activity,
  RefreshCw,
  Copy,
  Terminal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api, { checkApiHealth, getAppConfig } from '../services/api';

export const SettingsPage = ({ showToast, onRefreshAll }) => {
  const { user, updateUser, formatMoney, currencySymbol } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [currency, setCurrency] = useState(user?.currency || 'USD');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthlyBudget || 2500);
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [dbActionBusy, setDbActionBusy] = useState(false);
  const [envConfig] = useState(getAppConfig());
  const [healthCheck, setHealthCheck] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

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

  const handleTestPing = async () => {
    setPinging(true);
    try {
      const res = await checkApiHealth();
      setHealthCheck(res);
      if (res.ok) {
        showToast?.(`API connected! Latency: ${res.latencyMs}ms (${res.database})`, 'success');
      } else {
        showToast?.(`API offline: ${res.error}`, 'error');
      }
    } catch (err) {
      showToast?.('Ping test failed', 'error');
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    handleTestPing();
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(envConfig.apiUrl);
    setCopiedUrl(true);
    showToast?.('API URL copied to clipboard!', 'success');
    setTimeout(() => setCopiedUrl(false), 2000);
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

          {/* Client Environment & API Diagnostics */}
          <div className="settings-panel-card">
            <div className="panel-header-row">
              <div>
                <span className="panel-eyebrow">ENVIRONMENT & API</span>
                <h3 className="panel-title">Client & Backend Status</h3>
              </div>
              <Server size={18} className="text-primary" />
            </div>

            <div className="diag-card" style={{ margin: '8px 0', border: 'none', padding: 0, background: 'transparent' }}>
              <span className="diag-label">Configured API Base URL</span>
              <div className="diag-code-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <code style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{envConfig.apiUrl}</code>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex', alignItems: 'center', padding: '2px' }}
                  title="Copy API URL to clipboard"
                >
                  {copiedUrl ? <Check size={14} className="text-income" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div className="stack-specs-list" style={{ marginTop: '10px' }}>
              <div className="spec-row">
                <span className="spec-key">API Status</span>
                <span className="spec-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className={`status-dot small ${healthCheck?.ok ? 'dot-online' : 'dot-offline'}`} />
                  {healthCheck?.ok ? 'Online & Healthy' : pinging ? 'Testing...' : 'Offline'}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Latency</span>
                <span className="spec-val">
                  {healthCheck?.latencyMs !== undefined && healthCheck?.latencyMs !== null ? `${healthCheck.latencyMs} ms` : '—'}
                </span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Database</span>
                <span className="spec-val">{healthCheck?.database ? healthCheck.database.toUpperCase() : 'Checking...'}</span>
              </div>
              <div className="spec-row">
                <span className="spec-key">Client Mode</span>
                <span className="spec-val">{envConfig.appEnv.toUpperCase()}</span>
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                className="btn-outline-action full-width"
                onClick={handleTestPing}
                disabled={pinging}
              >
                <RefreshCw size={14} className={pinging ? 'spin-animation' : ''} />
                <span>{pinging ? 'Testing Connection...' : 'Test Connection / Ping'}</span>
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
