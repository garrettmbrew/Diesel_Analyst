// API Endpoints
export const API_ENDPOINTS = {
  EIA: {
    BASE: 'https://api.eia.gov/v2',
    PETROLEUM: '/petroleum',
    WEEKLY_STOCKS: '/petroleum/sum/sndw/data',
    SPOT_PRICES: '/petroleum/pri/spt/data',
  },
  FRED: {
    BASE: 'https://api.stlouisfed.org/fred',
    SERIES: '/series/observations',
  },
};

// FRED Series IDs for relevant data
export const FRED_SERIES = {
  DIESEL_GULF: 'DDFUELUSGULF',
  DIESEL_NYH: 'DDFUELNYH',
  BRENT: 'DCOILBRENTEU',
  WTI: 'DCOILWTICO',
};

// EIA Product Codes
export const EIA_PRODUCTS = {
  DISTILLATE: 'EPD0',     // Distillate fuel oil (total)
  CRUDE: 'EPC0',          // Crude oil
  GASOLINE: 'EPM0',       // Motor gasoline
};

// EIA Process Codes
export const EIA_PROCESS = {
  ENDING_STOCKS: 'SAE',   // Ending Stocks
  PRODUCTION: 'YPR',      // Production
};

// EIA Area Codes
export const EIA_AREAS = {
  US_TOTAL: 'NUS',
  PADD1: 'R10',           // East Coast
  PADD1A: 'R1X',          // New England
  PADD1B: 'R1Y',          // Central Atlantic
  PADD1C: 'R1Z',          // Lower Atlantic
  PADD2: 'R20',           // Midwest
  PADD3: 'R30',           // Gulf Coast
  PADD4: 'R40',           // Rocky Mountain
  PADD5: 'R50',           // West Coast
};

// Unit Conversions
export const CONVERSIONS = {
  BBL_PER_MT_GASOIL: 7.45,      // Barrels per metric ton (gasoil)
  BBL_PER_MT_CRUDE: 7.33,       // Barrels per metric ton (crude)
  GAL_PER_BBL: 42,              // Gallons per barrel
  MT_PER_BBL_GASOIL: 0.1342,    // Metric tons per barrel
};

// Threshold Levels for Analysis
export const THRESHOLDS = {
  // Crack Spreads ($/bbl)
  CRACK: {
    VERY_STRONG: 25,
    STRONG: 20,
    HEALTHY: 15,
    MODERATE: 10,
    WEAK: 5,
  },
  
  // US Distillate Stocks (million barrels)
  US_DISTILLATE_STOCKS: {
    VERY_TIGHT: 105,
    TIGHT: 115,
    BELOW_AVG: 125,
    AVERAGE: 135,
    ABOVE_AVG: 145,
    OVERSUPPLIED: 160,
  },
  
  // PADD 1 Stocks (million barrels) - critical for East Coast
  PADD1_STOCKS: {
    CRITICAL: 20,
    TIGHT: 25,
    NORMAL: 35,
    COMFORTABLE: 45,
  },
  
  // ARA Stocks (million metric tons)
  ARA_STOCKS: {
    TIGHT: 1.8,
    NORMAL_LOW: 2.0,
    NORMAL_HIGH: 2.3,
    OVERSUPPLIED: 2.5,
  },
  
  // Days of Supply
  DAYS_SUPPLY: {
    CRITICAL: 25,
    TIGHT: 28,
    NORMAL: 32,
    COMFORTABLE: 38,
  },
  
  // Timespreads ($/bbl for gasoil, $/mt context)
  TIMESPREAD: {
    STRONG_BACKWARDATION: 3,
    MODERATE_BACKWARDATION: 1,
    FLAT: 0.5,
    MODERATE_CONTANGO: -1,
    STRONG_CONTANGO: -3,
  },
  
  // Refinery Utilization (%)
  UTILIZATION: {
    MAX_SUSTAINABLE: 95,
    HIGH: 92,
    NORMAL: 88,
    LOW: 82,
    VERY_LOW: 75,
  },
};

// Signal Interpretations
export const SIGNALS = {
  CRACK: {
    VERY_STRONG: { label: 'Very Strong', color: 'bullish', meaning: 'Exceptional margins, max runs' },
    STRONG: { label: 'Strong', color: 'bullish', meaning: 'Healthy profitability' },
    HEALTHY: { label: 'Healthy', color: 'neutral', meaning: 'Normal operations' },
    MODERATE: { label: 'Moderate', color: 'warning', meaning: 'Marginal economics' },
    WEAK: { label: 'Weak', color: 'bearish', meaning: 'Run cuts likely' },
  },
  
  STRUCTURE: {
    BACKWARDATION: { label: 'Backwardation', color: 'warning', meaning: 'Tight market, current demand' },
    FLAT: { label: 'Flat', color: 'neutral', meaning: 'Balanced market' },
    CONTANGO: { label: 'Contango', color: 'bearish', meaning: 'Oversupplied, storage play' },
  },
  
  ARB: {
    OPEN: { label: 'Open', color: 'bullish', meaning: 'Profitable to ship' },
    MARGINAL: { label: 'Marginal', color: 'warning', meaning: 'Breakeven economics' },
    CLOSED: { label: 'Closed', color: 'bearish', meaning: 'Uneconomic' },
  },
};

