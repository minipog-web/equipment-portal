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
        <a href="/admin" className="admin-link">Admin Dashboard</a>
      </footer>
    </main>
  );
}
