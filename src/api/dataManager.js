import Papa from 'papaparse';

const parseCSV = (url) => {
  return new Promise((resolve, reject) => {
    Papa.parse(`${url}?t=${new Date().getTime()}`, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (error) => reject(error)
    });
  });
};

export const loadData = async () => {
  try {
    const [papers, risultati] = await Promise.all([
      parseCSV('./paper.csv'),
      parseCSV('./risultati.csv')
    ]);

    // clean and standardize incoming data
    const formatMultiValue = (val) => val ? val.split(' | ').join(', ').trim() : '';

    const cleanedPapers = papers.map(p => ({
      ...p,
      Tecnologia_Interfaccia: (p.Tecnologia_Interfaccia || '').trim(),
      Popolazione_Studiata: formatMultiValue(p.Popolazione_Studiata),
      Contributo: formatMultiValue(p.Contributo),
      Metodi_Estrazione: formatMultiValue(p.Metodi_Estrazione),
    }));

    const cleanedRisultati = risultati.map(r => ({
      ...r,
      Topic: (r.Topic || '').trim(),
    }));

    // join risultati array to each paper
    const joinedData = cleanedPapers.map(paper => {
      return {
        ...paper,
        risultati: cleanedRisultati.filter(r => r.ID_Paper === paper.ID_Paper)
      };
    });

    return {
      papers: cleanedPapers,
      risultati: cleanedRisultati,
      joinedData
    };
  } catch (error) {
    console.error("Error loading data:", error);
    throw error;
  }
};
