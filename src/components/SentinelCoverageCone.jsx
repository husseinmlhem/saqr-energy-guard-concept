import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function SentinelCoverageCone() {
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
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              fontWeight: 'bold',
              display: 'block',
              marginBottom: '0.5rem'
            }}
          >
            COVERAGE ZONE // RADIAL CONE
          </span>
          <h2 
            style={{
              fontFamily: 'var(--font-hud)',
              fontSize: '2.2rem',
              fontWeight: 900,
              margin: '0 0 1rem',
              color: 'var(--text-primary)'
            }}
          >
            Sentinel: vertical awareness tower
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
            An elevated fictional layer for range, height, and environmental mapping.
          </p>
        </div>

        {/* 2. Dark graphite stage wrapper */}
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
          {/* Left panel: Details sheet inside dark glass panel */}
          <div 
            className="glass-panel"
            style={{
              flex: '1',
              minWidth: '300px',
              maxWidth: '500px',
              padding: '2rem',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 800 }}>
              Vertical Elevation Reach
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <li style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Sensor Crown</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Top-mounted visual indicator mapping out localized telemetry.</span>
              </li>
              <li style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Vertical Core</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Heavy duty support column hoisting visual sensors to surveillance heights.</span>
              </li>
              <li style={{ borderLeft: '3px solid var(--accent-cyan)', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-primary)' }}>Coverage Cone</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Broad scan coverage mapping coastal ranges up to fictional 12.4M altitude.</span>
              </li>
            </ul>
          </div>

          {/* Right panel: Sentinel rendering inside controlled product image frame with light gray background */}
          <div 
            style={{
              position: 'relative',
              width: 'min(450px, 90vw)',
              height: '420px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              backgroundColor: '#b8babb', // Product frame environment background
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'visible',
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
                zIndex: 3,
                filter: 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.25))'
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
              {/* Coverage cone projection lines */}
              <polygon points="225,110 45,30 405,30" fill="rgba(0, 255, 213, 0.04)" stroke="rgba(0, 255, 213, 0.2)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="225" y1="110" x2="225" y2="20" stroke="rgba(0, 255, 213, 0.15)" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Scan indicator line */}
              <line x1="45" y1="30" x2="405" y2="30" stroke="#00ffd5" strokeWidth="1.5" style={{ opacity: 0.7 }} />

              {/* Height tags */}
              <text x="235" y="25" fill="#334155" fontFamily="var(--font-mono)" fontSize="8" fontWeight="bold">+12.4M</text>
              <text x="235" y="70" fill="#334155" fontFamily="var(--font-mono)" fontSize="8" fontWeight="bold">+6.2M</text>
            </svg>

            {/* Labels overlay */}
            <div style={{ position: 'absolute', top: '105px', left: '15%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#042f2e', fontWeight: 'bold' }}>
              SENSOR CROWN
            </div>
            <div style={{ position: 'absolute', top: '240px', left: '15%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#042f2e', fontWeight: 'bold' }}>
              VERTICAL CORE
            </div>
            <div style={{ position: 'absolute', top: '340px', right: '15%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#042f2e', fontWeight: 'bold' }}>
              BASE ANCHOR
            </div>
            <div style={{ position: 'absolute', top: '40px', right: '10%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#0f766e', fontWeight: 'bold' }}>
              COVERAGE FIELD
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
