import React from 'react';
import './styles.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; 2025 VoteSecure. Empowering democracy through secure digital voting.</p>
        <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--space-2)', opacity: 0.8 }}>
          Secure • Transparent • Accessible
        </p>
      </div>
    </footer>
  );
}

