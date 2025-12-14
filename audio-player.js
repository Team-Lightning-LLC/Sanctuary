/* ========================================
   Audio Player Module
   YouTube background audio integration
   ======================================== */

class AudioPlayer {
  constructor() {
    this.config = window.SanctuaryConfig?.audio || {};
    this.container = document.getElementById('youtube-container');
    this.playerElement = document.getElementById('audio-player');
    this.toggleBtn = document.getElementById('audio-toggle');
    this.volumeSlider = document.getElementById('audio-volume');
    this.audioIcon = document.getElementById('audio-icon');
    
    this.player = null;
    this.isReady = false;
    this.isPlaying = false;
    this.isMuted = false;
    this.volume = this.config.defaultVolume || 30;
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('YouTube container not found');
      return;
    }

    this.bindEvents();
    this.loadYouTubeAPI();
  }

  bindEvents() {
    // Toggle play/pause
    if (this.toggleBtn) {
      this.toggleBtn.addEventListener('click', () => this.toggle());
    }

    // Volume control
    if (this.volumeSlider) {
      this.volumeSlider.value = this.volume;
      this.volumeSlider.addEventListener('input', (e) => {
        this.setVolume(parseInt(e.target.value, 10));
      });
    }

    // Expand player on hover
    if (this.playerElement) {
      this.playerElement.addEventListener('mouseenter', () => {
        this.playerElement.classList.add('expanded');
      });
      this.playerElement.addEventListener('mouseleave', () => {
        this.playerElement.classList.remove('expanded');
      });
    }

    // Keyboard shortcut: M to mute/unmute
    document.addEventListener('keydown', (e) => {
      if (e.key === 'm' && !e.ctrlKey && !e.metaKey) {
        // Only if not typing in an input
        if (document.activeElement.tagName !== 'INPUT' && 
            document.activeElement.tagName !== 'TEXTAREA') {
          this.toggleMute();
        }
      }
    });
  }

  loadYouTubeAPI() {
    // Check if API already loaded
    if (window.YT && window.YT.Player) {
      this.createPlayer();
      return;
    }

    // Add loading state
    if (this.playerElement) {
      this.playerElement.classList.add('loading');
    }

    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.onerror = () => this.handleLoadError();
    
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Set up callback
    window.onYouTubeIframeAPIReady = () => {
      this.createPlayer();
    };
  }

  createPlayer() {
    const videoId = this.config.youtubeVideoId || 'p3lVE5SH5kQ';

    this.player = new YT.Player('youtube-container', {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        loop: 1,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        playlist: videoId, // Required for looping
      },
      events: {
        onReady: (e) => this.onPlayerReady(e),
        onStateChange: (e) => this.onPlayerStateChange(e),
        onError: (e) => this.onPlayerError(e),
      },
    });
  }

  onPlayerReady(event) {
    this.isReady = true;
    
    if (this.playerElement) {
      this.playerElement.classList.remove('loading');
    }

    // Set initial volume
    this.player.setVolume(this.volume);

    // Auto-play if configured (usually blocked by browsers)
    if (this.config.autoPlay) {
      this.play();
    }
  }

  onPlayerStateChange(event) {
    const state = event.data;

    // YT.PlayerState: UNSTARTED=-1, ENDED=0, PLAYING=1, PAUSED=2, BUFFERING=3, CUED=5
    if (state === YT.PlayerState.PLAYING) {
      this.isPlaying = true;
      this.updateUI();
    } else if (state === YT.PlayerState.PAUSED || state === YT.PlayerState.ENDED) {
      this.isPlaying = false;
      this.updateUI();
    }
  }

  onPlayerError(event) {
    console.error('YouTube player error:', event.data);
    if (this.playerElement) {
      this.playerElement.classList.add('error');
    }
  }

  handleLoadError() {
    console.error('Failed to load YouTube API');
    if (this.playerElement) {
      this.playerElement.classList.remove('loading');
      this.playerElement.classList.add('error');
    }
  }

  play() {
    if (!this.isReady || !this.player) return;
    
    try {
      this.player.playVideo();
    } catch (e) {
      console.error('Failed to play:', e);
    }
  }

  pause() {
    if (!this.isReady || !this.player) return;
    
    try {
      this.player.pauseVideo();
    } catch (e) {
      console.error('Failed to pause:', e);
    }
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  setVolume(value) {
    this.volume = Math.max(0, Math.min(100, value));
    
    if (this.isReady && this.player) {
      this.player.setVolume(this.volume);
    }
    
    if (this.volumeSlider) {
      this.volumeSlider.value = this.volume;
    }

    // Update mute state
    this.isMuted = this.volume === 0;
    this.updateUI();
  }

  toggleMute() {
    if (this.isMuted) {
      this.setVolume(this.config.defaultVolume || 30);
    } else {
      this.setVolume(0);
    }
  }

  updateUI() {
    if (!this.playerElement) return;

    // Playing state
    this.playerElement.classList.toggle('playing', this.isPlaying);
    
    // Muted state
    this.playerElement.classList.toggle('muted', this.isMuted);

    // Icon
    if (this.audioIcon) {
      if (this.isMuted) {
        this.audioIcon.textContent = '🔇';
      } else if (this.isPlaying) {
        this.audioIcon.textContent = '♫';
      } else {
        this.audioIcon.textContent = '♪';
      }
    }
  }

  // Public getters
  getVolume() {
    return this.volume;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getIsReady() {
    return this.isReady;
  }
}

// Initialize when DOM is ready
let audioPlayer;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    audioPlayer = new AudioPlayer();
  });
} else {
  audioPlayer = new AudioPlayer();
}

// Export for use in other modules
export { audioPlayer, AudioPlayer };
