import { CONVERSIONS, THRESHOLDS, SIGNALS } from './constants';

/**
 * Crack Spread Calculations
 */

// Simple Gasoil/Brent crack ($/bbl)
export const calcGasoilCrack = (gasoilMt, brentBbl) => {
  if (!gasoilMt || !brentBbl) return null;
  const gasoilBbl = gasoilMt / CONVERSIONS.BBL_PER_MT_GASOIL;
  return gasoilBbl - brentBbl;
};

// ULSD/WTI crack ($/bbl)
export const calcUlsdCrack = (ulsdGal, wtiBbl) => {
  if (!ulsdGal || !wtiBbl) return null;
  const ulsdBbl = ulsdGal * CONVERSIONS.GAL_PER_BBL;
  return ulsdBbl - wtiBbl;
};

// 3-2-1 Crack Spread ($/bbl)
// Assumes 3 barrels crude yields 2 barrels gasoline + 1 barrel diesel
export const calc321Crack = (rbobGal, ulsdGal, wtiBbl) => {
  if (!rbobGal || !ulsdGal || !wtiBbl) return null;
  const rbobBbl = rbobGal * CONVERSIONS.GAL_PER_BBL;
  const ulsdBbl = ulsdGal * CONVERSIONS.GAL_PER_BBL;
  return ((2 * rbobBbl) + ulsdBbl - (3 * wtiBbl)) / 3;
};

// 2-1-1 Crack Spread ($/bbl)
// Alternative: 2 barrels crude = 1 gasoline + 1 diesel
export const calc211Crack = (rbobGal, ulsdGal, wtiBbl) => {
  if (!rbobGal || !ulsdGal || !wtiBbl) return null;
  const rbobBbl = rbobGal * CONVERSIONS.GAL_PER_BBL;
  const ulsdBbl = ulsdGal * CONVERSIONS.GAL_PER_BBL;
  return (rbobBbl + ulsdBbl - (2 * wtiBbl)) / 2;
};

/**
 * Unit Conversions
 */

// Convert $/mt to $/bbl for gasoil
export const mtToBbl = (priceMt) => {
  if (!priceMt) return null;
  return priceMt / CONVERSIONS.BBL_PER_MT_GASOIL;
};

// Convert $/bbl to $/mt for gasoil
export const bblToMt = (priceBbl) => {
  if (!priceBbl) return null;
  return priceBbl * CONVERSIONS.BBL_PER_MT_GASOIL;
};

// Convert $/gal to $/bbl
export const galToBbl = (priceGal) => {
  if (!priceGal) return null;
  return priceGal * CONVERSIONS.GAL_PER_BBL;
};

// Convert $/bbl to $/gal
export const bblToGal = (priceBbl) => {
  if (!priceBbl) return null;
  return priceBbl / CONVERSIONS.GAL_PER_BBL;
};

/**
 * Inventory Calculations
 */

// Days of supply calculation
export const calcDaysOfSupply = (stocksBbl, weeklyDemandBbl) => {
  if (!stocksBbl || !weeklyDemandBbl) return null;
  const dailyDemand = weeklyDemandBbl / 7;
  return stocksBbl / dailyDemand;
};

// Stock change (week-over-week)
export const calcStockChange = (currentStocks, previousStocks) => {
  if (!currentStocks || !previousStocks) return null;
  return currentStocks - previousStocks;
};

// Stocks vs 5-year average (percentage)
export const calcVsFiveYearAvg = (currentStocks, fiveYearAvg) => {
  if (!currentStocks || !fiveYearAvg) return null;
  return ((currentStocks - fiveYearAvg) / fiveYearAvg) * 100;
};

/**
 * Timespread Calculations
 */

// Simple timespread (M1 - M2)
export const calcTimespread = (m1Price, m2Price) => {
  if (!m1Price || !m2Price) return null;
  return m1Price - m2Price;
};

// Determine curve structure
export const getCurveStructure = (timespread) => {
  if (timespread === null) return null;
  if (timespread > THRESHOLDS.TIMESPREAD.MODERATE_BACKWARDATION) {
    return 'backwardation';
  } else if (timespread < THRESHOLDS.TIMESPREAD.MODERATE_CONTANGO) {
    return 'contango';
  }
  return 'flat';
};

// Annualized roll yield (for carry calculations)
export const calcAnnualizedRoll = (timespread, daysToExpiry) => {
  if (!timespread || !daysToExpiry) return null;
  return (timespread / daysToExpiry) * 365;
};

/**
 * Arbitrage Calculations
 */

// Basic arb economics
export const calcArbEconomics = (originFob, destPrice, freight, insurance = 0, portCosts = 0) => {
  if (!originFob || !destPrice || !freight) return null;
  const deliveredCost = originFob + freight + insurance + portCosts;
  return destPrice - deliveredCost;
};

