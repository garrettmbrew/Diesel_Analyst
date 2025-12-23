import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, FRED_SERIES } from '../utils/constants';

/**
 * Hook for fetching FRED (Federal Reserve Economic Data) price data
 * Requires API key from environment variable: REACT_APP_FRED_API_KEY
 * 
 * FRED Series:
 * - DCOILBRENTEU: Brent Crude Oil ($/bbl)
 * - DCOILWTICO: WTI Crude Oil ($/bbl)  
 * - DDFUELUSGULF: No. 2 Diesel Gulf Coast ($/gal)
 * - DDFUELNYH: No. 2 Diesel NY Harbor ($/gal)
 */
export const useFREDData = () => {
  const [brentPrice, setBrentPrice] = useState(null);
  const [wtiPrice, setWtiPrice] = useState(null);
  const [dieselGulf, setDieselGulf] = useState(null);
  const [dieselNYH, setDieselNYH] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const apiKey = process.env.REACT_APP_FRED_API_KEY;

  // Fetch a single FRED series
  const fetchSeries = useCallback(async (seriesId, limit = 30) => {
    if (!apiKey) {
      return null;
    }

    try {
      const url = new URL(`${API_ENDPOINTS.FRED.BASE}${API_ENDPOINTS.FRED.SERIES}`);
      url.searchParams.append('series_id', seriesId);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('file_type', 'json');
      url.searchParams.append('sort_order', 'desc');
      url.searchParams.append('limit', limit.toString());

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`FRED API error: ${response.status}`);
      
      const data = await response.json();
      
      if (data.observations && data.observations.length > 0) {
        // Filter out missing values (FRED uses "." for missing)
        const validObs = data.observations.filter(obs => obs.value !== '.');
        return validObs.map(obs => ({
          date: obs.date,
          value: parseFloat(obs.value),
        }));
      }
      return null;
    } catch (err) {
      console.error(`FRED fetch error for ${seriesId}:`, err);
      throw err;
    }
  }, [apiKey]);

  // Fetch all price data
  const fetchAllPrices = useCallback(async () => {
    if (!apiKey) {
      console.warn('No FRED API key configured');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const [brentData, wtiData, gulfData, nyhData] = await Promise.all([
        fetchSeries(FRED_SERIES.BRENT, 30),
        fetchSeries(FRED_SERIES.WTI, 30),
        fetchSeries(FRED_SERIES.DIESEL_GULF, 30),
        fetchSeries(FRED_SERIES.DIESEL_NYH, 30),
      ]);

      // Get latest values and calculate changes
      if (brentData && brentData.length >= 2) {
        const current = brentData[0].value;
        const previous = brentData[1].value;
        const change = current - previous;
        setBrentPrice({
          price: current,
          change: change,
          changePercent: (change / previous) * 100,
          high: Math.max(...brentData.slice(0, 5).map(d => d.value)),
          low: Math.min(...brentData.slice(0, 5).map(d => d.value)),
          date: brentData[0].date,
        });
      }

      if (wtiData && wtiData.length >= 2) {
        const current = wtiData[0].value;
        const previous = wtiData[1].value;
        const change = current - previous;
        setWtiPrice({
          price: current,
          change: change,
          changePercent: (change / previous) * 100,
          high: Math.max(...wtiData.slice(0, 5).map(d => d.value)),
          low: Math.min(...wtiData.slice(0, 5).map(d => d.value)),
          date: wtiData[0].date,
        });
      }

      if (gulfData && gulfData.length >= 2) {
        const current = gulfData[0].value;
        const previous = gulfData[1].value;
        const change = current - previous;
        setDieselGulf({
          price: current,
          change: change,
          changePercent: (change / previous) * 100,
          high: Math.max(...gulfData.slice(0, 5).map(d => d.value)),
          low: Math.min(...gulfData.slice(0, 5).map(d => d.value)),
          date: gulfData[0].date,
        });
      }

      if (nyhData && nyhData.length >= 2) {
        const current = nyhData[0].value;
        const previous = nyhData[1].value;
        const change = current - previous;
        setDieselNYH({
          price: current,
          change: change,
          changePercent: (change / previous) * 100,
          high: Math.max(...nyhData.slice(0, 5).map(d => d.value)),
          low: Math.min(...nyhData.slice(0, 5).map(d => d.value)),
          date: nyhData[0].date,
        });
      }

      // Build historical data for charts
      if (brentData && wtiData) {
        const combined = brentData.slice(0, 20).map((brent, i) => ({
          date: brent.date,
          brent: brent.value,
          wti: wtiData[i]?.value || null,
          dieselGulf: gulfData?.[i]?.value || null,
          dieselNYH: nyhData?.[i]?.value || null,
        })).reverse();
        setHistoricalData(combined);
      }

      setLastFetch(new Date());
      return { brentData, wtiData, gulfData, nyhData };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [apiKey, fetchSeries]);

  // Fetch historical data for a specific series (for charts)
  const fetchHistorical = useCallback(async (seriesId, months = 24) => {
    if (!apiKey) return null;
    
    try {
      // Calculate date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - months);
      
      const url = new URL(`${API_ENDPOINTS.FRED.BASE}${API_ENDPOINTS.FRED.SERIES}`);
      url.searchParams.append('series_id', seriesId);
      url.searchParams.append('api_key', apiKey);
      url.searchParams.append('file_type', 'json');
      url.searchParams.append('observation_start', startDate.toISOString().split('T')[0]);
      url.searchParams.append('observation_end', endDate.toISOString().split('T')[0]);

      const response = await fetch(url.toString());
      const data = await response.json();
      
      if (data.observations) {
        return data.observations
          .filter(obs => obs.value !== '.')
          .map(obs => ({
            date: obs.date,
            value: parseFloat(obs.value),
          }));
      }
      return null;
    } catch (err) {
      console.error(`FRED historical fetch error:`, err);
      return null;
    }
  }, [apiKey]);

  // Initial fetch
  useEffect(() => {
    fetchAllPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    brentPrice,
    wtiPrice,
    dieselGulf,
    dieselNYH,
    historicalData,
    loading,
    error,
    lastFetch,
    refresh: fetchAllPrices,
    fetchHistorical,
    hasApiKey: !!apiKey,
  };
};

export default useFREDData;
