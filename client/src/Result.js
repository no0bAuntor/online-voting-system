import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

export default function Result() {
  const [candidates, setCandidates] = useState([]);
  const [statistics, setStatistics] = useState({
    totalRegisteredUsers: 0,
    totalVotedUsers: 0,
    votePercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  
  

  const fetchResults = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/vote/all');
      const data = res.data;
      
      // Handle new API response structure
      const candidatesData = data.candidates || data; // Fallback for backward compatibility
      const statsData = data.statistics || { totalRegisteredUsers: 0, totalVotedUsers: 0, votePercentage: 0 };
      
      
      
      // Sort candidates by votes (descending)
      const sortedCandidates = candidatesData.sort((a, b) => b.votes - a.votes);
      setCandidates(sortedCandidates);
      setStatistics(statsData);
      
      setError('');
      
    } catch (err) {
      console.error('Failed to fetch results', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate percentage of votes for a candidate
  const getPercentage = (votes) => {
    const totalVotes = candidates.reduce((sum, candidate) => sum + candidate.votes, 0);
    if (totalVotes === 0) return 0;
    return ((votes / totalVotes) * 100).toFixed(1);
  };

  useEffect(() => {
    fetchResults();

    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  

  const getPositionIcon = (index) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '📊';
    }
  };

  const getPositionColor = (index) => {
    switch (index) {
      case 0: return 'var(--accent-gold)';
      case 1: return '#c0c0c0';
      case 2: return '#cd7f32';
      default: return 'var(--deep-blue)';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="content-container animate-fade-in">
          <div className="text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                color: 'var(--warm-white)',
                fontSize: 'var(--font-size-2xl)',
                margin: '0 auto var(--space-4) auto',
                animation: 'spin 1s linear infinite'
              }}
            >
              🔄
            </div>
            <h3>Loading Results...</h3>
            <p style={{ color: 'var(--warm-gray)' }}>
              Fetching the latest vote counts
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="content-container animate-fade-in">
        <div className="card-header text-center">
          <h1>📊 Election Results</h1>
          <p className="card-subtitle">
            Live results updated in real-time
          </p>
        </div>

        {error && (
          <div className="alert alert-error animate-slide-in">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* Summary Statistics */}
        <div className="grid gap-4 mb-8" style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)'
        }}>
          
          
          
          
          <div className="card text-center" style={{ padding: 'var(--space-6)' }}>
            <div 
              className="text-3xl mb-2"
              style={{ 
                fontSize: 'var(--font-size-4xl)',
                fontWeight: '800',
                color: 'var(--deep-blue)',
                marginBottom: 'var(--space-2)'
              }}
            >
              {statistics.totalRegisteredUsers}
            </div>
            <p style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--warm-gray)',
              margin: 0
            }}>
              Registered Users
            </p>
          </div>
          
          <div className="card text-center" style={{ padding: 'var(--space-6)' }}>
            <div 
              className="text-3xl mb-2"
              style={{ 
                fontSize: 'var(--font-size-4xl)',
                fontWeight: '800',
                color: 'var(--success-green)',
                marginBottom: 'var(--space-2)'
              }}
            >
              {statistics.totalVotedUsers}
            </div>
            <p style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--warm-gray)',
              margin: 0
            }}>
              Votes Cast
            </p>
          </div>
          
          <div className="card text-center" style={{ padding: 'var(--space-6)' }}>
            <div 
              className="text-3xl mb-2"
              style={{ 
                fontSize: 'var(--font-size-4xl)',
                fontWeight: '800',
                color: 'var(--accent-gold)',
                marginBottom: 'var(--space-2)'
              }}
            >
              {statistics.votePercentage}%
            </div>
            <p style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--warm-gray)',
              margin: 0
            }}>
              Turnout Rate
            </p>
          </div>
          
          <div className="card text-center" style={{ padding: 'var(--space-6)' }}>
            <div 
              className="text-3xl mb-2"
              style={{ 
                fontSize: 'var(--font-size-4xl)',
                fontWeight: '800',
                color: 'var(--success-green)',
                marginBottom: 'var(--space-2)'
              }}
            >
              {candidates.length}
            </div>
            <p style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--warm-gray)',
              margin: 0
            }}>
              Candidates
            </p>
          </div>
          
          <div className="card text-center" style={{ padding: 'var(--space-6)' }}>
            <div 
              className="text-3xl mb-2"
              style={{ 
                fontSize: 'var(--font-size-2xl)',
                fontWeight: '800',
                color: 'var(--accent-gold)',
                marginBottom: 'var(--space-2)'
              }}
            >
              🔴 LIVE
            </div>
            <p style={{ 
              fontSize: 'var(--font-size-sm)',
              color: 'var(--warm-gray)',
              margin: 0
            }}>
              Real-time Updates
            </p>
          </div>
        </div>

        {/* Results List */}
        {candidates.length === 0 ? (
          <div className="card text-center" style={{ padding: 'var(--space-8)' }}>
            <div 
              className="text-6xl mb-4"
              style={{ 
                fontSize: 'var(--font-size-6xl)',
                marginBottom: 'var(--space-4)'
              }}
            >
              🗳️
            </div>
            <h3 className="mb-4">No Results Available</h3>
            <p style={{ color: 'var(--warm-gray)' }}>
              No votes have been cast yet, or the election hasn't started.
            </p>
          </div>
        ) : (
          <div className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {candidates.map((candidate, index) => (
              <div 
                key={candidate._id} 
                className="card animate-slide-in"
                style={{ 
                  animationDelay: `${index * 0.1}s`,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Background progress bar */}
                <div 
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${getPercentage(candidate.votes)}%`,
                    background: `linear-gradient(90deg, ${getPositionColor(index)}15, ${getPositionColor(index)}05)`,
                    transition: 'width 1s ease-out',
                    borderRadius: 'var(--radius-xl)'
                  }}
                />
                
                <div className="relative flex items-center justify-between" style={{ position: 'relative' }}>
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex items-center justify-center text-2xl font-bold"
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '50%',
                        background: getPositionColor(index),
                        color: 'var(--warm-white)',
                        fontSize: 'var(--font-size-xl)',
                        fontWeight: '700'
                      }}
                    >
                      {getPositionIcon(index)}
                    </div>
                    
                    <div>
                      <h4 className="mb-1" style={{ marginBottom: 'var(--space-1)' }}>
                        {candidate.name}
                      </h4>
                      <p style={{ 
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--warm-gray)',
                        margin: 0
                      }}>
                        {candidate.party}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div 
                      className="text-2xl font-bold mb-1"
                      style={{ 
                        fontSize: 'var(--font-size-2xl)',
                        fontWeight: '800',
                        color: 'var(--navy-blue)',
                        marginBottom: 'var(--space-1)'
                      }}
                    >
                      {candidate.votes}
                    </div>
                    <div 
                      className="text-lg font-semibold"
                      style={{ 
                        fontSize: 'var(--font-size-lg)',
                        fontWeight: '600',
                        color: getPositionColor(index)
                      }}
                    >
                      {getPercentage(candidate.votes)}%
                    </div>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div 
                  className="mt-3"
                  style={{ marginTop: 'var(--space-3)' }}
                >
                  <div className="progress-container" style={{ height: '6px' }}>
                    <div 
                      className="progress-bar"
                      style={{ 
                        width: `${getPercentage(candidate.votes)}%`,
                        background: getPositionColor(index),
                        transition: 'width 1s ease-out'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Last Updated */}
        <div className="text-center mt-8" style={{ 
          marginTop: 'var(--space-8)',
          padding: 'var(--space-4)',
          background: 'rgba(107, 114, 128, 0.05)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid rgba(107, 114, 128, 0.1)'
        }}>
          
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-6">
          <button 
            className="btn btn-secondary"
            onClick={fetchResults}
            disabled={loading}
          >
            <span>🔄</span>
            Refresh Results
          </button>
        </div>
      </div>
    </div>
  );
}

// Add spin animation for loading
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

