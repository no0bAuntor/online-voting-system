import React, { useEffect, useState } from "react";
import axios from "axios";
import Result from "./Result";
import './styles.css';

const API_URL = process.env.REACT_APP_API_URL;

export default function Admin() {
  const [name, setName] = useState("");
  const [party, setParty] = useState("");
  const [photo, setPhoto] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [votingOpen, setVotingOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("candidates");
  const [electionStats, setElectionStats] = useState(null);

  const resetElection = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/vote/reset`);
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
      setCandidates(Array.isArray(res.data) ? res.data : res.data.candidates || []);
    } catch (err) {
      setMessage("Failed to fetch candidates");
    }
  };

  const fetchVotingStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/vote/status`);
      setVotingOpen(res.data.votingOpen ?? res.data.open);
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
      setPhoto(null);
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

        <div className="flex gap-2 mb-8">
          {renderTabButton("candidates", "Candidates", "👥")}
          {renderTabButton("voting", "Voting Control", "🗳️")}
          {renderTabButton("results", "Results", "📊")}
        </div>

        {activeTab === "candidates" && (
          <div className="animate-fade-in">
            <div className="card">
              <h3>Add New Candidate</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={name}
                  placeholder="Candidate Name"
                  onChange={(e) => setName(e.target.value)}
                />
                <input
                  type="text"
                  value={party}
                  placeholder="Party"
                  onChange={(e) => setParty(e.target.value)}
                />
                <input type="file" onChange={handlePhotoChange} />
                <button type="submit">Add Candidate</button>
              </form>
            </div>
            <div className="card">
              <h3>Registered Candidates</h3>
              {candidates.map((c) => (
                <div key={c._id}>
                  <p>{c.name} ({c.party})</p>
                  <button onClick={() => deleteCandidate(c._id, c.name)}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "voting" && (
          <div className="animate-fade-in">
            <h3>Voting is {votingOpen ? 'Open' : 'Closed'}</h3>
            <button onClick={toggleVoting} disabled={isLoading}>
              {votingOpen ? 'Close Voting' : 'Open Voting'}
            </button>
            <button onClick={resetElection} disabled={isLoading}>
              Reset Election
            </button>
          </div>
        )}

        {activeTab === "results" && (
          <div className="animate-fade-in">
            <Result />
          </div>
        )}
      </div>
    </div>
  );
}
