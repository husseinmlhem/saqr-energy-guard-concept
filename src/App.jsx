import { useState, useEffect } from 'react';
import ShowcaseIntroPage from './components/ShowcaseIntroPage';
import ProductExperiencePage from './components/ProductExperiencePage';
import CinematicBackground from './components/CinematicBackground';

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

  // Custom client-side router navigation helper
  const navigateTo = (path) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Select the appropriate component to render based on current path
  const renderPage = () => {
    if (currentPath === '/experience') {
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
      
      {/* Active Page Component */}
      {renderPage()}
    </>
  );
}

export default App;
