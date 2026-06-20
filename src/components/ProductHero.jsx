import React from 'react';
import ProductVisualPair from './ProductVisualPair';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function ProductHero({ onExploreClick, onBackToShowcase }) {
  return (
    <section className="product-hero-section">
      {/* Corner HUD Data Overlay */}
      <div className="hero-overlay-hud" aria-hidden="true">
        <div>PROT_TYP: SG-02 // DUAL DEVICE</div>
        <div>SYS_STATUS: ACTIVE_SIMULATION</div>
        <div>STORY_DIR: HUSSEIN MLHEM</div>
      </div>
      
      <div className="hero-overlay-hud-right" aria-hidden="true">
        <div>SYS_COORD: 24.4539° N, 54.3773° E</div>
        <div>MULTIMEDIA_CAPABILITY_TEST</div>
        <div>DATE: 2026.06.20</div>
      </div>

      <div className="hero-text-content">
        {/* Visible Logo */}
        <div style={{ marginBottom: '1.25rem', zIndex: 20 }}>
          <img 
            src={SAQR_ASSETS.logo} 
            alt="SAQR Logo" 
            style={{ height: '40px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <span className="badge-concept">Concept Project</span>
        </div>
        
        <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '0.75rem', lineHeight: '1.1' }}>
          SAQR Energy Guard
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.1rem', fontWeight: 300, maxWidth: '650px', margin: '0 auto 2rem', lineHeight: '1.5' }}>
          A fictional dual-device concept for futuristic environmental intelligence.
        </p>
        
        <div className="cta-group" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button onClick={onExploreClick} className="btn-primary">
            Start Experience
          </button>
          <button onClick={onBackToShowcase} className="btn-secondary">
            Back to Showcase
          </button>
        </div>
      </div>

      {/* Cinematic Static Composition of Devices */}
      <ProductVisualPair />
    </section>
  );
}
