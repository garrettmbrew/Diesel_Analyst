import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { theme } from '../../styles/theme';
import { formatPrice, formatPercent } from '../../utils/formatters';
import { SourceIndicator } from '../Common/SourceBadge';

/**
 * Price display card for benchmark prices
 */
export const PriceCard = ({
  title,
  price,
  change,
  changePercent,
  unit = '',
  decimals = 2,
  onClick,
  isLive = false,
  source = 'Sample',
  dataUrl = null,
  dataDate = null,
}) => {
  const isPositive = change >= 0;
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  const trendColor = isPositive 
    ? theme.colors.semantic.bullish 
    : theme.colors.semantic.bearish;

  return (
    <div 
      style={styles.card}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={styles.header}>
        <div style={styles.label}>{title}</div>
        <SourceIndicator isLive={isLive} source={source} dataUrl={dataUrl} />
      </div>
      
      <div style={styles.priceRow}>
        <span style={styles.price}>
          {formatPrice(price, decimals)}
        </span>
        <span style={styles.unit}>{unit}</span>
      </div>
      
      <div style={{ ...styles.change, color: trendColor }}>
        <TrendIcon size={14} style={styles.trendIcon} />
        <span>
          {isPositive ? '+' : ''}{formatPrice(change, decimals)}
        </span>
        <span style={styles.percent}>
          ({formatPercent(changePercent, 2, false)})
        </span>
      </div>

      {dataDate && (
        <div style={styles.dataDate}>
          Data as of: {dataDate}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    background: theme.colors.background.card,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.radius.md,
    padding: '20px',
    cursor: 'pointer',
    transition: `all ${theme.transitions.normal}`,
    ':hover': {
      borderColor: theme.colors.border.hover,
      background: theme.colors.background.cardHover,
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  label: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.muted,
    letterSpacing: '1px',
    fontFamily: theme.fonts.mono,
  },
  dataDate: {
    fontSize: '9px',
    color: theme.colors.text.disabled,
    marginTop: '8px',
    fontFamily: theme.fonts.mono,
  },
  priceRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '4px',
    marginBottom: '8px',
  },
  price: {
    fontSize: '28px',
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  unit: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.disabled,
  },
  change: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    fontFamily: theme.fonts.mono,
  },
  trendIcon: {
    marginRight: '2px',
  },
  percent: {
    opacity: 0.8,
  },
};

export default PriceCard;
