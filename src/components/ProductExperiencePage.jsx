import React, { useRef, useState, useEffect } from 'react';
import ProductHero from './ProductHero';
import GlassCard from './GlassCard';
import SectionHeader from './SectionHeader';
import FrameSequenceScroll from './FrameSequenceScroll';
import ContactSection from './ContactSection';
import OrbitalRadarConsole from './OrbitalRadarConsole';
import DefenderBlueprint from './DefenderBlueprint';
import SentinelCoverageCone from './SentinelCoverageCone';
import SignalRoutingMesh from './SignalRoutingMesh';
import TacticalTimeline from './TacticalTimeline';
import { SAQR_ASSETS, PROJECT_LINKS } from '../assets/saqr_assets';

export default function ProductExperiencePage({ onBackToShowcase }) {
  const defenderRef = useRef(null);
  const sentinelRef = useRef(null);
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
            <img src={SAQR_ASSETS.experienceLogoVariant} alt="SAQR Logo" className="logo-img" />
          </div>
          
          <nav>
            <ul className="nav-menu">
              <li className="nav-item">
                <a onClick={() => scrollToSection(defenderRef)}>Defender</a>
              </li>
              <li className="nav-item">
                <a onClick={() => scrollToSection(sentinelRef)}>Sentinel</a>
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

      {/* 2. Orbital Radar Sweep Console */}
      <OrbitalRadarConsole />

      {/* 3. Defender Scroll Reveal */}
      <div ref={defenderRef}>
        <FrameSequenceScroll
          productName="Defender"
          posterPath={SAQR_ASSETS.defenderPoster}
          frameCount={SAQR_ASSETS.defenderFrameCount}
          getFramePath={SAQR_ASSETS.getDefenderFramePath}
          stages={defenderStages}
          callouts={defenderCallouts}
          backgroundColor="#bcbcbd"
        />
      </div>

      {/* 4. Defender Blueprint / close-range intelligence section */}
      <DefenderBlueprint />

      {/* 5. Sentinel Scroll Reveal */}
      <div ref={sentinelRef}>
        <FrameSequenceScroll
          productName="Sentinel"
          posterPath={SAQR_ASSETS.sentinelPoster}
          frameCount={SAQR_ASSETS.sentinelFrameCount}
          getFramePath={SAQR_ASSETS.getSentinelFramePath}
          stages={sentinelStages}
          callouts={sentinelCallouts}
          backgroundColor="#b8babb"
        />
      </div>

      {/* 6. Sentinel Vertical Coverage section */}
      <SentinelCoverageCone />

      {/* 7. Signal Routing Mesh */}
      <SignalRoutingMesh />

      {/* 8. Tactical Interface Timeline */}
      <TacticalTimeline />

      {/* 9. Cinematic Product Video Section */}
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
