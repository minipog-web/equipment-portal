"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [filter, setFilter] = useState("Open");
  const [password, setPassword] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
    const adminPass = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
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
                <tr key={req.id} className={req.status === 'Resolved' ? 'completed-row' : ''} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'all 0.2s' }}>
                  <td style={{ padding: '20px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{req.equipment}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{req.model || 'No model specified'}</div>
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
                          {req.status === 'Pending' && (
                            <button 
                              className="action-button" 
                              onClick={() => updateStatus(req.id, 'In Progress')}
                            >
                              ⚙️ Start
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
