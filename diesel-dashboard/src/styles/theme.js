// Design tokens for the diesel dashboard
// Industrial/terminal aesthetic with warm accent colors

export const theme = {
  colors: {
    // Base
    background: {
      primary: '#0f172a',
      secondary: '#1e293b',
      tertiary: '#334155',
      card: 'rgba(30, 41, 59, 0.6)',
      cardHover: 'rgba(30, 41, 59, 0.8)',
    },
    
    // Text
    text: {
      primary: '#f8fafc',
      secondary: '#e2e8f0',
      muted: '#94a3b8',
      disabled: '#64748b',
    },
    
    // Accents
    accent: {
      primary: '#f59e0b',    // Amber - main accent
      secondary: '#ef4444',   // Red - alerts/bearish
      tertiary: '#3b82f6',    // Blue - info
    },
    
    // Semantic
    semantic: {
      bullish: '#22c55e',
      bearish: '#ef4444',
      neutral: '#94a3b8',
      warning: '#f59e0b',
    },
    
    // Borders
    border: {
      default: 'rgba(148, 163, 184, 0.1)',
      hover: 'rgba(148, 163, 184, 0.2)',
      active: 'rgba(245, 158, 11, 0.5)',
    },
  },
  
  // Typography
  fonts: {
    mono: "'JetBrains Mono', 'Fira Code', 'SF Mono', monospace",
    sans: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  
  fontSizes: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
  },
  
  fontWeights: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  
  // Border radius
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.2)',
    md: '0 4px 6px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
    glow: '0 0 20px rgba(245, 158, 11, 0.3)',
  },
  
  // Transitions
  transitions: {
    fast: '0.1s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
  },
  
  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
};

// Utility function to get nested theme values
export const getThemeValue = (path) => {
  return path.split('.').reduce((obj, key) => obj?.[key], theme);
};

// CSS-in-JS helper
export const createStyles = (stylesFn) => {
  return stylesFn(theme);
};

export default theme;
