import React from 'react';
import { theme } from '../../styles/theme';
import { formatPrice } from '../../utils/formatters';

/**
 * Timespread display card showing curve structure
 */
export const TimespreadCard = ({
  title,
  value,
  structure, // 'backwardation', 'contango', 'flat'
  onClick,
}) => {
  const getStructureColor = () => {
    switch (structure) {
      case 'backwardation':
        return theme.colors.semantic.warning;
      case 'contango':
        return theme.colors.accent.tertiary;
      default:
        return theme.colors.text.muted;
    }
  };

  const getStructureLabel = () => {
    switch (structure) {
      case 'backwardation':
        return 'BACKWARDATION';
      case 'contango':
        return 'CONTANGO';
      default:
        return 'FLAT';
    }
  };

  const getStructureDescription = () => {
    switch (structure) {
      case 'backwardation':
        return 'Front > Back — Tight market';
      case 'contango':
        return 'Front < Back — Oversupplied';
      default:
        return 'Balanced market';
    }
  };

  return (
    <div 
      style={styles.card}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div style={styles.label}>{title}</div>
      
      <div style={styles.valueRow}>
        <span style={styles.sign}>{value >= 0 ? '+' : ''}</span>
        <span style={styles.value}>${formatPrice(Math.abs(value), 2)}</span>
      </div>
      
      <div style={{
        ...styles.structure,
        color: getStructureColor(),
      }}>
        {getStructureLabel()}
      </div>
      
      <div style={styles.description}>
        {getStructureDescription()}
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: theme.colors.background.card,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.radius.md,
    padding: '20px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: `all ${theme.transitions.normal}`,
  },
  label: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.muted,
    letterSpacing: '1px',
    marginBottom: '8px',
    fontFamily: theme.fonts.mono,
  },
  valueRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '2px',
    marginBottom: '8px',
  },
  sign: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  value: {
    fontSize: '28px',
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  structure: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '2px',
    marginBottom: '4px',
  },
  description: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
  },
};

export default TimespreadCard;
