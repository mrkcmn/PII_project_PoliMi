import React from 'react';
import { ArrowLeft } from 'lucide-react';

// component that renders the full paper list and individual paper details
export const TabArchive = ({ data, selectedPaper, setSelectedPaper }) => {
  // extract joined data array falling back to an empty list
  const papers = data.joinedData || [];

  // render the detailed view if a paper is currently selected
  if (selectedPaper) {
    return (
      <div className="archive-container">
        <div className="paper-detail-view" style={{ display: 'flex', gap: '32px', maxWidth: '1200px', margin: '0 auto', padding: '32px 0' }}>
          <div className="paper-detail-sidebar" style={{ width: '200px', flexShrink: 0 }}>
            <button className="back-btn" onClick={() => setSelectedPaper(null)}>
              <ArrowLeft size={16} /> Back to Archive
            </button>
          </div>

          <div className="paper-detail-content" style={{ flex: 1, maxWidth: '800px' }}>
            <div className="paper-meta">
              <h1>{selectedPaper.Titolo}</h1>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {selectedPaper.Autori}
              </p>

              <div className="meta-grid">
                <div className="meta-item">
                  <label>Interface type</label>
                  <span>{selectedPaper.Tecnologia_Interfaccia || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <label>Studied population</label>
                  <span>{selectedPaper.Popolazione_Studiata || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <label>Contribution</label>
                  <span>{selectedPaper.Contributo || 'N/A'}</span>
                </div>
                <div className="meta-item">
                  <label>Extraction method</label>
                  <span>{selectedPaper.Metodi_Estrazione || 'N/A'}</span>
                </div>
                {selectedPaper.DOI && (
                  <div className="meta-item">
                    <label>DOI</label>
                    <a href={selectedPaper.DOI} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-color)' }}>
                      {selectedPaper.DOI}
                    </a>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ marginBottom: '8px' }}>Abstract</h3>
                <p style={{ lineHeight: 1.6 }}>{selectedPaper.Abstract || 'No abstract available.'}</p>
              </div>
            </div>

            <div>
              <div className="section-header">
                <h2 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '16px' }}>
                  Guidelines ({selectedPaper.risultati ? selectedPaper.risultati.length : 0})
                </h2>
              </div>

              {selectedPaper.risultati && selectedPaper.risultati.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {[...selectedPaper.risultati]
                    .sort((a, b) => (a.Topic || '').localeCompare(b.Topic || ''))
                    .map((g, i) => (
                      <div key={i} style={{ background: 'var(--bg-color)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <span className="badge">{g.Topic}</span>
                        </div>
                        <div className="paper-detail-content-guideline" style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>
                          {g.Testo_Linea_Guida}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)' }}>No guidelines extracted for this paper yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // render the tabular list view if no paper is selected
  return (
    <div className="archive-container">
      <div className="table-wrapper">
        <table className="archive-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Authors</th>
              <th style={{ width: '40%' }}>Title</th>
              <th style={{ width: '15%' }}>Interface type</th>
              <th style={{ width: '15%' }}>Studied population</th>
              <th style={{ width: '10%' }}>DOI</th>
            </tr>
          </thead>
          <tbody>
            {papers.map((p, i) => (
              <tr key={i} onClick={() => setSelectedPaper(p)}>
                <td>{p.Autori && p.Autori.split(',')[0]} {p.Autori && p.Autori.includes(',') ? 'et al.' : ''}</td>
                <td style={{ fontWeight: 500 }}>{p.Titolo}</td>
                <td>{p.Tecnologia_Interfaccia}</td>
                <td>{p.Popolazione_Studiata}</td>
                <td>
                  {p.DOI && (
                    <a
                      href={p.DOI}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: 'var(--accent-color)', textDecoration: 'none' }}
                    >
                      Link
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {papers.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No papers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
