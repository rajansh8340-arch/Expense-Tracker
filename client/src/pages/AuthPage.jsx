import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  Mail,
  User,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CheckCircle,
  Eye,
  EyeOff,
  DollarSign,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const AuthPage = ({ showToast }) => {
  const { login, register, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [demoBusy, setDemoBusy] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);

    try {
      if (mode === 'register') {
        if (!name.trim()) {
          setError('Please provide your name.');
          setBusy(false);
          return;
        }
        await register(name.trim(), email.trim(), password, currency);
        showToast?.('Account created successfully! Welcome to Ledgerly.', 'success');
      } else {
        await login(email.trim(), password);
        showToast?.('Welcome back!', 'success');
      }
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server. Please make sure the backend API is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Authentication failed. Please check credentials.');
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setDemoBusy(true);
    try {
      await demoLogin();
      showToast?.('Logged into Instant Demo Account with sample data!', 'success');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach server. Please make sure the backend API is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Failed to start demo session. Please try again.');
      }
    } finally {
      setDemoBusy(false);
    }
  };

  return (
    <div className="auth-hero-container">
      {/* Top right theme toggle */}
      <div className="auth-top-bar">
        <button
          type="button"
          className="icon-btn-header auth-theme-toggle"
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span className="auth-theme-text">{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
        </button>
      </div>

      {/* Background ambient glow shapes */}
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />

      <div className="auth-content-box">
        {/* Brand header */}
        <div className="auth-brand-center">
          <div className="auth-logo-badge">
            <CreditCard size={24} />
          </div>
          <h1 className="auth-brand-heading">Ledgerly</h1>
          <p className="auth-brand-caption">Full-Stack MERN Personal Finance & Expense Tracker</p>
        </div>

        {/* Instant Demo Account Button */}
        <div className="demo-banner-box">
          <div className="demo-banner-text">
            <strong>Want to explore immediately?</strong>
            <span>One-click test drive with pre-loaded transactions and charts.</span>
          </div>
          <button
            type="button"
            className="btn-demo-instant"
            onClick={handleDemoLogin}
            disabled={demoBusy || busy}
          >
            <Sparkles size={16} />
            <span>{demoBusy ? 'Launching Demo...' : 'Instant Demo Login'}</span>
          </button>
        </div>

        {/* Auth Card */}
        <div className="auth-glass-card">
          {/* Segmented Mode Selector */}
          <div className="auth-segmented-nav">
            <button
              type="button"
              className={`auth-segment-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setMode('login');
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-segment-btn ${mode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setMode('register');
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-fields">
            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="reg-name">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    id="reg-name"
                    type="text"
                    placeholder="e.g. Jordan Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="auth-email">Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="auth-pass">Password</label>
              <div className="input-with-icon password-input-wrap">
                <Lock size={16} className="input-icon" />
                <input
                  id="auth-pass"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'At least 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'register' && (
              <div className="form-group">
                <label htmlFor="reg-currency">Preferred Currency</label>
                <div className="input-with-icon">
                  <DollarSign size={16} className="input-icon" />
                  <select
                    id="reg-currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="auth-currency-select"
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
            )}

            {error && <div className="form-error-alert">{error}</div>}

            <button type="submit" className="btn-primary full-width auth-submit-btn" disabled={busy}>
              <span>{busy ? 'Please wait...' : mode === 'register' ? 'Get Started Free' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Feature Highlights beneath */}
          <div className="auth-features-list">
            <div className="auth-feature-bullet">
              <CheckCircle size={14} className="text-accent" />
              <span>MongoDB User Isolation</span>
            </div>
            <div className="auth-feature-bullet">
              <CheckCircle size={14} className="text-accent" />
              <span>Real-time Visual Analytics</span>
            </div>
            <div className="auth-feature-bullet">
              <CheckCircle size={14} className="text-accent" />
              <span>CSV Ledger Exporting</span>
            </div>
          </div>
        </div>

        <div className="auth-footer-note">
          <ShieldCheck size={14} />
          <span>Secured with JSON Web Tokens and Bcrypt Hashing</span>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
