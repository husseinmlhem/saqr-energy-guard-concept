export const SAQR_ASSETS = {
  logo: "/assets/saqr/Logo.png",
  defenderPoster: "/assets/saqr/Defender.png",
  sentinelPoster: "/assets/saqr/Senetial.png",
  defenderFramesPath: "/assets/saqr/Defender/frames",
  sentinelFramesPath: "/assets/saqr/Senetial/frames",
  defenderFrameCount: 49,
  sentinelFrameCount: 40,
  
  getDefenderFramePath: (index) => {
    const frameNum = String(index).padStart(4, '0');
    const time = ((index - 1) * 0.1).toFixed(2);
    return `/assets/saqr/Defender/frames/frame_${frameNum}_${time}s.webp`;
  },
  
  getSentinelFramePath: (index) => {
    const frameNum = String(index).padStart(4, '0');
    const time = ((index - 1) * 0.1).toFixed(2);
    return `/assets/saqr/Senetial/frames/frame_${frameNum}_${time}s.webp`;
  }
};

export const PROJECT_LINKS = {
  // Cinematic product video YouTube links
  youtubeVideoUrl: "https://www.youtube.com/embed/qNlmI27_694",
  youtubeWatchUrl: "https://www.youtube.com/watch?v=qNlmI27_694",
  
  // Product presentation PDF viewer & download paths
  presentationViewUrl: "/assets/saqr/presentation/SAQR-Energy-Guard-Presentation.pdf",
  presentationDownloadUrl: "/assets/saqr/presentation/SAQR-Energy-Guard-Presentation.pdf",
  
  // Creative director contact information and social profiles
  portfolioWebsite: "https://www.husseinmlhem.com",
  githubRepo: "", // e.g. "https://github.com/husseinmlhem/SAQR-Energy-Guard"
  email: "",      // user-editable config
  phone: "",      // user-editable config
  linkedin: ""    // user-editable config
};
