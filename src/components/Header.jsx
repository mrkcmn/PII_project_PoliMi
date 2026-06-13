import React from 'react';

// component that renders the main application header and navigation
export const Header = ({ activeTab, setActiveTab }) => {
  // render the header container with titles and tab navigation
  return (
    <header className="header">
      <div className="header-title" style={{display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden'}}>
        <span className="header-main-title">What's in a recommendation?</span>
        <span className="header-sub-title" style={{fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)'}}>
          Mapping unstructured design knowledge from voice and conversational interaction literature.
        </span>
      </div>
      <nav className="nav-tabs" role="tablist">
        <button 
          role="tab"
          aria-selected={activeTab === 'knowledge'}
          className={`nav-tab ${activeTab === 'knowledge' ? 'active' : ''}`}
          onClick={() => setActiveTab('knowledge')}
        >
          Explore design knowledge
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'papers'}
          className={`nav-tab ${activeTab === 'papers' ? 'active' : ''}`}
          onClick={() => setActiveTab('papers')}
        >
          Explore papers
        </button>
        <button 
          role="tab"
          aria-selected={activeTab === 'archive'}
          className={`nav-tab ${activeTab === 'archive' ? 'active' : ''}`}
          onClick={() => setActiveTab('archive')}
        >
          Paper archive
        </button>
      </nav>
    </header>
  );
};
