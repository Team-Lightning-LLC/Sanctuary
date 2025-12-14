/* ========================================
   Ambient Background Module
   Creates abstract, flowing animations
   Zen-like, contemplative atmosphere
   ======================================== */

class AmbientBackground {
  constructor() {
    this.config = window.SanctuaryConfig?.ambient || {};
    this.container = document.getElementById('ambient-background');
    
    this.init();
  }

  init() {
    if (!this.container) {
      console.warn('Ambient background container not found');
      return;
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion || this.config.reducedMotion) {
      this.createStaticBackground();
    } else if (this.config.enabled !== false) {
      this.createAnimatedBackground();
    }
  }

  createStaticBackground() {
    // Simple gradient background without animations
    this.container.innerHTML = `
      <div class="ambient-noise"></div>
      <div class="ambient-vignette"></div>
    `;
  }

  createAnimatedBackground() {
    // Create the flowing, abstract elements
    this.container.innerHTML = `
      <!-- Drifting abstract forms -->
      <div class="ambient-form ambient-form-1"></div>
      <div class="ambient-form ambient-form-2"></div>
      <div class="ambient-form ambient-form-3"></div>
      <div class="ambient-form ambient-form-4"></div>
      
      <!-- Flowing wind/water lines -->
      <div class="ambient-flow ambient-flow-1"></div>
      <div class="ambient-flow ambient-flow-2"></div>
      <div class="ambient-flow ambient-flow-3"></div>
      
      <!-- Geometric circle accents -->
      <div class="ambient-circle ambient-circle-1"></div>
      <div class="ambient-circle ambient-circle-2"></div>
      <div class="ambient-circle ambient-circle-3"></div>
      
      <!-- Noise texture -->
      <div class="ambient-noise"></div>
      
      <!-- Vignette -->
      <div class="ambient-vignette"></div>
    `;

    // Optional: Add subtle parallax on mouse
    if (!this.config.reducedMotion) {
      this.addParallax();
    }
  }

  addParallax() {
    // Very subtle parallax effect on forms
    let rafId = null;
    let mouseX = 0;
    let mouseY = 0;

    const forms = this.container.querySelectorAll('.ambient-form');

    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          forms.forEach((form, index) => {
            const factor = (index + 1) * 3;
            const x = mouseX * factor;
            const y = mouseY * factor;
            form.style.marginLeft = `${x}px`;
            form.style.marginTop = `${y}px`;
          });
          rafId = null;
        });
      }
    };

    document.addEventListener('mousemove', handleMouseMove, { passive: true });
  }

  // Method to toggle animations
  setAnimationsEnabled(enabled) {
    if (enabled) {
      this.createAnimatedBackground();
    } else {
      this.createStaticBackground();
    }
  }
}

// Initialize when DOM is ready
let ambientBackground;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ambientBackground = new AmbientBackground();
  });
} else {
  ambientBackground = new AmbientBackground();
}

// Export for use in other modules
export { ambientBackground, AmbientBackground };
