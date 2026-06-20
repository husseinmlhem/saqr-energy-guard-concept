import React from 'react';

export default function TacticalTimeline() {
  return (
    <section 
      style={{
        padding: '6rem 2rem',
        position: 'relative',
        background: 'linear-gradient(to bottom, #050507 0%, #101016 50%, #050507 100%)',
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
          PROJECT PIPELINE // CRITICAL PATH
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
          Built as a Complete Concept Package
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
          From visual identity to deck, video, and interactive web experience.
        </p>

        {/* Horizontal Timeline Interface */}
        <div style={{ position: 'relative', width: '100%', padding: '0 2rem' }}>
          {/* Progress bar line */}
          <div 
            style={{
              position: 'absolute',
              top: '25px',
              left: '10%',
              width: '80%',
              height: '2px',
              backgroundColor: 'var(--border-color)',
              zIndex: 1
            }}
          />
          {/* Animated active path bar */}
          <div 
            style={{
              position: 'absolute',
              top: '25px',
              left: '10%',
              width: '80%',
              height: '2px',
              background: 'linear-gradient(90deg, var(--accent-blue) 0%, var(--accent-cyan) 100%)',
              zIndex: 2,
              animation: 'pulse-beam 4s ease infinite',
              transformOrigin: 'left'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
            {[
              { title: "Identity", phase: "PHASE 01", desc: "Specs, sand-beige & graphite design values." },
              { title: "Presentation", phase: "PHASE 02", desc: "Detailed product and placement slide deck." },
              { title: "Video", phase: "PHASE 03", desc: "3D CAD-rendered component assembly reel." },
              { title: "Website", phase: "PHASE 04", desc: "High-DPI scroll-reveal experience portal." }
            ].map((step, index) => (
              <div 
                key={index} 
                style={{ 
                  flex: '1', 
                  minWidth: '180px', 
                  position: 'relative', 
                  zIndex: 5,
                  textAlign: 'center'
                }}
              >
                {/* Node indicator */}
                <div 
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(5, 5, 7, 0.9)',
                    border: '2px solid var(--accent-blue)',
                    boxShadow: '0 0 10px var(--accent-blue)',
                    margin: '19px auto 1.5rem',
                    position: 'relative',
                    zIndex: 6
                  }}
                />

                <span 
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.55rem',
                    color: 'var(--accent-cyan)',
                    display: 'block',
                    marginBottom: '0.4rem',
                    letterSpacing: '1px'
                  }}
                >
                  {step.phase}
                </span>
                <h4 
                  style={{
                    fontFamily: 'var(--font-hud)',
                    fontSize: '1.05rem',
                    color: 'var(--text-primary)',
                    margin: '0 0 0.5rem'
                  }}
                >
                  {step.title}
                </h4>
                <p 
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    lineHeight: '1.4',
                    padding: '0 10px',
                    fontWeight: 300
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Side measurement scan ticks */}
      <div 
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          width: '1px',
          height: '100px',
          background: 'linear-gradient(to bottom, var(--text-muted), transparent)',
          opacity: 0.3
        }}
      />
      <div 
        style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          width: '1px',
          height: '100px',
          background: 'linear-gradient(to top, var(--text-muted), transparent)',
          opacity: 0.3
        }}
      />
    </section>
  );
}
