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

      {/* 2. Threat Simulation Field */}
      <section 
        className="simulation-field-section" 
        style={{ 
          padding: '6rem 2rem', 
          maxWidth: '1200px', 
          margin: '0 auto', 
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <p className="section-tagline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Simulated Threat Field</p>
        <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '2.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Threat Simulation Field</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 300, marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
          Abstract scenario mapping for a fictional protection concept.
        </p>

        {/* Digital Terrain Grid */}
        <div 
          style={{
            position: 'relative',
            width: '100%',
            height: '350px',
            backgroundColor: '#07070a',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}
        >
          {/* Scanning Sweeping Laser Line */}
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to right, transparent, rgba(0, 240, 255, 0.05) 50%, transparent 100%)',
              animation: 'sweep-laser 8s linear infinite',
              pointerEvents: 'none'
            }}
          />

          {/* SVG paths and markers */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
            <path d="M 150 120 L 450 220 L 750 100" fill="none" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" strokeDasharray="5,5" />
            <path d="M 450 220 L 880 280" fill="none" stroke="rgba(0, 255, 213, 0.2)" strokeWidth="1" strokeDasharray="3,3" />
          </svg>

          {/* Sentinel Node */}
          <div style={{ position: 'absolute', top: '100px', left: '15%', transform: 'translate(-50%, -50%)', textAlign: 'left' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-cyan)', boxShadow: '0 0 10px var(--accent-cyan)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--text-primary)', marginLeft: '10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>SENTINEL_NODE // SNT-V1</span>
          </div>

          {/* Defender Node */}
          <div style={{ position: 'absolute', top: '220px', left: '45%', transform: 'translate(-50%, -50%)', textAlign: 'left' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', boxShadow: '0 0 10px var(--accent-blue)', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--text-primary)', marginLeft: '10px', verticalAlign: 'middle', textTransform: 'uppercase' }}>DEFENDER_UNIT // DFN-V1</span>
          </div>

          {/* Threat Point A */}
          <div style={{ position: 'absolute', top: '80px', left: '75%', transform: 'translate(-50%, -50%)', textAlign: 'left' }} className="threat-blink">
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#ef4444', marginLeft: '8px', verticalAlign: 'middle' }}>ANOMALY_01: THERMAL_SPIKE</span>
          </div>

          {/* Threat Point B */}
          <div style={{ position: 'absolute', top: '280px', left: '85%', transform: 'translate(-50%, -50%)', textAlign: 'left' }} className="threat-blink">
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444', boxShadow: '0 0 10px #ef4444', display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: '#ef4444', marginLeft: '8px', verticalAlign: 'middle' }}>ANOMALY_02: SIGNAL_CORRUPT</span>
          </div>
        </div>
      </section>

      {/* 3. Intelligence Layer Stack */}
      <section 
        className="layer-stack-section" 
        style={{ 
          padding: '6rem 2rem', 
          maxWidth: '1000px', 
          margin: '0 auto', 
          textAlign: 'center'
        }}
      >
        <p className="section-tagline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Modular Architecture</p>
        <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '2.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Intelligence Layer Stack</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 300, marginBottom: '3rem', maxWidth: '800px', margin: '0 auto 3rem' }}>
          Four visual layers combine into one speculative awareness model.
        </p>

        {/* Stacked Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {[
            { step: "01", name: "Visual Layer", desc: "Real-time high-fidelity rendering and visual asset management.", color: 'var(--accent-blue)' },
            { step: "02", name: "Signal Layer", desc: "Speculative environmental radar sweeps and sensor arrays.", color: 'var(--accent-cyan)' },
            { step: "03", name: "Motion Layer", desc: "Cinematic motion reveals and dual-device transition sequences.", color: 'var(--accent-blue)' },
            { step: "04", name: "Decision Layer", desc: "Fictional telemetry, coordinated threat containment models.", color: 'var(--accent-cyan)' }
          ].map((layer, index) => (
            <div 
              key={index}
              style={{
                width: '100%',
                maxWidth: '800px',
                padding: '1.75rem 2rem',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                background: 'rgba(10, 10, 15, 0.7)',
                backdropFilter: 'blur(10px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                textAlign: 'left',
                boxShadow: `0 ${index * 8}px ${index * 12}px rgba(0,0,0,0.4)`,
                transform: `translateY(-${index * 4}px)`,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.25rem', color: layer.color, fontWeight: 'bold' }}>{layer.step}</span>
                <div>
                  <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.1rem', color: 'var(--text-primary)', margin: 0 }}>{layer.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '0.25rem 0 0 0', fontWeight: 300 }}>{layer.desc}</p>
                </div>
              </div>
              <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '4px', backgroundColor: layer.color }} />
            </div>
          ))}
        </div>
      </section>

      {/* 4. Defender GSAP Pinned Fullscreen Sequence */}
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

      {/* 5. Sentinel GSAP Pinned Fullscreen Sequence */}
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

      {/* 6. Split-Brain System Logic */}
      <section 
        ref={systemRef}
        className="split-brain-section" 
        style={{ 
          padding: '8rem 2rem', 
          maxWidth: '1100px', 
          margin: '0 auto', 
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        <p className="section-tagline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Speculative Processing</p>
        <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '2.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Split-Brain System Logic</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 300, marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
          Connected speculative intelligence split between mobile containment units and tall radar hubs.
        </p>

        <div style={{ display: 'flex', gap: '2rem', justifyContent: 'space-between', alignItems: 'stretch', flexWrap: 'wrap' }}>
          {/* Left panel: Defender */}
          <div style={{ flex: '1', minWidth: '280px', padding: '2.5rem 2rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(10, 10, 15, 0.4)', textAlign: 'left' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-blue)', display: 'block', marginBottom: '0.5rem' }}>MODULE // DFN-V1</span>
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Defender: Close-range module</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', fontWeight: 300 }}>
              Tactical mobile containment and environmental mapping. Designed to react dynamically at ground level to simulated thermal and seismic threat points.
            </p>
          </div>

          {/* Central Connecting Processing Node */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minWidth: '120px' }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px dashed var(--accent-cyan)', display: 'flex', justifyContent: 'center', alignItems: 'center', animation: 'spin-node 12s linear infinite' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'var(--accent-blue)', boxShadow: '0 0 15px var(--accent-blue)' }} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)', marginTop: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Shared Layer // Connected Intel</span>
          </div>

          {/* Right panel: Sentinel */}
          <div style={{ flex: '1', minWidth: '280px', padding: '2.5rem 2rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'rgba(10, 10, 15, 0.4)', textAlign: 'right' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.5rem' }}>STATION // SNT-V1</span>
            <h3 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>Sentinel: Vertical monitoring tower</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: '1.6', fontWeight: 300 }}>
              Static broad-range radar surveillance. Designed for high architectural placement to scan wide-area air space and broadcast coordinates to mobile nodes.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Concept Build Timeline */}
      <section 
        className="timeline-section" 
        style={{ 
          padding: '8rem 2rem', 
          maxWidth: '1000px', 
          margin: '0 auto', 
          textAlign: 'center',
          borderTop: '1px solid var(--border-color)'
        }}
      >
        <p className="section-tagline" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem' }}>Development History</p>
        <h2 style={{ fontFamily: 'var(--font-hud)', fontSize: '2.2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Concept Build Timeline</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 300, marginBottom: '4rem', maxWidth: '800px', margin: '0 auto 4rem' }}>
          From concept identity to a complete interactive product experience.
        </p>

        {/* Timeline Line */}
        <div style={{ position: 'relative', width: '100%', marginTop: '3rem' }}>
          {/* Horizontal Bar */}
          <div style={{ position: 'absolute', top: '24px', left: '10%', width: '80%', height: '1px', backgroundColor: 'var(--border-color)', zIndex: 1 }} />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '2rem' }}>
            {[
              { title: "Identity", sub: "Brand System & Aesthetics", desc: "Establishing sand beige and dark graphite palettes, typography structures, and speculative logic." },
              { title: "Presentation", sub: "Slide Deck Layout", desc: "Mapping modular device components, strategic business cases, and facility defense grids." },
              { title: "Video", sub: "Motion assembly trailer", desc: "Rendering camera sweeps, 3D parts assembly sequences, and high-DPI concept videos." },
              { title: "Website", sub: "Scroll-reveal canvas web", desc: "Developing GSAP pinned triggers, preloading canvas pipelines, and hosting final sites." }
            ].map((step, idx) => (
              <div key={idx} style={{ flex: '1', minWidth: '180px', position: 'relative', zIndex: 5, textAlign: 'center' }}>
                {/* Number Circle */}
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#07070a', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent-blue)', boxShadow: '0 0 10px rgba(0,0,0,0.8)' }}>
                  0{idx + 1}
                </div>
                <h4 style={{ fontFamily: 'var(--font-hud)', fontSize: '1.05rem', color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>{step.title}</h4>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--accent-cyan)', display: 'block', marginBottom: '0.75rem' }}>{step.sub}</span>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', lineHeight: '1.4', padding: '0 10px' }}>{step.desc}</p>
              </div>
            ))}
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
