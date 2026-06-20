import React from 'react';

export default function GlassCard({ children, className = '', style = {}, ...props }) {
  return (
    <div 
      className={`glass-panel-interactive ${className}`} 
      style={style} 
      {...props}
    >
      {children}
    </div>
  );
}
