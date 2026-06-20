export default function ProductHero({ onExploreClick, onBackToShowcase }) {
  return (
    <section className="product-hero-section" style={{ height: '100vh', padding: 0 }}>
      {/* Corner HUD Data Overlay */}
      <div className="hero-overlay-hud" aria-hidden="true">
        <div>PROT_TYP: SG-02 // DUAL DEVICE</div>
        <div>SYS_STATUS: ACTIVE_SIMULATION</div>
        <div>STORY_DIR: HUSSEIN MLHEM</div>
      </div>
      
      <div className="hero-overlay-hud-right" aria-hidden="true">
        <div>SYS_COORD: 24.4539° N, 54.3773° E</div>
        <div>MULTIMEDIA_CAPABILITY_TEST</div>
        <div>DATE: 2026.06.20</div>
      </div>

      <div className="hero-text-content">
        <div style={{ marginBottom: '1.5rem' }}>
          <span className="badge-concept">Concept Project</span>
        </div>
        
        <h1 className="hero-title" style={{ fontSize: '4.5rem', marginBottom: '1rem' }}>
          SAQR Energy Guard
        </h1>
        <p className="hero-subtitle" style={{ fontSize: '1.25rem', fontWeight: 300, maxWidth: '700px', margin: '0 auto 2.5rem' }}>
          A fictional dual-device concept for futuristic environmental intelligence.
        </p>
        
        <div className="cta-group">
          <button onClick={onExploreClick} className="btn-primary">
            Start Experience
          </button>
          <button onClick={onBackToShowcase} className="btn-secondary">
            Back to Showcase
          </button>
        </div>
      </div>
    </section>
  );
}
