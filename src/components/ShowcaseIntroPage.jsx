import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function ShowcaseIntroPage({ onEnterExperience }) {
  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Small Centered SAQR Logo */}
      <div style={{ marginBottom: '1.25rem' }}>
        <img 
          src={SAQR_ASSETS.logo} 
          alt="SAQR Logo" 
          style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* 2. One Short Line */}
      <p 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--accent-blue)',
          letterSpacing: '1.5px',
          margin: '0 0 2rem 0',
          textTransform: 'uppercase'
        }}
      >
        An applied fictional case study by Hussein Mlhem.
      </p>

      {/* 3. Small Heading */}
      <h2 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          margin: '0 0 1rem 0',
          fontWeight: 500
        }}
      >
        Review three deliverables
      </h2>

      {/* 4. Three Deliverables in ONE row on desktop */}
      <div className="showcase-deliverables-grid">
        {/* Interactive Website */}
        <div 
          style={{
            padding: '1.5rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '110px'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>01 // WEB</span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Interactive Website</h3>
        </div>

        {/* Product Presentation */}
        <div 
          style={{
            padding: '1.5rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.4)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '110px'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>02 // DECK</span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Product Presentation</h3>
        </div>

        {/* Cinematic Product Video (Highlighted) */}
        <div 
          style={{
            padding: '1.5rem 1rem',
            border: '1px solid rgba(0, 255, 213, 0.3)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.5)',
            boxShadow: '0 0 15px rgba(0, 255, 213, 0.08)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '110px',
            position: 'relative'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>03 // Featured</span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Cinematic Product Video</h3>
        </div>
      </div>

      {/* 5. One Main CTA Button */}
      <div style={{ marginBottom: '3.5rem' }}>
        <button 
          onClick={onEnterExperience} 
          className="btn-primary" 
          style={{ padding: '0.9rem 2.5rem', fontSize: '0.85rem' }}
        >
          Enter Product Experience
        </button>
      </div>

      {/* 6. Tiny Muted Bottom Note */}
      <div 
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          opacity: 0.7
        }}
      >
        Fictional concept created for portfolio and job evaluation.
      </div>
    </div>
  );
}

