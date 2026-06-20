import React from 'react';
import ProductVisualPair from './ProductVisualPair';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function ProductHero({ onExploreClick, onBackToShowcase }) {
  return (
    <section className="product-hero-section" style={{ height: '100vh', padding: '80px 2rem 0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box' }}>
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

      <div className="hero-text-content" style={{ margin: 'auto 0 0', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Visible Logo */}
        <div style={{ marginBottom: '1.5rem', zIndex: 20 }}>
          <img 
            src={SAQR_ASSETS.logo} 
            alt="SAQR Logo" 
            style={{ height: '50px', width: 'auto', objectFit: 'contain' }} 
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <span className="badge-concept">Concept Project</span>
        </div>
        
        <h1 className="hero-title" style={{ fontSize: '3.5rem', marginBottom: '0.75rem', lineHeight: '1.1' }}>
          SAQR Energy Guard
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.2rem', fontWeight: 300, maxWidth: '700px', margin: '0 auto 2rem', lineHeight: '1.5' }}>
          A fictional dual-device concept for futuristic environmental intelligence.
        </p>
        
        <div className="cta-group" style={{ marginBottom: '1.5rem' }}>
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
