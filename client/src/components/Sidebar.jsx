import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  PieChart,
  Settings,
  LogOut,
  Plus,
  Moon,
  Sun,
  X,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const Sidebar = ({ activeTab, setActiveTab, onOpenAddModal, isOpen, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'analytics', label: 'Analytics & Insights', icon: PieChart },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const userInitial = user?.name ? user.name[0].toUpperCase() : 'U';

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-backdrop" onClick={onCloseMobile} />}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand-row">
          <div className="sidebar-brand">
            <div className="brand-logo-mark">
              <CreditCard size={20} />
            </div>
            <div className="brand-text">
              <span className="brand-title">Ledgerly</span>
              <span className="brand-badge">MERN</span>
            </div>
          </div>
          <button className="mobile-close-btn" onClick={onCloseMobile} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* User Workspace Card */}
        <div className="sidebar-user-card">
          <div className="user-avatar-circle">{userInitial}</div>
          <div className="user-info-text">
            <span className="user-display-name">{user?.name}</span>
            <span className="user-email-text">{user?.email}</span>
          </div>
        </div>

        {/* Quick Add Button */}
        <button
          type="button"
          className="sidebar-quick-add"
          onClick={() => {
            onOpenAddModal();
            onCloseMobile();
          }}
        >
          <Plus size={16} />
          <span>New Transaction</span>
        </button>

        {/* Nav Links */}
        <nav className="sidebar-nav-links">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={18} className="nav-item-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="sidebar-footer">
          <div className="sidebar-security-badge">
            <ShieldCheck size={14} />
            <span>Mongoose Isolated DB</span>
          </div>

          <div className="sidebar-bottom-actions">
            <button
              type="button"
              className="sidebar-action-btn theme-toggle-btn"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            <button
              type="button"
              className="sidebar-action-btn logout-btn"
              onClick={logout}
              title="Log out of session"
            >
              <LogOut size={17} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
