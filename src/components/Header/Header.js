import React, { useState, useEffect } from 'react';
import AuthModal from '../AuthModal/AuthModal';
import './Header.css';

const Header = ({ onToggleSidebar }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    // Check if user is already logged in
    const user = localStorage.getItem('currentUser');
    const token = localStorage.getItem('authToken');
    
    if (user && token) {
      setCurrentUser(JSON.parse(user));
    }
    // apply theme on mount
    document.body.classList.toggle('theme-dark', theme === 'dark');
  }, []);

  useEffect(() => {
    document.body.classList.toggle('theme-dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    setCurrentUser(null);
    setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={onToggleSidebar} aria-label="Toggle menu">
          <span className="hamburger"></span>
          <span className="hamburger"></span>
          <span className="hamburger"></span>
        </button>
        <h1 className="header-title">Social Media Analytics</h1>
      </div>
      <div className="header-right">
        <div className="header-actions">
          <button className="settings-btn" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} onClick={toggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="notification-btn" title="Notifications">
            🔔
            <span className="notification-badge">3</span>
          </button>
          <button className="settings-btn" title="Settings">⚙️</button>
        </div>
        
        {currentUser ? (
          <div className="user-profile" onClick={toggleUserMenu}>
            <div className="user-avatar">
              <img
                src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name || currentUser.username)}&background=667eea&color=fff`}
                alt={currentUser.full_name || currentUser.username}
              />
            </div>
            <div className="user-info">
              <span className="user-name">{currentUser.full_name || currentUser.username}</span>
              <span className="user-role">@{currentUser.username}</span>
            </div>
            <span className="dropdown-arrow">▼</span>
            {showUserMenu && (
              <div className="user-menu">
                <div className="user-menu-header">
                  <img
                    src={currentUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.full_name || currentUser.username)}&background=667eea&color=fff`}
                    alt={currentUser.full_name || currentUser.username}
                    className="menu-avatar"
                  />
                  <div className="menu-user-info">
                    <span className="menu-name">{currentUser.full_name || currentUser.username}</span>
                    <span className="menu-username">@{currentUser.username}</span>
                    <span className="menu-email">{currentUser.email}</span>
                  </div>
                </div>
                <a href="#profile" className="menu-item">👤 My Profile</a>
                <a href="#settings" className="menu-item">⚙️ Settings</a>
                <a href="#help" className="menu-item">❓ Help</a>
                <hr className="menu-divider" />
                <button className="menu-item logout" onClick={handleLogout}>🚪 Logout</button>
              </div>
            )}
          </div>
        ) : (
          <div className="auth-section">
            <button 
              className="login-btn" 
              onClick={() => setShowAuthModal(true)}
            >
              Login
            </button>
          </div>
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />
      
      {/* Overlay to close user menu */}
      {showUserMenu && (
        <div 
          className="menu-overlay" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;