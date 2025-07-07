import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Admin from './Admin';
import Vote from './Vote';
import Result from './Result';
import Sidebar from './Sidebar';
import './styles.css';

function AppContent() {
  const location = useLocation();
  
  // Determine page class based on current route
  const getPageClass = () => {
    switch (location.pathname) {
      case '/login':
        return 'login-page';
      case '/register':
        return 'register-page';
      case '/vote':
        return 'vote-page';
      case '/result':
        return 'result-page';
      case '/admin':
        return 'admin-page';
      default:
        return 'login-page';
    }
  };

  return (
    <div className={`app-container ${getPageClass()}`}>
      <Sidebar />
      <main className="main-content">
        <Routes>
          {/* ✅ Make login the default page */}
          <Route path="/" element={<Navigate to="/login" />} />

          {/* Core routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/vote" element={<Vote />} />
          <Route path="/result" element={<Result />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;

