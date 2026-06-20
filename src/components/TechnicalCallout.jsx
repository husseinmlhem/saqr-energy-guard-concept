import React from 'react';

export default function TechnicalCallout({ 
  x, 
  y, 
  label, 
  sublabel, 
  isActive, 
  align = 'right' 
}) {
  const lineStyle = {
    position: 'absolute',
    top: '50%',
    height: '1px',
    backgroundColor: 'var(--accent-cyan)',
    width: '30px',
    transformOrigin: align === 'left' ? 'right center' : 'left center',
    transform: isActive ? 'scaleX(1)' : 'scaleX(0)',
    transition: 'transform 0.4s ease-out',
  };

  if (align === 'left') {
    lineStyle.right = '100%';
    lineStyle.left = 'auto';
  } else {
    lineStyle.left = '100%';
    lineStyle.right = 'auto';
  }

  const textStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    color: 'var(--accent-cyan)',
    backgroundColor: 'rgba(5, 5, 7, 0.85)',
    border: '1px solid rgba(0, 255, 213, 0.3)',
    padding: '4px 8px',
    borderRadius: '3px',
    letterSpacing: '1px',
    pointerEvents: 'none',
    opacity: isActive ? 1 : 0,
    transform: `translateY(-50%) scale(${isActive ? 1 : 0.9})`,
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  if (align === 'left') {
    textStyle.right = 'calc(100% + 35px)';
    textStyle.left = 'auto';
  } else {
    textStyle.left = 'calc(100% + 35px)';
    textStyle.right = 'auto';
  }

  return (
    <div 
      className="tech-callout-wrapper"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        pointerEvents: 'none'
      }}
    >
      {/* Glowing Target Dot */}
      <div 
        className="hero-hud-dot" 
        style={{
          opacity: isActive ? 1 : 0,
          transform: `scale(${isActive ? 1 : 0})`,
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          pointerEvents: 'auto'
        }}
      />
      
      {/* Connector Line */}
      <div style={lineStyle} />
      
      {/* Callout Text Box */}
      <div style={textStyle}>
        <div style={{ fontWeight: 'bold' }}>{label}</div>
        {sublabel && <div style={{ color: 'var(--text-secondary)', fontSize: '0.55rem', marginTop: '2px' }}>{sublabel}</div>}
      </div>
    </div>
  );
}
