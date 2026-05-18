"use client";

import { useState, useEffect, Fragment } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [filter, setFilter] = useState("Open");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [claimingId, setClaimingId] = useState(null);
  const [claimerName, setClaimerName] = useState("");
  const [caseDetails, setCaseDetails] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedName = localStorage.getItem("claimerName");
      if (savedName) setClaimerName(savedName);
    }
  }, []);

  useEffect(() => {
    if (!authenticated) return;

    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setRequests(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "BlueSky67";
    if (password === adminPass) {
      setAuthenticated(true);
    } else {
      alert("Incorrect password");
    }
  };

  const updateStatus = async (id, newStatus) => {
    const docRef = doc(db, "requests", id);
    const updates = { status: newStatus };
    if (newStatus === "Resolved") {
      updates.resolvedAt = serverTimestamp();
    }
    await updateDoc(docRef, updates);
  };

  const handleConfirmClaim = async (id) => {
    if (!claimerName.trim()) {
      alert("Please enter your name to claim this request.");
      return;
    }
    
    const docRef = doc(db, "requests", id);
    const updates = {
      status: "In Progress",
      claimedBy: claimerName.trim(),
      caseDetails: caseDetails.trim(),
      claimedAt: serverTimestamp()
    };
    
    try {
      await updateDoc(docRef, updates);
      if (typeof window !== "undefined") {
        localStorage.setItem("claimerName", claimerName.trim());
      }
      setClaimingId(null);
    } catch (err) {
      console.error("Error claiming request:", err);
      alert("Failed to claim request. Please try again.");
    }
  };

  const openRequests = requests.filter(r => r.status === "Pending" || r.status === "In Progress");
  const completedRequests = requests.filter(r => r.status === "Resolved");
  
  const matchesSearch = (req) => {
    const search = searchTerm.toLowerCase();
    return (
      req.name?.toLowerCase().includes(search) ||
      req.equipment?.toLowerCase().includes(search) ||
      req.location?.toLowerCase().includes(search) ||
      req.model?.toLowerCase().includes(search)
    );
  };

  const filteredRequests = (filter === "All" ? requests : filter === "Open" ? openRequests : completedRequests)
    .filter(matchesSearch);

  const completionRate = requests.length > 0 
    ? Math.round((completedRequests.length / requests.length) * 100) 
    : 0;

  const getTimeOpen = (createdAt) => {
    if (!createdAt) return "...";
    const now = new Date();
    const created = createdAt.toDate();
    const diffInHours = Math.floor((now - created) / (1000 * 60 * 60));
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h open`;
    return `${Math.floor(diffInHours / 24)}d open`;
  };

  const getFullDate = (createdAt) => {
    if (!createdAt) return "...";
    return createdAt.toDate().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getResolvedDate = (resolvedAt) => {
    if (!resolvedAt) return "";
    return resolvedAt.toDate().toLocaleDateString();
  };

  if (!authenticated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <form className="glass-card" style={{ padding: '40px', textAlign: 'center' }} onSubmit={handleLogin}>
          <h2 style={{ marginBottom: '20px' }}>Admin Login</h2>
          <input 
            type="password" 
            className="glass-input" 
            placeholder="Enter password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '20px', width: '100%' }}
          />
          <button className="primary-button" style={{ width: '100%' }}>Login</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 style={{ fontFamily: 'Outfit, sans-serif' }}>Marano Eye Care Admin</h1>
          <p style={{ color: 'var(--text-muted)' }}>Tracking equipment and maintenance requests</p>
        </div>
        <button className="glass-input" style={{ cursor: 'pointer' }} onClick={() => setAuthenticated(false)}>Logout</button>
      </header>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Open Requests</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--accent)' }}>{openRequests.length}</div>
          <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--text-muted)' }}>Active maintenance</div>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid #40c057' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Resolved</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#40c057' }}>{completedRequests.length}</div>
          <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--text-muted)' }}>Task completed</div>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderTop: `4px solid ${completionRate > 80 ? '#40c057' : '#ffd43b'}` }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Completion Rate</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{completionRate}%</div>
          <div style={{ 
            height: '4px', 
            background: 'rgba(255,255,255,0.1)', 
            borderRadius: '2px', 
            marginTop: '8px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${completionRate}%`, 
              height: '100%', 
              background: completionRate > 80 ? '#40c057' : 'var(--accent)',
              transition: 'width 1s ease-out'
            }} />
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>Total Volume</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{requests.length}</div>
          <div style={{ fontSize: '10px', marginTop: '4px', color: 'var(--text-muted)' }}>Lifetime requests</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {["Open", "Completed", "All"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="glass-input"
              style={{ 
                cursor: 'pointer',
                background: filter === f ? 'rgba(114, 146, 201, 0.2)' : 'transparent',
                borderColor: filter === f ? 'var(--accent)' : 'var(--glass-border)',
                color: filter === f ? 'var(--accent)' : 'white',
                fontWeight: filter === f ? '600' : '400',
                padding: '8px 24px'
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, maxWidth: '400px' }}>
          <input 
            className="glass-input" 
            style={{ width: '100%' }} 
            placeholder="🔍 Search name, equipment, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading requests...</p>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Equipment</th>
                <th style={{ padding: '20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Requester</th>
                <th style={{ padding: '20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Location</th>
                <th style={{ padding: '20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Urgency</th>
                <th style={{ padding: '20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '20px', fontSize: '12px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <Fragment key={req.id}>
                  <tr className={req.status === 'Resolved' ? 'completed-row' : ''} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s' }}>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{req.equipment}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{req.model || 'No model specified'}</div>
                      {req.claimedBy && (
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '600', 
                            color: 'var(--accent)', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            background: 'rgba(114, 146, 201, 0.08)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            whiteSpace: 'nowrap'
                          }}>
                            🛠️ Claimed by {req.claimedBy}
                          </span>
                          {req.caseDetails && (
                            <div style={{ 
                              fontSize: '11px', 
                              color: 'var(--text-muted)', 
                              background: 'rgba(255,255,255,0.02)', 
                              padding: '6px 10px', 
                              borderRadius: '8px', 
                              borderLeft: '2px solid var(--accent)',
                              marginTop: '4px',
                              maxWidth: '300px',
                              whiteSpace: 'pre-wrap'
                            }}>
                              {req.caseDetails}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--accent)' }}>{req.name}</div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: '500' }}>{req.location}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room {req.room}</div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ fontWeight: '500', fontSize: '13px' }} title={getFullDate(req.createdAt)}>
                        {getTimeOpen(req.createdAt)}
                      </div>
                      {req.status === 'Resolved' && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Resolved: {getResolvedDate(req.resolvedAt)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span style={{ 
                        color: req.urgency === 'High' ? '#ff4d4d' : req.urgency === 'Medium' ? '#ffd43b' : '#40c057',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}>
                        {req.urgency === 'High' ? '🔴' : req.urgency === 'Medium' ? '🟡' : '🟢'} {req.urgency}
                      </span>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <span className={`status-badge status-${req.status === 'In Progress' ? 'progress' : req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {req.status !== 'Resolved' && (
                          <>
                            <button 
                              className="action-button action-resolve" 
                              title="Mark as Resolved"
                              onClick={() => updateStatus(req.id, 'Resolved')}
                            >
                              ✅ Resolve
                            </button>
                            {!req.claimedBy && (
                              <button 
                                className="action-button" 
                                style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                                onClick={() => {
                                  setClaimingId(req.id);
                                  setCaseDetails("");
                                }}
                              >
                                ⚙️ Claim
                              </button>
                            )}
                            {req.claimedBy && (
                              <button 
                                className="action-button" 
                                onClick={() => {
                                  setClaimingId(req.id);
                                  setCaseDetails(req.caseDetails || "");
                                  setClaimerName(req.claimedBy || "");
                                }}
                              >
                                📝 Edit Notes
                              </button>
                            )}
                          </>
                        )}
                        {req.imageUrl && (
                          <a href={req.imageUrl} target="_blank" className="action-button" style={{ textDecoration: 'none' }}>
                            🖼️ Photo
                          </a>
                        )}
                        {req.status === 'Resolved' && (
                          <button 
                            className="action-button" 
                            style={{ opacity: 0.5 }}
                            onClick={() => updateStatus(req.id, 'Pending')}
                          >
                            ↩️ Reopen
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {claimingId === req.id && (
                    <tr style={{ background: 'rgba(114, 146, 201, 0.03)' }}>
                      <td colSpan={7} style={{ padding: '15px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ 
                          background: 'rgba(255, 255, 255, 0.02)', 
                          border: '1px dashed var(--accent)', 
                          borderRadius: '16px', 
                          padding: '20px',
                          maxWidth: '600px',
                          boxShadow: '0 8px 32px 0 rgba(0,0,0,0.2)'
                        }}>
                          <h4 style={{ color: 'var(--accent)', marginBottom: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontFamily: 'Outfit, sans-serif' }}>
                            🛠️ {req.claimedBy ? "Edit Claim Details" : "Claim & Update Case Details"}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Your Name</label>
                              <input 
                                className="glass-input" 
                                style={{ width: '100%', padding: '8px 12px', fontSize: '13px' }} 
                                placeholder="Who is claiming this request?"
                                value={claimerName}
                                onChange={(e) => setClaimerName(e.target.value)}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 'bold' }}>Case Details / Action Plan</label>
                              <textarea 
                                className="glass-input" 
                                style={{ width: '100%', padding: '8px 12px', fontSize: '13px', fontFamily: 'inherit', minHeight: '80px', resize: 'vertical' }} 
                                placeholder="What is your plan or progress? (e.g. Ordered replacement bulb, arriving Tuesday)"
                                value={caseDetails}
                                onChange={(e) => setCaseDetails(e.target.value)}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                className="action-button" 
                                style={{ padding: '6px 16px' }}
                                onClick={() => setClaimingId(null)}
                              >
                                Cancel
                              </button>
                              <button 
                                className="primary-button" 
                                style={{ padding: '6px 20px', borderRadius: '8px', fontSize: '12px' }}
                                onClick={() => handleConfirmClaim(req.id)}
                              >
                                Confirm Claim
                              </button>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {filteredRequests.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔎</div>
              No requests found matching your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
