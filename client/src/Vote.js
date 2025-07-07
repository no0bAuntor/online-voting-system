import React, { useEffect, useState } from "react";
import axios from "axios";
import './styles.css';

export default function Vote() {
  const [candidates, setCandidates] = useState([]);
  const [voted, setVoted] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [votingStep, setVotingStep] = useState(1); // 1: Select, 2: Confirm, 3: Complete
  const [votingOpen, setVotingOpen] = useState(true);

  const voteFor = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/vote",
        { candidateId: id },
        { headers: { Authorization: token } }
      );
      setVoted(true);
      setVotingStep(3);
      setMessage("Your vote has been securely recorded!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Voting failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCandidateSelect = (candidate) => {
    if (!voted && votingOpen) {
      setSelectedCandidate(candidate);
      setVotingStep(2);
    }
  };

  const confirmVote = () => {
    if (selectedCandidate) {
      voteFor(selectedCandidate._id);
    }
  };

  const goBack = () => {
    setVotingStep(1);
    setSelectedCandidate(null);
  };

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vote/candidates");
        setCandidates(res.data);
      } catch (err) {
        console.error("Error fetching candidates", err);
        setMessage("Failed to load candidates. Please refresh the page.");
      }
    };

    const checkVotingStatus = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vote/status");
        if (!res.data.votingOpen) {
          setMessage("Voting is currently closed.");
          setVoted(true);
          setVotingOpen(false);
        }
      } catch (err) {
        console.error("Error checking voting status", err);
      }
    };

    const checkIfVoted = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/vote/voted", {
          headers: { Authorization: localStorage.getItem("token") },
        });
        if (res.data.voted) {
          setVoted(true);
          setVotingStep(3);
          setMessage("You have already cast your vote in this election.");
        }
      } catch (err) {
        console.error("Error checking if already voted", err);
      }
    };

    checkVotingStatus();
    checkIfVoted();
    fetchCandidates();
  }, []);

  const renderProgressBar = () => {
    const progress = (votingStep / 3) * 100;
    return (
      <div className="progress-container">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    );
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex justify-center gap-4 mb-8">
        {[1, 2, 3].map((step) => (
          <div 
            key={step}
            className={`flex items-center gap-2 ${
              step <= votingStep ? 'opacity-100' : 'opacity-50'
            }`}
          >
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                step <= votingStep 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 'var(--font-size-sm)',
                fontWeight: '700',
                background: step <= votingStep 
                  ? 'var(--primary-gradient)' 
                  : 'var(--warm-gray)',
                color: step <= votingStep ? 'var(--warm-white)' : 'var(--navy-blue)'
              }}
            >
              {step === 3 && voted ? '✓' : step}
            </div>
            <span className={`text-sm font-medium ${
              step <= votingStep ? 'text-blue-600' : 'text-gray-400'
            }`} style={{
              fontSize: 'var(--font-size-sm)',
              fontWeight: '500',
              color: step <= votingStep ? 'var(--deep-blue)' : 'var(--warm-gray)'
            }}>
              {step === 1 && 'Select'}
              {step === 2 && 'Confirm'}
              {step === 3 && 'Complete'}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="content-container animate-fade-in">
        <div className="card-header text-center">
          <h1>🗳️ Cast Your Vote</h1>
          <p className="card-subtitle">
            Your voice matters. Choose your preferred candidate.
          </p>
        </div>

        {renderStepIndicator()}
        {renderProgressBar()}

        {message && (
          <div className={`alert ${
            message.includes('recorded') || message.includes('already') 
              ? 'alert-success' 
              : message.includes('closed') || message.includes('Failed')
              ? 'alert-error'
              : 'alert-info'
          } animate-slide-in`}>
            <span>
              {message.includes('recorded') ? '✅' : 
               message.includes('closed') || message.includes('Failed') ? '⚠️' : 'ℹ️'}
            </span>
            {message}
          </div>
        )}

        {/* Step 1: Select Candidate */}
        {votingStep === 1 && !voted && votingOpen && (
          <div className="animate-fade-in">
            <h3 className="text-center mb-6">Select Your Candidate</h3>
            <div className="grid gap-4">
              {candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="voting-card cursor-pointer"
                  onClick={() => handleCandidateSelect(candidate)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {candidate.photoUrl ? (
                        <img 
                          src={`http://localhost:5000${candidate.photoUrl}`}
                          alt={candidate.name}
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            border: '3px solid var(--accent-gold)'
                          }}
                        />
                      ) : (
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
                          style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: '50%',
                            background: 'var(--secondary-gradient)',
                            color: 'var(--warm-white)',
                            fontSize: 'var(--font-size-2xl)',
                            fontWeight: '700'
                          }}
                        >
                          {candidate.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="mb-1" style={{ marginBottom: 'var(--space-1)' }}>
                          {candidate.name}
                        </h4>
                        <p className="text-sm" style={{ 
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--warm-gray)',
                          margin: 0
                        }}>
                          {candidate.party}
                        </p>
                      </div>
                    </div>
                    <div 
                      className="text-2xl"
                      style={{ fontSize: 'var(--font-size-2xl)' }}
                    >
                      👤
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Confirm Vote */}
        {votingStep === 2 && selectedCandidate && !voted && (
          <div className="animate-fade-in">
            <h3 className="text-center mb-6">Confirm Your Vote</h3>
            <div className="card" style={{ 
              background: 'rgba(16, 185, 129, 0.05)',
              border: '2px solid rgba(16, 185, 129, 0.2)'
            }}>
              <div className="text-center">
                {selectedCandidate.photoUrl ? (
                  <img 
                    src={`http://localhost:5000${selectedCandidate.photoUrl}`}
                    alt={selectedCandidate.name}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--accent-gold)',
                      margin: '0 auto var(--space-4) auto'
                    }}
                  />
                ) : (
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto mb-4"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'var(--secondary-gradient)',
                      color: 'var(--warm-white)',
                      fontSize: 'var(--font-size-4xl)',
                      fontWeight: '700',
                      margin: '0 auto var(--space-4) auto'
                    }}
                  >
                    {selectedCandidate.name.charAt(0)}
                  </div>
                )}
                <h4 className="mb-2">{selectedCandidate.name}</h4>
                <p className="mb-4" style={{ color: 'var(--warm-gray)' }}>
                  {selectedCandidate.party}
                </p>
                <p style={{ 
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--warm-gray)',
                  marginBottom: 'var(--space-6)'
                }}>
                  Are you sure you want to vote for this candidate?
                  <br />
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button 
                className="btn btn-outline flex-1"
                onClick={goBack}
                disabled={isLoading}
              >
                <span>←</span>
                Go Back
              </button>
              <button 
                className="btn btn-primary flex-1"
                onClick={confirmVote}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span>🔄</span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <span>✓</span>
                    Confirm Vote
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Vote Complete */}
        {votingStep === 3 && voted && (
          <div className="animate-fade-in text-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'var(--secondary-gradient)',
                color: 'var(--warm-white)',
                fontSize: 'var(--font-size-5xl)',
                margin: '0 auto var(--space-6) auto'
              }}
            >
              ✅
            </div>
            <h3 className="mb-4">Vote Successfully Cast!</h3>
            <p className="mb-6" style={{ color: 'var(--warm-gray)' }}>
              Thank you for participating in the democratic process. 
              Your vote has been securely recorded and will be counted.
            </p>
            
            <div className="card" style={{ 
              background: 'rgba(37, 99, 235, 0.05)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              textAlign: 'left'
            }}>
              <h4 style={{ marginBottom: 'var(--space-3)' }}>🔒 Security Information</h4>
              <ul style={{ 
                listStyle: 'none',
                padding: 0,
                margin: 0,
                fontSize: 'var(--font-size-sm)',
                color: 'var(--warm-gray)'
              }}>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  • Your vote is encrypted and anonymous
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  • No one can trace your vote back to you
                </li>
                <li style={{ marginBottom: 'var(--space-2)' }}>
                  • Results will be available after voting closes
                </li>
              </ul>
            </div>

            <button 
              className="btn btn-secondary mt-6"
              onClick={() => window.location.href = '/result'}
            >
              <span>📊</span>
              View Results
            </button>
          </div>
        )}

        {/* Voting Closed State */}
        {!votingOpen && (
          <div className="animate-fade-in text-center">
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                background: 'var(--warm-gray)',
                color: 'var(--warm-white)',
                fontSize: 'var(--font-size-5xl)',
                margin: '0 auto var(--space-6) auto'
              }}
            >
              🔒
            </div>
            <h3 className="mb-4">Voting is Currently Closed</h3>
            <p className="mb-6" style={{ color: 'var(--warm-gray)' }}>
              The voting period for this election has ended. 
              Thank you for your interest in participating.
            </p>
            
            <button 
              className="btn btn-secondary"
              onClick={() => window.location.href = '/result'}
            >
              <span>📊</span>
              View Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
