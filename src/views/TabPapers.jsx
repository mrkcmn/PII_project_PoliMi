import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { GroupByDropdowns } from '../components/GroupByDropdowns';
import { BubbleChart } from '../components/BubbleChart';
import { Modal } from '../components/Modal';

// render the main view for exploring grouped academic papers
export const TabPapers = ({ data, goToPaperDetail }) => {
  // state to manage the sidebar expansion state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // state to manage the current active dimensions for grouping data
  const [selections, setSelections] = useState([
    'Tecnologia_Interfaccia'
  ]);
  
  // state to store the currently clicked bubble cluster
  const [selectedCluster, setSelectedCluster] = useState(null);

  // process and format paper objects for chart rendering
  const papers = React.useMemo(() => {
    // exit early if data is missing
    if (!data.joinedData) return [];
    
    let all = [];
    // iterate over all papers to sanitize their dimension fields
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

      // gather all unique topics from the paper's guidelines
      let topics = new Set();

      if (paper.risultati && paper.risultati.length > 0) {
        paper.risultati.forEach(r => {
          if (r.Topic) topics.add(r.Topic);
        });
      }

      // fallback if no topics were found
      if (topics.size === 0) topics.add('Uncategorized');

      // push the fully processed paper object
      all.push({
        ...paper,
        Popolazione_Studiata: popolazioni,
        Contributo: contributi,
        Topic: Array.from(topics),
        Metodi_Estrazione: metodi,
        Tecnologia_Interfaccia: [paper.Tecnologia_Interfaccia || 'Uncategorized'],
      });
    });
    // return the formatted array of papers
    return all;
  }, [data.joinedData]);

  // filter out duplicate papers inside a single cluster
  const getUniquePapersForCluster = (items) => {
    const unique = {};
    items.forEach(p => {
      if (!unique[p.ID_Paper]) {
        unique[p.ID_Paper] = p;
      }
    });
    return Object.values(unique);
  };

  // render the structured layout
  return (
    <div className="main-layout" style={{position: 'relative'}}>
      
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        data={papers}
        firstDimension={selections[0]}
        isPaperView={true}
      />
      
      <div className="chart-area">
        <GroupByDropdowns 
          selections={selections} 
          setSelections={setSelections} 
          isPaperView={true}
        />
        
        <BubbleChart 
          data={papers}
          selections={selections}
          onNodeClick={(cluster) => setSelectedCluster(cluster)}
          isPaperView={true}
        />
      </div>

      <Modal 
        isOpen={!!selectedCluster} 
        onClose={() => setSelectedCluster(null)}
        title={selectedCluster ? `Cluster: ${selectedCluster.dimensions.join(' | ')} (${getUniquePapersForCluster(selectedCluster.items).length} Papers)` : ''}
      >
        {selectedCluster && (
          <div>
            <div style={{display: 'grid', gap: '12px'}}>
              {getUniquePapersForCluster(selectedCluster.items).map((p, i) => (
                <div key={i} style={{padding: '16px', border: '1px solid var(--border-color)', borderRadius: '6px'}}>
                  <div style={{fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px'}}>{p.Titolo}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px'}}>{p.Autori}</div>
                  
                  <div style={{marginTop: '12px'}}>
                    <button 
                      onClick={() => goToPaperDetail(p.ID_Paper)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--accent-color)', 
                        fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer', padding: 0
                      }}
                    >
                      View Details in Archive
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};
