import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [icp, setIcp] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("signals");

  const validateForm = () => {
    if (!icp.trim() || !company.trim() || !email.trim()) {
      setError("All fields are required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    setError("");
    return true;
  };

  const runAgent = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/run-agent`,
        {},
        { params: { icp, company, email } }
      );
      setResult(res.data);
    } catch (err) {
      setError("Failed to run agent. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setIcp("");
    setCompany("");
    setEmail("");
    setResult(null);
    setError("");
  };

  return (
    <div className="app-container">
      <div className="app-wrapper">
        <header className="app-header">
          <div className="header-content">
            <h1 className="app-title">
              FireReach
            </h1>
            <p className="app-subtitle">Autonomous Outreach Platform</p>
          </div>
        </header>
        <div className="form-card">
          <div className="form-header">
            <h2>Configure Outreach</h2>
            <p>Enter details to generate personalized outreach</p>
          </div>
          <div className="form-body">
            <div className="input-group">
              <label className="input-label">Company Name<span className="required">*</span></label>
              <input className="input-field" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="e.g., TechCorp Inc." disabled={loading} />
            </div>
            <div className="input-group">
              <label className="input-label">Ideal Customer Profile (ICP)<span className="required">*</span></label>
              <input className="input-field" value={icp} onChange={(e) => setIcp(e.target.value)} placeholder="e.g., B2B SaaS startups with 50-200 employees" disabled={loading} />
            </div>
            <div className="input-group">
              <label className="input-label">Email Address<span className="required">*</span></label>
              <input className="input-field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@example.com" disabled={loading} />
            </div>
            {error && <div className="error-message"><span>Warning: </span>{error}</div>}
            <div className="button-group">
              <button className="btn btn-primary" onClick={runAgent} disabled={loading}>
                {loading ? <><span className="spinner" /> Processing...</> : <>Run FireReach Agent</>}
              </button>
              <button className="btn btn-secondary" onClick={clearForm} disabled={loading}>Clear</button>
            </div>
          </div>
        </div>
        {result && (
          <div className="results-card animate-in">
            <div className="results-header">
              <h2>Analysis Results</h2>
              <div className="status-badge"><span className="status-dot" />Complete</div>
            </div>
            <div className="tabs">
              {[{id:"signals",label:"Signals"},{id:"research",label:"Research"},{id:"status",label:"Email Status"}].map((t) => (
                <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.label}</button>
              ))}
            </div>
            <div className="tab-content">
              {activeTab === "signals" && <div className="content-section"><pre className="json-display">{JSON.stringify(result.signals, null, 2)}</pre></div>}
              {activeTab === "research" && <div className="content-section"><div className="research-display">{result.research}</div></div>}
              {activeTab === "status" && <div className="content-section"><div className="status-content"><p className="status-text">{result.email_status || "Status pending"}</p></div></div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
