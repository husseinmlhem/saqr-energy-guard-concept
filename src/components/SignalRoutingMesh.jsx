import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function SignalRoutingMesh() {
  return (
    <section 
      style={{
        padding: '8rem 2rem',
        position: 'relative',
        background: 'linear-gradient(to bottom, #050507 0%, #0d1017 50%, #050507 100%)',
        borderBottom: '1px solid var(--border-color)',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}
      >
        <span 
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--accent-blue)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '1rem',
            display: 'block'
          }}
        >
          COORDINATED NETWORK // CONNECTIVITY
        </span>
        <h2 
          style={{
            fontFamily: 'var(--font-hud)',
            fontSize: '2.2rem',
            fontWeight: 700,
            marginBottom: '1rem',
            color: 'var(--text-primary)'
          }}
        >
          Connected Speculative Ecosystem
        </h2>
        <p 
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            fontWeight: 300,
            marginBottom: '5rem',
            maxWidth: '650px',
            lineHeight: '1.6'
          }}
        >
          Two fictional devices linked through a shared visual intelligence layer.
        </p>

        {/* Mesh container layout */}
        <div 
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '3rem',
            position: 'relative'
          }}
        >
          {/* Left Device: Defender */}
          <div 
            className="glass-panel"
            style={{
              padding: '2rem 1.5rem',
              width: 'min(280px, 90vw)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(10, 10, 15, 0.4)',
              textAlign: 'center',
              position: 'relative',
              zIndex: 5
            }}
          >
            <div style={{ height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={SAQR_ASSETS.defenderPoster} 
                alt="Defender" 
                style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} 
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-blue)', display: 'block', marginBottom: '0.25rem' }}>UNIT // DFN-V1</span>
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Defender</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 300, margin: 0 }}>Close-range module</p>
          </div>

          {/* Center Connection Node */}
          <div 
            style={{
              flex: '1',
              minWidth: '150px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              height: '180px'
            }}
          >
            {/* SVG lines for network pathways and data pulses */}
            <svg 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible',
                pointerEvents: 'none'
              }}
            >
              {/* Path from Left to Center */}
              <path d="M -50 90 L 50 90" stroke="rgba(0, 240, 255, 0.15)" strokeWidth="2" fill="none" />
              {/* Path from Center to Right */}
              <path d="M 50 90 L 150 90" stroke="rgba(0, 255, 213, 0.15)" strokeWidth="2" fill="none" />

              {/* Data pulse animation - Left to Center */}
              <circle cx="-50" cy="90" r="3" fill="var(--accent-blue)">
                <animate 
                  attributeName="cx" 
                  from="-50" 
                  to="50" 
                  dur="3s" 
                  repeatCount="indefinite" 
                />
              </circle>

              {/* Data pulse animation - Center to Right */}
              <circle cx="50" cy="90" r="3" fill="var(--accent-cyan)">
                <animate 
                  attributeName="cx" 
                  from="50" 
                  to="200" 
                  dur="4s" 
                  repeatCount="indefinite" 
                />
              </circle>
            </svg>

            {/* Central Node */}
            <div 
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: '2px dashed var(--accent-cyan)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                animation: 'spin-node 15s linear infinite',
                backgroundColor: 'rgba(5, 5, 7, 0.8)',
                zIndex: 6
              }}
            >
              <div 
                style={{ 
                  width: '16px', 
                  height: '16px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--accent-blue)', 
                  boxShadow: '0 0 10px var(--accent-blue)' 
                }} 
              />
            </div>
            <span 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.55rem', 
                color: 'var(--text-muted)', 
                marginTop: '1.25rem', 
                textTransform: 'uppercase', 
                letterSpacing: '1px',
                textAlign: 'center'
              }}
            >
              Shared Intelligence Layer
            </span>
          </div>

          {/* Right Device: Sentinel */}
          <div 
            className="glass-panel"
            style={{
              padding: '2rem 1.5rem',
              width: 'min(280px, 90vw)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'rgba(10, 10, 15, 0.4)',
              textAlign: 'center',
              position: 'relative',
              zIndex: 5
            }}
          >
            <div style={{ height: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem' }}>
              <img 
                src={SAQR_ASSETS.sentinelPoster} 
                alt="Sentinel" 
                style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }} 
              />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.25rem' }}>STATION // SNT-V1</span>
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 0.5rem' }}>Sentinel</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 300, margin: 0 }}>Vertical monitoring tower</p>
          </div>
        </div>
      </div>

      {/* Grid pattern background */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.01) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.6,
          pointerEvents: 'none'
        }}
      />
    </section>
  );
}
