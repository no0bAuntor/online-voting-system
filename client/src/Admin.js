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

  // Fetch all required data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [candidatesRes, votingStatusRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/vote/all`),
        axios.get(`${API_URL}/api/vote/status`),
        axios.get(`${API_URL}/api/vote/stats`)
      ]);
      setCandidates(candidatesRes.data?.candidates || []);
      setVotingOpen(votingStatusRes.data.votingOpen ?? true);
      setElectionStats(statsRes.data || {});
    } catch (err) {
      console.error("Error fetching admin data", err);
      setMessage("⚠️ Failed to fetch admin data");
    }
  };

  const resetElection = async () => {
    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/vote/reset`);
      await fetchAllData();
      setMessage("✅ Election reset successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reset election");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoting = async () => {
    setIsLoading(true);
    try {
      const newStatus = !votingOpen;
      await axios.post(`${API_URL}/api/vote/status`, { votingOpen: newStatus });
      setVotingOpen(newStatus);
      setMessage(newStatus ? "🟢 Voting opened!" : "🔴 Voting closed.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to toggle voting");
    } finally {
      setIsLoading(false);
    }
  };

  const addCandidate = async () => {
    if (!name.trim() || !party.trim() || !photo) {
      setMessage("Please fill in all fields and upload a photo.");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("party", party);
    formData.append("photo", photo);

    setIsLoading(true);
    try {
      await axios.post(`${API_URL}/api/vote/add`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchAllData();
      setName(""); setParty(""); setPhoto(null);
      setMessage("✅ Candidate added successfully!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add candidate");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCandidate = async (id) => {
    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/api/vote/${id}`);
      await fetchAllData();
      setMessage("🗑️ Candidate deleted");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete candidate");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) setPhoto(file);
    else setMessage("Please select a valid image.");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addCandidate();
  };

  const renderTabButton = (tabId, label, icon) => (
    <button
      className={`btn ${activeTab === tabId ? 'btn-primary' : 'btn-outline'}`}
      onClick={() => setActiveTab(tabId)}
    >
      {icon} {label}
    </button>
  );

  return (
    <div className="container">
      <div className="card-header text-center">
        <h1>⚙️ Admin Dashboard</h1>
        <p>Manage candidates, voting, and view results</p>
      </div>

      {message && (
        <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      <div className="tab-nav">
        {renderTabButton("candidates", "Candidates", "👥")}
        {renderTabButton("voting", "Voting", "🗳️")}
        {renderTabButton("results", "Results", "📊")}
      </div>

      {/* Candidates Tab */}
      {activeTab === "candidates" && (
        <div>
          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              placeholder="Candidate Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
            />
            <input
              type="text"
              placeholder="Party"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              disabled={isLoading}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Candidate"}
            </button>
          </form>

          <div className="candidate-list">
            {candidates.length === 0 ? (
              <p>No candidates yet.</p>
            ) : (
              candidates.map(c => (
                <div key={c._id} className="candidate-card">
                  <img src={`${API_URL}${c.photoUrl}`} alt={c.name} />
                  <div>
                    <h4>{c.name}</h4>
                    <p>{c.party} • {c.votes} votes</p>
                  </div>
                  <button onClick={() => deleteCandidate(c._id)} disabled={isLoading}>
                    🗑️ Delete
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Voting Tab */}
      {activeTab === "voting" && (
        <div className="voting-control">
          <h3>Voting is currently {votingOpen ? "🟢 OPEN" : "🔴 CLOSED"}</h3>
          <button onClick={toggleVoting} disabled={isLoading}>
            {votingOpen ? "Close Voting" : "Open Voting"}
          </button>
          <button onClick={resetElection} disabled={isLoading} style={{ marginLeft: "1rem" }}>
            Reset Election
          </button>
        </div>
      )}

      {/* Results Tab */}
      {activeTab === "results" && <Result />}
    </div>
  );
}
