/* ========================================
   Document Viewer Module
   Fetches and displays document content
   from Vertesia API
   ======================================== */

class DocumentViewer {
  constructor() {
    this.config = window.SanctuaryConfig || {};
    this.apiConfig = this.config.api || {};
    this.overlay = document.getElementById('document-viewer-overlay');
    this.container = this.overlay?.querySelector('.viewer-container');
    this.title = document.getElementById('viewer-title');
    this.content = document.getElementById('viewer-content');
    this.closeBtn = document.getElementById('viewer-close');
    
    this.currentDoc = null;
    this.isOpen = false;
    
    this.init();
  }

  init() {
    if (!this.overlay) {
      console.warn('Document viewer overlay not found');
      return;
    }

    this.bindEvents();
  }

  bindEvents() {
    // Close button
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    // Click outside to close
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  async open(doc, apiConfigOverride = null) {
    if (!doc) return;

    this.currentDoc = doc;
    this.isOpen = true;
    
    // Use passed config or default
    const api = apiConfigOverride || this.apiConfig;

    // Update title
    if (this.title) {
      this.title.textContent = doc.title || 'Document';
    }

    // Show loading state
    this.showLoading();
    
    // Show modal
    this.overlay.classList.add('open');
    document.body.style.overflow = 'hidden';

    // Load content
    try {
      const content = await this.loadContent(doc, api);
      this.renderContent(content, doc);
    } catch (error) {
      console.error('Failed to load document:', error);
      this.showError();
    }
  }

  close() {
    this.isOpen = false;
    this.currentDoc = null;
    
    this.overlay.classList.remove('open');
    document.body.style.overflow = '';

    // Clear content after animation
    setTimeout(() => {
      if (this.content) {
        this.content.innerHTML = '';
      }
    }, 400);
  }

  showLoading() {
    if (this.content) {
      this.content.classList.add('loading');
      this.content.innerHTML = `
        <div class="viewer-loading">
          <div class="viewer-loading-spinner"></div>
          <p>loading...</p>
        </div>
      `;
    }
  }

  async loadContent(doc, api) {
    // If document has content directly (from previous fetch)
    if (doc.content) {
      return doc.content;
    }

    // If we have API config and document has source, fetch from Vertesia
    if (api.apiKey && doc.source) {
      return this.fetchFromVertesia(doc, api);
    }

    // If document has a URL
    if (doc.url) {
      return this.fetchContent(doc.url);
    }

    // Fallback: show placeholder
    return this.getPlaceholderContent(doc);
  }

  async fetchFromVertesia(doc, api) {
    const { baseUrl, apiKey } = api;
    
    // Get the file reference from source
    const source = doc.source || doc._raw?.content?.source;
    const fileRef = typeof source === 'string' 
      ? source 
      : (source?.file || source?.store || source?.path);

    if (!fileRef) {
      throw new Error('No file reference found');
    }

    // Get download URL from Vertesia
    const urlResponse = await fetch(`${baseUrl}/objects/download-url`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ file: fileRef, format: 'original' })
    });

    if (!urlResponse.ok) throw new Error('Failed to get download URL');
    
    const { url } = await urlResponse.json();
    
    // Fetch the actual content
    const contentResponse = await fetch(url);
    if (!contentResponse.ok) throw new Error('Failed to fetch content');
    
    return contentResponse.text();
  }

  async fetchContent(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${url}`);
    }
    return response.text();
  }

  getPlaceholderContent(doc) {
    return `
# ${doc.title || 'Document'}

*This document is being prepared.*

---

Content will appear here when connected to the library.
    `;
  }

  renderContent(content, doc) {
    if (!this.content) return;

    this.content.classList.remove('loading');

    // Determine content type from title/source
    const fileName = doc.title || doc.source || '';
    const fileType = this.getFileType(fileName);

    if (fileType === 'pdf') {
      this.renderPdf(content, doc);
    } else if (fileType === 'html') {
      this.content.innerHTML = content;
    } else {
      // Assume markdown/text
      this.renderMarkdown(content);
    }
  }

  getFileType(filename) {
    const name = filename.toLowerCase();
    if (name.includes('.pdf')) return 'pdf';
    if (name.includes('.html') || name.includes('.htm')) return 'html';
    return 'markdown';
  }

  renderPdf(url, doc) {
    this.content.innerHTML = `
      <iframe 
        src="${url}" 
        title="${doc.title || 'Document'}"
        allowfullscreen
      ></iframe>
    `;
  }

  renderMarkdown(markdown) {
    const html = this.parseMarkdown(markdown);
    this.content.innerHTML = html;
  }

  parseMarkdown(text) {
    // Markdown parsing
    let html = text
      // Escape HTML (but preserve our markdown processing)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      
      // Headers
      .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      
      // Bold and italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      
      // Blockquotes
      .replace(/^&gt; (.*$)/gm, '<blockquote>$1</blockquote>')
      
      // Horizontal rules
      .replace(/^---$/gm, '<hr>')
      .replace(/^\*\*\*$/gm, '<hr>')
      
      // Lists (basic)
      .replace(/^- (.*$)/gm, '<li>$1</li>')
      
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');

    // Wrap in paragraphs
    html = '<p>' + html + '</p>';
    
    // Clean up
    html = html
      .replace(/<p><\/p>/g, '')
      .replace(/<p><h/g, '<h')
      .replace(/<\/h(\d)><\/p>/g, '</h$1>')
      .replace(/<p><hr><\/p>/g, '<hr>')
      .replace(/<p><hr>/g, '<hr>')
      .replace(/<hr><\/p>/g, '<hr>')
      .replace(/<p><blockquote>/g, '<blockquote><p>')
      .replace(/<\/blockquote><\/p>/g, '</p></blockquote>')
      .replace(/<p><li>/g, '<ul><li>')
      .replace(/<\/li><\/p>/g, '</li></ul>')
      .replace(/<\/li><br><li>/g, '</li><li>');

    return html;
  }

  showError() {
    if (this.content) {
      this.content.classList.remove('loading');
      this.content.innerHTML = `
        <div class="viewer-error">
          <p>unable to load this document</p>
        </div>
      `;
    }
  }

  // Public methods
  isViewerOpen() {
    return this.isOpen;
  }

  getCurrentDocument() {
    return this.currentDoc;
  }
}

// Singleton instance
let viewer;

function getViewer() {
  if (!viewer) {
    viewer = new DocumentViewer();
  }
  return viewer;
}

// Convenience function to open viewer
function openViewer(doc, apiConfig = null) {
  getViewer().open(doc, apiConfig);
}

// Convenience function to close viewer
function closeViewer() {
  getViewer().close();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    getViewer();
  });
} else {
  getViewer();
}

// Export for use in other modules
export { getViewer, openViewer, closeViewer, DocumentViewer };
