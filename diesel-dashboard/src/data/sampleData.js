// Sample market data for development and fallback
// Based on realistic market levels as of late 2024/early 2025

export const samplePrices = {
  brent: { price: 74.82, change: -0.45, changePercent: -0.60, high: 75.40, low: 74.10 },
  wti: { price: 71.23, change: -0.38, changePercent: -0.53, high: 71.85, low: 70.65 },
  iceGasoil: { price: 698.50, change: 3.25, changePercent: 0.47, high: 702.00, low: 692.25 },
  nymexUlsd: { price: 2.2845, change: 0.0124, changePercent: 0.55, high: 2.2920, low: 2.2680 },
  rbob: { price: 2.0125, change: -0.0085, changePercent: -0.42, high: 2.0280, low: 2.0050 },
};

export const sampleCracks = {
  gasoilBrent: { value: 18.42, change: 0.85, percentile: 62 },
  ulsdWti: { value: 24.56, change: 0.92, percentile: 58 },
  crack321: { value: 18.85, change: 0.45, percentile: 55 },
};

export const sampleTimespreads = {
  gasoilM1M2: { value: 2.75, structure: 'backwardation' },
  gasoilM1M3: { value: 5.25, structure: 'backwardation' },
  ulsdM1M2: { value: 0.0285, structure: 'backwardation' },
};

export const sampleInventories = {
  usDistillate: {
    current: 118500, // thousand barrels
    previous: 120200,
    change: -1700,
    fiveYearAvg: 125000,
    fiveYearLow: 104000,
    fiveYearHigh: 148000,
  },
  padd1: {
    current: 24800,
    previous: 25100,
    change: -300,
  },
  padd3: {
    current: 42500,
    previous: 43200,
    change: -700,
  },
  araStocks: {
    current: 1.92, // million metric tons
    previous: 1.98,
    change: -0.06,
  },
};

export const sampleArbs = {
  usgcNwe: { value: -2.50, status: 'closed', freight: 18.50, transit: 13 },
  usgcLatam: { value: 4.25, status: 'open', freight: 10.00, transit: 7 },
  asiaEurope: { value: -8.50, status: 'closed', freight: 35.00, transit: 30 },
  meEurope: { value: 1.20, status: 'marginal', freight: 24.00, transit: 20 },
};

export const sampleNews = [
  {
    id: 1,
    time: '06:42',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    headline: 'Phillips 66 Bayway refinery reports unit restart after maintenance',
    impact: 'bearish',
    region: 'USEC',
    source: 'Reuters',
  },
  {
    id: 2,
    time: '05:18',
    timestamp: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    headline: 'Rhine river levels falling, barge freight rates rising',
    impact: 'bullish',
    region: 'NWE',
    source: 'Platts',
  },
  {
    id: 3,
    time: '04:55',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    headline: 'China diesel exports remain subdued amid weak margins',
    impact: 'bullish',
    region: 'ASIA',
    source: 'Argus',
  },
  {
    id: 4,
    time: '03:30',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    headline: 'Russian gasoil flows to Turkey steady despite sanctions',
    impact: 'neutral',
    region: 'MED',
    source: 'Kpler',
  },
  {
    id: 5,
    time: '02:15',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    headline: 'US trucking index shows 3% YoY decline in freight volumes',
    impact: 'bearish',
    region: 'US',
    source: 'ATA',
  },
  {
    id: 6,
    time: '01:45',
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
    headline: 'Cold snap forecast for Northeast US next week, HDDs rising',
    impact: 'bullish',
    region: 'USEC',
    source: 'NOAA',
  },
];

// Historical price data for charts (monthly averages, last 24 months)
export const sampleHistoricalPrices = [
  { date: '2023-01', brent: 83.5, gasoil: 920, ulsd: 3.45, crack: 28.5 },
  { date: '2023-02', brent: 82.8, gasoil: 890, ulsd: 3.35, crack: 26.8 },
  { date: '2023-03', brent: 78.5, gasoil: 820, ulsd: 3.10, crack: 24.2 },
  { date: '2023-04', brent: 81.2, gasoil: 785, ulsd: 2.95, crack: 21.5 },
  { date: '2023-05', brent: 75.8, gasoil: 720, ulsd: 2.70, crack: 18.8 },
  { date: '2023-06', brent: 74.5, gasoil: 695, ulsd: 2.60, crack: 17.2 },
  { date: '2023-07', brent: 79.2, gasoil: 750, ulsd: 2.80, crack: 19.5 },
  { date: '2023-08', brent: 85.5, gasoil: 860, ulsd: 3.20, crack: 24.8 },
  { date: '2023-09', brent: 92.5, gasoil: 980, ulsd: 3.65, crack: 29.2 },
  { date: '2023-10', brent: 88.2, gasoil: 920, ulsd: 3.45, crack: 26.5 },
  { date: '2023-11', brent: 82.5, gasoil: 840, ulsd: 3.15, crack: 22.8 },
  { date: '2023-12', brent: 78.8, gasoil: 790, ulsd: 2.95, crack: 20.5 },
  { date: '2024-01', brent: 79.5, gasoil: 810, ulsd: 3.05, crack: 21.8 },
  { date: '2024-02', brent: 81.2, gasoil: 835, ulsd: 3.15, crack: 23.2 },
  { date: '2024-03', brent: 85.5, gasoil: 870, ulsd: 3.28, crack: 24.5 },
  { date: '2024-04', brent: 88.2, gasoil: 890, ulsd: 3.35, crack: 25.8 },
  { date: '2024-05', brent: 82.5, gasoil: 820, ulsd: 3.10, crack: 22.5 },
  { date: '2024-06', brent: 78.8, gasoil: 760, ulsd: 2.85, crack: 19.8 },
  { date: '2024-07', brent: 80.5, gasoil: 780, ulsd: 2.92, crack: 20.5 },
  { date: '2024-08', brent: 79.2, gasoil: 755, ulsd: 2.82, crack: 19.2 },
  { date: '2024-09', brent: 73.5, gasoil: 700, ulsd: 2.62, crack: 17.5 },
  { date: '2024-10', brent: 74.8, gasoil: 710, ulsd: 2.68, crack: 18.2 },
  { date: '2024-11', brent: 73.2, gasoil: 695, ulsd: 2.60, crack: 17.8 },
  { date: '2024-12', brent: 74.8, gasoil: 698, ulsd: 2.28, crack: 18.4 },
];

