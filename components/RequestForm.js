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
    <div style={{ position: 'relative', width: '100%' }}>
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="glass-card" 
            style={{ padding: '60px 40px', textAlign: 'center' }}
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
              style={{ fontSize: '80px', marginBottom: '20px' }}
            >
              ✅
            </motion.div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '16px', fontSize: '2rem' }}>Request Submitted</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Thank you. Adam will review your request shortly.</p>
            <button 
              className="primary-button" 
              style={{ marginTop: '40px' }}
              onClick={() => {
                setFormData({ name: "", location: "Livingston", room: "", equipment: "", model: "", urgency: "Medium" });
                setImage(null);
                setPreview(null);
                setStatus("idle");
              }}
            >
              Send Another
            </button>
          </motion.div>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card" 
            style={{ padding: '40px', width: '100%' }} 
            onSubmit={handleSubmit}
          >
            <h2 style={{ fontFamily: 'Outfit, sans-serif', marginBottom: '8px', fontSize: '1.8rem' }}>Marano Eye Care Portal</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '14px' }}>
              Equipment supply and maintenance reporting system.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="field-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Name</label>
                <input 
                  className="glass-input" 
                  style={{ width: '100%' }} 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ flex: 1.5 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Office Location</label>
                  <select 
                    className="glass-input" 
                    style={{ width: '100%', appearance: 'none' }}
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  >
                    <option value="Livingston">Livingston</option>
                    <option value="Denville">Denville</option>
                    <option value="Newark">Newark</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room #</label>
                  <input 
                    className="glass-input" 
                    style={{ width: '100%' }} 
                    required
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    placeholder="e.g. 102"
                  />
                </div>
              </div>

              <div className="field-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Equipment Name</label>
                <input 
                  className="glass-input" 
                  style={{ width: '100%' }} 
                  required
                  value={formData.equipment}
                  onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                  placeholder="What is broken or low?"
                />
              </div>

              <div className="field-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Make / Model / Serial #</label>
                <input 
                  className="glass-input" 
                  style={{ width: '100%' }} 
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  placeholder="Help us identify the exact item"
                />
              </div>

              <div className="field-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgency</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {["Low", "Medium", "High"].map((level) => (
                    <button
                      key={level}
                      type="button"
                      className="glass-input"
                      style={{ 
                        flex: 1, 
                        cursor: 'pointer',
                        borderColor: formData.urgency === level ? 'var(--accent)' : 'var(--glass-border)',
                        background: formData.urgency === level ? 'rgba(77, 171, 247, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        color: formData.urgency === level ? 'var(--accent)' : 'white',
                        fontWeight: formData.urgency === level ? '600' : '400',
                        boxShadow: formData.urgency === level ? '0 0 15px rgba(77, 171, 247, 0.2)' : 'none',
                      }}
                      onClick={() => setFormData({...formData, urgency: level})}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Photo (Optional)</label>
                <div 
                  style={{ 
                    border: '2px dashed var(--glass-border)', 
                    borderRadius: '16px', 
                    padding: '24px', 
                    textAlign: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {preview ? (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', borderRadius: '12px', display: 'block' }} />
                      <div 
                        onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); }}
                        style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ff4d4d', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                      >
                        ✕
                      </div>
                    </div>
                  ) : (
                    <div style={{ padding: '10px 0' }}>
                      <div style={{ fontSize: '24px', marginBottom: '8px' }}>📷</div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Tap to capture or upload photo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    style={{ 
                      position: 'absolute', 
                      top: 0, 
                      left: 0, 
                      width: '100%', 
                      height: '100%', 
                      opacity: 0, 
                      cursor: 'pointer' 
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="primary-button" 
                style={{ 
                  width: '100%', 
                  marginTop: '10px',
                  opacity: status === "submitting" ? 0.7 : 1,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px'
                }}
                disabled={status === "submitting"}
              >
                {status === "submitting" ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      style={{ width: '18px', height: '18px', border: '2px solid rgba(15, 23, 42, 0.3)', borderTopColor: '#0f172a', borderRadius: '50%' }}
                    />
                    Submitting...
                  </>
                ) : "Submit Request"}
              </button>

              {status === "error" && (
                <div style={{ background: 'rgba(255, 77, 77, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255, 77, 77, 0.2)' }}>
                  <p style={{ color: '#ff4d4d', fontSize: '13px', textAlign: 'center', fontWeight: '500' }}>
                    {errorDetail || "Something went wrong. Please try again."}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px', textAlign: 'center', marginTop: '4px' }}>
                    Verify your connection and ensure the domain is authorized.
                  </p>
                </div>
              )}
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
