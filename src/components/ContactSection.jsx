import React from 'react';
import GlassCard from './GlassCard';
import { PROJECT_LINKS } from '../assets/saqr_assets';

export default function ContactSection({ className = '' }) {
  const { portfolioWebsite, email, phone, linkedin } = PROJECT_LINKS;

  const renderContactCard = (title, value, href, iconText, isConfigured) => {
    return (
      <GlassCard className="system-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <p className="device-badge" style={{ marginBottom: '1rem', color: isConfigured ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
          {iconText}
        </p>
        <h4 className="system-card-title">{title}</h4>
        
        {isConfigured ? (
          <a 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ 
              color: 'var(--accent-cyan)', 
              textDecoration: 'none', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.85rem',
              marginTop: 'auto',
              wordBreak: 'break-all'
            }}
          >
            {value}
          </a>
        ) : (
          <span 
            style={{ 
              color: 'var(--text-muted)', 
              fontFamily: 'var(--font-mono)', 
              fontSize: '0.75rem',
              marginTop: 'auto',
              fontStyle: 'italic'
            }}
          >
            Config pending
          </span>
        )}
      </GlassCard>
    );
  };

  return (
    <section className={`integrated-section ${className}`} style={{ paddingBottom: '6rem' }}>
      <div className="integrated-header" style={{ marginBottom: '3rem' }}>
        <p className="section-tagline">Get In Touch</p>
        <h2 className="section-title" style={{ marginBottom: '1rem' }}>Contact Hussein Mlhem</h2>
        <p className="overview-desc" style={{ maxWidth: '800px', margin: '0 auto', fontSize: '1rem' }}>
          For portfolio, creative direction, multimedia design, video production, and AI-assisted web experience inquiries.
        </p>
      </div>

      <div className="system-details-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        
        {/* Portfolio Website - Always Available */}
        {renderContactCard(
          "Portfolio Website",
          "www.husseinmlhem.com",
          portfolioWebsite,
          "WEB // 01",
          true
        )}

        {/* Email */}
        {renderContactCard(
          "Email Address",
          "Hussein.mlhem@gmail.com",
          `mailto:${email}`,
          "MAIL // 02",
          true
        )}

        {/* Phone / WhatsApp */}
        {renderContactCard(
          "Phone / WhatsApp",
          "+971 54 288 2950",
          `tel:${phone}`,
          "TEL // 03",
          true
        )}

        {/* LinkedIn */}
        {renderContactCard(
          "LinkedIn Profile",
          "linkedin.com/in/hussein-mlhem",
          linkedin,
          "LNKD // 04",
          true
        )}

      </div>
    </section>
  );
}
