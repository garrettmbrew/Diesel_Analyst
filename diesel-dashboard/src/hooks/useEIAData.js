import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, EIA_PRODUCTS, EIA_AREAS } from '../utils/constants';
import { sampleEIAData } from '../data/sampleData';

/**
 * Hook for fetching EIA petroleum data
 * Requires API key from environment variable: REACT_APP_EIA_API_KEY
 */
export const useEIAData = () => {
  const [distillateStocks, setDistillateStocks] = useState(null);
  const [paddBreakdown, setPaddBreakdown] = useState(null);
  const [utilization, setUtilization] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const apiKey = process.env.REACT_APP_EIA_API_KEY;

  // Fetch distillate stocks
  const fetchDistillateStocks = useCallback(async () => {
    if (!apiKey) {
      // Use sample data if no API key
      setDistillateStocks(sampleEIAData);
      return sampleEIAData;
    }

    try {
      const url = new URL(`${API_ENDPOINTS.EIA.BASE}${API_ENDPOINTS.EIA.WEEKLY_STOCKS}`);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('frequency', 'weekly');
      url.searchParams.append('data[0]', 'value');
      url.searchParams.append('facets[product][]', EIA_PRODUCTS.DISTILLATE);
      url.searchParams.append('facets[duoarea][]', EIA_AREAS.US_TOTAL);
      url.searchParams.append('sort[0][column]', 'period');
      url.searchParams.append('sort[0][direction]', 'desc');
      url.searchParams.append('length', '52'); // Last year of weekly data

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`EIA API error: ${response.status}`);
      
      const data = await response.json();
      
      if (data.response?.data) {
        const formatted = data.response.data.map((item, index, arr) => ({
          week: item.period,
          distillate: parseInt(item.value),
          change: index < arr.length - 1 
            ? parseInt(item.value) - parseInt(arr[index + 1].value)
            : 0,
        }));
        setDistillateStocks(formatted);
        return formatted;
      }
    } catch (err) {
      console.error('EIA fetch error:', err);
      setError(err.message);
      // Fallback to sample data
      setDistillateStocks(sampleEIAData);
      return sampleEIAData;
    }
  }, [apiKey]);

  // Fetch PADD breakdown
  const fetchPaddBreakdown = useCallback(async () => {
    if (!apiKey) {
      return null;
    }

    try {
      const paddAreas = [
        EIA_AREAS.PADD1,
        EIA_AREAS.PADD2,
        EIA_AREAS.PADD3,
        EIA_AREAS.PADD4,
        EIA_AREAS.PADD5,
      ];

      const results = await Promise.all(
        paddAreas.map(async (area) => {
          const url = new URL(`${API_ENDPOINTS.EIA.BASE}${API_ENDPOINTS.EIA.WEEKLY_STOCKS}`);
          url.searchParams.append('api_key', apiKey);
          url.searchParams.append('frequency', 'weekly');
          url.searchParams.append('data[0]', 'value');
          url.searchParams.append('facets[product][]', EIA_PRODUCTS.DISTILLATE);
          url.searchParams.append('facets[duoarea][]', area);
          url.searchParams.append('sort[0][column]', 'period');
          url.searchParams.append('sort[0][direction]', 'desc');
          url.searchParams.append('length', '1');

          const response = await fetch(url.toString());
          const data = await response.json();
          
          return {
            padd: area,
            value: data.response?.data?.[0]?.value || null,
            period: data.response?.data?.[0]?.period || null,
          };
        })
      );

      setPaddBreakdown(results);
      return results;
    } catch (err) {
      console.error('PADD fetch error:', err);
      setError(err.message);
      return null;
    }
  }, [apiKey]);

  // Main fetch function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchDistillateStocks(),
        fetchPaddBreakdown(),
      ]);
      setLastFetch(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchDistillateStocks, fetchPaddBreakdown]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, []);

  return {
    distillateStocks,
    paddBreakdown,
    utilization,
    loading,
    error,
    lastFetch,
    refresh: fetchData,
    hasApiKey: !!apiKey,
  };
};

export default useEIAData;
