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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
        <form className="glass-card" style={{ padding: '48px 40px', textAlign: 'center', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }} onSubmit={handleLogin}>
          <h2 style={{ 
            fontFamily: 'Outfit, sans-serif', 
            fontSize: '2rem',
            background: 'linear-gradient(135deg, #ffffff 30%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: '700',
            letterSpacing: '-0.02em',
            marginBottom: '4px'
          }}>
            Admin Console
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
            Authorized personnel access only.
          </p>
          <input 
            type="password" 
            className="glass-input" 
            placeholder="Enter credentials..." 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: '16px', width: '100%', textAlign: 'center', letterSpacing: '0.1em' }}
          />
          <button className="primary-button" style={{ width: '100%' }} type="submit">Authenticate</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '60px 20px', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ 
            fontFamily: 'Outfit, sans-serif',
            fontSize: '2.2rem',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #ffffff 40%, #a5b4fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em'
          }}>
            Marano Eye Care Admin
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>Tracking equipment and maintenance requests</p>
        </div>
        <button 
          type="button"
          className="action-button" 
          style={{ 
            cursor: 'pointer',
            padding: '10px 20px',
            borderColor: 'rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            background: 'rgba(239, 68, 68, 0.05)'
          }} 
          onClick={() => setAuthenticated(false)}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
            e.currentTarget.style.borderColor = '#ef4444';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(239, 68, 68, 0.15)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          🔒 Logout
        </button>
      </header>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', marginBottom: '48px' }}>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-secondary) 100%)', boxShadow: '0 1px 10px var(--accent-glow)' }} />
          <div style={{ fontSize: '11px', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px' }}>Open Requests</div>
          <div style={{ fontSize: '2.8rem', fontWeight: '700', color: 'var(--accent)', fontFamily: 'Outfit, sans-serif', lineHeight: '1.2' }}>{openRequests.length}</div>
          <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text-muted)' }}>Active maintenance</div>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)', boxShadow: '0 1px 10px rgba(52, 211, 153, 0.3)' }} />
          <div style={{ fontSize: '11px', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px' }}>Resolved</div>
          <div style={{ fontSize: '2.8rem', fontWeight: '700', color: '#34d399', fontFamily: 'Outfit, sans-serif', lineHeight: '1.2' }}>{completedRequests.length}</div>
          <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text-muted)' }}>Task completed</div>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: completionRate > 80 ? 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' : 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)', boxShadow: completionRate > 80 ? '0 1px 10px rgba(52, 211, 153, 0.3)' : '0 1px 10px rgba(251, 191, 36, 0.3)' }} />
          <div style={{ fontSize: '11px', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px' }}>Completion Rate</div>
          <div style={{ fontSize: '2.8rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif', lineHeight: '1.2', color: completionRate > 80 ? '#34d399' : '#fbbf24' }}>{completionRate}%</div>
          <div style={{ 
            height: '5px', 
            background: 'rgba(255,255,255,0.03)', 
            borderRadius: '3px', 
            marginTop: '12px',
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ 
              width: `${completionRate}%`, 
              height: '100%', 
              background: completionRate > 80 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f59e0b, #fbbf24)',
              transition: 'width 1s ease-out'
            }} />
          </div>
        </div>
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #8b5cf6 0%, #c084fc 100%)', boxShadow: '0 1px 10px rgba(192, 132, 252, 0.3)' }} />
          <div style={{ fontSize: '11px', color: 'var(--text-label)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600', marginBottom: '8px' }}>Total Volume</div>
          <div style={{ fontSize: '2.8rem', fontWeight: '700', fontFamily: 'Outfit, sans-serif', color: '#c084fc', lineHeight: '1.2' }}>{requests.length}</div>
          <div style={{ fontSize: '11px', marginTop: '6px', color: 'var(--text-muted)' }}>Lifetime requests</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {["Open", "Completed", "All"].map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className="glass-input"
              style={{ 
                cursor: 'pointer',
                background: filter === f ? 'rgba(6, 182, 212, 0.12)' : 'rgba(255, 255, 255, 0.01)',
                borderColor: filter === f ? 'var(--accent)' : 'var(--glass-border)',
                color: filter === f ? 'var(--accent)' : 'var(--text-label)',
                fontWeight: filter === f ? '600' : '400',
                padding: '8px 24px',
                boxShadow: filter === f ? '0 0 12px var(--accent-glow)' : 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => {
                if (filter !== f) {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                }
              }}
              onMouseOut={(e) => {
                if (filter !== f) {
                  e.currentTarget.style.borderColor = 'var(--glass-border)';
                  e.currentTarget.style.color = 'var(--text-label)';
                }
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <div style={{ flex: 1, maxWidth: '400px', minWidth: '260px' }}>
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
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-label)' }}>
          <p>Loading requests...</p>
        </div>
      ) : (
        <div className="glass-card" style={{ overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-label)', letterSpacing: '0.08em' }}>Equipment</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-label)', letterSpacing: '0.08em' }}>Requester</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-label)', letterSpacing: '0.08em' }}>Location</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-label)', letterSpacing: '0.08em' }}>Date</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-label)', letterSpacing: '0.08em' }}>Urgency</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-label)', letterSpacing: '0.08em' }}>Status</th>
                <th style={{ padding: '20px 24px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-label)', letterSpacing: '0.08em' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <Fragment key={req.id}>
                  <tr className={req.status === 'Resolved' ? 'completed-row' : ''} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', transition: 'all 0.2s' }}>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{req.equipment}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{req.model || 'No model specified'}</div>
                      {req.claimedBy && (
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ 
                            fontSize: '11px', 
                            fontWeight: '600', 
                            color: 'var(--accent)', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '4px',
                            background: 'rgba(6, 182, 212, 0.08)',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            border: '1px solid rgba(6, 182, 212, 0.15)',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 0 10px rgba(6, 182, 212, 0.05)'
                          }}>
                            🛠️ Claimed by {req.claimedBy}
                          </span>
                          {req.caseDetails && (
                            <div style={{ 
                              fontSize: '12px', 
                              color: 'var(--text-label)', 
                              background: 'rgba(11, 15, 25, 0.4)', 
                              padding: '10px 14px', 
                              borderRadius: '12px', 
                              border: '1px solid rgba(255, 255, 255, 0.03)',
                              borderLeft: '3px solid var(--accent)',
                              marginTop: '8px',
                              maxWidth: '320px',
                              whiteSpace: 'pre-wrap',
                              lineHeight: '1.4',
                              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                            }}>
                              {req.caseDetails}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontWeight: '600', color: 'var(--accent)' }}>{req.name}</div>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontWeight: '500' }}>{req.location}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Room {req.room}</div>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ fontWeight: '500', fontSize: '13px' }} title={getFullDate(req.createdAt)}>
                        {getTimeOpen(req.createdAt)}
                      </div>
                      {req.status === 'Resolved' && (
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Resolved: {getResolvedDate(req.resolvedAt)}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '24px' }}>
                      <span style={{ 
                        color: req.urgency === 'High' ? '#f87171' : req.urgency === 'Medium' ? '#fbbf24' : '#34d399',
                        fontWeight: 'bold',
                        fontSize: '13px'
                      }}>
                        {req.urgency === 'High' ? '🔴' : req.urgency === 'Medium' ? '🟡' : '🟢'} {req.urgency}
                      </span>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <span className={`status-badge status-${req.status === 'In Progress' ? 'progress' : req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td style={{ padding: '24px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {req.status !== 'Resolved' && (
                          <>
                            <button 
                              type="button"
                              className="action-button action-resolve" 
                              title="Mark as Resolved"
                              onClick={() => updateStatus(req.id, 'Resolved')}
                            >
                              ✅ Resolve
                            </button>
                            {!req.claimedBy && (
                              <button 
                                type="button"
                                className="action-button" 
                                style={{ borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--accent)' }}
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
                                type="button"
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
                            type="button"
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
                    <tr style={{ background: 'rgba(6, 182, 212, 0.02)' }}>
                      <td colSpan={7} style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ 
                          background: 'rgba(11, 15, 25, 0.6)', 
                          border: '1px solid rgba(6, 182, 212, 0.25)', 
                          borderRadius: '20px', 
                          padding: '24px',
                          maxWidth: '600px',
                          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(6, 182, 212, 0.05)',
                          backdropFilter: 'blur(10px)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{ position: 'absolute', left: 0, top: 0, width: '4px', height: '100%', background: 'var(--accent)' }} />
                          <h4 style={{ color: 'var(--accent)', marginBottom: '16px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'Outfit, sans-serif', fontWeight: '600' }}>
                            🛠️ {req.claimedBy ? "Edit Claim Details" : "Claim & Update Case Details"}
                          </h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-label)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 'bold' }}>Your Name</label>
                              <input 
                                className="glass-input" 
                                style={{ width: '100%', padding: '10px 14px', fontSize: '13px' }} 
                                placeholder="Who is claiming this request?"
                                value={claimerName}
                                onChange={(e) => setClaimerName(e.target.value)}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-label)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 'bold' }}>Case Details / Action Plan</label>
                              <textarea 
                                className="glass-input" 
                                style={{ width: '100%', padding: '10px 14px', fontSize: '13px', fontFamily: 'inherit', minHeight: '90px', resize: 'vertical' }} 
                                placeholder="What is your plan or progress? (e.g. Ordered replacement bulb, arriving Tuesday)"
                                value={caseDetails}
                                onChange={(e) => setCaseDetails(e.target.value)}
                              />
                            </div>
                            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '4px' }}>
                              <button 
                                type="button"
                                className="action-button" 
                                style={{ padding: '8px 20px', borderColor: 'rgba(255,255,255,0.05)' }}
                                onClick={() => setClaimingId(null)}
                              >
                                Cancel
                              </button>
                              <button 
                                type="button"
                                className="primary-button" 
                                style={{ padding: '8px 24px', borderRadius: '10px', fontSize: '12px' }}
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
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-label)' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔎</div>
              No requests found matching your filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
