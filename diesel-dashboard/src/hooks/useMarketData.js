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

/**
 * Main hook for fetching and managing market data
 * Uses FRED API for live price data when API key is available
 * Falls back to sample data with simulated updates
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

  // Build prices from FRED data or fall back to sample
  const buildPrices = useCallback(() => {
    // Check if we have FRED data
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
  }, [hasFredKey, brentPrice, wtiPrice, dieselGulf, dieselNYH]);

  // Fetch/update market data
  const fetchData = useCallback(async () => {
    try {
      const updatedPrices = buildPrices();

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
      setInventories(sampleInventories);
      setArbs(sampleArbs);
      setNews(sampleNews);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, [buildPrices]);

  // Initial fetch and when FRED data updates
  useEffect(() => {
    fetchData();
  }, [fetchData, brentPrice, wtiPrice]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        refreshFred();
      }, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, refreshFred]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    setLoading(true);
    await refreshFred();
    fetchData();
  }, [fetchData, refreshFred]);

  return {
    prices,
    cracks,
    timespreads,
    inventories,
    arbs,
    news,
    loading: loading || fredLoading,
    error,
    lastUpdate,
    refresh,
    dataSource,
    hasFredKey,
  };
};

export default useMarketData;
