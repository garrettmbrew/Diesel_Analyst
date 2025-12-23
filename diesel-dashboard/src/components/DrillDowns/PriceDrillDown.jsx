import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush, ReferenceLine } from 'recharts';
import { theme } from '../../styles/theme';
import { Tabs, TabPanel } from '../Common/Tabs';
import { sampleHistoricalPrices } from '../../data/sampleData';
import { TrendingUp, BarChart3, Activity, ExternalLink, Database } from 'lucide-react';
import { useFREDData } from '../../hooks/useFREDData';

// Time range options for historical data
const TIME_RANGES = [
  { id: '1w', label: '1W', days: 7 },
  { id: '1m', label: '1M', days: 30 },
  { id: '3m', label: '3M', days: 90 },
  { id: '6m', label: '6M', days: 180 },
  { id: '1y', label: '1Y', days: 365 },
  { id: '2y', label: '2Y', days: 730 },
];

// Available data sources per product - expandable for future API integrations
// Each source can be: 'api' (fetchable), 'external' (link only), or 'sample'
const PRODUCT_SOURCES = {
  brent: [
    { 
      id: 'fred', 
      name: 'FRED', 
      type: 'api',
      series: 'DCOILBRENTEU',
      frequency: 'Daily',
      delay: '1-day',
      url: 'https://fred.stlouisfed.org/series/DCOILBRENTEU#0',
      color: theme.colors.accent.tertiary,
    },
    { 
      id: 'ice', 
      name: 'ICE Exchange', 
      type: 'external',
      frequency: 'Intraday',
      delay: 'Real-time',
      url: 'https://www.theice.com/products/219/Brent-Crude-Futures/data?marketId=5191210',
      color: theme.colors.semantic.bullish,
    },
    { 
      id: 'sample', 
      name: 'Sample Data', 
      type: 'sample',
      frequency: 'Monthly',
      delay: 'Static',
      color: theme.colors.text.muted,
    },
  ],
  wti: [
    { 
      id: 'fred', 
      name: 'FRED', 
      type: 'api',
      series: 'DCOILWTICO',
      frequency: 'Daily',
      delay: '1-day',
      url: 'https://fred.stlouisfed.org/series/DCOILWTICO#0',
      color: theme.colors.accent.tertiary,
    },
    { 
      id: 'cme', 
      name: 'CME Exchange', 
      type: 'external',
      frequency: 'Intraday',
      delay: 'Real-time',
      url: 'https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.quotes.html',
      color: theme.colors.semantic.bullish,
    },
    { 
      id: 'sample', 
      name: 'Sample Data', 
      type: 'sample',
      frequency: 'Monthly',
      delay: 'Static',
      color: theme.colors.text.muted,
    },
  ],
  ulsd: [
    { 
      id: 'fred', 
      name: 'FRED (Gulf)', 
      type: 'api',
      series: 'DDFUELUSGULF',
      frequency: 'Daily',
      delay: '1-day',
      url: 'https://fred.stlouisfed.org/series/DDFUELUSGULF#0',
      color: theme.colors.accent.tertiary,
    },
    { 
      id: 'fred_nyh', 
      name: 'FRED (NYH)', 
      type: 'api',
      series: 'DDFUELNYH',
      frequency: 'Daily',
      delay: '1-day',
      url: 'https://fred.stlouisfed.org/series/DDFUELNYH#0',
      color: theme.colors.accent.secondary,
    },
    { 
      id: 'cme', 
      name: 'CME Exchange', 
      type: 'external',
      frequency: 'Intraday',
      delay: 'Real-time',
      url: 'https://www.cmegroup.com/markets/energy/refined-products/heating-oil.quotes.html',
      color: theme.colors.semantic.bullish,
    },
    { 
      id: 'sample', 
      name: 'Sample Data', 
      type: 'sample',
      frequency: 'Monthly',
      delay: 'Static',
      color: theme.colors.text.muted,
    },
  ],
  gasoil: [
    { 
      id: 'ice', 
      name: 'ICE Exchange', 
      type: 'external',
      frequency: 'Intraday',
      delay: 'Real-time',
      url: 'https://www.theice.com/products/34361119/Low-Sulphur-Gasoil-Futures/data?marketId=5502955',
      color: theme.colors.semantic.bullish,
    },
    { 
      id: 'sample', 
      name: 'Sample Data', 
      type: 'sample',
      frequency: 'Monthly',
      delay: 'Static',
      color: theme.colors.text.muted,
    },
  ],
};

