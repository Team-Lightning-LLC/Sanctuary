/* ========================================
   Wisdom Banner Module
   Displays rotating wisdom sentences
   ======================================== */

class WisdomBanner {
  constructor() {
    this.config = window.SanctuaryConfig?.wisdom || {};
    this.element = document.getElementById('wisdom-text');
    this.wisdom = this.getWisdom();
    this.currentIndex = 0;
    this.intervalId = null;
    
    this.init();
  }

  getWisdom() {
    // The 15 contemplations
    return [
      "You are process. Not thing, not self—recursion in motion.",
      "All separation is pattern. Boundaries are real and made.",
      "Mind is body. Sensation is thought.",
      "Rigidity is decay. Flexibility is survival.",
      "Regulation is relational. Alone is destabilization.",
      "Sleep is recalibration. Destabilize to remain stable.",
      "Consciousness is cost. Integration demands energy.",
      "Time is constructed. Sequence is stitched.",
      "Memory is re-creation. Recall is remaking.",
      "Resistance reinforces. Integration transforms.",
      "Attention is energy. What you feed, lives.",
      "Meaning is coherence. Alignment creates it.",
      "Connection is embodied. Safety is physiological.",
      "The self is recursive emptiness. Observation begets observer.",
      "The deepest questions remain. Not all that matters resolves."
    ];
  }

  init() {
    if (!this.element) {
      console.warn('Wisdom banner element not found');
      return;
    }

    // Shuffle for variety each session
    this.shuffleArray(this.wisdom);
    
    // Show first wisdom after a moment
    setTimeout(() => {
      this.showWisdom();
      this.startRotation();
    }, 2000);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  showWisdom() {
    if (this.wisdom.length === 0) return;

    // Fade out
    this.element.classList.remove('visible');
    this.element.classList.add('fading');

    const transitionDuration = this.config.transitionDuration || 2000;

    setTimeout(() => {
      this.element.textContent = this.wisdom[this.currentIndex];
      this.element.classList.remove('fading');
      this.element.classList.add('visible');
    }, transitionDuration / 2);
  }

  nextWisdom() {
    this.currentIndex = (this.currentIndex + 1) % this.wisdom.length;
    this.showWisdom();
  }

  startRotation() {
    const interval = this.config.interval || 300000; // 5 minutes
    this.intervalId = setInterval(() => this.nextWisdom(), interval);
  }

  stopRotation() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  // Public method to manually advance
  next() {
    this.nextWisdom();
  }
}

// Initialize when DOM is ready
let wisdomBanner;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    wisdomBanner = new WisdomBanner();
  });
} else {
  wisdomBanner = new WisdomBanner();
}

// Export for use in other modules
export { wisdomBanner, WisdomBanner };
