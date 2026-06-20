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
        padding: '1rem 1.5rem', // moved elements higher by reducing top/bottom padding
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. Small Centered SAQR Logo (moved higher) */}
      <div style={{ marginBottom: '2.5rem', marginTop: '-2rem' }}>
        <img 
          src={SAQR_ASSETS.logo} 
          alt="SAQR Logo" 
          style={{ height: '30px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* 2. One Short Line (with highlighted creator name) */}
      <p 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          letterSpacing: '1.5px',
          margin: '0 0 2.5rem 0',
          textTransform: 'uppercase'
        }}
      >
        An applied fictional case study by <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', textShadow: '0 0 8px var(--accent-cyan-glow)' }}>Hussein Mlhem</span>.
      </p>

      {/* 3. Small Heading */}
      <h2 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          margin: '0 0 1.25rem 0',
          fontWeight: 600
        }}
      >
        Review three deliverables
      </h2>

      {/* 4. Three Deliverables in ONE row on desktop (Cinematic video in center and highlighted) */}
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
          <h3 style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Interactive Website</h3>
        </div>

        {/* Cinematic Product Video (Highlighted Center Card) */}
        <div 
          style={{
            padding: '1.5rem 1rem',
            border: '1px solid rgba(0, 255, 213, 0.4)',
            borderRadius: '6px',
            backgroundColor: 'rgba(12, 20, 25, 0.6)',
            boxShadow: '0 0 20px rgba(0, 255, 213, 0.12)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '115px', // slightly taller to stand out
            transform: 'scale(1.03)',
            position: 'relative',
            zIndex: 2
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.4rem', fontWeight: 'bold' }}>02 // Featured</span>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Cinematic Product Video</h3>
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
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>03 // DECK</span>
          <h3 style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Product Presentation</h3>
        </div>
      </div>

      {/* 5. One Main CTA Button */}
      <div style={{ marginBottom: '2.5rem' }}>
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

