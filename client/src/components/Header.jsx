import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  Plus,
  Sun,
  Moon,
  Sparkles,
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  LogOut,
  Download,
  ChevronDown,
  User as UserIcon,
  ShieldCheck,
  Target,
  Activity,
  Server,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useApiStatus } from '../hooks/useApiStatus';
import DiagnosticsModal from './DiagnosticsModal';
import api from '../services/api';

export const Header = ({ activeTab, setActiveTab, onOpenAddModal, onOpenMobileMenu, showToast }) => {
  const { user, logout, currencySymbol, formatMoney } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const apiStatus = useApiStatus(true, 30000);


  const titles = {
    overview: {
      eyebrow: 'FINANCIAL SNAPSHOT',
      title: `Welcome back, ${user?.name ? user.name.split(' ')[0] : 'there'}`,
      subtitle: 'Monitor real-time cash flow, category breakdowns, and monthly budget progress.',
    },
    transactions: {
      eyebrow: 'TRANSACTION LEDGER',
      title: 'Transaction History',
      subtitle: 'Filter, search, export, and manage your income and expense records.',
    },
    analytics: {
      eyebrow: 'ADVANCED METRICS',
      title: 'Financial Analytics',
      subtitle: 'Visual insights, monthly trends, and spending patterns.',
    },
    settings: {
      eyebrow: 'ACCOUNT PREFERENCES',
      title: 'Profile & Settings',
      subtitle: 'Customize display name, preferred currency, monthly budget limits, and database options.',
    },
  };

  const current = titles[activeTab] || titles.overview;
  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';

  // Handle clicking outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const handleNav = (tab) => {
    setActiveTab?.(tab);
    setDropdownOpen(false);
  };

  const handleExportCSV = async () => {
    setDropdownOpen(false);
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
      showToast?.('Failed to export CSV.', 'error');
    }
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="mobile-hamburger-btn"
          onClick={onOpenMobileMenu}
          aria-label="Open navigation menu"
        >
          <Menu size={22} />
        </button>

        <div className="header-titles">
          <span className="header-eyebrow">{current.eyebrow}</span>
          <h1 className="header-title">{current.title}</h1>
        </div>
      </div>

      <div className="header-right">
        {/* Live API Connection Status Pill */}
        <button
          type="button"
          className={`header-api-status-pill ${
            apiStatus.isConnected
              ? 'status-online'
              : apiStatus.isChecking
              ? 'status-checking'
              : 'status-offline'
          }`}
          onClick={() => setDiagnosticsOpen(true)}
          title={`API Base: ${apiStatus.config.apiUrl} (${
            apiStatus.isConnected ? 'Connected' : 'Offline'
          }) - Click to inspect environment & latency`}
        >
          <span
            className={`status-pulse-dot ${
              apiStatus.isConnected
                ? 'pulse-green'
                : apiStatus.isChecking
                ? 'pulse-yellow'
                : 'pulse-red'
            }`}
          />
          <span className="api-status-label">
            {apiStatus.isConnected
              ? `API ${apiStatus.latencyMs !== null ? `${apiStatus.latencyMs}ms` : 'Online'}`
              : apiStatus.isChecking
              ? 'Checking...'
              : 'API Offline'}
          </span>
        </button>

        {/* Currency Badge */}
        <div className="header-currency-chip" title="Active Display Currency">
          <span className="currency-label">{user?.currency || 'USD'}</span>
          <span className="currency-symbol-tag">{currencySymbol}</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          className="icon-btn-header"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Quick Add CTA */}
        <button className="btn-primary header-add-btn" onClick={onOpenAddModal}>
          <Plus size={16} />
          <span>Add Record</span>
        </button>

        {/* User Mini Avatar & Interactive Dropdown */}
        <div className="header-avatar-container" ref={dropdownRef}>
          <button
            type="button"
            className={`header-avatar-btn ${dropdownOpen ? 'active' : ''}`}
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={dropdownOpen}
            title={`${user?.name || 'User'} - Click for profile menu`}
          >
            <div className="header-avatar">
              {userInitial}
            </div>
            <ChevronDown size={13} className={`avatar-chevron ${dropdownOpen ? 'rotated' : ''}`} />
          </button>

          {/* User Profile Dropdown Menu */}
          {dropdownOpen && (
            <div className="user-dropdown-menu">
              {/* Header with user info */}
              <div className="user-dropdown-header">
                <div className="dropdown-avatar-circle">
                  {userInitial}
                </div>
                <div className="dropdown-user-details">
                  <span className="dropdown-user-name">{user?.name || 'Ledgerly User'}</span>
                  <span className="dropdown-user-email">{user?.email}</span>
                  <div className="dropdown-meta-tags">
                    <span className="dropdown-badge-currency">
                      {user?.currency || 'USD'} ({currencySymbol})
                    </span>
                    {user?.monthlyBudget && (
                      <span className="dropdown-badge-budget">
                        Target: {formatMoney(user.monthlyBudget)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="dropdown-divider" />

              {/* Navigation Actions */}
              <div className="dropdown-nav-group">
                <button
                  type="button"
                  className={`dropdown-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => handleNav('overview')}
                >
                  <LayoutDashboard size={16} className="dropdown-item-icon" />
                  <span>Dashboard Overview</span>
                </button>

                <button
                  type="button"
                  className={`dropdown-nav-item ${activeTab === 'transactions' ? 'active' : ''}`}
                  onClick={() => handleNav('transactions')}
                >
                  <Receipt size={16} className="dropdown-item-icon" />
                  <span>Transaction Ledger</span>
                </button>

                <button
                  type="button"
                  className={`dropdown-nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
                  onClick={() => handleNav('analytics')}
                >
                  <PieChart size={16} className="dropdown-item-icon" />
                  <span>Financial Analytics</span>
                </button>

                <button
                  type="button"
                  className={`dropdown-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => handleNav('settings')}
                >
                  <Settings size={16} className="dropdown-item-icon" />
                  <span>Profile & Settings</span>
                </button>
              </div>

              <div className="dropdown-divider" />

              {/* Quick Utilities */}
              <div className="dropdown-nav-group">
                <button
                  type="button"
                  className="dropdown-nav-item"
                  onClick={() => {
                    setDropdownOpen(false);
                    setDiagnosticsOpen(true);
                  }}
                >
                  <Activity size={16} className="dropdown-item-icon text-income" />
                  <span>API & System Diagnostics</span>
                </button>

                <button
                  type="button"
                  className="dropdown-nav-item"
                  onClick={handleExportCSV}
                >
                  <Download size={16} className="dropdown-item-icon" />
                  <span>Export Transactions (CSV)</span>
                </button>

                <button
                  type="button"
                  className="dropdown-nav-item"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? (
                    <Sun size={16} className="dropdown-item-icon text-warning" />
                  ) : (
                    <Moon size={16} className="dropdown-item-icon text-primary" />
                  )}
                  <span>Switch to {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              <div className="dropdown-divider" />

              {/* Logout Action */}
              <div className="dropdown-footer">
                <button
                  type="button"
                  className="dropdown-nav-item dropdown-logout-btn"
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={16} className="dropdown-item-icon" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Diagnostics & Environment Modal */}
      <DiagnosticsModal
        isOpen={diagnosticsOpen}
        onClose={() => setDiagnosticsOpen(false)}
        showToast={showToast}
      />
    </header>
  );
};

export default Header;
