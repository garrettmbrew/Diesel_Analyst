import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for fetching data from the Python backend API
 * Backend must be running at http://localhost:8000
 */

const BACKEND_URL = 'http://localhost:8000';

export const useBackendData = () => {
  const [prices, setPrices] = useState(null);
  const [inventories, setInventories] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  // Check if backend is running
  const checkBackend = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const available = response.ok;
      setIsBackendAvailable(available);
      return available;
    } catch (err) {
      setIsBackendAvailable(false);
      return false;
    }
  }, []);

  // Fetch prices from backend
  const fetchPrices = useCallback(async (limit = 500) => {
    try {
      const response = await fetch(`${BACKEND_URL}/prices?limit=${limit}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data into the format the dashboard expects
      const transformed = transformPriceData(data);
      setPrices(transformed);
      return transformed;
    } catch (err) {
      console.error('Error fetching prices from backend:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Fetch inventories from backend
  const fetchInventories = useCallback(async (limit = 500) => {
    try {
      const response = await fetch(`${BACKEND_URL}/inventories?limit=${limit}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Transform backend data
      const transformed = transformInventoryData(data);
      setInventories(transformed);
      return transformed;
    } catch (err) {
      console.error('Error fetching inventories from backend:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Fetch latest prices (most recent value for each series)
  const fetchLatestPrices = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/prices/latest`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching latest prices:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Fetch latest inventories
  const fetchLatestInventories = useCallback(async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/inventories/latest`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      
      if (!response.ok) {
        throw new Error(`Backend API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching latest inventories:', err);
      setError(err.message);
      return null;
    }
  }, []);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const backendAvailable = await checkBackend();
    
    if (!backendAvailable) {
      setLoading(false);
      setError('Backend not available. Make sure the API is running on http://localhost:8000');
      return { prices: null, inventories: null };
    }

    try {
      const [priceData, inventoryData] = await Promise.all([
        fetchPrices(),
        fetchInventories(),
      ]);

      setLastFetch(new Date());
      setLoading(false);
      
      return { prices: priceData, inventories: inventoryData };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { prices: null, inventories: null };
    }
  }, [checkBackend, fetchPrices, fetchInventories]);

  // Transform price data from backend format to dashboard format
  const transformPriceData = (backendData) => {
    if (!backendData || backendData.length === 0) return null;

    // Group by series_id
    const grouped = {};
    backendData.forEach(item => {
      if (!grouped[item.series_id]) {
        grouped[item.series_id] = [];
      }
      grouped[item.series_id].push({
        date: item.date,
        value: item.value,
      });
    });

    // Sort each series by date descending (most recent first)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return grouped;
  };

  // Transform inventory data from backend format to dashboard format
  const transformInventoryData = (backendData) => {
    if (!backendData || backendData.length === 0) return null;

    // Group by region
    const grouped = {};
    backendData.forEach(item => {
      if (!grouped[item.region]) {
        grouped[item.region] = [];
      }
      grouped[item.region].push({
        date: item.date,
        value: item.value,
        unit: item.unit,
      });
    });

    // Sort each region by date descending
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    return grouped;
  };

  // Check backend on mount
  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  return {
    prices,
    inventories,
    loading,
    error,
    lastFetch,
    isBackendAvailable,
    fetchAll,
    fetchPrices,
    fetchInventories,
    fetchLatestPrices,
    fetchLatestInventories,
    checkBackend,
  };
};
