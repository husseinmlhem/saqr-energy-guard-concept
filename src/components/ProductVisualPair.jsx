import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function ProductVisualPair() {
  return (
    <div className="hero-visual-pair-container">
      {/* Decorative Technical HUD Lines */}
      <div 
        className="hero-hud-line" 
        style={{ top: '15%', left: '10%', width: '80%', height: '1px' }} 
      />
      <div 
        className="hero-hud-line" 
        style={{ bottom: '15%', left: '10%', width: '80%', height: '1px' }} 
      />
      
      {/* Left Device (Defender) */}
      <div className="hero-visual-wrapper visual-left">
        <img 
          src={SAQR_ASSETS.defenderPoster} 
          alt="Defender Device" 
          className="hero-img" 
          loading="eager"
        />
        {/* Decorative HUD Details */}
        <div className="hero-hud-dot" style={{ top: '35%', right: '25%' }} />
        <div 
          className="hero-hud-line" 
          style={{ top: '35%', right: '15%', width: '10%', height: '1px' }} 
        />
        <span 
          style={{
            position: 'absolute',
            top: '30%',
            right: '5%',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--accent-blue)',
            letterSpacing: '1px'
          }}
        >
          DFN-V1
        </span>
      </div>

      {/* Right Device (Sentinel) */}
      <div className="hero-visual-wrapper visual-right">
        <img 
          src={SAQR_ASSETS.sentinelPoster} 
          alt="Sentinel Device" 
          className="hero-img" 
          loading="eager"
        />
        {/* Decorative HUD Details */}
        <div className="hero-hud-dot" style={{ bottom: '40%', left: '25%' }} />
        <div 
          className="hero-hud-line" 
          style={{ bottom: '40%', left: '15%', width: '10%', height: '1px' }} 
        />
        <span 
          style={{
            position: 'absolute',
            bottom: '43%',
            left: '5%',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.6rem',
            color: 'var(--accent-blue)',
            letterSpacing: '1px'
          }}
        >
          SNT-V1
        </span>
      </div>
    </div>
  );
}
