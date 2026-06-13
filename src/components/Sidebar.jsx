import React, { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DIMENSIONS } from './GroupByDropdowns';

// render the collapsible sidebar containing descriptive statistics
export const Sidebar = ({ isCollapsed, setIsCollapsed, data, firstDimension, isPaperView }) => {
  // aggregate raw data by the selected dimensions to compute counts
  const aggregatedData = useMemo(() => {
    // return empty object if missing required data or dimension
    if (!data || data.length === 0 || !firstDimension || firstDimension === 'none') return {};

    // initialize empty result dictionary
    const result = {};

    // iterate through all items in the dataset
    data.forEach(item => {
      // extract primary dimension values or fallback to uncategorized
      const dimValues = item[firstDimension] || ['Uncategorized'];

      // process each primary dimension value
      dimValues.forEach(dimValue => {
        let actualDimValue = dimValue;
        // normalize case for existing dimension keys
        for (let k of Object.keys(result)) {
          if (k.toLowerCase() === dimValue.toLowerCase()) {
            actualDimValue = k;
            break;
          }
        }
        // initialize subdictionary if it doesn't exist yet
        if (!result[actualDimValue]) result[actualDimValue] = {};

        // subdimension is tecnologia for tab 2 and topic for tab 1
        let subDimValues = [];
        if (isPaperView) {
          // extract secondary dimension for papers view
          subDimValues = item.Contributo || ['Uncategorized'];
        } else {
          // extract secondary dimension for knowledge view
          subDimValues = item.Topic || ['Uncategorized'];
        }

        // process each secondary dimension value
        subDimValues.forEach(subValue => {
          let actualSubValue = subValue;
          // normalize case for existing secondary dimension keys
          for (let k of Object.keys(result[actualDimValue])) {
            if (k.toLowerCase() === subValue.toLowerCase()) {
              actualSubValue = k;
              break;
            }
          }
          // initialize counter if it doesn't exist
          if (!result[actualDimValue][actualSubValue]) {
            result[actualDimValue][actualSubValue] = 0;
          }
          // increment occurrence counter
          result[actualDimValue][actualSubValue] += 1;
        });
      });
    });

    // return the fully populated aggregation map
    return result;
  }, [data, firstDimension, isPaperView]);

  // render sidebar container and its toggle button
  return (
    <>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header" style={{ paddingBottom: '16px', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.4', textTransform: 'none', fontWeight: 600 }}>
            {isPaperView ? 'Contributions offered by the papers' : 'Topics covered by the guidelines'}
          </h3>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Organized by: {firstDimension !== 'none' ? (DIMENSIONS.find(d => d.id === firstDimension)?.label || firstDimension.replace('_', ' ')) : 'None'}
          </div>
        </div>

        <div className="sidebar-content">
          <div className="sidebar-section">

            {Object.entries(aggregatedData).map(([dimValue, subMaps]) => {
              // calculate sum of all subdimensions within this primary category
              const totalCount = Object.values(subMaps).reduce((a, b) => a + b, 0);

              // render block for each primary dimension
              return (
                <div key={dimValue} className="dimension-value-block">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0 }}>{dimValue}</h4>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{totalCount}</span>
                  </div>
                  <ul className="topic-count-list">
                    {Object.entries(subMaps).map(([subValue, count]) => (
                      <li key={subValue} className="topic-count-item">
                        <span className="topic-name" title={subValue}>{subValue}</span>
                        <span className="topic-number">{count}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}

            {Object.keys(aggregatedData).length === 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No data available.</p>
            )}
          </div>
        </div>
      </aside>

      <button
        className={`sidebar-toggle-btn ${isCollapsed ? 'collapsed' : ''}`}
        onClick={() => setIsCollapsed(!isCollapsed)}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        aria-expanded={!isCollapsed}
      >
        {isCollapsed ? <ChevronRight size={16} aria-hidden="true" /> : <ChevronLeft size={16} aria-hidden="true" />}
      </button>
    </>
  );
};
