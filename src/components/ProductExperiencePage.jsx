import React, { useRef, useState, useEffect } from 'react';
import ProductHero from './ProductHero';
import GlassCard from './GlassCard';
import SectionHeader from './SectionHeader';
import FrameSequenceScroll from './FrameSequenceScroll';
import ContactSection from './ContactSection';
import { SAQR_ASSETS, PROJECT_LINKS } from '../assets/saqr_assets';

export default function ProductExperiencePage({ onBackToShowcase }) {
  const defenderRef = useRef(null);
  const sentinelRef = useRef(null);
  const systemRef = useRef(null);
  const videoRef = useRef(null);
  const presentationRef = useRef(null);
  const contactRef = useRef(null);

  const [pdfExists, setPdfExists] = useState(false);

  // Auto-detect if presentation PDF exists in the assets directory using range request
  useEffect(() => {
    fetch(PROJECT_LINKS.presentationViewUrl, {
      headers: { Range: 'bytes=0-0' }
    })
      .then((res) => {
        if (res.status === 200 || res.status === 206) {
          setPdfExists(true);
        } else {
          setPdfExists(false);
        }
      })
      .catch(() => {
        setPdfExists(false);
      });
  }, []);

  const scrollToSection = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Defender scroll stages (strictly one-line descriptions)
  const defenderStages = [
    {
      progressStart: 0,
      progressEnd: 0.25,
      step: "Stage 01 // Component Laydown",
      title: "Separated Components",
      desc: "Modular components laid out to illustrate the transition into a complete operational device.",
      activeCallouts: [3] // Assembly Lock
    },
    {
      progressStart: 0.25,
      progressEnd: 0.5,
      step: "Stage 02 // Structural Core",
      title: "Internal Structure",
      desc: "Internal chassis, thermal management lines, and electrical conduits align.",
      activeCallouts: [0, 3] // Module Core, Assembly Lock
    },
    {
      progressStart: 0.5,
      progressEnd: 0.75,
      step: "Stage 03 // Precision Alignment",
      title: "Sensor Core Integration",
      desc: "Directed-energy module and tracking lenses couple with the rotation base.",
      activeCallouts: [0, 1] // Module Core, Vision Unit
    },
    {
      progressStart: 0.75,
      progressEnd: 1.0,
      step: "Stage 04 // Operational State",
      title: "Final Operational Form",
      desc: "Protective sand beige outer panels lock, completing the assembly sequence.",
      activeCallouts: [0, 1, 2, 3] // all callouts
    }
  ];

  const defenderCallouts = [
    { label: "Module Core", sublabel: "Sealed computer box", x: "47%", y: "42%", align: "right" },
    { label: "Vision Unit", sublabel: "Optical lens array", x: "45%", y: "28%", align: "left" },
    { label: "Stabilized Base", sublabel: "Rotational platform", x: "50%", y: "74%", align: "right" },
    { label: "Assembly Lock", sublabel: "Heavy mechanical connector", x: "36%", y: "58%", align: "left" }
  ];

  // Sentinel scroll stages (strictly one-line descriptions)
  const sentinelStages = [
    {
      progressStart: 0,
      progressEnd: 0.25,
      step: "Stage 01 // Structural Base",
      title: "Modular Foundation",
      desc: "Vertical trusses and structural base frame lay the architectural foundation.",
      activeCallouts: [3] // Base Anchor
    },
    {
      progressStart: 0.25,
      progressEnd: 0.5,
      step: "Stage 02 // Core Uplift",
      title: "Structural Elevation",
      desc: "Central monitoring column rises telescopically to target surveillance height.",
      activeCallouts: [0, 3] // Vertical Core, Base Anchor
    },
    {
      progressStart: 0.5,
      progressEnd: 0.75,
      step: "Stage 03 // Sensor Coupling",
      title: "Sensor Integration",
      desc: "Threat-scanning lenses and side radar panels align on the rotating core.",
      activeCallouts: [0, 1] // Vertical Core, Sensor Column
    },
    {
      progressStart: 0.75,
      progressEnd: 1.0,
      step: "Stage 04 // Simulation Active",
      title: "Wide-Area Awareness",
      desc: "Active signal crown starts local perimeter intelligence mapping.",
      activeCallouts: [0, 1, 2, 3] // all callouts
    }
  ];

  const sentinelCallouts = [
    { label: "Vertical Core", sublabel: "Reinforced support column", x: "50%", y: "52%", align: "right" },
    { label: "Sensor Column", sublabel: "Electro-optical array", x: "46%", y: "30%", align: "left" },
    { label: "Signal Crown", sublabel: "Teal radar indicators", x: "50%", y: "14%", align: "right" },
    { label: "Base Anchor", sublabel: "Concrete foundation base", x: "50%", y: "83%", align: "left" }
  ];

  return (
    <div className="experience-container">
      {/* Experience Header */}
      <header className="site-header">
        <div className="nav-container">
          <div className="logo-link" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src={SAQR_ASSETS.logo} alt="SAQR Logo" className="logo-img" />
            <span className="logo-text">SAQR</span>
          </div>
          
          <span className="badge-concept">Concept Project</span>
          
          <nav>
            <ul className="nav-menu">
              <li className="nav-item">
                <a onClick={() => scrollToSection(defenderRef)}>Defender</a>
              </li>
              <li className="nav-item">
                <a onClick={() => scrollToSection(sentinelRef)}>Sentinel</a>
              </li>
              <li className="nav-item">
                <a onClick={() => scrollToSection(systemRef)}>System</a>
              </li>
              <li className="nav-item">
                <a onClick={() => scrollToSection(videoRef)}>Video</a>
              </li>
              <li className="nav-item">
                <a onClick={() => scrollToSection(presentationRef)}>Presentation</a>
              </li>
              <li className="nav-item">
                <a onClick={() => scrollToSection(contactRef)} style={{ color: 'var(--accent-blue)' }}>Contact</a>
              </li>
              <li className="nav-item">
                <a onClick={onBackToShowcase} style={{ color: 'var(--accent-cyan)' }}>Showcase</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* 1. Cinematic Hero */}
      <ProductHero 
        onExploreClick={() => scrollToSection(defenderRef)} 
        onBackToShowcase={onBackToShowcase}
      />

      {/* 2. Mission / Concept Statement */}
      <section 
        className="mission-section" 
        style={{ 
          padding: '8rem 2rem', 
          maxWidth: '1000px', 
          margin: '0 auto', 
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div style={{ marginBottom: '3rem' }}>
          <p className="section-tagline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Speculative Vision</p>
          <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '2.2rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Two devices. One speculative protection system.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', fontWeight: 300, lineHeight: '1.7', maxWidth: '800px', margin: '0 auto' }}>
            SAQR Energy Guard explores how product storytelling, visual identity, motion, presentation design, and interactive web experience can merge into one complete fictional launch concept.
          </p>
        </div>

        {/* Abstract indicators and connections */}
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: '4rem', flexWrap: 'wrap', gap: '2rem' }}>
          <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.5rem' }}>01 // SYSTEM</span>
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Concept System</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Strategic device positioning and facility integration.</p>
          </div>
          
          <div style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)', display: 'block', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-2px', left: '50%', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', boxShadow: '0 0 10px var(--accent-blue)' }} />
          </div>

          <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.5rem' }}>02 // MOTION</span>
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Motion Reveal</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Modular parts and telescopic lift animations.</p>
          </div>

          <div style={{ width: '80px', height: '1px', background: 'linear-gradient(90deg, transparent, var(--accent-blue), transparent)', display: 'block', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-2px', left: '50%', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', boxShadow: '0 0 10px var(--accent-blue)' }} />
          </div>

          <div style={{ textAlign: 'center', flex: '1', minWidth: '200px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.5rem' }}>03 // EXECUTION</span>
            <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Interactive Experience</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Scroll-driven web execution and assembly rendering.</p>
          </div>
        </div>
      </section>

      {/* 3. Defender Immersive Scroll Assembly */}
      <div ref={defenderRef}>
        <FrameSequenceScroll
          productName="Defender"
          posterPath={SAQR_ASSETS.defenderPoster}
          frameCount={SAQR_ASSETS.defenderFrameCount}
          getFramePath={SAQR_ASSETS.getDefenderFramePath}
          stages={defenderStages}
          callouts={defenderCallouts}
        />
      </div>

      {/* 4. Sentinel Immersive Scroll Assembly */}
      <div ref={sentinelRef}>
        <FrameSequenceScroll
          productName="Sentinel"
          posterPath={SAQR_ASSETS.sentinelPoster}
          frameCount={SAQR_ASSETS.sentinelFrameCount}
          getFramePath={SAQR_ASSETS.getSentinelFramePath}
          stages={sentinelStages}
          callouts={sentinelCallouts}
        />
      </div>

      {/* 5. Dual-System Interaction Section */}
      <section 
        ref={systemRef}
        className="dual-system-section" 
        style={{ 
          padding: '8rem 2rem', 
          maxWidth: '1100px', 
          margin: '0 auto', 
          textAlign: 'center',
          overflow: 'hidden'
        }}
      >
        <p className="section-tagline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Operational Network</p>
        <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '2rem', fontWeight: 700, marginBottom: '3rem', color: 'var(--text-primary)' }}>Connected Speculative Ecosystem</h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', minHeight: '400px', flexWrap: 'wrap', gap: '3rem' }}>
          
          {/* Left Device: Defender */}
          <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <img 
              src={SAQR_ASSETS.defenderPoster} 
              alt="SAQR Defender" 
              style={{ width: '240px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0, 180, 216, 0.2))' }} 
            />
            <div style={{ marginTop: '1.5rem' }}>
              <span className="badge-concept" style={{ color: 'var(--accent-blue)', borderColor: 'var(--accent-blue)' }}>DFN-V1</span>
              <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>SAQR Defender</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Close-range response module</p>
            </div>
          </div>

          {/* Center Animated Connection Line & Scanning Beams */}
          <div style={{ position: 'absolute', top: '40%', left: '20%', width: '60%', height: '2px', background: 'linear-gradient(90deg, transparent, var(--accent-blue), var(--accent-cyan), transparent)', zIndex: 5, pointerEvents: 'none' }} className="beam-animation-container">
            {/* Pulsing glow particle that slides across */}
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: 'var(--accent-cyan)',
              borderRadius: '50%',
              boxShadow: '0 0 15px var(--accent-cyan), 0 0 30px var(--accent-cyan)',
              position: 'absolute',
              top: '-5px',
              left: '0%',
              animation: 'pulse-beam 4s cubic-bezier(0.4, 0, 0.2, 1) infinite'
            }} />
          </div>

          {/* Right Device: Sentinel */}
          <div style={{ flex: '1', minWidth: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 10 }}>
            <img 
              src={SAQR_ASSETS.sentinelPoster} 
              alt="SAQR Sentinel" 
              style={{ width: '220px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 15px 30px rgba(0, 255, 213, 0.2))' }} 
            />
            <div style={{ marginTop: '1.5rem' }}>
              <span className="badge-concept" style={{ color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}>SNT-V1</span>
              <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>SAQR Sentinel</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Vertical monitoring tower</p>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Creative Deliverables / Process */}
      <section 
        className="deliverables-section" 
        style={{ 
          padding: '8rem 2rem', 
          maxWidth: '1100px', 
          margin: '0 auto', 
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        <p className="section-tagline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Scope of Work</p>
        <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '2rem', fontWeight: 700, marginBottom: '4rem', color: 'var(--text-primary)' }}>Built as a complete creative package</h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', textAlign: 'left' }}>
          
          {/* Panel 1: Interactive Website */}
          <div 
            style={{ 
              padding: '2.5rem 2rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              background: 'rgba(10, 10, 15, 0.6)', 
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>DELIVERABLE // 01</span>
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Interactive Website</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', fontWeight: 300 }}>
              Scroll-driven product storytelling and responsive web execution.
            </p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--accent-blue)' }} />
          </div>

          {/* Panel 2: Product Presentation */}
          <div 
            style={{ 
              padding: '2.5rem 2rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              background: 'rgba(10, 10, 15, 0.6)', 
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>DELIVERABLE // 02</span>
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Product Presentation</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', fontWeight: 300 }}>
              A structured deck explaining the concept, visual system, and fictional product logic.
            </p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--accent-cyan)' }} />
          </div>

          {/* Panel 3: Cinematic Product Video */}
          <div 
            style={{ 
              padding: '2.5rem 2rem', 
              borderRadius: '8px', 
              border: '1px solid var(--border-color)', 
              background: 'rgba(10, 10, 15, 0.6)', 
              backdropFilter: 'blur(10px)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '1rem' }}>DELIVERABLE // 03</span>
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Cinematic Product Video</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', fontWeight: 300 }}>
              Motion-led assembly reveal designed to present the fictional product universe.
            </p>
            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--accent-blue)' }} />
          </div>

        </div>
      </section>

      {/* 5. Cinematic Product Video Section */}
      <section ref={videoRef} className="integrated-section" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="integrated-header">
          <SectionHeader 
            tagline="Concept Video" 
            title="Cinematic Product Video" 
          />
          <p className="overview-desc" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '2.5rem', fontSize: '1rem', fontWeight: 300 }}>
            A motion-led reveal created as part of the SAQR Energy Guard fictional concept package, showing the product components assembling into their final forms.
          </p>
        </div>

        <GlassCard 
          style={{ 
            maxWidth: '900px', 
            margin: '0 auto', 
            padding: '1.5rem',
            boxShadow: '0 30px 60px rgba(0,0,0,0.8)' 
          }}
        >
          {/* Responsive 16:9 Aspect Video Container */}
          <div 
            style={{ 
              position: 'relative', 
              paddingBottom: '56.25%', 
              height: 0, 
              overflow: 'hidden',
              borderRadius: '4px',
              border: '1px solid rgba(255,255,255,0.05)'
            }}
          >
            <iframe
              src={PROJECT_LINKS.youtubeVideoUrl}
              title="SAQR Energy Guard Cinematic Product Video"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
            />
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
            <a 
              href={PROJECT_LINKS.youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Open on YouTube
            </a>
          </div>
        </GlassCard>
      </section>

      {/* 6. Product Presentation Section */}
      <section ref={presentationRef} className="integrated-section" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="integrated-header">
          <SectionHeader 
            tagline="Strategic Deck" 
            title="Product Presentation" 
          />
          <p className="overview-desc" style={{ maxWidth: '800px', margin: '0 auto', marginBottom: '2.5rem', fontSize: '1rem', fontWeight: 300 }}>
            A structured product deck designed to present the fictional concept, product positioning, visual system, and launch story.
          </p>
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {pdfExists ? (
            /* Premium PDF Viewer Frame */
            <GlassCard style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <div 
                style={{ 
                  width: '100%', 
                  height: '500px', 
                  borderRadius: '4px', 
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.05)',
                  backgroundColor: '#000'
                }}
              >
                <iframe
                  src={PROJECT_LINKS.presentationViewUrl}
                  title="SAQR Energy Guard Presentation PDF"
                  width="100%"
                  height="100%"
                  style={{ border: 'none' }}
                />
              </div>
            </GlassCard>
          ) : (
            /* Polished Fallback Placeholder Card */
            <GlassCard 
              style={{ 
                padding: '4rem 2rem', 
                textAlign: 'center', 
                marginBottom: '2rem',
                borderStyle: 'dashed',
                borderColor: 'var(--border-color-active)'
              }}
            >
              <div 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '1.25rem', 
                  color: 'var(--accent-blue)', 
                  marginBottom: '1rem' 
                }}
              >
                [ PDF_VIEWER_OFFLINE ]
              </div>
              <p className="stage-desc" style={{ maxWidth: '500px', margin: '0 auto', fontSize: '0.9rem' }}>
                Presentation file will be added here.
              </p>
              <p 
                style={{ 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: '0.65rem', 
                  color: 'var(--text-muted)', 
                  marginTop: '1.5rem' 
                }}
              >
                Target path: {PROJECT_LINKS.presentationViewUrl}
              </p>
            </GlassCard>
          )}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a 
              href={PROJECT_LINKS.presentationViewUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn-secondary"
            >
              View Presentation
            </a>
            <a 
              href={PROJECT_LINKS.presentationDownloadUrl} 
              download="SAQR-Energy-Guard-Presentation.pdf"
              className="btn-primary"
            >
              Download Presentation
            </a>
          </div>
        </div>
      </section>

      {/* 7. Contact Section */}
      <div ref={contactRef}>
        <ContactSection />
      </div>

      {/* 8. Experience Footer */}
      <footer className="site-footer">
        <p>SAQR Energy Guard — Fictional concept project by Hussein Mlhem.</p>
        <p style={{ marginTop: '0.5rem' }}>
          Portfolio: <a href={PROJECT_LINKS.portfolioWebsite} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>www.husseinmlhem.com</a>
        </p>
        <p style={{ marginTop: '0.5rem', opacity: 0.6 }}>Created for portfolio and job evaluation purposes.</p>
      </footer>
    </div>
  );
}
