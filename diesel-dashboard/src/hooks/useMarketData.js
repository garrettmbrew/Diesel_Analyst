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

/**
 * Main hook for fetching and managing market data
 * In production, this would connect to live data feeds
 * Currently uses sample data with simulated updates
 */
export const useMarketData = (refreshInterval = 30000) => {
  const [prices, setPrices] = useState(null);
  const [cracks, setCracks] = useState(null);
  const [timespreads, setTimespreads] = useState(null);
  const [inventories, setInventories] = useState(null);
  const [arbs, setArbs] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Simulate small price movements for demo purposes
  const simulatePriceMovement = useCallback((basePrice, volatility = 0.002) => {
    const change = (Math.random() - 0.5) * 2 * volatility * basePrice;
    return basePrice + change;
  }, []);

  // Fetch/update market data
  const fetchData = useCallback(async () => {
    try {
      // In production, replace with actual API calls:
      // const priceData = await fetch('https://api.example.com/prices');
      
      // Simulate price updates with small random movements
      const updatedPrices = {
        brent: {
          ...samplePrices.brent,
          price: simulatePriceMovement(samplePrices.brent.price),
        },
        wti: {
          ...samplePrices.wti,
          price: simulatePriceMovement(samplePrices.wti.price),
        },
        iceGasoil: {
          ...samplePrices.iceGasoil,
          price: simulatePriceMovement(samplePrices.iceGasoil.price, 0.003),
        },
        nymexUlsd: {
          ...samplePrices.nymexUlsd,
          price: simulatePriceMovement(samplePrices.nymexUlsd.price, 0.003),
        },
        rbob: {
          ...samplePrices.rbob,
          price: simulatePriceMovement(samplePrices.rbob.price, 0.003),
        },
      };

      // Recalculate cracks based on updated prices
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
  }, [simulatePriceMovement]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up refresh interval
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshInterval, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    setLoading(true);
    fetchData();
  }, [fetchData]);

  return {
    prices,
    cracks,
    timespreads,
    inventories,
    arbs,
    news,
    loading,
    error,
    lastUpdate,
    refresh,
  };
};

export default useMarketData;
