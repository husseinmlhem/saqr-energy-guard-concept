const BASE_URL = import.meta.env.BASE_URL || '/';

export const SAQR_ASSETS = {
  logo: `${BASE_URL}assets/saqr/Logo.png`,
  defenderPoster: `${BASE_URL}assets/saqr/Defender.png`,
  sentinelPoster: `${BASE_URL}assets/saqr/Senetial.png`,
  defenderFramesPath: `${BASE_URL}assets/saqr/Defender/frames`,
  sentinelFramesPath: `${BASE_URL}assets/saqr/Senetial/frames`,
  defenderFrameCount: 49,
  sentinelFrameCount: 40,
  
  getDefenderFramePath: (index) => {
    const frameNum = String(index).padStart(4, '0');
    const time = ((index - 1) * 0.1).toFixed(2);
    return `${BASE_URL}assets/saqr/Defender/frames/frame_${frameNum}_${time}s.webp`;
  },
  
  getSentinelFramePath: (index) => {
    const frameNum = String(index).padStart(4, '0');
    const time = ((index - 1) * 0.1).toFixed(2);
    return `${BASE_URL}assets/saqr/Senetial/frames/frame_${frameNum}_${time}s.webp`;
  }
};

export const PROJECT_LINKS = {
  // Cinematic product video YouTube links
  youtubeVideoUrl: "https://www.youtube.com/embed/qNlmI27_694",
  youtubeWatchUrl: "https://www.youtube.com/watch?v=qNlmI27_694",
  
  // Product presentation PDF viewer & download paths
  presentationViewUrl: `${BASE_URL}assets/saqr/presentation/SAQR-Energy-Guard-Presentation.pdf`,
  presentationDownloadUrl: `${BASE_URL}assets/saqr/presentation/SAQR-Energy-Guard-Presentation.pdf`,
  
  // Creative director contact information and social profiles
  portfolioWebsite: "https://www.husseinmlhem.com",
  githubRepo: "https://github.com/husseinmlhem/saqr-energy-guard-concept",
  email: "Hussein.mlhem@gmail.com",
  phone: "+971542882950",
  linkedin: "https://www.linkedin.com/in/hussein-mlhem"
};