// News Impact Categories
export const NEWS_IMPACT = {
  BULLISH: 'bullish',
  BEARISH: 'bearish',
  NEUTRAL: 'neutral',
};

// Regions for arbitrage and flows
export const REGIONS = {
  USGC: { name: 'US Gulf Coast', code: 'USGC' },
  USEC: { name: 'US East Coast', code: 'USEC' },
  NWE: { name: 'NW Europe (ARA)', code: 'NWE' },
  MED: { name: 'Mediterranean', code: 'MED' },
  SING: { name: 'Singapore', code: 'SING' },
  ME: { name: 'Middle East', code: 'ME' },
};

// Standard Arbitrage Routes
export const ARB_ROUTES = [
  {
    id: 'usgc-nwe',
    origin: REGIONS.USGC,
    destination: REGIONS.NWE,
    typicalFreight: { low: 15, high: 22, unit: '$/mt' },
    transitDays: { low: 12, high: 14 },
    notes: 'Primary US export route to Europe',
  },
  {
    id: 'usgc-latam',
    origin: REGIONS.USGC,
    destination: { name: 'Latin America', code: 'LATAM' },
    typicalFreight: { low: 8, high: 15, unit: '$/mt' },
    transitDays: { low: 5, high: 10 },
    notes: 'Short-haul, usually open',
  },
  {
    id: 'asia-nwe',
    origin: REGIONS.SING,
    destination: REGIONS.NWE,
    typicalFreight: { low: 30, high: 40, unit: '$/mt' },
    transitDays: { low: 28, high: 35 },
    notes: 'Long-haul, rarely economic',
  },
  {
    id: 'me-nwe',
    origin: REGIONS.ME,
    destination: REGIONS.NWE,
    typicalFreight: { low: 20, high: 28, unit: '$/mt' },
    transitDays: { low: 18, high: 22 },
    notes: 'Key swing route post-sanctions',
  },
];

// Refiner Stocks for correlation analysis
export const REFINER_STOCKS = [
  { ticker: 'VLO', name: 'Valero Energy', description: 'Largest independent US refiner' },
  { ticker: 'MPC', name: 'Marathon Petroleum', description: 'Largest US refiner by capacity' },
  { ticker: 'PSX', name: 'Phillips 66', description: 'Diversified: refining + midstream + chemicals' },
  { ticker: 'PBF', name: 'PBF Energy', description: 'East Coast focused' },
  { ticker: 'DINO', name: 'HF Sinclair', description: 'Mid-continent + renewables' },
];

// Seasonal Patterns
export const SEASONALITY = {
  Q1: { demand: 'Peak heating', supply: 'Turnaround season starts', typical: 'Strong cracks' },
  Q2: { demand: 'Planting season', supply: 'Turnarounds end', typical: 'Transitional' },
  Q3: { demand: 'Weakest quarter', supply: 'Max runs, building stocks', typical: 'Soft cracks' },
  Q4: { demand: 'Harvest + heating returns', supply: 'Pre-winter stocking', typical: 'Strongest quarter' },
};

// Drill-down panel definitions
export const DRILL_DOWNS = {
  PRICE: {
    id: 'price',
    title: 'Price Analysis',
    description: 'Historical prices, correlations, and volatility metrics',
  },
  CRACK: {
    id: 'crack',
    title: 'Crack Spread Analysis',
    description: 'Refining margins, historical patterns, and equity correlations',
  },
  INVENTORY: {
    id: 'inventory',
    title: 'Inventory Analysis',
    description: 'US and European stocks, days of supply, regional breakdown',
  },
  TIMESPREAD: {
    id: 'timespread',
    title: 'Timespread Analysis',
    description: 'Forward curve structure, storage economics, regime history',
  },
  ARB: {
    id: 'arb',
    title: 'Arbitrage Analysis',
    description: 'Regional price differentials, freight economics, trade flows',
  },
  DEMAND: {
    id: 'demand',
    title: 'Demand Indicators',
    description: 'Trucking indices, weather data, industrial signals',
  },
};

export default {
  API_ENDPOINTS,
  FRED_SERIES,
  EIA_PRODUCTS,
  EIA_AREAS,
  CONVERSIONS,
  THRESHOLDS,
  SIGNALS,
  NEWS_IMPACT,
  REGIONS,
  ARB_ROUTES,
  REFINER_STOCKS,
  SEASONALITY,
  DRILL_DOWNS,
};
