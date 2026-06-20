import React from 'react';

export default function OrbitalRadarConsole() {
  return (
    <section 
      style={{
        padding: '8rem 2rem',
        position: 'relative',
        background: 'linear-gradient(to bottom, #050507 0%, #121418 50%, #050507 100%)',
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
          maxWidth: '1000px',
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
            color: 'var(--accent-cyan)',
            textTransform: 'uppercase',
            letterSpacing: '3px',
            marginBottom: '1rem',
            display: 'block'
          }}
        >
          System Telemetry // Proximity Matrix
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
          Environmental Awareness Interface
        </h2>
        <p 
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            fontWeight: 300,
            marginBottom: '4rem',
            maxWidth: '650px',
            lineHeight: '1.6'
          }}
        >
          A fictional radar-inspired interface language for mapping proximity, range, and response zones.
        </p>

        {/* Cinematic Radar Box */}
        <div 
          className="glass-panel"
          style={{
            position: 'relative',
            width: 'min(450px, 90vw)',
            height: 'min(450px, 90vw)',
            borderRadius: '50%',
            border: '1px solid rgba(0, 255, 213, 0.15)',
            boxShadow: '0 0 40px rgba(0, 255, 213, 0.03)',
            backgroundColor: 'rgba(5, 5, 7, 0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden'
          }}
        >
          {/* Radial concentric rings */}
          <div style={{ position: 'absolute', width: '80%', height: '80%', borderRadius: '50%', border: '1px dashed rgba(0, 255, 213, 0.08)' }} />
          <div style={{ position: 'absolute', width: '60%', height: '60%', borderRadius: '50%', border: '1px solid rgba(0, 255, 213, 0.05)' }} />
          <div style={{ position: 'absolute', width: '40%', height: '40%', borderRadius: '50%', border: '1px dashed rgba(0, 255, 213, 0.08)' }} />
          <div style={{ position: 'absolute', width: '20%', height: '20%', borderRadius: '50%', border: '1px solid rgba(0, 255, 213, 0.05)' }} />

          {/* Crosshairs */}
          <div style={{ position: 'absolute', width: '100%', height: '1px', backgroundColor: 'rgba(0, 255, 213, 0.05)' }} />
          <div style={{ position: 'absolute', width: '1px', height: '100%', backgroundColor: 'rgba(0, 255, 213, 0.05)' }} />

          {/* Sweep Beam (Animated rotating gradient line) */}
          <div 
            style={{
              position: 'absolute',
              width: '50%',
              height: '50%',
              top: 0,
              left: '50%',
              transformOrigin: 'bottom left',
              background: 'linear-gradient(45deg, rgba(0, 255, 213, 0.15) 0%, transparent 80%)',
              animation: 'spin-node 10s linear infinite',
              zIndex: 3
            }}
          />

          {/* Defender Marker */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '42%', 
              left: '35%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 5
            }}
          >
            <div 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--accent-blue)', 
                boxShadow: '0 0 10px var(--accent-blue)',
                display: 'inline-block' 
              }} 
            />
            <div 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.45rem', 
                color: 'var(--text-primary)', 
                position: 'absolute',
                top: '-12px',
                left: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              DFN_V1 [OK]
            </div>
          </div>

          {/* Sentinel Marker */}
          <div 
            style={{ 
              position: 'absolute', 
              top: '28%', 
              left: '65%', 
              transform: 'translate(-50%, -50%)',
              zIndex: 5
            }}
          >
            <div 
              style={{ 
                width: '10px', 
                height: '10px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--accent-cyan)', 
                boxShadow: '0 0 10px var(--accent-cyan)',
                display: 'inline-block' 
              }} 
            />
            <div 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.45rem', 
                color: 'var(--text-primary)', 
                position: 'absolute',
                top: '-12px',
                left: '12px',
                whiteSpace: 'nowrap'
              }}
            >
              SNT_V1 [OK]
            </div>
          </div>

          {/* Threat Detection Dots (Blinking anomalies) */}
          <div 
            className="threat-blink"
            style={{ 
              position: 'absolute', 
              top: '72%', 
              left: '70%', 
              zIndex: 5
            }}
          >
            <div 
              style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#ef4444', 
                boxShadow: '0 0 10px #ef4444'
              }} 
            />
            <div 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.4rem', 
                color: '#ef4444', 
                position: 'absolute',
                top: '10px',
                left: '0px',
                whiteSpace: 'nowrap'
              }}
            >
              TRGT_A: 2.4KM
            </div>
          </div>

          <div 
            className="threat-blink"
            style={{ 
              position: 'absolute', 
              top: '60%', 
              left: '20%', 
              zIndex: 5,
              animationDelay: '1s'
            }}
          >
            <div 
              style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: '#ef4444', 
                boxShadow: '0 0 10px #ef4444'
              }} 
            />
            <div 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.4rem', 
                color: '#ef4444', 
                position: 'absolute',
                top: '10px',
                left: '0px',
                whiteSpace: 'nowrap'
              }}
            >
              TRGT_B: 4.8KM
            </div>
          </div>

          {/* Outer Edge Scale markings */}
          <div style={{ position: 'absolute', top: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--text-muted)' }}>000°</div>
          <div style={{ position: 'absolute', bottom: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--text-muted)' }}>180°</div>
          <div style={{ position: 'absolute', left: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--text-muted)' }}>270°</div>
          <div style={{ position: 'absolute', right: '10px', fontFamily: 'var(--font-mono)', fontSize: '0.45rem', color: 'var(--text-muted)' }}>090°</div>
        </div>
      </div>
      
      {/* Background HUD Grid Detail */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'radial-gradient(rgba(0, 240, 255, 0.02) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          opacity: 0.8,
          pointerEvents: 'none'
        }}
      />
    </section>
  );
}
