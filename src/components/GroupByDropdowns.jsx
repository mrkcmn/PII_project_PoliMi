import React from 'react';

// static list of available dimension filters
export const DIMENSIONS = [
  { id: 'Tecnologia_Interfaccia', label: 'Interface type' },
  { id: 'Popolazione_Studiata', label: 'Studied population' },
  { id: 'Contributo', label: 'Contribution' },
  { id: 'Metodi_Estrazione', label: 'Extraction method' },
  { id: 'Topic', label: 'Topic' }
];

// component to manage dynamic multi-level grouping selectors
export const GroupByDropdowns = ({ selections, setSelections, isPaperView }) => {
  // update specific filter dropdown value when changed
  const handleChange = (index, value) => {
    const newSelections = [...selections];
    newSelections[index] = value;
    setSelections(newSelections);
  };

  // add a new unused filter to the current selection chain
  const addFilter = () => {
    if (selections.length < 5) {
      const available = DIMENSIONS.find(dim => !selections.includes(dim.id));
      if (available) {
        setSelections([...selections, available.id]);
      }
    }
  };

  // remove a specific filter and reset if empty
  const removeFilter = (index) => {
    const newSelections = selections.filter((_, i) => i !== index);
    if (newSelections.length === 0) {
      newSelections.push('Tecnologia_Interfaccia');
    }
    setSelections(newSelections);
  };

  // compute dropdown options excluding already active ones
  const getAvailableOptions = (index) => {
    return DIMENSIONS.filter(dim => {
      const isSelectedElsewhere = selections.some((sel, idx) => idx !== index && sel === dim.id);
      return !isSelectedElsewhere;
    });
  };

  // context specific instruction label
  const helperText = isPaperView ? "Paper grouping filters" : "Guideline grouping filters";

  // render interactive filter controls container
  return (
    <div className="chart-controls-container">
      <div className="chart-controls-helper">
        {helperText}
      </div>
      <div className="chart-controls">
        {selections.map((currentVal, i) => (
          <div key={i} className="group-by-dropdown-wrapper">
            <select
              aria-label={`Group by ${i + 1}`}
              value={currentVal}
              onChange={(e) => handleChange(i, e.target.value)}
              className="group-by-select"
            >
              {getAvailableOptions(i).map(dim => (
                <option key={dim.id} value={dim.id}>{dim.label}</option>
              ))}
              {currentVal !== 'none' && !getAvailableOptions(i).find(d => d.id === currentVal) && (
                <option value={currentVal}>{DIMENSIONS.find(d => d.id === currentVal)?.label}</option>
              )}
            </select>
            {i > 0 && (
              <button
                onClick={() => removeFilter(i)}
                aria-label="Remove filter"
                className="group-by-remove-btn"
                title="Remove filter"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            )}
          </div>
        ))}
        {selections.length < 5 && (
          <button
            onClick={addFilter}
            aria-label="Add filter"
            className="group-by-add-btn"
            title="Add filter"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        )}
      </div>
    </div>
  );
};
