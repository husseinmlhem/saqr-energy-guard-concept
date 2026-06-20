import React from 'react';
import { SAQR_ASSETS, PROJECT_LINKS } from '../assets/saqr_assets';

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
      {/* SAQR Logo - Dominant Visual */}
      <div style={{ marginBottom: '2.5rem' }}>
        <img 
          src={SAQR_ASSETS.logo} 
          alt="SAQR Logo" 
          style={{ height: '80px', width: 'auto', objectFit: 'contain' }} 
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
          fontSize: '0.8rem',
          color: 'var(--accent-blue)',
          textTransform: 'uppercase',
          letterSpacing: '1.5px',
          marginBottom: '3rem'
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

      {/* Main CTA & Secondary Links */}
      <div style={{ marginBottom: '5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <button 
          onClick={onEnterExperience} 
          className="btn-primary" 
          style={{ padding: '0.9rem 2.5rem', fontSize: '0.85rem' }}
        >
          Enter Product Experience
        </button>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a 
            href={PROJECT_LINKS.youtubeWatchUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: 'var(--text-secondary)', 
              textDecoration: 'none', 
              fontSize: '0.75rem', 
              fontFamily: 'var(--font-mono)',
              borderBottom: '1px solid transparent',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Watch Video
          </a>
          <a 
            href={PROJECT_LINKS.presentationViewUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: 'var(--text-secondary)', 
              textDecoration: 'none', 
              fontSize: '0.75rem', 
              fontFamily: 'var(--font-mono)',
              borderBottom: '1px solid transparent',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            View Presentation
          </a>
        </div>
      </div>

      {/* Small Footer */}
      <footer 
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          width: '100%',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <span>Created by Hussein Mlhem</span>
        <a 
          href={PROJECT_LINKS.portfolioWebsite} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.3s' }}
          onMouseEnter={(e) => e.target.style.color = 'var(--accent-blue)'}
          onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
        >
          www.husseinmlhem.com
        </a>
      </footer>
    </div>
  );
}
