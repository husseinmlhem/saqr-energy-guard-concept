import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function ProductHero({ onExploreClick, onBackToShowcase }) {
  return (
    <section className="product-hero-section" style={{ backgroundColor: '#050507' }}>
      {/* Cinematic Background Image (full brightness and dominant) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${SAQR_ASSETS.mainHero})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.95,
          zIndex: 1
        }}
      />
      {/* Subtle Vignette Overlay for cinematic depth & text legibility */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle at center, rgba(5, 5, 7, 0.1) 0%, rgba(5, 5, 7, 0.7) 90%), linear-gradient(to bottom, rgba(5,5,7,0) 50%, rgba(5,5,7,0.9) 100%)',
          zIndex: 2
        }}
      />

      {/* Tech HUD Line overlays */}
      <div className="hero-overlay-hud" aria-hidden="true" style={{ zIndex: 10 }}>
        <div>PROT_TYP: SG-02 // SYSTEM_INTEGRATION</div>
        <div>SYS_STATUS: SIMULATION_ACTIVE</div>
        <div>CASE_STUDY: HUSSEIN MLHEM</div>
      </div>
      
      <div className="hero-overlay-hud-right" aria-hidden="true" style={{ zIndex: 10 }}>
        <div>SYS_COORD: 24.4539° N, 54.3773° E</div>
        <div>CREATIVE_DIRECTION_TEST</div>
        <div>DATE: 2026.06.20</div>
      </div>

      {/* Center content container */}
      <div className="hero-text-content" style={{ zIndex: 10, position: 'relative' }}>
        {/* Logo */}
        <div style={{ marginBottom: '1.25rem' }}>
          <img 
            src={SAQR_ASSETS.logo} 
            alt="SAQR Logo" 
            style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>

        {/* Badge */}
        <div style={{ marginBottom: '0.75rem' }}>
          <span className="badge-concept" style={{ letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.65rem' }}>
            Applied Fictional Case Study
          </span>
        </div>
        
        {/* Title */}
        <h1 className="hero-title" style={{ fontSize: '3.8rem', marginBottom: '0.75rem', lineHeight: '1.1', textShadow: '0 4px 12px rgba(0,0,0,0.8)' }}>
          SAQR Energy Guard
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle" style={{ fontSize: '1.15rem', fontWeight: 300, maxWidth: '600px', margin: '0 auto 2.5rem', lineHeight: '1.5', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
          A fictional dual-device concept for futuristic environmental intelligence.
        </p>
        
        {/* CTAs */}
        <div className="cta-group" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={onExploreClick} className="btn-primary" style={{ padding: '0.9rem 2.2rem', fontSize: '0.85rem' }}>
            Begin Experience
          </button>
          <button onClick={onBackToShowcase} className="btn-secondary" style={{ padding: '0.9rem 2.2rem', fontSize: '0.85rem' }}>
            Back to Showcase
          </button>
        </div>
      </div>
    </section>
  );
}
