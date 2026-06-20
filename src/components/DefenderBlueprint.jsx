import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function DefenderBlueprint() {
  return (
    <section 
      style={{
        position: 'relative',
        backgroundColor: '#050507', // Dark cinematic background
        overflow: 'hidden',
        padding: '5rem 2rem'
      }}
    >
      <div 
        style={{
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 5,
          color: 'var(--text-primary)'
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'left', marginBottom: '3rem', borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '1.25rem' }}>
          <span 
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.7rem',
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: 'bold',
              display: 'block',
              marginBottom: '0.25rem'
            }}
          >
            Post-Assembly Analysis // Module Specifications
          </span>
          <h2 
            style={{
              fontFamily: 'var(--font-hud)',
              fontSize: '1.75rem',
              fontWeight: 800,
              margin: 0,
              color: 'var(--text-primary)'
            }}
          >
            Defender: close-range intelligence module
          </h2>
          <p 
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.85rem',
              fontWeight: 300,
              marginTop: '0.5rem',
              lineHeight: '1.5'
            }}
          >
            Compact module logic visualized through a fictional technical breakdown.
          </p>
        </div>

        {/* Two-column layout directly in section context (no card wrappers) */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'stretch',
            justifyContent: 'center',
            gap: '2.5rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Left panel: Clean product image inside refined dark stage */}
          <div 
            style={{
              position: 'relative',
              width: 'min(450px, 90vw)',
              height: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0d0f12', // Refined dark stage frame
              borderRadius: '6px',
              border: '1px solid rgba(0, 255, 213, 0.15)', // Cyan border
              overflow: 'hidden'
            }}
          >
            {/* Main Product Image (Defender) */}
            <img 
              src={SAQR_ASSETS.defenderPoster} 
              alt="Defender Blueprint" 
              style={{
                height: '80%',
                width: 'auto',
                objectFit: 'contain',
                position: 'relative',
                zIndex: 3
              }}
            />

            {/* SVG HUD Blueprint overlay lines in cyan */}
            <svg 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                overflow: 'visible',
                zIndex: 4
              }}
            >
              {/* Line to Optical Core */}
              <path d="M 225 120 L 125 120 L 95 140" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0.7 }} />
              <circle cx="225" cy="120" r="2" fill="var(--accent-cyan)" />
              
              {/* Line to Side Module */}
              <path d="M 310 160 L 360 160 L 390 140" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0.7 }} />
              <circle cx="310" cy="160" r="2" fill="var(--accent-cyan)" />

              {/* Line to Stabilized Base */}
              <path d="M 230 280 L 310 280 L 340 300" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0.7 }} />
              <circle cx="230" cy="280" r="2" fill="var(--accent-cyan)" />

              {/* Line to Power Layer */}
              <path d="M 220 200 L 140 200 L 110 220" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0.7 }} />
              <circle cx="220" cy="200" r="2" fill="var(--accent-cyan)" />
            </svg>

            {/* Labels overlay in cyan */}
            <div style={{ position: 'absolute', top: '135px', left: '25px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.85 }}>
              OPTICAL CORE
            </div>
            <div style={{ position: 'absolute', top: '215px', left: '45px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.85 }}>
              POWER LAYER
            </div>
            <div style={{ position: 'absolute', top: '135px', right: '35px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.85 }}>
              SIDE MODULE
            </div>
            <div style={{ position: 'absolute', top: '295px', right: '70px', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.85 }}>
              STABILIZED BASE
            </div>
          </div>

          {/* Right panel: Details sheet inside technical HUD panel */}
          <div 
            style={{
              flex: '1',
              minWidth: '300px',
              maxWidth: '500px',
              padding: '1.75rem',
              backgroundColor: 'rgba(10, 12, 16, 0.35)',
              border: '1px dashed rgba(255, 255, 255, 0.08)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Speculative Module Breakdown
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <li style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-primary)' }}>Optical Core</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>High-fidelity lens array designed to track proximity thermal anomalies.</span>
              </li>
              <li style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-primary)' }}>Stabilized Base</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rotational motor matrix offering 360-degree environmental scan sweeps.</span>
              </li>
              <li style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-primary)' }}>Modular Side Plates</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Detachable sand-beige composite shells protecting key computation nodes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
