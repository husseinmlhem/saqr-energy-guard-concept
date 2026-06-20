import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function SentinelCoverageCone() {
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
            Post-Assembly Analysis // Wide-Area Monitoring
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
            Sentinel: vertical awareness tower
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
            An elevated fictional layer for range, height, and environmental mapping.
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
          {/* Left panel: Details sheet inside technical HUD panel */}
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
              Vertical Elevation Reach
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <li style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-primary)' }}>Sensor Crown</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Top-mounted visual indicator mapping out localized telemetry.</span>
              </li>
              <li style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-primary)' }}>Vertical Core</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Heavy duty support column hoisting visual sensors to surveillance heights.</span>
              </li>
              <li style={{ borderLeft: '2px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-primary)' }}>Coverage Cone</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Broad scan coverage mapping coastal ranges up to fictional 12.4M altitude.</span>
              </li>
            </ul>
          </div>

          {/* Right panel: Sentinel rendering inside refined dark stage */}
          <div 
            style={{
              position: 'relative',
              width: 'min(450px, 90vw)',
              height: '420px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              backgroundColor: '#0d0f12', // Refined dark stage frame
              borderRadius: '6px',
              border: '1px solid rgba(0, 255, 213, 0.15)', // Cyan border
              overflow: 'hidden',
              paddingBottom: '20px'
            }}
          >
            {/* Main Product Image (Sentinel) */}
            <img 
              src={SAQR_ASSETS.sentinelPoster} 
              alt="Sentinel Coverage Cone" 
              style={{
                height: '75%',
                width: 'auto',
                objectFit: 'contain',
                position: 'relative',
                zIndex: 3
              }}
            />

            {/* Coverage cone visual */}
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
              {/* Coverage cone projection lines in cyan */}
              <polygon points="225,110 45,30 405,30" fill="rgba(0, 255, 213, 0.03)" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="2,2" style={{ opacity: 0.6 }} />
              <line x1="225" y1="110" x2="225" y2="20" stroke="rgba(0, 255, 213, 0.15)" strokeWidth="1" strokeDasharray="4,4" />
              
              {/* Scan indicator line */}
              <line x1="45" y1="30" x2="405" y2="30" stroke="#00ffd5" strokeWidth="1" style={{ opacity: 0.5 }} />

              {/* Height tags */}
              <text x="235" y="25" fill="var(--text-secondary)" fontFamily="var(--font-mono)" fontSize="8" style={{ opacity: 0.8 }}>+12.4M</text>
              <text x="235" y="70" fill="var(--text-secondary)" fontFamily="var(--font-mono)" fontSize="8" style={{ opacity: 0.8 }}>+6.2M</text>
            </svg>

            {/* Labels overlay in cyan */}
            <div style={{ position: 'absolute', top: '105px', left: '15%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.85 }}>
              SENSOR CROWN
            </div>
            <div style={{ position: 'absolute', top: '240px', left: '15%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.85 }}>
              VERTICAL CORE
            </div>
            <div style={{ position: 'absolute', top: '340px', right: '15%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.85 }}>
              BASE ANCHOR
            </div>
            <div style={{ position: 'absolute', top: '40px', right: '10%', fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', opacity: 0.85 }}>
              COVERAGE FIELD
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
