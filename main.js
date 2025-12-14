/* ========================================
   Sanctuary - Main Entry Point
   A space for thought and contemplation
   ======================================== */

// The modules auto-initialize, but we can import them
// for additional orchestration if needed

import { wisdomBanner } from './wisdom-banner.js';
import { documentLibrary } from './document-library.js';
import { getViewer } from './document-viewer.js';
import { audioPlayer } from './audio-player.js';
import { ambientBackground } from './ambient.js';

class Sanctuary {
  constructor() {
    this.modules = {
      wisdom: wisdomBanner,
      library: documentLibrary,
      viewer: getViewer(),
      audio: audioPlayer,
      ambient: ambientBackground,
    };

    this.init();
  }

  init() {
    console.log('🏛️ Sanctuary initialized');
    
    // Add entrance animation class to body
    document.body.classList.add('sanctuary-ready');

    // Set up global keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Handle visibility change (pause audio when tab hidden)
    this.setupVisibilityHandler();
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Don't trigger if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // ? - Show keyboard shortcuts (future feature)
      if (e.key === '?') {
        console.log(`
🏛️ Sanctuary Keyboard Shortcuts:
  M      - Mute/unmute audio
  Esc    - Close document viewer
  Ctrl+R - Random article
  ?      - Show this help
        `);
      }
    });
  }

  setupVisibilityHandler() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Optionally pause audio when tab is hidden
        // this.modules.audio?.pause();
      }
    });
  }

  // Public API for external access
  getModule(name) {
    return this.modules[name];
  }
}

// Initialize sanctuary
const sanctuary = new Sanctuary();

// Expose to global scope for debugging
window.Sanctuary = sanctuary;

export { sanctuary };
