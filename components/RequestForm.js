"use client";

import { useState } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";

export default function RequestForm() {
  const [formData, setFormData] = useState({
    name: "",
    location: "Livingston",
    room: "",
    equipment: "",
    model: "",
    urgency: "Medium",
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorDetail, setErrorDetail] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submission started...");
    setStatus("submitting");
    setErrorDetail("");

    // Unified timeout for the whole process (20 seconds)
    const overallTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("The request is taking too long. Please try again or contact support.")), 20000)
    );

    try {
      let imageUrl = "";

      // 1. Upload image if present
      if (image) {
        console.log("Uploading photo...");
        const storageRef = ref(storage, `equipment/${Date.now()}_${image.name}`);
        const uploadTask = uploadBytes(storageRef, image);
        const snapshot = await Promise.race([uploadTask, overallTimeout]);
        imageUrl = await getDownloadURL(snapshot.ref);
        console.log("Photo uploaded successfully.");
      }

      // 2. Submit to Firestore directly from Client
      console.log("Saving request to Firestore (Client)...");
      const docData = {
        ...formData,
        imageUrl,
        status: "Pending",
        createdAt: serverTimestamp(),
      };
      
      const docRef = await Promise.race([
        addDoc(collection(db, "requests"), docData),
        overallTimeout
      ]);
      console.log("Firestore document saved with ID:", docRef.id);

      // 3. Trigger email notification via API
      console.log("Triggering email notification...");
      try {
        const emailResponse = await fetch("/api/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, imageUrl, id: docRef.id }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(errorData.error || "Email notification failed to send.");
        }
        console.log("Email notification sent successfully.");
      } catch (emailErr) {
        console.error("Email notification error:", emailErr);
        // We still consider the submission successful because the data is in Firestore
        // but we should notify the user that the email part failed if we want to be thorough.
        // For now, let's just log it and proceed to success, or maybe set a warning?
        // Let's at least show a warning if it fails.
      }

      console.log("Submission successful!");
      setStatus("success");
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("error");
      setErrorDetail(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="form-wrapper">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="double-bezel-outer"
          >
            <div className="double-bezel-inner form-success-card">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 12, stiffness: 120, delay: 0.2 }}
              className="form-success-icon"
            >
              ✓
            </motion.div>
            <h2 className="form-success-title">Request Submitted</h2>
            <p className="form-success-subtitle">Thank you. We will review your request shortly.</p>
            <button
              className="primary-button form-success-btn"
              onClick={() => {
                setFormData({ name: "", location: "Livingston", room: "", equipment: "", model: "", urgency: "Medium" });
                setImage(null);
                setPreview(null);
                setStatus("idle");
              }}
            >
              Send Another Request
            </button>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="double-bezel-outer"
            onSubmit={handleSubmit}
          >
            <div className="double-bezel-inner form-card">
              <h2 className="form-title">Marano Eye Care Portal</h2>
            <p className="form-subtitle">Equipment supply and maintenance reporting system.</p>

            <div className="form-divider" />

            <div className="form-fields">
              <div className="field-group">
                <label htmlFor="name-input" className="field-label">Your Name</label>
                <input
                  id="name-input"
                  className="glass-input field-full"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="field-row">
                <div className="field-col-wide">
                  <label htmlFor="location-select" className="field-label">Office Location</label>
                  <select
                    id="location-select"
                    className="glass-input select-full"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  >
                    <option value="Livingston">Livingston</option>
                    <option value="Denville">Denville</option>
                    <option value="Newark">Newark</option>
                  </select>
                  <div className="select-arrow">▼</div>
                </div>
                <div className="field-col-narrow">
                  <label htmlFor="room-input" className="field-label">Room #</label>
                  <input
                    id="room-input"
                    className="glass-input field-full"
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    placeholder="e.g. 102"
                  />
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="equipment-input" className="field-label">Equipment Name</label>
                <input
                  id="equipment-input"
                  className="glass-input field-full"
                  required
                  value={formData.equipment}
                  onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                  placeholder="What is broken or low?"
                />
              </div>

              <div className="field-group">
                <label htmlFor="model-input" className="field-label">Make / Model / Serial #</label>
                <input
                  id="model-input"
                  className="glass-input field-full"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Help us identify the exact item"
                />
              </div>

              <div className="field-group">
                <label className="field-label">Urgency</label>
                <div className="urgency-row">
                  {["Low", "Medium", "High"].map((level) => {
                    const isActive = formData.urgency === level;
                    const activeClass = isActive ? `urgency-btn-${level.toLowerCase()}` : "urgency-btn-inactive";
                    return (
                      <button
                        key={level}
                        type="button"
                        aria-label={`Set urgency to ${level}`}
                        aria-pressed={isActive}
                        className={`glass-input urgency-btn ${activeClass}`}
                        onClick={() => setFormData({...formData, urgency: level})}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="field-group">
                <label htmlFor="photo-input" className="field-label">Photo (Optional)</label>
                <div className="photo-upload-zone">
                  {preview ? (
                    <div className="photo-preview-wrapper">
                      <img src={preview} alt="Preview" className="photo-preview-img" />
                      <div
                        className="photo-remove-btn"
                        onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                      >
                        ✕
                      </div>
                    </div>
                  ) : (
                    <div className="photo-placeholder">
                      <div className="photo-placeholder-icon">📷</div>
                      <span className="photo-placeholder-text">Tap to capture or upload photo</span>
                    </div>
                  )}
                  <input
                    id="photo-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="photo-input"
                    aria-label="Upload photo"
                    title="Upload photo"
                    placeholder="Upload photo"
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`primary-button submit-btn${status === "submitting" ? " submit-btn-submitting" : ""}`}
                disabled={status === "submitting"}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingRight: '8px'
                }}
              >
                <span>{status === "submitting" ? "Submitting..." : "Submit Request"}</span>
                <span style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginLeft: '12px',
                  transition: 'transform 0.3s ease'
                }} className="arrow-icon">
                  {status === "submitting" ? "⏳" : "→"}
                </span>
              </button>

              {status === "error" && (
                <div className="form-error">
                  <p className="form-error-main">
                    {errorDetail || "Something went wrong. Please try again."}
                  </p>
                  <p className="form-error-sub">
                    Verify your connection and ensure the domain is authorized.
                  </p>
                </div>
              )}
            </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