// Determine arb status
export const getArbStatus = (arbValue, threshold = 2) => {
  if (arbValue === null) return null;
  if (arbValue > threshold) return 'open';
  if (arbValue > -threshold) return 'marginal';
  return 'closed';
};

/**
 * Signal Generation
 */

// Get crack signal based on level
export const getCrackSignal = (crackValue) => {
  if (crackValue === null) return null;
  if (crackValue >= THRESHOLDS.CRACK.VERY_STRONG) return SIGNALS.CRACK.VERY_STRONG;
  if (crackValue >= THRESHOLDS.CRACK.STRONG) return SIGNALS.CRACK.STRONG;
  if (crackValue >= THRESHOLDS.CRACK.HEALTHY) return SIGNALS.CRACK.HEALTHY;
  if (crackValue >= THRESHOLDS.CRACK.MODERATE) return SIGNALS.CRACK.MODERATE;
  return SIGNALS.CRACK.WEAK;
};

// Get structure signal
export const getStructureSignal = (timespread) => {
  const structure = getCurveStructure(timespread);
  if (!structure) return null;
  if (structure === 'backwardation') return SIGNALS.STRUCTURE.BACKWARDATION;
  if (structure === 'contango') return SIGNALS.STRUCTURE.CONTANGO;
  return SIGNALS.STRUCTURE.FLAT;
};

// Get arb signal
export const getArbSignal = (arbValue) => {
  const status = getArbStatus(arbValue);
  if (!status) return null;
  if (status === 'open') return SIGNALS.ARB.OPEN;
  if (status === 'marginal') return SIGNALS.ARB.MARGINAL;
  return SIGNALS.ARB.CLOSED;
};

/**
 * Statistical Helpers
 */

// Calculate percentage change
export const calcPercentChange = (current, previous) => {
  if (!current || !previous) return null;
  return ((current - previous) / previous) * 100;
};

// Calculate simple moving average
export const calcSMA = (data, period) => {
  if (!data || data.length < period) return null;
  const slice = data.slice(-period);
  return slice.reduce((sum, val) => sum + val, 0) / period;
};

// Calculate standard deviation
export const calcStdDev = (data) => {
  if (!data || data.length < 2) return null;
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  const squaredDiffs = data.map(val => Math.pow(val - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / data.length;
  return Math.sqrt(avgSquaredDiff);
};

// Calculate correlation coefficient
export const calcCorrelation = (dataX, dataY) => {
  if (!dataX || !dataY || dataX.length !== dataY.length || dataX.length < 2) return null;
  
  const n = dataX.length;
  const sumX = dataX.reduce((a, b) => a + b, 0);
  const sumY = dataY.reduce((a, b) => a + b, 0);
  const sumXY = dataX.reduce((total, x, i) => total + x * dataY[i], 0);
  const sumX2 = dataX.reduce((total, x) => total + x * x, 0);
  const sumY2 = dataY.reduce((total, y) => total + y * y, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  if (denominator === 0) return null;
  return numerator / denominator;
};

/**
 * Seasonality Helpers
 */

// Get current quarter
export const getCurrentQuarter = () => {
  const month = new Date().getMonth();
  if (month < 3) return 'Q1';
  if (month < 6) return 'Q2';
  if (month < 9) return 'Q3';
  return 'Q4';
};

// Get seasonal context
export const getSeasonalContext = (quarter) => {
  const contexts = {
    Q1: { demandBias: 'strong', typical: 'Peak heating demand, turnarounds begin' },
    Q2: { demandBias: 'moderate', typical: 'Planting season, transitional' },
    Q3: { demandBias: 'weak', typical: 'Weakest demand, inventory builds' },
    Q4: { demandBias: 'strong', typical: 'Harvest + heating, strongest quarter' },
  };
  return contexts[quarter] || null;
};

export default {
  // Crack spreads
  calcGasoilCrack,
  calcUlsdCrack,
  calc321Crack,
  calc211Crack,
  
  // Conversions
  mtToBbl,
  bblToMt,
  galToBbl,
  bblToGal,
  
  // Inventory
  calcDaysOfSupply,
  calcStockChange,
  calcVsFiveYearAvg,
  
  // Timespreads
  calcTimespread,
  getCurveStructure,
  calcAnnualizedRoll,
  
  // Arbitrage
  calcArbEconomics,
  getArbStatus,
  
  // Signals
  getCrackSignal,
  getStructureSignal,
  getArbSignal,
  
  // Statistics
  calcPercentChange,
  calcSMA,
  calcStdDev,
  calcCorrelation,
  
  // Seasonality
  getCurrentQuarter,
  getSeasonalContext,
};
