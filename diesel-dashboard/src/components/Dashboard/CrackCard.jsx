import React from 'react';
import { theme } from '../../styles/theme';
import { formatPrice } from '../../utils/formatters';
import { getCrackSignal } from '../../utils/calculations';
import { THRESHOLDS } from '../../utils/constants';
import { SourceIndicator } from '../Common/SourceBadge';

/**
 * Crack spread display card with signal indicator
 */
export const CrackCard = ({
  title,
  value,
  change,
  onClick,
  isLive = false,
  source = 'Calculated',
  dataUrl = null,
  dataDate = null,
}) => {
  const signal = getCrackSignal(value);
  const isPositive = change >= 0;
  
  // Calculate fill percentage for visual bar
  const maxCrack = THRESHOLDS.CRACK.VERY_STRONG + 10;
  const fillPercent = Math.min((value / maxCrack) * 100, 100);
  
  // Determine bar color based on crack level
  const getBarColor = () => {
    if (value >= THRESHOLDS.CRACK.STRONG) return theme.colors.semantic.bullish;
    if (value >= THRESHOLDS.CRACK.MODERATE) return theme.colors.semantic.warning;
    return theme.colors.semantic.bearish;
  };

  return (
    <div 
      style={styles.card}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={styles.header}>
        <div style={styles.labelRow}>
          <div style={styles.label}>{title}</div>
          <SourceIndicator isLive={isLive} source={source} dataUrl={dataUrl} />
        </div>
        {signal && (
          <div style={{
            ...styles.signal,
            color: theme.colors.semantic[signal.color],
            background: `${theme.colors.semantic[signal.color]}20`,
          }}>
            {signal.label}
          </div>
        )}
      </div>
      
      <div style={styles.valueRow}>
        <span style={styles.value}>${formatPrice(value, 2)}</span>
        <span style={styles.unit}>/bbl</span>
      </div>
      
      {/* Visual bar */}
      <div style={styles.barContainer}>
        <div style={styles.barTrack}>
          <div 
            style={{
              ...styles.barFill,
              width: `${fillPercent}%`,
              background: getBarColor(),
            }}
          />
        </div>
      </div>
      
      <div style={styles.footer}>
        <div style={{
          ...styles.change,
          color: isPositive ? theme.colors.semantic.bullish : theme.colors.semantic.bearish,
        }}>
          {isPositive ? '+' : ''}{formatPrice(change, 2)} vs yesterday
        </div>
        {isLive && dataDate && (
          <div style={styles.dataDate}>as of {dataDate}</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: `linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)`,
    border: `1px solid rgba(245, 158, 11, 0.2)`,
    borderRadius: theme.radius.md,
    padding: '20px',
    cursor: 'pointer',
    transition: `all ${theme.transitions.normal}`,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  labelRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  label: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.accent.primary,
    letterSpacing: '1px',
    fontFamily: theme.fonts.mono,
  },
  signal: {
    fontSize: '10px',
    fontWeight: theme.fontWeights.semibold,
    padding: '2px 8px',
    borderRadius: theme.radius.full,
    letterSpacing: '0.5px',
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginBottom: '12px',
  },
  value: {
    fontSize: '32px',
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  unit: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.text.muted,
  },
  barContainer: {
    marginBottom: '12px',
  },
  barTrack: {
    height: '6px',
    background: theme.colors.background.primary,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: theme.radius.full,
    transition: `width ${theme.transitions.slow}`,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  change: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fonts.mono,
  },
  dataDate: {
    fontSize: '10px',
    color: theme.colors.text.muted,
    fontFamily: theme.fonts.mono,
  },
};

export default CrackCard;
