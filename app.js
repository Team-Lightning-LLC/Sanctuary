/* ========================================
   Sanctuary App
   Single file application
   ======================================== */

// ==========================================
// WISDOM BANNER
// ==========================================

const WisdomBanner = {
  element: null,
  statements: [],
  currentIndex: 0,
  intervalId: null,

  init() {
    this.element = document.getElementById('wisdom-text');
    if (!this.element) return;

    this.statements = [...CONFIG.wisdom.statements];
    this.shuffle();
    
    // Show first wisdom after brief delay
    setTimeout(() => {
      this.show();
      this.startRotation();
    }, 1000);
  },

  shuffle() {
    for (let i = this.statements.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.statements[i], this.statements[j]] = [this.statements[j], this.statements[i]];
    }
  },

  show() {
    this.element.classList.remove('visible');
    
    setTimeout(() => {
      this.element.textContent = this.statements[this.currentIndex];
      this.element.classList.add('visible');
    }, 1000);
  },

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.statements.length;
    this.show();
  },

  startRotation() {
    this.intervalId = setInterval(() => this.next(), CONFIG.wisdom.interval);
  }
};

// ==========================================
// DOCUMENT LIBRARY
// ==========================================

const DocumentLibrary = {
  container: null,
  documents: [],

  init() {
    this.container = document.getElementById('document-list');
    const randomBtn = document.getElementById('random-btn');
    
    if (randomBtn) {
      randomBtn.addEventListener('click', () => this.openRandom());
    }

    this.load();
  },

  async load() {
    this.container.innerHTML = '<div class="document-list-empty">gathering documents...</div>';

    const { apiKey, baseUrl } = CONFIG.api;

    if (!apiKey) {
      // Fallback documents
      this.documents = this.getFallback();
      this.render();
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/objects?limit=100`, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (!response.ok) throw new Error('API error');

      const data = await response.json();
      const objects = Array.isArray(data) ? data : data.objects || [];

      this.documents = objects.map(obj => ({
        id: obj.id,
        title: obj.name || 'Untitled',
        source: obj.content?.source || null,
        _raw: obj
      }));

      this.render();
    } catch (err) {
      console.error('Failed to load documents:', err);
      this.documents = this.getFallback();
      this.render();
    }
  },

  getFallback() {
    return [
      { id: '1', title: 'The Organizational Principle: Dissolving the Hard Problem' },
      { id: '2', title: 'Awe: When Your Pattern Encounters Vastness' },
      { id: '3', title: 'The Fracture Points: Where Consciousness Science Stands' },
      { id: '4', title: 'Synesthesia: When Inhibition Fails and Richness Emerges' },
      { id: '5', title: 'Consciousness as Metabolic Architecture' },
      { id: '6', title: 'The Physics and Phenomenology of Non-Separation' },
      { id: '7', title: 'Memory is Re-creation: Recall is Remaking' },
    ];
  },

  render() {
    if (this.documents.length === 0) {
      this.container.innerHTML = '<div class="document-list-empty">the library awaits</div>';
      return;
    }

    this.container.innerHTML = this.documents
      .map((doc, i) => `
        <div class="document-item" data-index="${i}">
          <div class="document-title">${this.escapeHtml(doc.title)}</div>
        </div>
      `).join('');

    // Click handlers
    this.container.querySelectorAll('.document-item').forEach(item => {
      item.addEventListener('click', () => {
        const index = parseInt(item.dataset.index);
        DocumentViewer.open(this.documents[index]);
      });
    });
  },

  openRandom() {
    if (this.documents.length === 0) return;
    const index = Math.floor(Math.random() * this.documents.length);
    DocumentViewer.open(this.documents[index]);
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

// ==========================================
// DOCUMENT VIEWER
// ==========================================

const DocumentViewer = {
  overlay: null,
  title: null,
  content: null,
  currentDoc: null,

  init() {
    this.overlay = document.getElementById('viewer-overlay');
    this.title = document.getElementById('viewer-title');
    this.content = document.getElementById('viewer-content');
    
    const closeBtn = document.getElementById('viewer-close');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
    });
  },

  async open(doc) {
    if (!doc) return;
    
    this.currentDoc = doc;
    this.title.textContent = doc.title;
    this.content.innerHTML = '<div class="viewer-loading">loading...</div>';
    this.overlay.classList.add('open');

    try {
      const content = await this.loadContent(doc);
      this.renderContent(content);
    } catch (err) {
      this.content.innerHTML = '<div class="viewer-loading">unable to load document</div>';
    }
  },

  close() {
    this.overlay.classList.remove('open');
    setTimeout(() => {
      this.content.innerHTML = '';
    }, 400);
  },

  async loadContent(doc) {
    const { apiKey, baseUrl } = CONFIG.api;
    
    if (!apiKey || !doc.source) {
      return this.getPlaceholder(doc);
    }

    // Get file reference
    const source = doc.source || doc._raw?.content?.source;
    const fileRef = typeof source === 'string' 
      ? source 
      : (source?.file || source?.store || source?.path);

    if (!fileRef) return this.getPlaceholder(doc);

    // Get download URL
    const urlRes = await fetch(`${baseUrl}/objects/download-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file: fileRef, format: 'original' })
    });

    if (!urlRes.ok) throw new Error('Failed to get URL');
    
    const { url } = await urlRes.json();
    const contentRes = await fetch(url);
    
    if (!contentRes.ok) throw new Error('Failed to fetch content');
    
    return contentRes.text();
  },

  getPlaceholder(doc) {
    return `# ${doc.title}\n\n*Connect to Vertesia to view this document.*`;
  },

  renderContent(text) {
    // Simple markdown parsing
    let html = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>')
      .replace(/^---$/gm, '<hr>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    html = '<p>' + html + '</p>';
    html = html.replace(/<p><\/p>/g, '').replace(/<p><h/g, '<h').replace(/<\/h(\d)><\/p>/g, '</h$1>');
    
    this.content.innerHTML = html;
  }
};

// ==========================================
// AUDIO PLAYER
// ==========================================

const AudioPlayer = {
  audio: null,
  isPlaying: false,

  init() {
    this.audio = document.getElementById('audio-element');
    
    if (!this.audio) {
      console.warn('AudioPlayer: audio element not found');
      return;
    }

    // Set initial volume
    this.audio.volume = CONFIG.audio.defaultVolume / 100;

    const toggle = document.getElementById('audio-toggle');
    const volume = document.getElementById('audio-volume');

    toggle?.addEventListener('click', () => this.toggle());
    volume?.addEventListener('input', (e) => this.setVolume(parseInt(e.target.value)));

    // Update UI when audio plays/pauses
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this.updateUI();
    });

    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this.updateUI();
    });
  },

  toggle() {
    if (!this.audio) return;

    if (this.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    }
  },

  setVolume(val) {
    if (this.audio) {
      this.audio.volume = val / 100;
    }
  },

  updateUI() {
    const playerEl = document.getElementById('audio-player');
    const toggleEl = document.getElementById('audio-toggle');
    
    playerEl?.classList.toggle('playing', this.isPlaying);
    if (toggleEl) {
      toggleEl.textContent = this.isPlaying ? '❚❚' : '▷';
    }
  }
};

// ==========================================
// INITIALIZE
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  WisdomBanner.init();
  DocumentLibrary.init();
  DocumentViewer.init();
  AudioPlayer.init();
});
