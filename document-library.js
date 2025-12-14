/* ========================================
   Document Library Module
   Fetches documents from Vertesia API
   ======================================== */

import { openViewer } from './document-viewer.js';

class DocumentLibrary {
  constructor() {
    this.config = window.SanctuaryConfig || {};
    this.apiConfig = this.config.api || {};
    this.container = document.getElementById('document-list');
    this.randomBtn = document.getElementById('random-article-btn');
    this.documents = [];
    
    this.init();
  }

  async init() {
    if (!this.container) {
      console.warn('Document list container not found');
      return;
    }

    this.showLoading();
    this.bindEvents();

    try {
      await this.loadDocuments();
      this.render();
    } catch (error) {
      console.error('Failed to load documents:', error);
      this.showError();
    }
  }

  bindEvents() {
    // Random article button (wander)
    if (this.randomBtn) {
      this.randomBtn.addEventListener('click', () => this.openRandom());
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'w' && e.ctrlKey) {
        e.preventDefault();
        this.openRandom();
      }
    });
  }

  showLoading() {
    this.container.innerHTML = `
      <div class="document-item loading">
        <div class="document-title">gathering documents...</div>
      </div>
    `.repeat(3);
  }

  async loadDocuments() {
    const { baseUrl, apiKey } = this.apiConfig;

    // If no API key, use fallback
    if (!apiKey) {
      console.log('No API key configured, using local documents');
      this.documents = this.getFallbackDocuments();
      return;
    }

    try {
      // Fetch document list from Vertesia API
      const response = await fetch(`${baseUrl}/objects?limit=100`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch from Vertesia');
      
      const data = await response.json();
      const objects = Array.isArray(data) ? data : data.objects || [];
      
      // Transform to our document format (metadata only)
      this.documents = objects.map(obj => ({
        id: obj.id,
        title: obj.name || 'Untitled',
        type: obj.properties?.document_type || 'Document',
        category: obj.properties?.category || null,
        source: obj.content?.source || null,
        // Store the full object reference for later content fetch
        _raw: obj
      }));

    } catch (error) {
      console.error('Vertesia API error:', error);
      this.documents = this.getFallbackDocuments();
    }
  }

  getFallbackDocuments() {
    // Local fallback documents
    return [
      {
        id: 'organizational-principle',
        title: 'The Organizational Principle: Dissolving the Hard Problem Through Experiential Architecture',
        type: 'Essay',
        category: 'Consciousness',
      },
      {
        id: 'awe-pattern-vastness',
        title: 'Awe: When Your Pattern Encounters Vastness',
        type: 'Essay',
        category: 'Psychology',
      },
      {
        id: 'fracture-points',
        title: 'The Fracture Points: Where Consciousness Science Stands in Late 2025',
        type: 'Analysis',
        category: 'Consciousness',
      },
      {
        id: 'synesthesia-inhibition',
        title: 'Synesthesia: When Inhibition Fails and Richness Emerges',
        type: 'Essay',
        category: 'Neuroscience',
      },
      {
        id: 'measurement-problem',
        title: 'The Measurement Problem in Neuroscience',
        type: 'Analysis',
        category: 'Neuroscience',
      },
      {
        id: 'metabolic-architecture',
        title: 'Consciousness as Metabolic Architecture',
        type: 'Essay',
        category: 'Neuroscience',
      },
      {
        id: 'non-separation',
        title: 'The Physics and Phenomenology of Non-Separation',
        type: 'Essay',
        category: 'Physics',
      },
    ];
  }

  render() {
    if (this.documents.length === 0) {
      this.showEmpty();
      return;
    }

    this.container.innerHTML = this.documents
      .map((doc, index) => this.renderDocument(doc, index))
      .join('');

    // Attach click handlers
    this.container.querySelectorAll('.document-item').forEach((item, index) => {
      item.addEventListener('click', () => this.openDocument(this.documents[index]));
    });
  }

  renderDocument(doc, index) {
    return `
      <article class="document-item" data-id="${doc.id}" style="animation-delay: ${0.1 + index * 0.08}s">
        <h3 class="document-title">${this.escapeHtml(doc.title)}</h3>
      </article>
    `;
  }

  openDocument(doc) {
    openViewer(doc, this.apiConfig);
  }

  openRandom() {
    if (this.documents.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * this.documents.length);
    const doc = this.documents[randomIndex];
    
    this.openDocument(doc);
  }

  showEmpty() {
    this.container.innerHTML = `
      <div class="document-list-empty">
        <p>the library awaits</p>
      </div>
    `;
  }

  showError() {
    this.container.innerHTML = `
      <div class="document-list-empty">
        <p>unable to reach the library</p>
      </div>
    `;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public methods
  getDocuments() {
    return this.documents;
  }

  findDocument(id) {
    return this.documents.find(doc => doc.id === id);
  }
}

// Initialize when DOM is ready
let documentLibrary;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    documentLibrary = new DocumentLibrary();
  });
} else {
  documentLibrary = new DocumentLibrary();
}

// Export for use in other modules
export { documentLibrary, DocumentLibrary };
