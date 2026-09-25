import React, { useState, useEffect } from 'react';
import {
  X,
  Server,
  Activity,
  Database,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Layers,
} from 'lucide-react';
import { checkApiHealth, getAppConfig } from '../services/api';

export const DiagnosticsModal = ({ isOpen, onClose, showToast }) => {
  const [config] = useState(getAppConfig());
  const [healthData, setHealthData] = useState(null);
  const [pinging, setPinging] = useState(false);
  const [copied, setCopied] = useState(false);

  const runPing = async () => {
    setPinging(true);
    try {
      const data = await checkApiHealth();
      setHealthData(data);
    } catch (err) {
      setHealthData({
        ok: false,
        status: 'offline',
        database: 'error',
        latencyMs: 0,
        apiUrl: config.apiUrl,
        error: err.message,
      });
    } finally {
      setPinging(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runPing();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isConnected = healthData?.ok;
  const isDegraded = healthData && !healthData.ok && healthData.status !== 'offline';
  const isOffline = healthData && !healthData.ok;

  const handleCopyEnv = () => {
    const text = `VITE_API_URL=${config.apiUrl}\nVITE_APP_TITLE=${config.appTitle}\nVITE_APP_ENV=${config.appEnv}\nVITE_ENABLE_DEMO=${config.isDemoEnabled}`;
    navigator.clipboard?.writeText(text);
    setCopied(true);
    showToast?.('Copied client environment variables to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const getLatencyBadgeClass = (ms) => {
    if (!ms) return 'latency-offline';
    if (ms < 100) return 'latency-fast';
    if (ms < 300) return 'latency-medium';
    return 'latency-slow';
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog diagnostics-dialog" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="diagnostics-header-title">
            <div className="status-indicator-badge">
              <span className={`status-dot ${isConnected ? 'dot-online' : 'dot-offline'}`} />
              <span className="badge-chip">
                {isConnected ? 'API CONNECTED' : pinging ? 'TESTING...' : 'API DISCONNECTED'}
              </span>
            </div>
            <h2>Client & Backend Diagnostics</h2>
          </div>
          <button className="icon-btn-ghost" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="diagnostics-modal-body">
          {/* Main Status Hero */}
          <div className={`diagnostics-hero-banner ${isConnected ? 'hero-online' : 'hero-offline'}`}>
            <div className="hero-icon-wrap">
              {isConnected ? (
                <CheckCircle2 size={24} className="text-income" />
              ) : (
                <AlertTriangle size={24} className="text-expense" />
              )}
            </div>
            <div className="hero-text-wrap">
              <h4>
                {isConnected
                  ? 'All Backend Systems Operational'
                  : 'Backend API Unreachable'}
              </h4>
              <p>
                {isConnected
                  ? `Successfully responding from ${config.apiUrl} with full database connectivity.`
                  : healthData?.error ||
                    `Could not reach API server at ${config.apiUrl}. Please verify the server is running on port 5000.`}
              </p>
            </div>
            <button
              type="button"
              className="btn-ping-action"
              onClick={runPing}
              disabled={pinging}
              title="Ping backend server now"
            >
              <RefreshCw size={15} className={pinging ? 'spin-animation' : ''} />
              <span>{pinging ? 'Pinging...' : 'Ping Server'}</span>
            </button>
          </div>

          {/* Metrics Grid */}
          <div className="diagnostics-grid">
            {/* Active API URL */}
            <div className="diag-card">
              <div className="diag-card-header">
                <span className="diag-label">Active API Base URL</span>
                <Server size={16} className="text-primary" />
              </div>
              <div className="diag-code-box">
                <code>{config.apiUrl}</code>
              </div>
              <div className="diag-footer-note">
                <span className="pill-subtle">
                  {config.rawApiEnv ? 'Configured via .env' : 'Auto-detected fallback'}
                </span>
              </div>
            </div>

            {/* Ping / Latency */}
            <div className="diag-card">
              <div className="diag-card-header">
                <span className="diag-label">Response Latency</span>
                <Activity size={16} className="text-income" />
              </div>
              <div className="diag-value-row">
                <span className="diag-big-val">
                  {healthData?.latencyMs ? `${healthData.latencyMs} ms` : '—'}
                </span>
                {healthData?.latencyMs ? (
                  <span className={`latency-pill ${getLatencyBadgeClass(healthData.latencyMs)}`}>
                    {healthData.latencyMs < 100
                      ? '⚡ Lightning Fast'
                      : healthData.latencyMs < 300
                      ? '✓ Normal'
                      : '⚠️ Slow'}
                  </span>
                ) : null}
              </div>
              <div className="diag-footer-note">
                <span>Real-time roundtrip ping</span>
              </div>
            </div>

            {/* Database Status */}
            <div className="diag-card">
              <div className="diag-card-header">
                <span className="diag-label">MongoDB Connection</span>
                <Database size={16} className="text-accent" />
              </div>
              <div className="diag-value-row">
                <span className="diag-status-text">
                  <span
                    className={`status-dot small ${
                      healthData?.database === 'connected' ? 'dot-online' : 'dot-offline'
                    }`}
                  />
                  {healthData?.database ? healthData.database.toUpperCase() : 'CHECKING...'}
                </span>
              </div>
              <div className="diag-footer-note">
                <span>Managed isolated database</span>
              </div>
            </div>

            {/* Environment Mode */}
            <div className="diag-card">
              <div className="diag-card-header">
                <span className="diag-label">Environment Mode</span>
                <Layers size={16} className="text-muted" />
              </div>
              <div className="diag-value-row">
                <span className="diag-status-badge">{config.appEnv.toUpperCase()}</span>
                <span className="diag-sub-badge">Vite {config.isDev ? 'DEV' : 'PROD'}</span>
              </div>
              <div className="diag-footer-note">
                <span>VITE_APP_ENV token</span>
              </div>
            </div>
          </div>

          {/* Quick Environment Guide */}
          <div className="diagnostics-guide-card">
            <div className="guide-header">
              <div className="guide-title">
                <Terminal size={16} />
                <span>Client Environment Configuration (`client/.env`)</span>
              </div>
              <button
                type="button"
                className="btn-copy-env"
                onClick={handleCopyEnv}
                title="Copy environment snippet"
              >
                {copied ? <Check size={14} className="text-income" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy .env'}</span>
              </button>
            </div>
            <pre className="env-code-preview">
{`# Client Environment Configuration
VITE_API_URL=${config.apiUrl}
VITE_APP_TITLE=${config.appTitle}
VITE_APP_ENV=${config.appEnv}
VITE_ENABLE_DEMO=${config.isDemoEnabled}`}
            </pre>
            <p className="env-hint-text">
              💡 <strong>Tip:</strong> Changes to <code>client/.env</code> take effect when Vite dev server is restarted.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close Inspector
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={runPing}
            disabled={pinging}
          >
            <RefreshCw size={15} className={pinging ? 'spin-animation' : ''} />
            <span>{pinging ? 'Pinging Server...' : 'Ping Again'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticsModal;
