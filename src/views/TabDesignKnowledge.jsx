import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { GroupByDropdowns } from '../components/GroupByDropdowns';
import { BubbleChart } from '../components/BubbleChart';
import { Modal } from '../components/Modal';

// render the main view for exploring individual design guidelines
export const TabDesignKnowledge = ({ data, goToPaperDetail }) => {
  // state to manage the sidebar expansion state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // state to manage the current active dimensions for grouping data
  const [selections, setSelections] = useState([
    'Tecnologia_Interfaccia'
  ]);
  
  // state to store the currently clicked bubble cluster
  const [selectedCluster, setSelectedCluster] = useState(null);

  // flatten the hierarchical joined data into an array of guidelines
  const guidelines = React.useMemo(() => {
    // exit early if data is missing
    if (!data.joinedData) return [];
    
    let all = [];
    // iterate over all extracted papers
    data.joinedData.forEach(paper => {
      // parse and clean studied population fields
      const popolazioni = paper.Popolazione_Studiata 
        ? paper.Popolazione_Studiata.split(',').map(s => s.trim()).filter(Boolean)
        : ['Uncategorized'];

      // parse and clean contribution fields
      const contributi = paper.Contributo 
        ? paper.Contributo.split(',').map(s => s.trim()).filter(Boolean)
        : ['Uncategorized'];

      // parse and clean extraction method fields
      const metodi = paper.Metodi_Estrazione 
        ? paper.Metodi_Estrazione.split(',').map(s => s.trim()).filter(Boolean)
        : ['Uncategorized'];

      // duplicate each paper for every guideline it contains
      if (paper.risultati) {
        paper.risultati.forEach(risultato => {
          all.push({
            ...risultato,
            Popolazione_Studiata: popolazioni,
            Contributo: contributi,
            Metodi_Estrazione: metodi,
            Tecnologia_Interfaccia: [paper.Tecnologia_Interfaccia || 'Uncategorized'],
            Topic: [risultato.Topic || 'Uncategorized'],
            Paper_Titolo: paper.Titolo,
            Paper_Autori: paper.Autori,
            Paper_DOI: paper.DOI,
            ID_Paper: paper.ID_Paper
          });
        });
      }
    });
    // return the fully flattened guideline array
    return all;
  }, [data.joinedData]);

  // aggregate guidelines back to their source papers for modal display
  const getGuidelinesGroupedByPaper = (guidelines) => {
    const grouped = {};
    // group each guideline by its parent paper id
    guidelines.forEach(g => {
      const pId = g.ID_Paper;
      // initialize paper group if missing
      if (!grouped[pId]) {
        grouped[pId] = {
          id: pId,
          title: g.Paper_Titolo,
          authors: g.Paper_Autori,
          doi: g.Paper_DOI,
          items: []
        };
      }
      
      // prevent duplicate guidelines from being added
      const isDuplicate = grouped[pId].items.some(existing => existing.Testo_Linea_Guida === g.Testo_Linea_Guida);
      if (!isDuplicate) {
        grouped[pId].items.push(g);
      }
    });
    // return array of aggregated paper objects
    return Object.values(grouped);
  };

  // render the structured layout
  return (
    <div className="main-layout">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        data={guidelines}
        firstDimension={selections[0]}
        isPaperView={false}
      />
      
      <div className="chart-area">
        <GroupByDropdowns 
          selections={selections} 
          setSelections={setSelections} 
          isPaperView={false}
        />
        
        <BubbleChart 
          data={guidelines}
          selections={selections}
          onNodeClick={(cluster) => setSelectedCluster(cluster)}
          isPaperView={false}
        />
      </div>

      <Modal 
        isOpen={!!selectedCluster} 
        onClose={() => setSelectedCluster(null)}
        title={selectedCluster ? `Cluster: ${selectedCluster.dimensions.join(' | ')} (${selectedCluster.count} Guidelines)` : ''}
      >
        {selectedCluster && (
          <div>
            <p style={{marginBottom: '16px', color: 'var(--text-muted)'}}>
              Guidelines in this cluster are grouped by their parent paper below:
            </p>
            {getGuidelinesGroupedByPaper(selectedCluster.items).map((paperGroup, i) => (
              <details key={i} className="paper-accordion" open>
                <summary>
                  <div>
                    <div style={{fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px'}}>{paperGroup.title}</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400}}>
                      {paperGroup.authors}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        goToPaperDetail(paperGroup.id);
                      }}
                      style={{
                        background: 'none', border: 'none', color: 'var(--accent-color)', 
                        fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', padding: 0,
                        marginTop: '8px'
                      }}
                    >
                      View Details in Archive
                    </button>
                  </div>
                </summary>
                <div className="paper-accordion-content">
                  {paperGroup.items.map((g, j) => (
                    <div key={j} className="guideline-item">
                      <div style={{marginBottom: '8px'}}>
                        <span className="badge">{g.Topic && g.Topic[0]}</span>
                      </div>
                      <div style={{fontSize: '0.95rem', lineHeight: 1.5}}>
                        {g.Testo_Linea_Guida}
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};
