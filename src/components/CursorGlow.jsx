import React, { useState, useEffect } from 'react';

export default function CursorGlow() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  useEffect(() => {
    // 1. Check for mobile/touch screens or prefers-reduced-motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (isTouch || prefersReducedMotion) {
      setIsDisabled(true);
      return;
    }

    // 2. Track mouse position
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    // 3. Track hover states globally (delegated listener)
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;
      
      const isInteractive = 
        target.tagName === 'BUTTON' || 
        target.tagName === 'A' || 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('.logo-link') || 
        target.closest('.nav-item') ||
        target.style.cursor === 'pointer';
        
      setIsHovered(!!isInteractive);
    };

    const handleMouseLeaveWindow = () => {
      setIsVisible(false);
    };

    const handleMouseEnterWindow = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeaveWindow);
    document.addEventListener('mouseenter', handleMouseEnterWindow);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeaveWindow);
      document.removeEventListener('mouseenter', handleMouseEnterWindow);
    };
  }, [isVisible]);

  if (isDisabled) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: isHovered ? '44px' : '22px',
        height: isHovered ? '44px' : '22px',
        backgroundColor: 'transparent',
        border: `1px solid ${isHovered ? 'rgba(0, 255, 213, 0.6)' : 'rgba(0, 240, 255, 0.4)'}`,
        borderRadius: '50%',
        boxShadow: isHovered 
          ? '0 0 20px rgba(0, 255, 213, 0.35), inset 0 0 10px rgba(0, 255, 213, 0.2)' 
          : '0 0 12px rgba(0, 240, 255, 0.2)',
        pointerEvents: 'none',
        zIndex: 99999,
        transform: `translate3d(${position.x}px, ${position.y}px, 0) translate(-50%, -50%)`,
        transition: 'transform 0.08s cubic-bezier(0.25, 1, 0.5, 1), width 0.25s ease, height 0.25s ease, border-color 0.25s, box-shadow 0.25s',
        opacity: isVisible ? 1 : 0,
        willChange: 'transform, width, height'
      }}
    />
  );
}