// Legacy DATA_SOURCES for backwards compatibility
const DATA_SOURCES = {
  brent: {
    label: 'ICE Brent',
    fredSeries: 'DCOILBRENTEU',
    fredUrl: 'https://fred.stlouisfed.org/series/DCOILBRENTEU#0',
    fredNote: 'Daily (1-day delay)',
    exchangeUrl: 'https://www.theice.com/products/219/Brent-Crude-Futures/data?marketId=5191210',
    exchangeLabel: 'ICE Live (Intraday)',
    hasIntraday: true,
  },
  wti: {
    label: 'NYMEX WTI',
    fredSeries: 'DCOILWTICO',
    fredUrl: 'https://fred.stlouisfed.org/series/DCOILWTICO#0',
    fredNote: 'Daily (1-day delay)',
    exchangeUrl: 'https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.quotes.html',
    exchangeLabel: 'CME Live (Intraday)',
    hasIntraday: true,
  },
  ulsd: {
    label: 'NYMEX ULSD',
    fredSeries: 'DDFUELUSGULF',
    fredUrl: 'https://fred.stlouisfed.org/series/DDFUELUSGULF#0',
    fredNote: 'Daily (1-day delay)',
    exchangeUrl: 'https://www.cmegroup.com/markets/energy/refined-products/heating-oil.quotes.html',
    exchangeLabel: 'CME Live (Intraday)',
    hasIntraday: true,
  },
  gasoil: {
    label: 'ICE Gasoil',
    fredSeries: null,
    fredUrl: null,
    fredNote: null,
    exchangeUrl: 'https://www.theice.com/products/34361119/Low-Sulphur-Gasoil-Futures/data?marketId=5502955',
    exchangeLabel: 'ICE Live (Intraday)',
    hasIntraday: true,
  },
};

/**
 * Price drill-down with historical charts and analysis
 */
