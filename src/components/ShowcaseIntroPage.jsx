import React from 'react';
import { SAQR_ASSETS } from '../assets/saqr_assets';

export default function ShowcaseIntroPage({ onEnterExperience }) {
  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1.5rem',
        position: 'relative',
        zIndex: 10,
        maxWidth: '800px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* SAQR Logo - Subtle Brand Mark */}
      <div style={{ marginBottom: '1rem' }}>
        <img 
          src={SAQR_ASSETS.logo} 
          alt="SAQR Logo" 
          style={{ height: '32px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* Case Study Header */}
      <p 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--accent-blue)',
          letterSpacing: '1px',
          margin: '0 0 0.5rem 0',
          textTransform: 'uppercase'
        }}
      >
        An applied fictional case study by Hussein Mlhem.
      </p>

      {/* Project Title */}
      <h1 
        className="intro-title" 
        style={{ 
          fontSize: '2.5rem', 
          margin: '0 0 0.75rem 0', 
          fontWeight: 900, 
          letterSpacing: '0.5px',
          lineHeight: '1.2'
        }}
      >
        SAQR Energy Guard
      </h1>

      {/* Short Support Line */}
      <p 
        style={{
          fontSize: '1.05rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.5',
          margin: '0 0 2rem 0',
          fontWeight: 300,
          maxWidth: '650px'
        }}
      >
        Built to demonstrate creative direction, product storytelling, presentation design, video production, and interactive web execution.
      </p>

      {/* Clean Compact Heading */}
      <h2 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          margin: '0 0 1rem 0',
          fontWeight: 500
        }}
      >
        Review the complete concept package
      </h2>

      {/* Three Minimal Cards */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '0.75rem',
          width: '100%',
          marginBottom: '2.5rem'
        }}
      >
        <div 
          style={{
            padding: '1.25rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.4)',
            textAlign: 'center'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>01 // WEB</span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Interactive Website</h3>
        </div>

        <div 
          style={{
            padding: '1.25rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.4)',
            textAlign: 'center'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>02 // DECK</span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Product Presentation</h3>
        </div>

        <div 
          style={{
            padding: '1.25rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.4)',
            textAlign: 'center'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>03 // MOTION</span>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px', margin: 0 }}>Cinematic Product Video</h3>
        </div>
      </div>

      {/* Main CTA */}
      <div style={{ marginBottom: '3rem' }}>
        <button 
          onClick={onEnterExperience} 
          className="btn-primary" 
          style={{ padding: '0.9rem 2.5rem', fontSize: '0.85rem' }}
        >
          Enter Product Experience
        </button>
      </div>

      {/* Small Muted Disclaimer at the Bottom */}
      <div 
        style={{
          position: 'absolute',
          bottom: '1.5rem',
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          opacity: 0.7
        }}
      >
        Fictional concept — created for portfolio and job evaluation purposes.
      </div>
    </div>
  );
}

