/* ========================================
   Sanctuary Configuration
   ======================================== */

window.SanctuaryConfig = {
  // Vertesia API Configuration
  // Add your API key to connect to your document storage
  api: {
    baseUrl: 'https://api.vertesia.io/api/v1',
    apiKey: '', // YOUR_API_KEY_HERE
    environmentId: '', // YOUR_ENVIRONMENT_ID
  },

  // Wisdom Banner
  wisdom: {
    // Wisdom sentences cycle every 5 minutes (300000ms)
    interval: 300000,
    
    // Transition duration for fade effect (ms)
    transitionDuration: 2000,
  },

  // Document Library
  documents: {
    // Documents are fetched from Vertesia API
    // No local path needed
  },

  // Audio Player
  audio: {
    // YouTube video ID for Takashi Kokubo - Oasis of the Wind II
    youtubeVideoId: 'p3lVE5SH5kQ',
    
    // Default volume (0-100)
    defaultVolume: 25,
    
    // Auto-play on load? (most browsers block this)
    autoPlay: false,
  },

  // Ambient Background
  ambient: {
    // Enable ambient animations
    enabled: true,
    
    // Reduce animations for performance
    reducedMotion: false,
  },
};