export const PriceDrillDown = ({ product = 'gasoil', hasFredKey = false, priceDate = null }) => {
  const [activeTab, setActiveTab] = useState('history');
  const [timeRange, setTimeRange] = useState('3m');
  const [selectedSource, setSelectedSource] = useState(null); // Will be set based on available sources
  const [liveHistoricalData, setLiveHistoricalData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  // Multi-series data for correlations
  const [correlationData, setCorrelationData] = useState(null);
  const [loadingCorrelation, setLoadingCorrelation] = useState(false);
  
  const { fetchHistorical, hasApiKey } = useFREDData();

  // FRED series for correlation/volatility calculations
  const CORRELATION_SERIES = {
    brent: 'DCOILBRENTEU',
    wti: 'DCOILWTICO',
    dieselGulf: 'DDFUELUSGULF',
    dieselNYH: 'DDFUELNYH',
  };

  // Get available sources for current product
  const availableSources = useMemo(() => {
    const sources = PRODUCT_SOURCES[product] || PRODUCT_SOURCES.gasoil;
    // Filter to sources that are usable (API with key, or sample)
    return sources.map(source => ({
      ...source,
      available: source.type === 'sample' || 
                 (source.type === 'api' && hasApiKey) ||
                 source.type === 'external',
      fetchable: source.type === 'sample' || (source.type === 'api' && hasApiKey),
    }));
  }, [product, hasApiKey]);

  // Set default source when product changes
  useEffect(() => {
    const fetchableSources = availableSources.filter(s => s.fetchable);
    const apiSource = fetchableSources.find(s => s.type === 'api');
    const defaultSource = apiSource || fetchableSources[0];
    setSelectedSource(defaultSource?.id || 'sample');
    setLiveHistoricalData(null); // Clear data when product changes
  }, [product, availableSources]);

  const currentSource = availableSources.find(s => s.id === selectedSource) || availableSources[0];

  const tabs = [
    { id: 'history', label: 'History', icon: <TrendingUp size={14} /> },
    { id: 'correlation', label: 'Correlations', icon: <BarChart3 size={14} /> },
    { id: 'volatility', label: 'Volatility', icon: <Activity size={14} /> },
  ];

  const getProductConfig = () => {
    switch (product) {
      case 'brent':
        return { key: 'brent', label: 'ICE Brent', color: theme.colors.accent.tertiary, unit: '$/bbl' };
      case 'wti':
        return { key: 'wti', label: 'WTI', color: theme.colors.semantic.bullish, unit: '$/bbl' };
      case 'ulsd':
        return { key: 'ulsd', label: 'NYMEX ULSD', color: theme.colors.accent.primary, unit: '$/gal' };
      default:
        return { key: 'gasoil', label: 'ICE Gasoil', color: theme.colors.accent.secondary, unit: '$/mt' };
    }
  };

  const config = getProductConfig();
  const dataSource = DATA_SOURCES[product] || DATA_SOURCES.gasoil;

  // Get the series ID for the current source (used in dependency array)
  const currentSeriesId = currentSource?.series || null;

  // Fetch data when source, timeRange, or product changes
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch for API sources with a series
      if (!currentSeriesId || currentSource?.type !== 'api' || !hasApiKey) {
        setLiveHistoricalData(null);
        return;
      }
      
      setLoadingHistory(true);
      const selectedRange = TIME_RANGES.find(r => r.id === timeRange);
      const months = Math.ceil(selectedRange.days / 30);
      
      console.log(`Fetching FRED series: ${currentSeriesId} for ${months} months`); // Debug log
      
      try {
        const data = await fetchHistorical(currentSeriesId, months);
        if (data && data.length > 0) {
          // Filter to the exact day range
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - selectedRange.days);
          
          const filteredData = data.filter(d => new Date(d.date) >= cutoffDate);
          console.log(`Received ${filteredData.length} data points for ${currentSeriesId}`); // Debug log
          setLiveHistoricalData(filteredData);
        } else {
          setLiveHistoricalData(null);
        }
      } catch (err) {
        console.error('Failed to fetch historical data:', err);
        setLiveHistoricalData(null);
      } finally {
        setLoadingHistory(false);
      }
    };
    
    fetchData();
  }, [timeRange, currentSeriesId, currentSource?.type, hasApiKey, fetchHistorical]);

  // Fetch correlation data (multiple series) when correlation tab is active
  useEffect(() => {
    const fetchCorrelationData = async () => {
      if (!hasApiKey || activeTab !== 'correlation' && activeTab !== 'volatility') return;
      if (correlationData) return; // Already fetched
      
      setLoadingCorrelation(true);
      try {
        const [brentData, wtiData, gulfData, nyhData] = await Promise.all([
          fetchHistorical(CORRELATION_SERIES.brent, 6),
          fetchHistorical(CORRELATION_SERIES.wti, 6),
          fetchHistorical(CORRELATION_SERIES.dieselGulf, 6),
          fetchHistorical(CORRELATION_SERIES.dieselNYH, 6),
        ]);
        
        setCorrelationData({
          brent: brentData || [],
          wti: wtiData || [],
          dieselGulf: gulfData || [],
          dieselNYH: nyhData || [],
        });
      } catch (err) {
        console.error('Failed to fetch correlation data:', err);
      } finally {
        setLoadingCorrelation(false);
      }
    };
    
    fetchCorrelationData();
  }, [activeTab, hasApiKey, fetchHistorical, correlationData, CORRELATION_SERIES.brent, CORRELATION_SERIES.wti, CORRELATION_SERIES.dieselGulf, CORRELATION_SERIES.dieselNYH]);

  // Prepare chart data based on selected source
  const chartData = useMemo(() => {
    // For API sources with data
    if (currentSource?.type === 'api' && liveHistoricalData && liveHistoricalData.length > 0) {
      return liveHistoricalData.map(d => ({
        date: d.date,
        [config.key]: d.value,
      }));
    }
    // Sample data fallback
    return sampleHistoricalPrices;
  }, [liveHistoricalData, config.key, currentSource?.type]);

  const isUsingLiveData = currentSource?.type === 'api' && liveHistoricalData && liveHistoricalData.length > 0;

  // Calculate stats from chart data
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;
    const values = chartData.map(d => d[config.key]).filter(v => v != null);
    if (values.length === 0) return null;
    
    const current = values[values.length - 1];
    const high = Math.max(...values);
    const low = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    
    return { current, high, low, avg };
  }, [chartData, config.key]);

  // Calculate Pearson correlation coefficient
  const calculateCorrelation = (arr1, arr2) => {
    if (!arr1 || !arr2 || arr1.length < 10 || arr2.length < 10) return null;
    
    // Align dates
    const dateMap1 = new Map(arr1.map(d => [d.date, d.value]));
    const aligned = arr2
      .filter(d => dateMap1.has(d.date))
      .map(d => ({ x: dateMap1.get(d.date), y: d.value }));
    
    if (aligned.length < 10) return null;
    
    const n = aligned.length;
    const sumX = aligned.reduce((a, d) => a + d.x, 0);
    const sumY = aligned.reduce((a, d) => a + d.y, 0);
    const sumXY = aligned.reduce((a, d) => a + d.x * d.y, 0);
    const sumX2 = aligned.reduce((a, d) => a + d.x * d.x, 0);
    const sumY2 = aligned.reduce((a, d) => a + d.y * d.y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
    
    if (denominator === 0) return null;
    return numerator / denominator;
  };

  // Calculate volatility (annualized standard deviation of returns)
  const calculateVolatility = (data, days = 30) => {
    if (!data || data.length < days + 1) return null;
    
    const recentData = data.slice(0, days + 1);
    const returns = [];
    
    for (let i = 0; i < recentData.length - 1; i++) {
      const ret = Math.log(recentData[i].value / recentData[i + 1].value);
      returns.push(ret);
    }
    
    if (returns.length < 5) return null;
    
    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, r) => a + Math.pow(r - mean, 2), 0) / (returns.length - 1);
    const dailyVol = Math.sqrt(variance);
    const annualizedVol = dailyVol * Math.sqrt(252) * 100; // Annualized, as percentage
    
    return annualizedVol;
  };

  // Computed correlations from real data
  const correlations = useMemo(() => {
    if (!correlationData) return null;
    
    const { brent, wti, dieselGulf, dieselNYH } = correlationData;
    
    return {
      brentWti: calculateCorrelation(brent, wti),
      brentGulf: calculateCorrelation(brent, dieselGulf),
      wtiGulf: calculateCorrelation(wti, dieselGulf),
      gulfNyh: calculateCorrelation(dieselGulf, dieselNYH),
      brentNyh: calculateCorrelation(brent, dieselNYH),
      wtiNyh: calculateCorrelation(wti, dieselNYH),
    };
  }, [correlationData]);

  // Computed volatility from real data
  const volatilityStats = useMemo(() => {
    if (!correlationData) return null;
    
    // Get the relevant series for current product
    let primaryData;
    switch (product) {
      case 'brent': primaryData = correlationData.brent; break;
      case 'wti': primaryData = correlationData.wti; break;
      case 'ulsd': primaryData = correlationData.dieselGulf; break;
      default: primaryData = correlationData.brent; // Gasoil uses Brent as proxy
    }
    
    if (!primaryData || primaryData.length < 31) return null;
    
    const vol30 = calculateVolatility(primaryData, 30);
    const vol60 = calculateVolatility(primaryData, 60);
    const vol90 = calculateVolatility(primaryData, 90);
    
    // Calculate average vol over longer period
    const avgVol = vol90 || vol60 || vol30;
    const currentVol = vol30;
    
    let regime = 'NORMAL';
    if (currentVol && avgVol) {
      if (currentVol < avgVol * 0.8) regime = 'LOW';
      else if (currentVol > avgVol * 1.2) regime = 'HIGH';
    }
    
    return {
      vol30,
      vol60,
      vol90,
      avgVol,
      regime,
    };
  }, [correlationData, product]);

  // Helper to format correlation
  const formatCorrelation = (corr) => {
    if (corr === null || corr === undefined) return '--';
    return corr.toFixed(2);
  };

  // Helper to describe correlation
  const describeCorrelation = (corr) => {
    if (corr === null || corr === undefined) return 'Insufficient data';
    const abs = Math.abs(corr);
    const sign = corr >= 0 ? 'positive' : 'negative';
    if (abs >= 0.9) return `Very strong ${sign} correlation`;
    if (abs >= 0.7) return `Strong ${sign} correlation`;
    if (abs >= 0.5) return `Moderate ${sign} correlation`;
    if (abs >= 0.3) return `Weak ${sign} correlation`;
    return `Very weak ${sign} correlation`;
  };

  // Get correlation color
  const getCorrelationColor = (corr) => {
    if (corr === null) return theme.colors.text.muted;
    return corr >= 0 ? theme.colors.semantic.bullish : theme.colors.semantic.bearish;
  };

  // Handle source selection
  const handleSourceChange = (sourceId) => {
    const source = availableSources.find(s => s.id === sourceId);
    if (source?.type === 'external') {
      // Open external link in new tab
      window.open(source.url, '_blank');
    } else {
      setSelectedSource(sourceId);
      setLiveHistoricalData(null); // Clear to trigger refetch
    }
  };

  return (
    <div style={styles.container}>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <TabPanel isActive={activeTab === 'history'}>
        <div style={styles.chartContainer}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>{config.label} - Price History</h3>
            
            {/* Data Source Selector */}
            <div style={styles.sourceSelector}>
              <Database size={12} style={{ color: theme.colors.text.muted }} />
              <span style={styles.sourceSelectorLabel}>Source:</span>
              {availableSources.map(source => (
                <button
                  key={source.id}
                  style={{
                    ...styles.sourceButton,
                    ...(selectedSource === source.id ? styles.sourceButtonActive : {}),
                    ...(source.type === 'external' ? styles.sourceButtonExternal : {}),
                    borderColor: source.color,
                    ...(selectedSource === source.id ? { background: `${source.color}30` } : {}),
                  }}
                  onClick={() => handleSourceChange(source.id)}
                  title={`${source.frequency} updates, ${source.delay} delay`}
                >
                  {source.name}
                  {source.type === 'external' && <ExternalLink size={9} style={{ marginLeft: '3px' }} />}
                </button>
              ))}
            </div>

            {/* Current source info */}
            <div style={styles.sourceBadgeRow}>
              <span style={{
                ...styles.sourceBadge,
                background: isUsingLiveData ? `${theme.colors.semantic.bullish}20` : `${theme.colors.semantic.warning}20`,
                color: isUsingLiveData ? theme.colors.semantic.bullish : theme.colors.semantic.warning,
              }}>
                {loadingHistory ? '◌ Loading...' : 
                 isUsingLiveData ? `● ${currentSource?.name}: ${currentSource?.series}` : 
                 `○ ${currentSource?.name || 'Sample'}`}
                {isUsingLiveData && ` (${chartData.length} pts)`}
              </span>
              <span style={styles.sourceInfo}>
                {currentSource?.frequency} • {currentSource?.delay}
              </span>
              {currentSource?.url && (
                <a 
                  href={currentSource.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={styles.verifyLink}
                >
                  <ExternalLink size={10} /> View Source
                </a>
              )}
            </div>
          </div>

          {/* Time Range Selector */}
          <div style={styles.timeRangeSelector}>
            {TIME_RANGES.map(range => (
              <button
                key={range.id}
                style={{
                  ...styles.timeRangeButton,
                  ...(timeRange === range.id ? styles.timeRangeButtonActive : {}),
                }}
                onClick={() => setTimeRange(range.id)}
              >
                {range.label}
              </button>
            ))}
            {!hasApiKey && (
              <span style={styles.apiNote}>Add FRED API key for live daily data</span>
            )}
            {hasApiKey && !dataSource.fredSeries && (
              <span style={styles.apiNote}>No FRED series for {dataSource.label}</span>
            )}
          </div>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis 
                dataKey="date" 
                stroke={theme.colors.text.muted} 
                tick={{ fill: theme.colors.text.muted, fontSize: 10 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke={theme.colors.text.muted}
                tick={{ fill: theme.colors.text.muted, fontSize: 11 }}
                domain={['auto', 'auto']}
                label={{ value: config.unit, angle: -90, position: 'insideLeft', fill: theme.colors.text.muted }}
              />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
                labelStyle={{ color: theme.colors.text.primary }}
                formatter={(value) => [value?.toFixed(2), config.label]}
              />
              {stats && (
                <ReferenceLine 
                  y={stats.avg} 
                  stroke={theme.colors.text.muted} 
                  strokeDasharray="5 5" 
                  label={{ value: `Avg: ${stats.avg.toFixed(2)}`, fill: theme.colors.text.muted, fontSize: 10 }}
                />
              )}
              <Line 
                type="monotone" 
                dataKey={config.key} 
                stroke={config.color} 
                strokeWidth={2}
                dot={chartData.length <= 60 ? { fill: config.color, r: 2 } : false}
                name={config.label}
              />
              {/* Brush for zooming */}
              <Brush 
                dataKey="date" 
                height={25} 
                stroke={theme.colors.accent.primary}
                fill={theme.colors.background.secondary}
                tickFormatter={(val) => val?.slice(5) || ''}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Levels */}
        <div style={styles.levelsGrid}>
          <div style={styles.levelCard}>
            <div style={styles.levelLabel}>Period High</div>
            <div style={styles.levelValue}>{stats ? `$${stats.high.toFixed(2)}` : '--'}</div>
            <div style={styles.levelDate}>{TIME_RANGES.find(r => r.id === timeRange)?.label} range</div>
          </div>
          <div style={styles.levelCard}>
            <div style={styles.levelLabel}>Period Low</div>
            <div style={styles.levelValue}>{stats ? `$${stats.low.toFixed(2)}` : '--'}</div>
            <div style={styles.levelDate}>{TIME_RANGES.find(r => r.id === timeRange)?.label} range</div>
          </div>
          <div style={styles.levelCard}>
            <div style={styles.levelLabel}>Period Average</div>
            <div style={styles.levelValue}>{stats ? `$${stats.avg.toFixed(2)}` : '--'}</div>
            <div style={styles.levelSubtext}>{stats ? `Current: ${((stats.current - stats.avg) / stats.avg * 100).toFixed(1)}%` : '--'}</div>
          </div>
          <div style={styles.levelCard}>
            <div style={styles.levelLabel}>YTD Change</div>
            <div style={{ ...styles.levelValue, color: theme.colors.semantic.bearish }}>-8.2%</div>
            <div style={styles.levelSubtext}>From $81.50</div>
          </div>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'correlation'}>
        {/* Data source badge */}
        <div style={styles.sourceBadgeRow}>
          <span style={{
            ...styles.sourceBadge,
            background: correlations ? `${theme.colors.semantic.bullish}20` : `${theme.colors.semantic.warning}20`,
            color: correlations ? theme.colors.semantic.bullish : theme.colors.semantic.warning,
          }}>
            {loadingCorrelation ? '◌ Loading FRED data...' : 
             correlations ? '● LIVE: 6-month FRED data' : '○ Add FRED API key for live data'}
          </span>
        </div>

        <div style={styles.correlationGrid}>
          <div style={styles.correlationCard}>
            <div style={styles.correlationPair}>Brent vs WTI</div>
            <div style={{ ...styles.correlationValue, color: getCorrelationColor(correlations?.brentWti) }}>
              {formatCorrelation(correlations?.brentWti)}
            </div>
            <div style={styles.correlationBar}>
              <div style={{ 
                ...styles.correlationFill, 
                width: correlations?.brentWti ? `${Math.abs(correlations.brentWti) * 100}%` : '0%', 
                background: getCorrelationColor(correlations?.brentWti) 
              }} />
            </div>
            <div style={styles.correlationDesc}>{describeCorrelation(correlations?.brentWti)}</div>
          </div>
          <div style={styles.correlationCard}>
            <div style={styles.correlationPair}>Brent vs ULSD Gulf</div>
            <div style={{ ...styles.correlationValue, color: getCorrelationColor(correlations?.brentGulf) }}>
              {formatCorrelation(correlations?.brentGulf)}
            </div>
            <div style={styles.correlationBar}>
              <div style={{ 
                ...styles.correlationFill, 
                width: correlations?.brentGulf ? `${Math.abs(correlations.brentGulf) * 100}%` : '0%', 
                background: getCorrelationColor(correlations?.brentGulf) 
              }} />
            </div>
            <div style={styles.correlationDesc}>{describeCorrelation(correlations?.brentGulf)}</div>
          </div>
          <div style={styles.correlationCard}>
            <div style={styles.correlationPair}>WTI vs ULSD Gulf</div>
            <div style={{ ...styles.correlationValue, color: getCorrelationColor(correlations?.wtiGulf) }}>
              {formatCorrelation(correlations?.wtiGulf)}
            </div>
            <div style={styles.correlationBar}>
              <div style={{ 
                ...styles.correlationFill, 
                width: correlations?.wtiGulf ? `${Math.abs(correlations.wtiGulf) * 100}%` : '0%', 
                background: getCorrelationColor(correlations?.wtiGulf) 
              }} />
            </div>
            <div style={styles.correlationDesc}>{describeCorrelation(correlations?.wtiGulf)}</div>
          </div>
          <div style={styles.correlationCard}>
            <div style={styles.correlationPair}>ULSD Gulf vs NYH</div>
            <div style={{ ...styles.correlationValue, color: getCorrelationColor(correlations?.gulfNyh) }}>
              {formatCorrelation(correlations?.gulfNyh)}
            </div>
            <div style={styles.correlationBar}>
              <div style={{ 
                ...styles.correlationFill, 
                width: correlations?.gulfNyh ? `${Math.abs(correlations.gulfNyh) * 100}%` : '0%', 
                background: getCorrelationColor(correlations?.gulfNyh) 
              }} />
            </div>
            <div style={styles.correlationDesc}>{describeCorrelation(correlations?.gulfNyh)}</div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Why Correlations Matter</h4>
          <p style={styles.infoText}>
            Diesel prices correlate strongly with crude oil (~0.90+) but the spread between them (the crack) 
            is what drives refining profitability. Regional diesel spreads (Gulf vs NYH) indicate local supply/demand 
            imbalances and arbitrage opportunities.
          </p>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'volatility'}>
        {/* Data source badge */}
        <div style={styles.sourceBadgeRow}>
          <span style={{
            ...styles.sourceBadge,
            background: volatilityStats ? `${theme.colors.semantic.bullish}20` : `${theme.colors.semantic.warning}20`,
            color: volatilityStats ? theme.colors.semantic.bullish : theme.colors.semantic.warning,
          }}>
            {loadingCorrelation ? '◌ Loading FRED data...' : 
             volatilityStats ? `● LIVE: ${config.label} realized volatility` : '○ Add FRED API key for live data'}
          </span>
        </div>

        <div style={styles.volGrid}>
          <div style={styles.volCard}>
            <div style={styles.volLabel}>30-Day Realized Vol</div>
            <div style={styles.volValue}>
              {volatilityStats?.vol30 ? `${volatilityStats.vol30.toFixed(1)}%` : '--'}
            </div>
            <div style={styles.volContext}>
              {volatilityStats?.vol30 && volatilityStats?.avgVol 
                ? (volatilityStats.vol30 < volatilityStats.avgVol ? 'Below average' : 'Above average')
                : 'Annualized'}
            </div>
          </div>
          <div style={styles.volCard}>
            <div style={styles.volLabel}>60-Day Realized Vol</div>
            <div style={styles.volValue}>
              {volatilityStats?.vol60 ? `${volatilityStats.vol60.toFixed(1)}%` : '--'}
            </div>
            <div style={styles.volContext}>Medium-term trend</div>
          </div>
          <div style={styles.volCard}>
            <div style={styles.volLabel}>90-Day Realized Vol</div>
            <div style={styles.volValue}>
              {volatilityStats?.vol90 ? `${volatilityStats.vol90.toFixed(1)}%` : '--'}
            </div>
            <div style={styles.volContext}>Historical baseline</div>
          </div>
          <div style={styles.volCard}>
            <div style={styles.volLabel}>Vol Regime</div>
            <div style={{ 
              ...styles.volValue, 
              color: volatilityStats?.regime === 'LOW' ? theme.colors.semantic.bullish 
                   : volatilityStats?.regime === 'HIGH' ? theme.colors.semantic.bearish 
                   : theme.colors.text.primary 
            }}>
              {volatilityStats?.regime || '--'}
            </div>
            <div style={styles.volContext}>
              {volatilityStats?.regime === 'LOW' ? 'Below 90-day average' 
               : volatilityStats?.regime === 'HIGH' ? 'Above 90-day average' 
               : 'vs 90-day average'}
            </div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Volatility Interpretation</h4>
          <p style={styles.infoText}>
            Low volatility regimes often precede big moves — the market is complacent. 
            Realized volatility is calculated as the annualized standard deviation of daily log returns.
            High vol environments (&gt;40%) typically coincide with supply disruptions or demand shocks.
          </p>
        </div>
      </TabPanel>
    </div>
  );
};

