import React, { useRef, useState, useEffect } from 'react';
import TechnicalCallout from './TechnicalCallout';

export default function FrameSequenceScroll({
  productName,
  posterPath,
  frameCount,
  getFramePath,
  stages,
  callouts = []
}) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [progress, setProgress] = useState(0);
  const [hasStartedLoading, setHasStartedLoading] = useState(false);
  const [loadedImages, setLoadedImages] = useState({});
  const [loadCount, setLoadCount] = useState(0);
  const [currentFrameIndex, setCurrentFrameIndex] = useState(1);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  // 1. Trigger lazy-loading when container approaches viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStartedLoading(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 2. Progressive background preloader with error detection
  useEffect(() => {
    if (!hasStartedLoading) return;

    let isMounted = true;
    let loaded = 0;
    
    const loadImage = (index) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = getFramePath(index);
        img.onload = () => {
          if (isMounted) {
            setLoadedImages(prev => ({ ...prev, [index]: img }));
            loaded++;
            setLoadCount(loaded);
          }
          resolve(true);
        };
        img.onerror = () => {
          resolve(false);
        };
      });
    };

    const preload = async () => {
      const firstFrameUrl = getFramePath(1);
      
      // Load frame 1 immediately to transition from poster
      const firstFrameImg = new Image();
      firstFrameImg.src = firstFrameUrl;
      
      const success = await new Promise((resolve) => {
        firstFrameImg.onload = () => {
          if (isMounted) {
            setLoadedImages(prev => ({ ...prev, 1: firstFrameImg }));
            setLoadCount(1);
          }
          resolve(true);
        };
        firstFrameImg.onerror = () => {
          console.error("Frame not found:", firstFrameUrl);
          if (isMounted) {
            setLoadError(firstFrameUrl);
          }
          resolve(false);
        };
      });

      if (!success || !isMounted) {
        return; // stop execution and show error overlay
      }

      // Preload remaining frames in batches of 4
      const batchSize = 4;
      for (let i = 2; i <= frameCount; i += batchSize) {
        if (!isMounted) break;
        
        const promises = [];
        for (let j = 0; j < batchSize && (i + j) <= frameCount; j++) {
          promises.push(loadImage(i + j));
        }
        
        await Promise.all(promises);
        await new Promise(r => setTimeout(r, 20)); // tiny throttle delay
      }
    };

    preload();

    return () => {
      isMounted = false;
    };
  }, [hasStartedLoading, frameCount, getFramePath]);

  // 3. Canvas rendering function with custom scale zoom logic
  const drawFrame = (frameIndex, imagesMap) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let img = imagesMap[frameIndex];
    if (!img) {
      // Find closest loaded frame if target frame is not loaded yet
      for (let offset = 1; offset < frameCount; offset++) {
        if (imagesMap[frameIndex - offset]) {
          img = imagesMap[frameIndex - offset];
          break;
        }
        if (imagesMap[frameIndex + offset]) {
          img = imagesMap[frameIndex + offset];
          break;
        }
      }
    }

    if (img) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      
      let drawWidth, drawHeight;
      
      // Determine scaling factor to fill the screen dominantly (avoiding gaps)
      let scale = 1.0;
      if (productName === 'Defender') {
        scale = 1.35; // scale up Defender frames to make it look full cinematic width
      } else {
        scale = 1.25; // scale up Sentinel tower to make it feel tall and powerful
      }

      if (imgRatio > canvasRatio) {
        drawWidth = canvas.width * scale;
        drawHeight = (canvas.width / imgRatio) * scale;
      } else {
        drawHeight = canvas.height * scale;
        drawWidth = (canvas.height * imgRatio) * scale;
      }

      // Re-center drawing coordinates
      const xOffset = (canvas.width - drawWidth) / 2;
      const yOffset = (canvas.height - drawHeight) / 2;
      
      ctx.drawImage(img, xOffset, yOffset, drawWidth, drawHeight);
      if (!isCanvasReady) setIsCanvasReady(true);
    }
  };

  // 4. Handle resize and high-DPI scaling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      drawFrame(currentFrameIndex, loadedImages);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [loadedImages, currentFrameIndex]);

  // Redraw when new images load
  useEffect(() => {
    drawFrame(currentFrameIndex, loadedImages);
  }, [loadedImages, currentFrameIndex]);

  // 5. Scroll progress listener (throttled with requestAnimationFrame)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!containerRef.current) return;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          const rect = containerRef.current.getBoundingClientRect();
          const viewHeight = window.innerHeight;
          const scrollableDistance = rect.height - viewHeight;
          const scrolledAmount = -rect.top;
          
          let currentProgress = scrolledAmount / scrollableDistance;
          currentProgress = Math.max(0, Math.min(1, currentProgress));
          
          setProgress(currentProgress);

          const targetIndex = Math.max(
            1, 
            Math.min(
              frameCount, 
              Math.floor(currentProgress * (frameCount - 1)) + 1
            )
          );
          
          setCurrentFrameIndex(targetIndex);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [frameCount]);

  const activeStageIndex = stages.findIndex(
    stage => progress >= stage.progressStart && progress <= stage.progressEnd
  );
  const activeStage = stages[activeStageIndex !== -1 ? activeStageIndex : 0];
  const activeCalloutIndices = activeStage?.activeCallouts || [];
  const showFallback = !isCanvasReady;

  return (
    <section className="sequence-shell" style={{ height: '300vh', position: 'relative', width: '100%' }}>
      <div 
        className="sequence-sticky"
        style={{
          position: 'sticky',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--bg-primary)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {/* Full-width and height canvas container */}
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 5
          }}
        >
          {/* Fallback poster image */}
          <img 
            src={posterPath} 
            alt={`${productName} Showcase Poster`}
            className={`poster-fallback ${showFallback ? '' : 'hidden'}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
          
          {/* Canvas for rendering frame sequences */}
          <canvas 
            ref={canvasRef} 
            className={`scroll-canvas ${showFallback ? '' : 'loaded'}`}
            style={{ 
              width: '100%', 
              height: '100vh',
              display: 'block',
              objectFit: 'contain'
            }}
          />

          {/* Floating Technical HUD Callouts */}
          <div 
            className="visual-hud-overlay"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {callouts.map((callout, index) => (
              <TechnicalCallout
                key={index}
                x={callout.x}
                y={callout.y}
                label={callout.label}
                sublabel={callout.sublabel}
                align={callout.align}
                isActive={activeCalloutIndices.includes(index)}
              />
            ))}
          </div>

          {/* Corner HUD Data Logs */}
          {hasStartedLoading && (
            <div 
              style={{
                position: 'absolute',
                top: '100px',
                right: '40px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.6rem',
                color: 'var(--text-muted)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                textAlign: 'right',
                zIndex: 25
              }}
            >
              <div>SYS_LNK: OPERATIONAL</div>
              <div>BUFF_BUFFERS: {loadCount} / {frameCount} F</div>
              <div>ACTIVE_IDX: 0x{currentFrameIndex.toString(16).toUpperCase().padStart(2, '0')}</div>
            </div>
          )}

          {/* Sentinel measurement grid lines */}
          {productName === 'Sentinel' && (
            <>
              <div 
                style={{
                  position: 'absolute',
                  top: '10%',
                  left: '15%',
                  height: '80%',
                  width: '1px',
                  background: 'linear-gradient(to bottom, transparent, var(--accent-cyan), transparent)',
                  opacity: 0.2,
                  zIndex: 10
                }} 
              />
              <div 
                style={{
                  position: 'absolute',
                  top: '15%',
                  left: '16%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: 'var(--accent-cyan)',
                  opacity: 0.4,
                  zIndex: 10
                }}
              >
                +12.4M
              </div>
              <div 
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '16%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: 'var(--accent-cyan)',
                  opacity: 0.4,
                  zIndex: 10
                }}
              >
                +6.2M
              </div>
              <div 
                style={{
                  position: 'absolute',
                  top: '85%',
                  left: '16%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.55rem',
                  color: 'var(--accent-cyan)',
                  opacity: 0.4,
                  zIndex: 10
                }}
              >
                +0.0M
              </div>
              <div 
                className="scanning-beam" 
                style={{
                  position: 'absolute',
                  left: '20%',
                  width: '60%',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, var(--accent-cyan), transparent)',
                  opacity: 0.1,
                  zIndex: 10
                }} 
              />
            </>
          )}

          {/* Visible Error Overlay if First Frame Fails to Load */}
          {loadError && (
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '2px solid rgba(239, 68, 68, 0.8)',
                padding: '2rem',
                borderRadius: '8px',
                color: '#ef4444',
                fontFamily: 'var(--font-mono)',
                zIndex: 99,
                maxWidth: '90%',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.8)'
              }}
            >
              <h3 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>[ FRAME_LOAD_ERROR ]</h3>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>Failed to load the initial animation frame.</p>
              <code style={{ display: 'block', wordBreak: 'break-all', backgroundColor: 'rgba(0, 0, 0, 0.5)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', marginTop: '1rem', color: '#fca5a5' }}>
                {loadError}
              </code>
            </div>
          )}
        </div>

        {/* Minimal Floating Stage Text Overlay (Bottom Left) */}
        <div 
          className="glass-panel"
          style={{
            position: 'absolute',
            bottom: '6vh',
            left: 'clamp(20px, 5vw, 72px)',
            zIndex: 30,
            maxWidth: '360px',
            width: 'calc(100% - 40px)',
            padding: '1.25rem',
            textAlign: 'left',
            boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
            <span 
              style={{ 
                fontFamily: 'var(--font-mono)', 
                fontSize: '0.65rem', 
                color: 'var(--accent-blue)', 
                textTransform: 'uppercase', 
                letterSpacing: '2px'
              }}
            >
              {productName === 'Sentinel' ? 'Sentinel // SNT-V1' : 'Defender // DFN-V1'}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'var(--text-muted)' }}>
              F: {currentFrameIndex.toString().padStart(2, '0')} / {frameCount}
            </span>
          </div>

          <h3 
            style={{ 
              fontFamily: 'var(--font-hud)', 
              fontSize: '1.15rem', 
              fontWeight: 700, 
              margin: '0 0 0.5rem', 
              color: 'var(--text-primary)' 
            }}
          >
            {activeStage?.title || 'Initializing'}
          </h3>

          <p 
            style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.8rem', 
              fontWeight: 300, 
              lineHeight: '1.4',
              marginBottom: '1rem',
              minHeight: '2.8em' // maintain height to prevent jumps
            }}
          >
            {activeStage?.desc || ''}
          </p>

          {/* Thin horizontal progress bar (0 to 100%) */}
          <div 
            style={{ 
              width: '100%', 
              height: '2px', 
              backgroundColor: 'rgba(255,255,255,0.08)', 
              borderRadius: '1px',
              overflow: 'hidden'
            }}
          >
            <div 
              style={{ 
                width: `${Math.round(progress * 100)}%`, 
                height: '100%', 
                backgroundColor: 'var(--accent-blue)', 
                boxShadow: '0 0 8px var(--accent-blue)',
                transition: 'width 0.1s ease-out'
              }} 
            />
          </div>
        </div>

      </div>
    </section>
  );
}
