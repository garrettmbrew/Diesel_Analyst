/**
 * Number Formatters
 */

// Format price with appropriate decimals
export const formatPrice = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return value.toFixed(decimals);
};

// Format price with currency
export const formatCurrency = (value, currency = '$', decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${currency}${value.toFixed(decimals)}`;
};

// Format with unit
export const formatWithUnit = (value, unit, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  return `${value.toFixed(decimals)} ${unit}`;
};

// Format large numbers with abbreviation (K, M, B)
export const formatLargeNumber = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-';
  
  if (Math.abs(value) >= 1e9) {
    return `${(value / 1e9).toFixed(decimals)}B`;
  }
  if (Math.abs(value) >= 1e6) {
    return `${(value / 1e6).toFixed(decimals)}M`;
  }
  if (Math.abs(value) >= 1e3) {
    return `${(value / 1e3).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
};

// Format percentage
export const formatPercent = (value, decimals = 2, includeSign = true) => {
  if (value === null || value === undefined) return '-';
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

// Format change with arrow
export const formatChange = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-';
  const arrow = value >= 0 ? '▲' : '▼';
  const sign = value >= 0 ? '+' : '';
  return `${arrow} ${sign}${value.toFixed(decimals)}`;
};

// Format with thousands separator
export const formatWithCommas = (value) => {
  if (value === null || value === undefined) return '-';
  return value.toLocaleString();
};

/**
 * Date Formatters
 */

// Format date as YYYY-MM-DD
export const formatDateISO = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Format date as readable string
export const formatDateReadable = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time
export const formatTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Format datetime
export const formatDateTime = (date) => {
  if (!date) return '-';
  return `${formatDateReadable(date)} ${formatTime(date)}`;
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '-';
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateReadable(date);
};

/**
 * Specialized Energy Formatters
 */

// Format gasoil price ($/mt)
export const formatGasoil = (value) => {
  if (value === null || value === undefined) return '-';
  return `$${value.toFixed(2)}/mt`;
};

// Format ULSD price ($/gal)
export const formatUlsd = (value) => {
  if (value === null || value === undefined) return '-';
  return `$${value.toFixed(4)}/gal`;
};

// Format crude price ($/bbl)
export const formatCrude = (value) => {
  if (value === null || value === undefined) return '-';
  return `$${value.toFixed(2)}/bbl`;
};

// Format crack spread ($/bbl)
export const formatCrack = (value) => {
  if (value === null || value === undefined) return '-';
  const sign = value >= 0 ? '' : '-';
  return `${sign}$${Math.abs(value).toFixed(2)}/bbl`;
};

// Format stocks (million barrels)
export const formatStocks = (value) => {
  if (value === null || value === undefined) return '-';
  // Assume input is in thousands of barrels
  const millionBbl = value / 1000;
  return `${millionBbl.toFixed(1)} MMbbl`;
};

// Format freight ($/mt)
export const formatFreight = (value) => {
  if (value === null || value === undefined) return '-';
  return `$${value.toFixed(2)}/mt`;
};

/**
 * Status/Signal Formatters
 */

// Get color class based on value direction
export const getDirectionColor = (value) => {
  if (value === null || value === undefined) return 'neutral';
  if (value > 0) return 'bullish';
  if (value < 0) return 'bearish';
  return 'neutral';
};

// Get color for inventory levels
export const getInventoryColor = (current, average, lowThreshold, highThreshold) => {
  if (current < lowThreshold) return 'bearish'; // Low stocks = bullish for price, but "tight" warning
  if (current > highThreshold) return 'bullish'; // High stocks = bearish for price
  return 'neutral';
};

// Format market status
export const formatMarketStatus = (isOpen) => {
  return isOpen ? 'MARKETS OPEN' : 'MARKETS CLOSED';
};

/**
 * Table Formatters
 */

// Pad string to fixed length
export const padString = (str, length, char = ' ', position = 'end') => {
  const s = String(str);
  if (s.length >= length) return s;
  const padding = char.repeat(length - s.length);
  return position === 'start' ? padding + s : s + padding;
};

// Format as table cell with alignment
export const formatTableCell = (value, width, align = 'right') => {
  const str = String(value);
  if (align === 'right') {
    return str.padStart(width);
  } else if (align === 'center') {
    const pad = Math.floor((width - str.length) / 2);
    return str.padStart(str.length + pad).padEnd(width);
  }
  return str.padEnd(width);
};

export default {
  // Numbers
  formatPrice,
  formatCurrency,
  formatWithUnit,
  formatLargeNumber,
  formatPercent,
  formatChange,
  formatWithCommas,
  
  // Dates
  formatDateISO,
  formatDateReadable,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  
  // Energy-specific
  formatGasoil,
  formatUlsd,
  formatCrude,
  formatCrack,
  formatStocks,
  formatFreight,
  
  // Status
  getDirectionColor,
  getInventoryColor,
  formatMarketStatus,
  
  // Tables
  padString,
  formatTableCell,
};
