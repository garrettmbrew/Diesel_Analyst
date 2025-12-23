import React from 'react';
import { theme } from '../../styles/theme';
import { formatRelativeTime } from '../../utils/formatters';
import { SourceIndicator } from '../Common/SourceBadge';

/**
 * News feed component with impact tagging
 */
export const NewsFeed = ({ 
  news = [], 
  maxItems = 6,
  isLive = false,
  source = 'Sample',
}) => {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'bullish':
        return theme.colors.semantic.bullish;
      case 'bearish':
        return theme.colors.semantic.bearish;
      default:
        return theme.colors.semantic.neutral;
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>NEWS FEED</span>
        <SourceIndicator isLive={isLive} source={source} />
      </div>
      {news.slice(0, maxItems).map((item) => (
        <div key={item.id} style={styles.item}>
          <div style={styles.time}>{item.time}</div>
          
          <div style={styles.content}>
            <span style={styles.region}>{item.region}</span>
            <span style={styles.headline}>{item.headline}</span>
          </div>
          
          <div style={{
            ...styles.impact,
            color: getImpactColor(item.impact),
          }}>
            {item.impact.toUpperCase()}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    background: theme.colors.background.card,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 20px',
    borderBottom: `1px solid ${theme.colors.border.default}`,
    background: theme.colors.background.secondary,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.muted,
    letterSpacing: '2px',
  },
  item: {
    display: 'grid',
    gridTemplateColumns: '60px 1fr 80px',
    gap: '16px',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: `1px solid ${theme.colors.border.default}`,
    transition: `background ${theme.transitions.fast}`,
    cursor: 'pointer',
    ':hover': {
      background: theme.colors.background.cardHover,
    },
    ':last-child': {
      borderBottom: 'none',
    },
  },
  time: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.disabled,
    fontFamily: theme.fonts.mono,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    minWidth: 0,
  },
  region: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.accent.tertiary,
    background: `${theme.colors.accent.tertiary}20`,
    padding: '4px 8px',
    borderRadius: theme.radius.sm,
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  headline: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  impact: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '1px',
    textAlign: 'right',
  },
};

export default NewsFeed;