// EIA weekly inventory data (last 10 weeks)
export const sampleEIAData = [
  { week: '2024-12-13', distillate: 118500, change: -1700, utilization: 91.2 },
  { week: '2024-12-06', distillate: 120200, change: -800, utilization: 91.5 },
  { week: '2024-11-29', distillate: 121000, change: 1200, utilization: 90.8 },
  { week: '2024-11-22', distillate: 119800, change: -2100, utilization: 91.2 },
  { week: '2024-11-15', distillate: 121900, change: -1500, utilization: 90.5 },
  { week: '2024-11-08', distillate: 123400, change: 2800, utilization: 89.8 },
  { week: '2024-11-01', distillate: 120600, change: -900, utilization: 90.2 },
  { week: '2024-10-25', distillate: 121500, change: -1200, utilization: 89.5 },
  { week: '2024-10-18', distillate: 122700, change: 500, utilization: 88.2 },
  { week: '2024-10-11', distillate: 122200, change: -2400, utilization: 87.8 },
];

// Forward curve data (monthly contracts)
export const sampleForwardCurve = [
  { month: 'Jan-25', gasoil: 698.50, ulsd: 2.2845 },
  { month: 'Feb-25', gasoil: 695.75, ulsd: 2.2760 },
  { month: 'Mar-25', gasoil: 690.25, ulsd: 2.2620 },
  { month: 'Apr-25', gasoil: 682.50, ulsd: 2.2450 },
  { month: 'May-25', gasoil: 675.00, ulsd: 2.2280 },
  { month: 'Jun-25', gasoil: 670.25, ulsd: 2.2150 },
  { month: 'Jul-25', gasoil: 672.50, ulsd: 2.2200 },
  { month: 'Aug-25', gasoil: 678.75, ulsd: 2.2350 },
  { month: 'Sep-25', gasoil: 685.00, ulsd: 2.2500 },
  { month: 'Oct-25', gasoil: 690.25, ulsd: 2.2620 },
  { month: 'Nov-25', gasoil: 695.50, ulsd: 2.2750 },
  { month: 'Dec-25', gasoil: 698.00, ulsd: 2.2820 },
];

// Refiner stock performance (indexed to 100)
export const sampleRefinerStocks = [
  { date: '2024-01', VLO: 100, MPC: 100, PSX: 100 },
  { date: '2024-02', VLO: 105, MPC: 108, PSX: 102 },
  { date: '2024-03', VLO: 112, MPC: 115, PSX: 105 },
  { date: '2024-04', VLO: 118, MPC: 122, PSX: 108 },
  { date: '2024-05', VLO: 108, MPC: 112, PSX: 102 },
  { date: '2024-06', VLO: 98, MPC: 105, PSX: 95 },
  { date: '2024-07', VLO: 95, MPC: 102, PSX: 92 },
  { date: '2024-08', VLO: 92, MPC: 98, PSX: 88 },
  { date: '2024-09', VLO: 85, MPC: 92, PSX: 82 },
  { date: '2024-10', VLO: 90, MPC: 98, PSX: 88 },
  { date: '2024-11', VLO: 105, MPC: 112, PSX: 98 },
  { date: '2024-12', VLO: 118, MPC: 124, PSX: 103 },
];

// Seasonal patterns (average by month, indexed)
export const sampleSeasonality = {
  demand: [105, 102, 98, 95, 92, 88, 85, 88, 95, 102, 108, 112],
  cracks: [115, 108, 95, 88, 82, 78, 80, 92, 105, 112, 118, 120],
  stocks: [98, 100, 105, 108, 112, 118, 122, 118, 110, 102, 95, 92],
};

export default {
  samplePrices,
  sampleCracks,
  sampleTimespreads,
  sampleInventories,
  sampleArbs,
  sampleNews,
  sampleHistoricalPrices,
  sampleEIAData,
  sampleForwardCurve,
  sampleRefinerStocks,
  sampleSeasonality,
};