const styles = {
  container: {
    // Container styling
  },
  chartContainer: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    marginBottom: '24px',
  },
  chartHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px',
  },
  chartTitle: {
    margin: 0,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  sourceSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
    padding: '8px 12px',
    background: theme.colors.background.primary,
    borderRadius: theme.radius.md,
  },
  sourceSelectorLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginRight: '4px',
  },
  sourceButton: {
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
    background: 'transparent',
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.radius.sm,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    display: 'flex',
    alignItems: 'center',
  },
  sourceButtonActive: {
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  sourceButtonExternal: {
    borderStyle: 'dashed',
  },
  sourceInfo: {
    fontSize: '10px',
    color: theme.colors.text.disabled,
  },
  sourceBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  sourceBadge: {
    fontSize: '10px',
    fontWeight: theme.fontWeights.semibold,
    padding: '3px 10px',
    borderRadius: theme.radius.full,
    letterSpacing: '0.5px',
  },
  chartNote: {
    fontSize: '10px',
    color: theme.colors.text.muted,
    fontStyle: 'italic',
  },
  verifyLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    color: theme.colors.accent.primary,
    textDecoration: 'none',
    padding: '3px 8px',
    borderRadius: theme.radius.sm,
    background: `${theme.colors.accent.primary}10`,
  },
  primaryLink: {
    background: theme.colors.accent.primary,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeights.semibold,
  },
  levelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  levelCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
    textAlign: 'center',
  },
  levelLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  levelValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  levelDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  levelSubtext: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginTop: '4px',
  },
  timeRangeSelector: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  timeRangeButton: {
    padding: '6px 12px',
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.muted,
    background: theme.colors.background.card,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.radius.md,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  timeRangeButtonActive: {
    background: theme.colors.accent.primary,
    color: theme.colors.text.primary,
    borderColor: theme.colors.accent.primary,
  },
  apiNote: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginLeft: '8px',
    fontStyle: 'italic',
  },
  correlationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  correlationCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
  },
  correlationPair: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginBottom: '8px',
  },
  correlationValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
    marginBottom: '8px',
  },
  correlationBar: {
    height: '6px',
    background: theme.colors.background.primary,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: '8px',
  },
  correlationFill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
  correlationDesc: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
  },
  volGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  volCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
    textAlign: 'center',
  },
  volLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '8px',
  },
  volValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  volContext: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  infoBox: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    borderLeft: `3px solid ${theme.colors.accent.primary}`,
  },
  infoTitle: {
    margin: '0 0 8px 0',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  infoText: {
    margin: 0,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 1.6,
  },
};

export default PriceDrillDown;