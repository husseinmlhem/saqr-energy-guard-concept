import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function ShowcaseIntroPage({ onEnterExperience }) {
  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '30px 1.5rem 40px',
        position: 'relative',
        zIndex: 10,
        maxWidth: '1000px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* 1. SAQR Brand Logo (Logo.png - Moved to the very top and made larger) */}
      <div style={{ marginTop: '10px', marginBottom: '1.5rem' }}>
        <img 
          src={SAQR_ASSETS.homepageLogo} 
          alt="SAQR Logo" 
          style={{ height: '100px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* Center content container for case study line & deliverables */}
      <div 
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2.5rem',
          margin: 'auto 0'
        }}
      >
        {/* 2. One line creator credit (increased size and highlighted creator name) */}
        <p 
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(22px, 2.2vw, 36px)',
            color: 'var(--text-secondary)',
            letterSpacing: '0.04em',
            margin: 0,
            textTransform: 'uppercase',
            lineHeight: 1.3,
            fontWeight: 300,
            maxWidth: '900px'
          }}
        >
          An applied fictional case study by <span style={{ color: '#00ffd5', fontWeight: '700', textShadow: '0 0 15px rgba(0, 255, 213, 0.8), 0 0 25px rgba(0, 255, 213, 0.5)' }}>Hussein Mlhem</span>.
        </p>

        {/* 3. Small Heading */}
        <h2 
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            margin: '0.5rem 0 0 0',
            fontWeight: 600
          }}
        >
          Review three deliverables
        </h2>

        {/* 4. Single Inline Deliverable List with Numbers */}
        <div 
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: '0.9rem',
            color: 'var(--text-secondary)',
            margin: 0,
            lineHeight: '2',
            letterSpacing: '0.5px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem 2.25rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>[01]</span>
            <span>Interactive Website</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: '#00ffd5', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 255, 213, 0.3)' }}>[02]</span>
            <span style={{ color: '#00ffd5', fontWeight: 'bold', textShadow: '0 0 8px rgba(0, 255, 213, 0.3)' }}>Cinematic Product Video</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>[03]</span>
            <span>Product Presentation</span>
          </div>
        </div>

        {/* 5. One Main CTA */}
        <div style={{ marginTop: '1rem' }}>
          <button 
            onClick={onEnterExperience} 
            className="btn-primary" 
            style={{ padding: '1rem 3.5rem', fontSize: '0.85rem', letterSpacing: '1.5px' }}
          >
            Enter Product Experience
          </button>
        </div>
      </div>

      {/* 6. Tiny Muted Bottom Note */}
      <div 
        style={{
          marginTop: '2rem',
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
