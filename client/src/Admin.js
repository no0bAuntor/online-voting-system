import React, { useEffect, useState } from "react";
import axios from "axios";
import Result from "./Result";
import './styles.css';

const API_URL = process.env.REACT_APP_API_URL;

export default function Admin() {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [photo, setPhoto] = useState(null); // New state for candidate photo
  const [candidates, setCandidates] = useState([]);
  const [votingOpen, setVotingOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("candidates"); // candidates, voting, results

  // Election statistics
  // eslint-disable-next-line no-unused-vars
  const [electionStats, setElectionStats] = useState(null);

  // Reset election function
  const resetElection = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/vote/reset`);
      
      // Refresh all data
      await fetchCandidates();
      await fetchVotingStatus();
      await fetchElectionStats();
      
      setMessage("🔄 Election reset successfully! All votes cleared and users can vote again.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reset election");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch election statistics
  const fetchElectionStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/vote/stats`);
      setElectionStats(response.data);
    } catch (err) {
      console.error("Failed to fetch election stats:", err);
    }
  };

  

  const fetchCandidates = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vote/all`);
      setCandidates(res.data.candidates);
    } catch (err) {
      setMessage("Failed to fetch candidates");
    }
  };

  const fetchVotingStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vote/status`);
      setVotingOpen(res.data.votingOpen);
    } catch (err) {
      setMessage("Failed to fetch voting status");
    }
  };

  const toggleVoting = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/vote/status`, {
        votingOpen: !votingOpen,
      });
      await fetchVotingStatus();
      setMessage(`Voting has been ${!votingOpen ? 'opened' : 'closed'} successfully`);
    } catch (err) {
      setMessage("Failed to update voting status");
    } finally {
      setIsLoading(false);
    }
  };

  const addCandidate = async () => {
    if (!name.trim() || !party.trim()) {
      setMessage("Please enter both candidate name and party");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("party", party.trim());
    if (photo) {
      formData.append("photo", photo);
    }

    try {
      await axios.post(`${API_URL}/api/vote/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setName("");
      setParty("");
      setPhoto(null); // Clear photo state after upload
      await fetchCandidates();
      setMessage(`Candidate ${name} added successfully`);
    } catch (err) {
      setMessage("Failed to add candidate");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCandidate = async (id, candidateName) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/api/vote/${id}`);
      await fetchCandidates();
      setMessage(`Candidate ${candidateName} deleted successfully`);
    } catch (err) {
      setMessage("Failed to delete candidate");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addCandidate();
  };

  const handlePhotoDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhoto(file);
    } else {
      setMessage("Please drop an image file.");
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhoto(file);
    } else {
      setMessage("Please select an image file.");
    }
  };

  useEffect(() => {
    fetchCandidates();
    fetchVotingStatus();
    fetchElectionStats();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const renderTabButton = (tabId, label, icon) => (
    <button
      className={`btn ${activeTab === tabId ? 'btn-primary' : 'btn-outline'}`}
      onClick={() => setActiveTab(tabId)}
      style={{ flex: 1 }}
    >
      <span>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="container">
      <div className="content-container animate-fade-in">
        <div className="card-header text-center">
          <h1>⚙️ Admin Dashboard</h1>
          <p className="card-subtitle">
            Manage candidates, control voting access, and monitor results
          </p>
        </div>

        {message && (
          <div className={`alert ${
            message.includes('successfully') ? 'alert-success' : 'alert-error'
          } animate-slide-in`}>
            <span>
              {message.includes('successfully') ? '✅' : '⚠️'}
            </span>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8" style={{ 
          display: 'flex', 
          gap: 'var(--space-2)', 
          marginBottom: 'var(--space-8)' 
        }}>
          {renderTabButton("candidates", "Candidates", "👥")}
          {renderTabButton("voting", "Voting Control", "🗳️")}
          {renderTabButton("results", "Results", "📊")}
        </div>

        {/* Candidates Tab */}
        {activeTab === "candidates" && (
          <div className="animate-fade-in">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Add New Candidate</h3>
                <p className="card-subtitle">Register a new candidate for the election</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid gap-4 mb-6" style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-6)'
                }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="candidateName">
                      Candidate Name
                    </label>
                    <input
                      id="candidateName"
                      type="text"
                      className="form-input"
                      placeholder="Enter candidate's full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="party">
                      Political Party
                    </label>
                    <input
                      id="party"
                      type="text"
                      className="form-input"
                      placeholder="Enter party name"
                      value={party}
                      onChange={(e) => setParty(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Photo Upload */}
                  <div className="form-group">
                    <label className="form-label">Candidate Photo</label>
                    <div
                      className="drop-area"
                      onDrop={handlePhotoDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => document.getElementById("photoUpload").click()}
                      style={{
                        border: "2px dashed var(--warm-gray)",
                        borderRadius: "var(--radius-md)",
                        padding: "var(--space-6)",
                        textAlign: "center",
                        cursor: "pointer",
                        backgroundColor: "rgba(255, 255, 255, 0.05)",
                        transition: "all var(--transition-fast)",
                      }}
                    >
                      {photo ? (
                        <p>Selected: {photo.name}</p>
                      ) : (
                        <p>Drag & drop photo here, or click to select</p>
                      )}
                      <input
                        type="file"
                        id="photoUpload"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                      />
                    </div>
                    {photo && (
                      <button
                        type="button"
                        onClick={() => setPhoto(null)}
                        className="btn btn-outline btn-sm mt-2"
                        style={{ 
                          borderColor: "var(--alert-red)",
                          color: "var(--alert-red)",
                          fontSize: "var(--font-size-sm)",
                          padding: "var(--space-1) var(--space-3)"
                        }}
                      >
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="btn btn-primary"
                  disabled={isLoading || !name.trim() || !party.trim()}
                >
                  {isLoading ? (
                    <>
                      <span>🔄</span>
                      Adding...
                    </>
                  ) : (
                    <>
                      <span>➕</span>
                      Add Candidate
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Registered Candidates</h3>
                <p className="card-subtitle">
                  {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} registered
                </p>
              </div>

              {candidates.length === 0 ? (
                <div className="text-center" style={{ padding: "var(--space-8)" }}>
                  <div 
                    className="text-6xl mb-4"
                    style={{ 
                      fontSize: "var(--font-size-6xl)",
                      marginBottom: "var(--space-4)"
                    }}
                  >
                    👥
                  </div>
                  <h4 className="mb-2">No Candidates Yet</h4>
                  <p style={{ color: "var(--warm-gray)" }}>
                    Add your first candidate to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-3" style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "var(--space-3)" 
                }}>
                  {candidates.map((candidate, index) => (
                    <div 
                      key={candidate._id}
                      className="list-item animate-slide-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4">
                        {candidate.photoUrl ? (
                          <img 
                            src={`${API_URL}${candidate.photoUrl}`}
                            alt={candidate.name}
                            className="w-12 h-12 rounded-full object-cover"
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "2px solid var(--accent-gold)"
                            }}
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
                            style={{
                              width: "48px",
                              height: "48px",
                              borderRadius: "50%",
                              background: "var(--secondary-gradient)",
                              color: "var(--warm-white)",
                              fontSize: "var(--font-size-lg)",
                              fontWeight: "700"
                            }}
                          >
                            {candidate.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 style={{ marginBottom: "var(--space-1)" }}>
                            {candidate.name}
                          </h4>
                          <p style={{ 
                            fontSize: "var(--font-size-sm)",
                            color: "var(--warm-gray)",
                            margin: 0
                          }}>
                            {candidate.party} • {candidate.votes} votes
                          </p>
                        </div>
                      </div>
                      
                      <button
                        className="btn btn-outline"
                        onClick={() => deleteCandidate(candidate._id, candidate.name)}
                        disabled={isLoading}
                        style={{ 
                          padding: "var(--space-2) var(--space-4)",
                          fontSize: "var(--font-size-sm)",
                          borderColor: "var(--alert-red)",
                          color: "var(--alert-red)"
                        }}
                      >
                        <span>🗑️</span>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Voting Control Tab */}
        {activeTab === "voting" && (
          <div className="animate-fade-in">
            <div className="card">
              <div className="card-header text-center">
                <h3 className="card-title">Voting Status Control</h3>
                <p className="card-subtitle">
                  Manage when voters can cast their ballots
                </p>
              </div>

              <div className="text-center">
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
                  style={{
                    width: "96px",
                    height: "96px",
                    borderRadius: "50%",
                    background: votingOpen ? "var(--secondary-gradient)" : "var(--warm-gray)",
                    color: "var(--warm-white)",
                    fontSize: "var(--font-size-5xl)",
                    margin: "0 auto var(--space-6) auto"
                  }}
                >
                  {votingOpen ? "🟢" : "🔴"}
                </div>

                <h4 className="mb-4">
                  Voting is currently{" "}
                  <span style={{ 
                    color: votingOpen ? "var(--success-green)" : "var(--alert-red)",
                    fontWeight: "800"
                  }}>
                    {votingOpen ? "OPEN" : "CLOSED"}
                  </span>
                </h4>

                <p className="mb-6" style={{ color: "var(--warm-gray)" }}>
                  {votingOpen 
                    ? "Voters can currently cast their ballots"
                    : "Voting is disabled - no new votes can be cast"
                  }
                </p>

                <div className="flex gap-4 justify-center mb-6" style={{
                  display: 'flex',
                  gap: 'var(--space-4)',
                  justifyContent: 'center',
                  marginBottom: 'var(--space-6)'
                }}>
                  <button
                    className={`btn ${votingOpen ? "btn-outline" : "btn-primary"} btn-large`}
                    onClick={toggleVoting}
                    disabled={isLoading}
                    style={{
                      borderColor: votingOpen ? "var(--alert-red)" : "var(--success-green)",
                      color: votingOpen ? "var(--alert-red)" : "var(--warm-white)"
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span>🔄</span>
                        Updating...
                      </>
                    ) : (
                      <>
                        <span>{votingOpen ? "🔒" : "🔓"}</span>
                        {votingOpen ? "Close Voting" : "Open Voting"}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Reset Election Section */}
              <div className="mt-8 pt-6" style={{ 
                marginTop: "var(--space-8)",
                paddingTop: "var(--space-6)",
                borderTop: "2px solid var(--warm-gray-light)"
              }}>
                <div className="text-center mb-6">
                  <h4 style={{ 
                    fontSize: "var(--font-size-lg)",
                    fontWeight: "700",
                    color: "var(--alert-red)",
                    marginBottom: "var(--space-3)"
                  }}>
                    🔄 Reset Election
                  </h4>
                  <p style={{ 
                    fontSize: "var(--font-size-sm)",
                    color: "var(--warm-gray)",
                    marginBottom: "var(--space-4)"
                  }}>
                    Start a new election by clearing all votes and allowing users to vote again
                  </p>
                </div>

                <div className="text-center">
                  <button
                    className="btn btn-outline btn-large"
                    onClick={resetElection}
                    disabled={isLoading}
                    style={{
                      borderColor: "var(--alert-red)",
                      color: "var(--alert-red)",
                      borderWidth: "2px"
                    }}
                  >
                    {isLoading ? (
                      <>
                        <span>🔄</span>
                        Resetting...
                      </>
                    ) : (
                      <>
                        <span>🔄</span>
                        Reset Entire Election
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="mt-8" style={{ 
                marginTop: "var(--space-8)",
                padding: "var(--space-4)",
                background: "rgba(239, 68, 68, 0.05)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid rgba(239, 68, 68, 0.2)"
              }}>
                <h4 style={{ 
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "600",
                  color: "var(--alert-red)",
                  marginBottom: "var(--space-2)"
                }}>
                  ⚠️ Important Notice
                </h4>
                <ul style={{ 
                  fontSize: "var(--font-size-sm)",
                  color: "var(--warm-gray)",
                  margin: 0,
                  paddingLeft: "var(--space-4)"
                }}>
                  <li>Closing voting prevents new votes from being cast</li>
                  <li>Resetting election clears ALL votes and voting history</li>
                  <li>Reset action allows all users to vote again</li>
                  <li>Both actions cannot be undone - use with caution</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === "results" && (
          <div className="animate-fade-in">
            <Result />
          </div>
        )}

        </div>
    </div>
  );
}
