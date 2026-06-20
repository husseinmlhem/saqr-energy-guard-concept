import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function ProductHero({ onExploreClick, onBackToShowcase }) {
  return (
    <section 
      style={{ 
        backgroundColor: '#050507',
        position: 'relative',
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        padding: '0 clamp(20px, 8vw, 120px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        borderBottom: '1px solid var(--border-color)'
      }}
    >
      {/* Cinematic Background Image (full brightness and dominant) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${SAQR_ASSETS.mainHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 1.0,
          zIndex: 1
        }}
      />
      
      {/* Subtle Vignette & Left-Side Darkening Overlay for text legibility */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to right, rgba(5, 5, 7, 0.85) 0%, rgba(5, 5, 7, 0.4) 50%, transparent 100%), linear-gradient(to bottom, transparent 60%, rgba(5, 5, 7, 0.9) 100%)',
          zIndex: 2
        }}
      />

      {/* Left-aligned content container */}
      <div 
        style={{ 
          zIndex: 10, 
          position: 'relative',
          maxWidth: '550px',
          textAlign: 'left'
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '1.5rem' }}>
          <img 
            src={SAQR_ASSETS.logo} 
            alt="SAQR Logo" 
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>

        {/* Badge */}
        <div style={{ marginBottom: '1rem' }}>
          <span className="badge-concept" style={{ letterSpacing: '2.5px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Applied Fictional Case Study
          </span>
        </div>
        
        {/* Title */}
        <h1 
          style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 3.8rem)', 
            fontWeight: 900,
            marginBottom: '1rem', 
            lineHeight: '1.1', 
            color: 'var(--text-primary)',
            textShadow: '0 4px 15px rgba(0,0,0,0.9)' 
          }}
        >
          SAQR Energy Guard
        </h1>

        {/* Subtitle */}
        <p 
          style={{ 
            fontSize: '1.15rem', 
            fontWeight: 300, 
            color: 'var(--text-secondary)',
            marginBottom: '3rem', 
            lineHeight: '1.6', 
            textShadow: '0 2px 10px rgba(0,0,0,0.9)' 
          }}
        >
          A fictional dual-device concept for futuristic environmental intelligence.
        </p>
        
        {/* CTAs */}
        <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
          <button 
            onClick={onExploreClick} 
            className="btn-primary" 
            style={{ padding: '1rem 2.5rem', fontSize: '0.85rem', letterSpacing: '1px' }}
          >
            Begin Experience
          </button>
          <button 
            onClick={onBackToShowcase} 
            className="btn-secondary" 
            style={{ padding: '1rem 2.5rem', fontSize: '0.85rem', letterSpacing: '1px' }}
          >
            Back to Showcase
          </button>
        </div>
      </div>
    </section>
  );
}
