import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './styles.css';

export default function Login() {
  const [loginType, setLoginType] = useState('voter'); // 'voter' or 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', {
        username,
        password,
      });

      localStorage.setItem('token', res.data.token);

      if (res.data.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/vote');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login();
  };

  return (
    <div className="container">
      <div className="content-container animate-fade-in">
        <div className="card-header text-center">
          <h1>Welcome</h1>
          <p className="card-subtitle">
            {loginType === 'admin' 
              ? 'Administrator access to manage elections' 
              : 'Sign in to cast your vote'
            }
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-slide-in">
            <span>⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <div className="radio-group">
              <div className="radio-option">
                <input
                  type="radio"
                  id="voter"
                  value="voter"
                  checked={loginType === 'voter'}
                  onChange={() => setLoginType('voter')}
                />
                <label htmlFor="voter">Voter</label>
              </div>
              <div className="radio-option">
                <input
                  type="radio"
                  id="admin"
                  value="admin"
                  checked={loginType === 'admin'}
                  onChange={() => setLoginType('admin')}
                />
                <label htmlFor="admin">Administrator</label>
              </div>
            </div>
          </div>

          {loginType === 'admin' && (
            <div className="text-center mt-4 mb-4">
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--navy-blue)', marginBottom: 'var(--space-3)' }}>
                For admin ID and password, please contact the developer
              </p>
              <button
                type="button"
                onClick={() => window.open('https://mail.google.com/mail/?view=cm&to=mbauntor150@gmail.com&su=Admin%20Access%20Request&body=Hello,%0A%0AI%20would%20like%20to%20request%20admin%20access%20for%20the%20online%20voting%20system.%0A%0AThank%20you.', '_blank')}
                style={{
                  background: 'linear-gradient(135deg, #4285f4 0%, #34a853 100%)',
                  color: 'white',
                  border: 'none',
                  padding: 'var(--space-2) var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <span>📧</span>
                Contact Developer
              </button>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username">
              {loginType === 'admin' ? 'Admin ID' : 'User name'}
            </label>
            <input
              id="username"
              type="text"
              className="form-input"
              placeholder={loginType === 'admin' ? 'Enter your admin ID' : 'Enter your username'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                style={{ paddingRight: '45px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px',
                  color: 'var(--warm-gray)',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                disabled={isLoading}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-full btn-large"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span>🔄</span>
                Signing In...
              </>
            ) : (
              <>
                <span>🔐</span>
                Sign In
              </>
            )}
          </button>
        </form>

        {loginType === 'voter' && (
          <div className="text-center mt-6">
            <p style={{ color: 'blue', marginBottom: 'var(--space-2)' }}>
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="btn btn-outline"
              style={{ color: '#761b8b', borderColor: '#761b8b' }}
            >
              <span>📝</span>
              Create New Account
            </Link>
          </div>
        )}

        <div className="text-center mt-8" style={{ 
          padding: 'var(--space-4)', 
          background: 'rgba(135, 169, 107, 0.05)', 
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(135, 169, 107, 0.2)'
        }}>
          <p style={{ 
            fontSize: 'var(--font-size-sm)', 
            color: '#181515',
            margin: 0
          }}>
            🔒 Your vote is secure and anonymous
          </p>
        </div>
      </div>
    </div>
  );
}

