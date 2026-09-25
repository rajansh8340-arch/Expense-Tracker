import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import TransactionsPage from './pages/TransactionsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';
import AuthPage from './pages/AuthPage';
import TransactionModal from './components/TransactionModal';
import Toast from './components/Toast';
import api from './services/api';
import './styles.css';

function MainApp() {
  const { user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [summary, setSummary] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  useEffect(() => {
    const appTitle = import.meta.env.VITE_APP_TITLE || 'Ledgerly — Expense Tracker';
    document.title = appTitle;
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3500);
  }, []);

  const loadSummary = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/transactions/analytics/summary');
      setSummary(res.data);
    } catch (err) {
      console.error('Failed to load analytics summary:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSummary();
    }
  }, [user, loadSummary, refreshCounter]);

  const triggerRefresh = () => {
    setRefreshCounter((c) => c + 1);
  };

  const handleOpenAddModal = () => {
    setEditItem(null);
    setModalOpen(true);
  };

  const handleEditTransaction = (tx) => {
    setEditItem(tx);
    setModalOpen(true);
  };

  const handleSaved = () => {
    setModalOpen(false);
    setEditItem(null);
    triggerRefresh();
  };

  const handleSeedData = async () => {
    try {
      const res = await api.post('/transactions/actions/seed');
      showToast(res.data.message || 'Sample data loaded successfully!', 'success');
      triggerRefresh();
    } catch (err) {
      showToast('Failed to seed transactions', 'error');
    }
  };

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="loading-spinner-ring" />
        <p>Loading your Ledgerly financial workspace...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <AuthPage showToast={showToast} />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </>
    );
  }

  return (
    <div className="ledgerly-app-shell">
      {/* Collapsible / Responsive Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={handleOpenAddModal}
        isOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Workspace Area */}
      <div className="ledgerly-main-content">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={handleOpenAddModal}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          showToast={showToast}
        />

        <main className="tab-viewport">
          {activeTab === 'overview' && (
            <Dashboard
              summary={summary}
              onOpenAddModal={handleOpenAddModal}
              onNavigateToTransactions={() => setActiveTab('transactions')}
              onSeedData={handleSeedData}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              onOpenAddModal={handleOpenAddModal}
              onEditTransaction={handleEditTransaction}
              showToast={showToast}
              refreshTrigger={refreshCounter}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage summary={summary} />}

          {activeTab === 'settings' && (
            <SettingsPage showToast={showToast} onRefreshAll={triggerRefresh} />
          )}
        </main>
      </div>

      {/* Add / Edit Transaction Modal */}
      {modalOpen && (
        <TransactionModal
          editItem={editItem}
          onClose={() => {
            setModalOpen(false);
            setEditItem(null);
          }}
          onSaved={handleSaved}
          showToast={showToast}
        />
      )}

      {/* Global Toast Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
}
