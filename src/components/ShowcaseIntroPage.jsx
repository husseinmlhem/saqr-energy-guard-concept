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
        padding: '3rem 2rem',
        position: 'relative',
        zIndex: 10,
        maxWidth: '850px',
        margin: '0 auto',
        textAlign: 'center',
        boxSizing: 'border-box'
      }}
    >
      {/* SAQR Logo - Subtle Brand Mark */}
      <div style={{ marginBottom: '1.5rem' }}>
        <img 
          src={SAQR_ASSETS.logo} 
          alt="SAQR Logo" 
          style={{ height: '36px', width: 'auto', objectFit: 'contain' }} 
        />
      </div>

      {/* Project Title */}
      <h1 
        className="intro-title" 
        style={{ 
          fontSize: '3rem', 
          margin: '0 0 1rem', 
          fontWeight: 900, 
          letterSpacing: '1px',
          lineHeight: '1.2'
        }}
      >
        SAQR Energy Guard
      </h1>

      {/* Clear Statement */}
      <p 
        style={{
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '1.5rem',
          fontWeight: 300
        }}
      >
        A fictional product concept created by Hussein Mlhem as a capability test for a job opportunity.
      </p>

      {/* Disclaimer Badge */}
      <div style={{ marginBottom: '2rem' }}>
        <span className="badge-warning" style={{ fontSize: '0.7rem', padding: '6px 14px', borderRadius: '30px' }}>
          Concept project only — not an official commercial product.
        </span>
      </div>

      {/* Clear Statement Line */}
      <p 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          letterSpacing: '0.5px',
          marginBottom: '3rem',
          fontWeight: 400
        }}
      >
        Three things to review: Interactive Website • Product Presentation • Cinematic Product Video
      </p>

      {/* Three Minimal Cards */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          width: '100%',
          marginBottom: '3.5rem'
        }}
      >
        <div 
          style={{
            padding: '1.5rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.4)',
            textAlign: 'center'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>01 // WEB</span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>Interactive Website</h3>
        </div>

        <div 
          style={{
            padding: '1.5rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.4)',
            textAlign: 'center'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>02 // DECK</span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>Product Presentation</h3>
        </div>

        <div 
          style={{
            padding: '1.5rem 1rem',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            backgroundColor: 'rgba(10, 10, 15, 0.4)',
            textAlign: 'center'
          }}
        >
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>03 // MOTION</span>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', letterSpacing: '0.5px' }}>Cinematic Product Video</h3>
        </div>
      </div>

      {/* Main CTA */}
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={onEnterExperience} 
          className="btn-primary" 
          style={{ padding: '0.9rem 2.5rem', fontSize: '0.85rem' }}
        >
          Enter Product Experience
        </button>
      </div>
    </div>
  );
}

