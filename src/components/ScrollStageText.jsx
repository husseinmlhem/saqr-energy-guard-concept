import React from 'react';

export default function ScrollStageText({ stages, progress }) {
  // Find the active stage based on progress
  const activeIndex = stages.findIndex(
    (stage) => progress >= stage.progressStart && progress <= stage.progressEnd
  );
  
  // Fallback to closest stage if not found
  const activeStage = stages[activeIndex !== -1 ? activeIndex : 0];
  
  return (
    <div className="stage-info-box">
      <div className="stage-indicator-row">
        {stages.map((_, idx) => (
          <div 
            key={idx} 
            className={`stage-dot ${idx === (activeIndex !== -1 ? activeIndex : 0) ? 'active' : ''}`}
            aria-hidden="true"
          />
        ))}
      </div>
      
      {activeStage && (
        <div style={{ transition: 'opacity 0.3s ease' }}>
          <p className="stage-step">{activeStage.step}</p>
          <h3 className="stage-title">{activeStage.title}</h3>
          <p className="stage-desc">{activeStage.desc}</p>
        </div>
      )}
    </div>
  );
}
