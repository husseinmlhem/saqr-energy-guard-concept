import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function DefenderBlueprint() {
  return (
    <section 
      style={{
        position: 'relative',
        backgroundColor: '#050507', // Dark black page background
        overflow: 'hidden',
        padding: '6rem 2rem'
      }}
    >
      <div 
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 5,
          color: 'var(--text-primary)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <span 
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)', // Unified cyan HUD brand color
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: 'bold',
              display: 'block',
              marginBottom: '0.5rem'
            }}
          >
            SPECIFICATION // BLUEPRINT 01
          </span>
          <h2 
            style={{
              fontFamily: 'var(--font-hud)',
              fontSize: '2rem',
              fontWeight: 900,
              margin: '0 0 1rem',
              color: 'var(--text-primary)'
            }}
          >
            Defender: close-range intelligence module
          </h2>
          <p 
            style={{
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
              fontWeight: 300,
              maxWidth: '650px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            Compact module logic visualized through a fictional technical breakdown.
          </p>
        </div>

        {/* Dark graphite stage wrapper */}
        <div 
          style={{
            backgroundColor: '#111317', // Dark graphite stage
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            padding: '2.5rem',
            boxShadow: '0 30px 60px rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Left panel: Controlled product image frame inside dark graphite container */}
          <div 
            style={{
              position: 'relative',
              width: 'min(450px, 90vw)',
              height: '350px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#16191f', // Dark graphite frame to match the theme
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              overflow: 'hidden'
            }}
          >
            {/* Main Product Image (Defender) */}
            <img 
              src={SAQR_ASSETS.defenderPoster} 
              alt="Defender Blueprint" 
              style={{
                height: '85%',
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
              <path d="M 225 120 L 125 120 L 95 140" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="225" cy="120" r="3" fill="var(--accent-cyan)" />
              
              {/* Line to Side Module */}
              <path d="M 310 160 L 360 160 L 390 140" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="310" cy="160" r="3" fill="var(--accent-cyan)" />

              {/* Line to Stabilized Base */}
              <path d="M 230 280 L 310 280 L 340 300" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="230" cy="280" r="3" fill="var(--accent-cyan)" />

              {/* Line to Power Layer */}
              <path d="M 220 200 L 140 200 L 110 220" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeDasharray="3,3" />
              <circle cx="220" cy="200" r="3" fill="var(--accent-cyan)" />
            </svg>

            {/* Labels overlay in cyan/white */}
            <div style={{ position: 'absolute', top: '135px', left: '25px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
              OPTICAL CORE
            </div>
            <div style={{ position: 'absolute', top: '215px', left: '45px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
              POWER LAYER
            </div>
            <div style={{ position: 'absolute', top: '135px', right: '35px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
              SIDE MODULE
            </div>
            <div style={{ position: 'absolute', top: '295px', right: '70px', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
              STABILIZED BASE
            </div>
          </div>

          {/* Right panel: Details sheet inside dark glass panel */}
          <div 
            className="glass-panel"
            style={{
              flex: '1',
              minWidth: '300px',
              maxWidth: '500px',
              padding: '2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 800 }}>
              Speculative Module Breakdown
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <li style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Optical Core</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>High-fidelity lens array designed to track proximity thermal anomalies.</span>
              </li>
              <li style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Stabilized Base</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rotational motor matrix offering 360-degree environmental scan sweeps.</span>
              </li>
              <li style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Modular Side Plates</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Detachable sand-beige composite shells protecting key computation nodes.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
