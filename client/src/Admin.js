// Admin.js (Styled with your CSS framework)
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
      <div className="content-container animate-fade-in">
        <div className="card-header text-center">
          <h1>⚙️ Admin Dashboard</h1>
          <p className="card-subtitle">
            Manage candidates, control voting access, and monitor results
          </p>
        </div>

        {message && (
          <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-error'}`}>{message}</div>
        )}

        <div className="flex gap-4 mb-6 justify-center">
          {renderTabButton("candidates", "Candidates", "👥")}
          {renderTabButton("voting", "Voting", "🗳️")}
          {renderTabButton("results", "Results", "📊")}
        </div>

        {activeTab === "candidates" && (
          <div className="card">
            <form onSubmit={handleSubmit} className="form">
              <div className="form-group">
                <label className="form-label">Candidate Name</label>
                <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Political Party</label>
                <input type="text" className="form-input" value={party} onChange={(e) => setParty(e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Photo</label>
                <input type="file" className="form-input" accept="image/*" onChange={handlePhotoChange} />
              </div>
              <button className="btn btn-primary" type="submit" disabled={isLoading}>Add Candidate</button>
            </form>

            {candidates.length === 0 ? (
              <p className="text-center mt-6">No candidates added yet.</p>
            ) : (
              <div className="space-y-3 mt-6">
                {candidates.map((c, i) => (
                  <div key={c._id} className="list-item animate-slide-in">
                    <div className="flex items-center gap-4">
                      <img src={`${API_URL}${c.photoUrl}`} alt={c.name} className="w-12 h-12 rounded-full object-cover" />
                      <div>
                        <h4>{c.name}</h4>
                        <p>{c.party} • {c.votes} votes</p>
                      </div>
                    </div>
                    <button className="btn btn-outline" onClick={() => deleteCandidate(c._id)}>🗑️ Delete</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "voting" && (
          <div className="card text-center">
            <h3>Voting is currently {votingOpen ? "🟢 OPEN" : "🔴 CLOSED"}</h3>
            <button onClick={toggleVoting} className="btn btn-primary mt-4" disabled={isLoading}>
              {votingOpen ? "Close Voting" : "Open Voting"}
            </button>
            <button onClick={resetElection} className="btn btn-outline mt-4" disabled={isLoading}>
              Reset Election
            </button>
          </div>
        )}

        {activeTab === "results" && <Result />}
      </div>
    </div>
  );
}
