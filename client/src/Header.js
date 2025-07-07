import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styles.css';

export default function Header() {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          VoteSecure
        </Link>
        
        <nav>
          <ul className="nav-links">
            <li>
              <Link 
                to="/login" 
                className={isActive('/login') ? 'active' : ''}
              >
                Login
              </Link>
            </li>
            <li>
              <Link 
                to="/register" 
                className={isActive('/register') ? 'active' : ''}
              >
                Register
              </Link>
            </li>
            <li>
              <Link 
                to="/vote" 
                className={isActive('/vote') ? 'active' : ''}
              >
                Vote
              </Link>
            </li>
            <li>
              <Link 
                to="/result" 
                className={isActive('/result') ? 'active' : ''}
              >
                Results
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

