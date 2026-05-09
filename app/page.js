"use client";
import RequestForm from "@/components/RequestForm";
import Image from "next/image";

export default function Home() {
  return (
    <main style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '60px 20px',
      background: 'radial-gradient(circle at top right, rgba(77, 171, 247, 0.1), transparent 40%), radial-gradient(circle at bottom left, rgba(77, 171, 247, 0.05), transparent 40%)'
    }}>
      <div style={{ maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <Image 
            src="/logo.png" 
            alt="Marano Eye Care Logo" 
            width={300} 
            height={100} 
            style={{ height: 'auto', width: '100%', maxWidth: '350px' }}
            priority
          />
        </div>
        
        <RequestForm />
        
        <footer style={{ 
          marginTop: '40px', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--text-muted)', 
          fontSize: '14px', 
          opacity: 0.8,
          fontFamily: 'Inter, sans-serif'
        }}>
          <p>made by Adam B. Pogash</p>
          <a 
            href="/admin" 
            style={{ 
              color: 'var(--accent)', 
              textDecoration: 'none', 
              fontSize: '12px',
              fontWeight: '500',
              padding: '6px 16px',
              borderRadius: '20px',
              background: 'rgba(77, 171, 247, 0.05)',
              border: '1px solid rgba(77, 171, 247, 0.1)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(77, 171, 247, 0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(77, 171, 247, 0.05)'; }}
          >
            Admin Dashboard
          </a>
        </footer>
      </div>
    </main>
  );
}
