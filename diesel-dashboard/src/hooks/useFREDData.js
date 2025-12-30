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

  // Fetch a single FRED series via backend proxy
  const fetchSeries = useCallback(async (seriesId, limit = 30) => {
    // Always use backend proxy - no API key needed in frontend
    try {
      const url = `http://localhost:8000/api/fetch/fred/proxy/${seriesId}?limit=${limit}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Backend proxy error: ${response.status}`);
      
      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.error || 'Backend proxy failed');
      }
      
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
  }, []); // No dependency on apiKey anymore

  // Fetch all price data
  const fetchAllPrices = useCallback(async () => {
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
  }, [fetchSeries]);

  // Fetch historical data for a specific series (for charts) via backend proxy
  const fetchHistorical = useCallback(async (seriesId, months = 24) => {
    try {
      // Calculate number of observations needed (approx 30 per month for daily data)
      const limit = months * 30;
      const url = `http://localhost:8000/api/fetch/fred/proxy/${seriesId}?limit=${limit}`;
      
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Backend proxy error: ${response.status}`);
      
      const data = await response.json();
      
      if (data.success === false) {
        throw new Error(data.error || 'Backend proxy failed');
      }
      
      if (data.observations) {
        return data.observations
          .filter(obs => obs.value !== '.')
          .map(obs => ({
            date: obs.date,
            value: parseFloat(obs.value),
          }))
          .reverse(); // FRED returns newest first, we want oldest first for charts
      }
      return null;
    } catch (err) {
      console.error(`FRED historical fetch error:`, err);
      return null;
    }
  }, []);

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
    hasApiKey: true, // Backend handles API key now
  };
};

export default useFREDData;
