import { useState, useEffect } from 'react';
import { loadData } from '../api/dataManager';

// custom hook to fetch and manage application data
export const useData = () => {
  // initialize state with empty data arrays
  const [data, setData] = useState({
    papers: [],
    risultati: [],
    joinedData: []
  });
  
  // track loading status during fetch
  const [loading, setLoading] = useState(true);
  
  // store any potential fetch errors
  const [error, setError] = useState(null);

  // trigger data load on component mount
  useEffect(() => {
    // track component mount state to prevent memory leaks
    let mounted = true;

    // async function to handle data fetching
    const fetchData = async () => {
      try {
        // set loading state before request
        setLoading(true);
        
        // request parsed data from manager
        const result = await loadData();
        
        // update state only if component is still mounted
        if (mounted) {
          setData(result);
          setError(null);
        }
      } catch (err) {
        // capture and set any fetch errors
        if (mounted) {
          setError(err);
        }
      } finally {
        // clear loading state once finished
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // execute the fetch operation
    fetchData();

    // cleanup function to mark component as unmounted
    return () => {
      mounted = false;
    };
  }, []);

  // return destructured data along with status indicators
  return { ...data, loading, error };
};
