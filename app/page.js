"use client";
import RequestForm from "@/components/RequestForm";
import RequestTracker from "@/components/RequestTracker";
import Image from "next/image";

export default function Home() {
  return (
    <main className="page-main">
      <div className="page-logo-wrapper">
        <Image 
          src="/logo.png" 
          alt="Marano Eye Care Logo" 
          width={300} 
          height={100} 
          className="page-logo"
          priority
        />
      </div>
      
      <div className="portal-grid">
        <div className="portal-grid-col">
          <RequestForm />
        </div>
        <div className="portal-grid-col">
          <RequestTracker />
        </div>
      </div>
      
      <footer className="page-footer">
        <p>made by Adam B. Pogash</p>
        <a href="/admin" className="admin-link">
          <svg className="admin-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="4 17 10 11 4 5" />
            <line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          Admin Dashboard
        </a>
      </footer>
    </main>
  );
}
