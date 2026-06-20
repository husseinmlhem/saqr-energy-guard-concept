import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function SentinelCoverageCone() {
  return (
    <section 
      style={{
        position: 'relative',
        backgroundColor: '#b8babb', // Soft product environment background
        overflow: 'hidden',
        padding: '8rem 2rem'
      }}
    >
      {/* Top Black Fade Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '25%',
          background: 'linear-gradient(to bottom, #050507 0%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />
      {/* Bottom Black Fade Overlay */}
      <div 
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '25%',
          background: 'linear-gradient(to top, #050507 0%, transparent 100%)',
          zIndex: 2,
          pointerEvents: 'none'
        }}
      />

      <div 
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
          zIndex: 5,
          color: '#1a1d20'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <span 
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: '#3b434c',
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
              color: '#0d1117'
            }}
          >
            Sentinel Vertical Coverage
          </h2>
          <p 
            style={{
              color: '#475569',
              fontSize: '0.95rem',
              fontWeight: 400,
              maxWidth: '650px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}
          >
            A fictional elevated awareness tower designed to visualize range, height, and environmental mapping.
          </p>
        </div>

        {/* Coverage Cone Grid */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Left panel: Details sheet */}
          <div 
            className="glass-panel"
            style={{
              flex: '1',
              minWidth: '300px',
              maxWidth: '500px',
              padding: '2.5rem',
              backgroundColor: 'rgba(255, 255, 255, 0.4)',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: '#0d1117', marginBottom: '1.5rem', fontWeight: 800 }}>
              Vertical Elevation Reach
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <li style={{ borderLeft: '3px solid #00ffd5', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>Sensor Crown</strong>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>Top-mounted visual indicator mapping out localized telemetry.</span>
              </li>
              <li style={{ borderLeft: '3px solid #00ffd5', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>Vertical Core</strong>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>Heavy duty support column hoisting visual sensors to surveillance heights.</span>
              </li>
              <li style={{ borderLeft: '3px solid #00ffd5', paddingLeft: '1rem' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a' }}>Coverage Cone</strong>
                <span style={{ fontSize: '0.8rem', color: '#475569' }}>Broad scan coverage mapping coastal ranges up to fictional 12.4M altitude.</span>
              </li>
            </ul>
          </div>

          {/* Right panel: Sentinel rendering with animated overlay cone */}
          <div 
            style={{
              position: 'relative',
              width: 'min(480px, 90vw)',
              height: '420px',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
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
              <polygon points="240,110 60,30 420,30" fill="rgba(0, 255, 213, 0.04)" stroke="rgba(0, 255, 213, 0.2)" strokeWidth="1" strokeDasharray="3,3" />
              <line x1="240" y1="110" x2="240" y2="20" stroke="rgba(0, 255, 213, 0.15)" strokeWidth="1" strokeDasharray="5,5" />
              
              {/* Scan indicator line */}
              <line x1="60" y1="30" x2="420" y2="30" stroke="#00ffd5" strokeWidth="1.5" style={{ opacity: 0.7 }} />

              {/* Height tags */}
              <text x="250" y="25" fill="#334155" fontFamily="var(--font-mono)" fontSize="8" fontWeight="bold">+12.4M</text>
              <text x="250" y="70" fill="#334155" fontFamily="var(--font-mono)" fontSize="8" fontWeight="bold">+6.2M</text>
            </svg>

            {/* Labels overlay */}
            <div style={{ position: 'absolute', top: '105px', left: '20%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#042f2e', fontWeight: 'bold' }}>
              SENSOR CROWN
            </div>
            <div style={{ position: 'absolute', top: '240px', left: '20%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#042f2e', fontWeight: 'bold' }}>
              VERTICAL CORE
            </div>
            <div style={{ position: 'absolute', top: '340px', right: '20%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#042f2e', fontWeight: 'bold' }}>
              BASE ANCHOR
            </div>
            <div style={{ position: 'absolute', top: '40px', right: '15%', fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: '#0f766e', fontWeight: 'bold' }}>
              COVERAGE FIELD
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
