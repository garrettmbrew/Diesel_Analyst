import { useState, useEffect, useCallback } from 'react';
import {
  samplePrices,
  sampleCracks,
  sampleTimespreads,
  sampleInventories,
  sampleArbs,
  sampleNews,
} from '../data/sampleData';
import { calcGasoilCrack, calcUlsdCrack, calc321Crack } from '../utils/calculations';
import { useFREDData } from './useFREDData';
import { useBackendData } from './useBackendData';

/**
 * Main hook for fetching and managing market data
 * Priority order: Backend API > FRED API > Sample Data
 * 
 * Data Sources:
 * 1. Backend API (http://localhost:8000) - Cached data from database
 * 2. FRED API - Direct API calls (requires API key)
 * 3. Sample Data - Fallback when no APIs available
 */
export const useMarketData = (refreshInterval = 60000) => {
  const [prices, setPrices] = useState(null);
  const [cracks, setCracks] = useState(null);
  const [timespreads, setTimespreads] = useState(null);
  const [inventories, setInventories] = useState(null);
  const [arbs, setArbs] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dataSource, setDataSource] = useState('sample');

  // Get backend data
  const {
    isBackendAvailable,
    fetchLatestPrices: fetchBackendPrices,
    fetchLatestInventories: fetchBackendInventories,
    loading: backendLoading,
  } = useBackendData();

  // Get FRED data
  const { 
    brentPrice, 
    wtiPrice, 
    dieselGulf, 
    dieselNYH,
    hasApiKey: hasFredKey,
    refresh: refreshFred,
    loading: fredLoading,
  } = useFREDData();

  // Build prices from backend or FRED data or fall back to sample
  const buildPrices = useCallback(async () => {
    // First, try backend API
    if (isBackendAvailable) {
      try {
        const backendPrices = await fetchBackendPrices();
        if (backendPrices) {
          setDataSource('Backend API (Database)');
          
          // Transform backend format to dashboard format
          return {
            brent: {
              price: backendPrices.DCOILBRENTEU?.value || samplePrices.brent.price,
              change: backendPrices.DCOILBRENTEU?.change || 0,
              changePercent: backendPrices.DCOILBRENTEU?.changePercent || 0,
              high: backendPrices.DCOILBRENTEU?.high || samplePrices.brent.high,
              low: backendPrices.DCOILBRENTEU?.low || samplePrices.brent.low,
              date: backendPrices.DCOILBRENTEU?.date,
            },
            wti: {
              price: backendPrices.DCOILWTICO?.value || samplePrices.wti.price,
              change: backendPrices.DCOILWTICO?.change || 0,
              changePercent: backendPrices.DCOILWTICO?.changePercent || 0,
              high: backendPrices.DCOILWTICO?.high || samplePrices.wti.high,
              low: backendPrices.DCOILWTICO?.low || samplePrices.wti.low,
              date: backendPrices.DCOILWTICO?.date,
            },
            iceGasoil: {
              // Estimate from Brent + crack
              price: ((backendPrices.DCOILBRENTEU?.value || samplePrices.brent.price) + 18) * 7.45,
              change: (backendPrices.DCOILBRENTEU?.change || 0) * 7.45,
              changePercent: backendPrices.DCOILBRENTEU?.changePercent || 0,
              high: samplePrices.iceGasoil.high,
              low: samplePrices.iceGasoil.low,
            },
            nymexUlsd: {
              price: backendPrices.DDFUELUSGULF?.value || backendPrices.DDFUELNYH?.value || samplePrices.nymexUlsd.price,
              change: backendPrices.DDFUELUSGULF?.change || 0,
              changePercent: backendPrices.DDFUELUSGULF?.changePercent || 0,
              high: backendPrices.DDFUELUSGULF?.high || samplePrices.nymexUlsd.high,
              low: backendPrices.DDFUELUSGULF?.low || samplePrices.nymexUlsd.low,
              date: backendPrices.DDFUELUSGULF?.date,
            },
            rbob: samplePrices.rbob, // Not in backend yet
          };
        }
      } catch (err) {
        console.error('Backend fetch failed, trying FRED:', err);
      }
    }
    
    // Second, try FRED API if we have keys
    if (hasFredKey && brentPrice && wtiPrice) {
      setDataSource('FRED API');
      
      // Use FRED data for crude prices
      // Note: FRED doesn't have ICE Gasoil or NYMEX ULSD futures directly
      // We use diesel Gulf as a proxy for ULSD, with conversion
      const ulsdPrice = dieselGulf?.price || dieselNYH?.price || samplePrices.nymexUlsd.price;
      
      return {
        brent: {
          price: brentPrice.price,
          change: brentPrice.change,
          changePercent: brentPrice.changePercent,
          high: brentPrice.high,
          low: brentPrice.low,
          date: brentPrice.date,
        },
        wti: {
          price: wtiPrice.price,
          change: wtiPrice.change,
          changePercent: wtiPrice.changePercent,
          high: wtiPrice.high,
          low: wtiPrice.low,
          date: wtiPrice.date,
        },
        iceGasoil: {
          // Estimate ICE Gasoil from Brent + typical crack spread
          // In reality, would need ICE data feed
          price: (brentPrice.price + 18) * 7.45, // Convert to $/mt approximation
          change: brentPrice.change * 7.45,
          changePercent: brentPrice.changePercent,
          high: (brentPrice.high + 18) * 7.45,
          low: (brentPrice.low + 18) * 7.45,
          date: brentPrice.date, // Derived from Brent
        },
        nymexUlsd: {
          price: ulsdPrice,
          change: dieselGulf?.change || samplePrices.nymexUlsd.change,
          changePercent: dieselGulf?.changePercent || samplePrices.nymexUlsd.changePercent,
          high: dieselGulf?.high || samplePrices.nymexUlsd.high,
          low: dieselGulf?.low || samplePrices.nymexUlsd.low,
          date: dieselGulf?.date || null,
        },
        rbob: {
          // RBOB not in FRED, use sample with adjustment based on crude move
          price: samplePrices.rbob.price * (1 + (brentPrice.changePercent / 100)),
          change: samplePrices.rbob.change,
          changePercent: brentPrice.changePercent,
          high: samplePrices.rbob.high,
          low: samplePrices.rbob.low,
        },
      };
    }
    
    // Fallback to sample data
    setDataSource('Sample Data');
    return samplePrices;
  }, [isBackendAvailable, fetchBackendPrices, hasFredKey, brentPrice, wtiPrice, dieselGulf, dieselNYH]);

  // Fetch inventory data from backend
  const buildInventories = useCallback(async () => {
    if (isBackendAvailable) {
      try {
        const backendInventories = await fetchBackendInventories();
        if (backendInventories) {
          // Transform backend format to dashboard format
          return {
            usDistillate: {
              current: backendInventories.US?.value || sampleInventories.usDistillate.current,
              previous: backendInventories.US?.previous || sampleInventories.usDistillate.previous,
              change: backendInventories.US?.change || 0,
              fiveYearAvg: sampleInventories.usDistillate.fiveYearAvg,
              fiveYearLow: sampleInventories.usDistillate.fiveYearLow,
              fiveYearHigh: sampleInventories.usDistillate.fiveYearHigh,
            },
            padd1: {
              current: backendInventories.PADD1?.value || sampleInventories.padd1.current,
              previous: backendInventories.PADD1?.previous || sampleInventories.padd1.previous,
              change: backendInventories.PADD1?.change || 0,
            },
            padd3: {
              current: backendInventories.PADD3?.value || sampleInventories.padd3.current,
              previous: backendInventories.PADD3?.previous || sampleInventories.padd3.previous,
              change: backendInventories.PADD3?.change || 0,
            },
            araStocks: sampleInventories.araStocks, // Not in backend yet
          };
        }
      } catch (err) {
        console.error('Backend inventory fetch failed:', err);
      }
    }
    
    return sampleInventories;
  }, [isBackendAvailable, fetchBackendInventories]);

  // Fetch/update market data
  const fetchData = useCallback(async () => {
    try {
      const updatedPrices = await buildPrices();
      const updatedInventories = await buildInventories();

      // Calculate cracks based on current prices
      const gasoilCrack = calcGasoilCrack(updatedPrices.iceGasoil.price, updatedPrices.brent.price);
      const ulsdCrack = calcUlsdCrack(updatedPrices.nymexUlsd.price, updatedPrices.wti.price);
      const crack321 = calc321Crack(
        updatedPrices.rbob.price,
        updatedPrices.nymexUlsd.price,
        updatedPrices.wti.price
      );

      const updatedCracks = {
        gasoilBrent: {
          ...sampleCracks.gasoilBrent,
          value: gasoilCrack,
        },
        ulsdWti: {
          ...sampleCracks.ulsdWti,
          value: ulsdCrack,
        },
        crack321: {
          ...sampleCracks.crack321,
          value: crack321,
        },
      };

      setPrices(updatedPrices);
      setCracks(updatedCracks);
      setTimespreads(sampleTimespreads);
      setInventories(updatedInventories);
      setArbs(sampleArbs);
      setNews(sampleNews);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [buildPrices, buildInventories]);

  // Initial fetch and when data sources update
  useEffect(() => {
    fetchData();
  }, [fetchData, brentPrice, wtiPrice, isBackendAvailable]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        if (!isBackendAvailable) {
          refreshFred();
        }
        fetchData();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refreshFred, fetchData, isBackendAvailable]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    if (!isBackendAvailable) {
      await refreshFred();
    }
    await fetchData();
  }, [fetchData, refreshFred, isBackendAvailable]);

  return {
    prices,
    cracks,
    timespreads,
    inventories,
    arbs,
    news,
    loading: loading || fredLoading || backendLoading,
    error,
    lastUpdate,
    refresh,
    dataSource,
    hasFredKey,
    isBackendAvailable,
  };
};

export default useMarketData;
