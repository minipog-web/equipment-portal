"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global boundary caught error:", error);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>System Error | Marano Eye Care</title>
      </head>
      <body>
        <main className="error-container">
          <div className="glass-card error-card">
            <div className="error-icon">⚠️</div>
            <h2 className="error-title">Application Error</h2>
            <p className="error-text">
              A critical error has occurred. The portal team has been notified.
            </p>
            <button className="primary-button" onClick={() => reset()}>
              Recover Application
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
