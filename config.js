/* ========================================
   Sanctuary Configuration
   ======================================== */

const CONFIG = {
  // Vertesia API
  api: {
    baseUrl: 'https://api.vertesia.io/api/v1',
    apiKey: 'sk-1ac1f7c9966cbc6782c78f747ab849cb', // ADD YOUR API KEY HERE
    environmentId: '681915c6a01fb262a410c161', // ADD YOUR ENVIRONMENT ID HERE
  },

  // Wisdom - cycles every 5 minutes
  wisdom: {
    interval: 300000,
    statements: [
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
    ]
  },

  // Audio
  audio: {
    defaultVolume: 25  // 0-100
  }
};
