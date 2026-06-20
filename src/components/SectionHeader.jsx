import React from 'react';

export default function SectionHeader({ tagline, title, className = '' }) {
  return (
    <div className={`section-header ${className}`} style={{ marginBottom: '3rem' }}>
      {tagline && <p className="section-tagline">{tagline}</p>}
      {title && <h2 className="section-title">{title}</h2>}
    </div>
  );
}
