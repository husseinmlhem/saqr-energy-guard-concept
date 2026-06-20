import React from 'react';

export default function OrbitalRadarConsole() {
  return (
    <section 
      style={{
        padding: '6rem 2rem',
        position: 'relative',
        backgroundColor: '#050507', // Unified dark cinematic background
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
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Title / Description */}
        <div style={{ textAlign: 'center', marginBottom: '4.5rem' }}>
          <span 
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
              color: 'var(--accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '3px',
              marginBottom: '0.75rem',
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
            Environmental awareness interface
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
            A fictional interface language for mapping proximity, signal flow, and response zones.
          </p>
        </div>

        {/* Combined two-column interface */}
        <div 
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '4rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Left Column: System Readiness Interface */}
          <div 
            className="glass-panel"
            style={{
              flex: '1',
              minWidth: '320px',
              maxWidth: '480px',
              padding: '2.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.01)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}
          >
            <h3 
              style={{
                fontFamily: 'var(--font-hud)',
                fontSize: '1rem',
                color: 'var(--text-primary)',
                marginBottom: '2rem',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '0.75rem'
              }}
            >
              System Readiness Interface
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {/* Row 1: Proximity Scan */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>Proximity Scan</span>
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.6rem', 
                      color: '#00ffd5', 
                      backgroundColor: 'rgba(0, 255, 213, 0.1)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    ACTIVE
                  </span>
                </div>
                <div 
                  style={{ 
                    height: '4px', 
                    width: '100%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                    borderRadius: '2px', 
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <div 
                    style={{ 
                      height: '100%', 
                      width: '75%', 
                      backgroundColor: 'var(--accent-cyan)',
                      borderRadius: '2px',
                      animation: 'pulse-beam 2s infinite ease-in-out' 
                    }} 
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  DFN // SNT Proximity Lock: Normal (2.4KM)
                </span>
              </div>

              {/* Row 2: Signal Routing */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>Signal Routing</span>
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.6rem', 
                      color: 'var(--accent-blue)', 
                      backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    ROUTING
                  </span>
                </div>
                <div 
                  style={{ 
                    height: '4px', 
                    width: '100%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                    borderRadius: '2px', 
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <div 
                    style={{ 
                      height: '100%', 
                      width: '90%', 
                      backgroundColor: 'var(--accent-blue)',
                      borderRadius: '2px',
                      animation: 'pulse-beam 3s infinite ease-in-out' 
                    }} 
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Telemetry Link Status: Coordinated 98.4%
                </span>
              </div>

              {/* Row 3: Response Layer */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-primary)' }}>Response Layer</span>
                  <span 
                    style={{ 
                      fontFamily: 'var(--font-mono)', 
                      fontSize: '0.6rem', 
                      color: '#f59e0b', 
                      backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      fontWeight: 'bold'
                    }}
                  >
                    STANDBY
                  </span>
                </div>
                <div 
                  style={{ 
                    height: '4px', 
                    width: '100%', 
                    backgroundColor: 'rgba(255, 255, 255, 0.08)', 
                    borderRadius: '2px', 
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <div 
                    style={{ 
                      height: '100%', 
                      width: '40%', 
                      backgroundColor: '#f59e0b',
                      borderRadius: '2px'
                    }} 
                  />
                </div>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                  Auto-Containment Grid Ready
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Orbital Radar Sweep Console */}
          <div 
            style={{
              flex: '1',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minWidth: '320px'
            }}
          >
            {/* Radar Circular interface */}
            <div 
              className="glass-panel"
              style={{
                position: 'relative',
                width: 'min(400px, 90vw)',
                height: 'min(400px, 90vw)',
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
