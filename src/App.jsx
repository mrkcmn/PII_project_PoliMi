import React, { useState } from 'react';
import { Header } from './components/Header';
import { TabDesignKnowledge } from './views/TabDesignKnowledge';
import { TabPapers } from './views/TabPapers';
import { TabArchive } from './views/TabArchive';
import { useData } from './hooks/useData';
import './index.css';

// main application component that manages state and routing
function App() {
  // state to track the currently active navigation tab
  const [activeTab, setActiveTab] = useState('knowledge'); // default active tab
  
  // state to store the paper currently viewed in the archive detail view
  const [selectedArchivePaper, setSelectedArchivePaper] = useState(null);
  
  // fetch global data using the custom data hook
  const { data, loading, error, ...rest } = useData();

  // handle tab switching and reset detail view when leaving archive
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'archive') {
      setSelectedArchivePaper(null);
    }
  };

  // navigate directly to a paper detail view in the archive tab
  const goToPaperDetail = (paper) => {
    // find full paper object if only id is provided
    const fullPaper = typeof paper === 'string' 
      ? rest.joinedData.find(p => p.ID_Paper === paper) 
      : paper;
      
    // set the selected paper and change tab
    setSelectedArchivePaper(fullPaper);
    setActiveTab('archive');
  };

  // render an error screen if data loading fails
  if (error) {
    return (
      <div style={{display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', color: 'red'}}>
        Error loading data: {error.message}
      </div>
    );
  }

  // structure the final complete data object to pass to views
  const completeData = {
    papers: rest.papers,
    risultati: rest.risultati,
    joinedData: rest.joinedData
  };

  // render the main layout with header and dynamic main content area
  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={handleTabChange} />
      
      <main style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {activeTab === 'knowledge' && (
          <TabDesignKnowledge data={completeData} goToPaperDetail={goToPaperDetail} />
        )}
        {activeTab === 'papers' && (
          <TabPapers data={completeData} goToPaperDetail={goToPaperDetail} />
        )}
        {activeTab === 'archive' && (
          <TabArchive 
            data={completeData} 
            selectedPaper={selectedArchivePaper}
            setSelectedPaper={setSelectedArchivePaper}
          />
        )}
      </main>
    </div>
  );
}

export default App;
