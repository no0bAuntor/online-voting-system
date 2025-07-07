import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles.css';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>

      {/* Sidebar Overlay for Mobile */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-logo">
          <span className="sidebar-logo-text">VoteSecure</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <Link 
            to="/login" 
            className={`sidebar-nav-item ${isActive('/login') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <span className="sidebar-nav-icon">🔐</span>
            <span>Login</span>
          </Link>

          <Link 
            to="/register" 
            className={`sidebar-nav-item ${isActive('/register') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <span className="sidebar-nav-icon">📝</span>
            <span>Register</span>
          </Link>

          {/* <Link 
            to="/vote" 
            className={`sidebar-nav-item ${isActive('/vote') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <span className="sidebar-nav-icon">🗳️</span>
            <span>Vote</span>
          </Link> */}

          <Link 
            to="/result" 
            className={`sidebar-nav-item ${isActive('/result') ? 'active' : ''}`}
            onClick={closeSidebar}
          >
            <span className="sidebar-nav-icon">📊</span>
            <span>Results</span>
          </Link>

          
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <p>&copy; 2025 VoteSecure</p>
          <p>Secure • Transparent • Accessible</p>
        </div>
      </aside>
    </>
  );
}

