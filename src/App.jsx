import { useState, useEffect } from 'react';
import ShowcaseIntroPage from './components/ShowcaseIntroPage';
import ProductExperiencePage from './components/ProductExperiencePage';
import CinematicBackground from './components/CinematicBackground';
import CursorGlow from './components/CursorGlow';

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Synchronize path state with browser history (back/forward navigation)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      window.scrollTo(0, 0);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getNormalizedPath = (path) => {
    const base = import.meta.env.BASE_URL || '/';
    let res = path;
    if (res.startsWith(base)) {
      res = '/' + res.substring(base.length);
    }
    if (res !== '/' && res.endsWith('/')) {
      res = res.slice(0, -1);
    }
    return res;
  };

  // Custom client-side router navigation helper
  const navigateTo = (path) => {
    const base = import.meta.env.BASE_URL || '/';
    let targetPath = path;
    if (targetPath.startsWith('/')) {
      targetPath = (base + targetPath.substring(1)).replace(/\/+/g, '/');
    }
    window.history.pushState(null, '', targetPath);
    setCurrentPath(window.location.pathname);
    window.scrollTo(0, 0);
  };

  // Select the appropriate component to render based on current path
  const renderPage = () => {
    const normalized = getNormalizedPath(currentPath);
    if (normalized === '/experience') {
      return (
        <ProductExperiencePage 
          onBackToShowcase={() => navigateTo('/')} 
        />
      );
    }
    
    // Default to showcase intro page for "/" and any fallback paths
    return (
      <ShowcaseIntroPage 
        onEnterExperience={() => navigateTo('/experience')} 
      />
    );
  };

  return (
    <>
      {/* Tech HUD overlay lines & scanlines globally */}
      <CinematicBackground />
      
      {/* Premium custom mouse glow trail */}
      <CursorGlow />
      
      {/* Active Page Component */}
      {renderPage()}
    </>
  );
}

export default App;
