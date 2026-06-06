"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

export default function RequestTracker() {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs = [];
      querySnapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() });
      });
      setRequests(docs);
      setLoading(false);
    }, (error) => {
      console.error("Firestore tracker error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const matchesSearch = (req) => {
    const search = searchTerm.toLowerCase();
    return (
      req.name?.toLowerCase().includes(search) ||
      req.equipment?.toLowerCase().includes(search) ||
      req.location?.toLowerCase().includes(search) ||
      req.model?.toLowerCase().includes(search) ||
      req.status?.toLowerCase().includes(search)
    );
  };

  const filteredRequests = requests
    .filter((req) => req.status !== "Resolved")
    .filter(matchesSearch);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return {
          color: "#fbbf24",
          borderColor: "rgba(251, 191, 36, 0.3)",
          bg: "rgba(251, 191, 36, 0.06)",
          shadow: "0 0 10px rgba(251, 191, 36, 0.15)"
        };
      case "In Progress":
        return {
          color: "#06b6d4",
          borderColor: "rgba(6, 182, 212, 0.3)",
          bg: "rgba(6, 182, 212, 0.06)",
          shadow: "0 0 10px rgba(6, 182, 212, 0.15)"
        };
      case "Resolved":
        return {
          color: "#10b981",
          borderColor: "rgba(16, 185, 129, 0.3)",
          bg: "rgba(16, 185, 129, 0.06)",
          shadow: "0 0 10px rgba(16, 185, 129, 0.15)"
        };
      default:
        return {
          color: "var(--text-muted)",
          borderColor: "var(--glass-border)",
          bg: "rgba(255, 255, 255, 0.02)",
          shadow: "none"
        };
    }
  };

  const getTimeAgo = (createdAt) => {
    if (!createdAt) return "...";
    const now = new Date();
    const created = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
    const diffInMins = Math.floor((now - created) / (1000 * 60));
    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    const diffInHours = Math.floor(diffInMins / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return created.toLocaleDateString();
  };

  return (
    <div className="double-bezel-outer tracker-card" style={{ padding: '8px' }}>
      <div className="double-bezel-inner" style={{ padding: '32px' }}>
        <div className="tracker-header">
          <div>
          <h3 className="tracker-title">Live Request Tracker</h3>
          <p className="tracker-subtitle">Monitor real-time repair status, technicians, and case notes.</p>
        </div>

        <div className="tracker-search-wrapper">
          <input
            id="tracker-search"
            aria-label="Search requests"
            className="glass-input tracker-search"
            placeholder="Search equipment, name, location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="tracker-search-icon">🔍</div>
        </div>
      </div>

      <div className="tracker-divider" />

      {loading ? (
        <div className="tracker-loading">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="tracker-spinner"
          />
          <span className="tracker-loading-text">Loading requests feed...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="tracker-empty">No matching equipment reports found.</div>
      ) : (
        <div className="tracker-list">
          <AnimatePresence>
            {filteredRequests.map((req, idx) => {
              const statusStyle = getStatusStyle(req.status);
              return (
                <motion.div
                  key={req.id || idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                  className="tracker-item"
                >
                  <div className="tracker-item-top">
                    <div>
                      <h4 className="tracker-item-name">
                        {req.equipment} {req.model && <span className="tracker-item-model">({req.model})</span>}
                      </h4>
                      <p className="tracker-item-location">{req.location} (Room {req.room})</p>
                    </div>

                    <div className="tracker-item-meta">
                      <span className="tracker-item-time">{getTimeAgo(req.createdAt)}</span>
                      <span
                        className="tracker-status-badge"
                        style={{
                          color: statusStyle.color,
                          border: `1px solid ${statusStyle.borderColor}`,
                          background: statusStyle.bg,
                          boxShadow: statusStyle.shadow,
                        }}
                      >
                        {req.status}
                      </span>
                    </div>
                  </div>

                  <div className="tracker-item-details">
                    <div className="tracker-detail-row">
                      <span className="tracker-detail-icon">👤</span>
                      {req.claimedBy ? (
                        <span className="tracker-assigned">Assigned Tech: <strong style={{ color: 'white' }}>{req.claimedBy}</strong></span>
                      ) : (
                        <span className="tracker-unassigned">Awaiting technical dispatch</span>
                      )}
                    </div>

                    <div className="tracker-detail-comment-row">
                      <span className="tracker-detail-comment-icon">💬</span>
                      <p className={`tracker-comment ${req.caseDetails ? 'tracker-comment-filled' : 'tracker-comment-empty'}`}>
                        {req.caseDetails || "No updates logged by technician yet."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      </div>
    </div>
  );
}
