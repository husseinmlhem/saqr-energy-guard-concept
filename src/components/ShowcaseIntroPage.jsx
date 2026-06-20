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
        maxWidth: '850px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. SAQR Brand Logo (Moved higher and larger) */}
      <div style={{ marginBottom: '3.5rem', marginTop: '-4vh' }}>
        <img 
          src={SAQR_ASSETS.logo} 
          alt="SAQR Logo" 
          style={{ height: '48px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* 2. One line creator credit */}
      <p 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          letterSpacing: '1.5px',
          margin: '0 0 3rem 0',
          textTransform: 'uppercase',
          lineHeight: '1.6'
        }}
      >
        An applied fictional case study by <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', textShadow: '0 0 12px rgba(0, 255, 213, 0.45)' }}>Hussein Mlhem</span>.
      </p>

      {/* 4. Single Inline Deliverable List */}
      <div 
        style={{
          fontFamily: 'var(--font-hud)',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          margin: '0 0 3.5rem 0',
          lineHeight: '2',
          letterSpacing: '0.5px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem 0.75rem'
        }}
      >
        <span>Interactive Website</span>
        <span style={{ color: 'var(--text-muted)' }}>•</span>
        <span style={{ color: 'var(--accent-cyan)', fontWeight: 'bold', textShadow: '0 0 10px rgba(0, 255, 213, 0.4)' }}>Cinematic Product Video</span>
        <span style={{ color: 'var(--text-muted)' }}>•</span>
        <span>Product Presentation</span>
      </div>

      {/* 5. One Main CTA */}
      <div style={{ marginBottom: '4rem' }}>
        <button 
          onClick={onEnterExperience} 
          className="btn-primary" 
          style={{ padding: '1rem 3rem', fontSize: '0.85rem', letterSpacing: '1.5px' }}
        >
          Enter Product Experience
        </button>
      </div>

      {/* 6. Tiny Muted Bottom Note */}
      <div 
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          opacity: 0.6
        }}
      >
        Fictional concept created for portfolio and job evaluation.
      </div>
    </div>
  );
}
