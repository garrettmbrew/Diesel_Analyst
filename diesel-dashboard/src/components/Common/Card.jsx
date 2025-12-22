import React from 'react';
import { ChevronRight } from 'lucide-react';
import { theme } from '../../styles/theme';

/**
 * Reusable card component with optional drill-down trigger
 */
export const Card = ({
  children,
  title,
  subtitle,
  onClick,
  clickable = false,
  variant = 'default', // 'default', 'accent', 'highlight'
  padding = 'normal', // 'compact', 'normal', 'spacious'
  className,
  style,
}) => {
  const isClickable = clickable || !!onClick;

  const variantStyles = {
    default: {
      background: theme.colors.background.card,
      border: `1px solid ${theme.colors.border.default}`,
    },
    accent: {
      background: `linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(239, 68, 68, 0.05) 100%)`,
      border: `1px solid rgba(245, 158, 11, 0.2)`,
    },
    highlight: {
      background: theme.colors.background.card,
      border: `1px solid ${theme.colors.accent.primary}`,
      boxShadow: theme.shadows.glow,
    },
  };

  const paddingStyles = {
    compact: '12px 16px',
    normal: '20px',
    spacious: '24px 28px',
  };

  return (
    <div
      style={{
        ...styles.card,
        ...variantStyles[variant],
        padding: paddingStyles[padding],
        cursor: isClickable ? 'pointer' : 'default',
        ...style,
      }}
      onClick={onClick}
      className={className}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {(title || isClickable) && (
        <div style={styles.header}>
          <div>
            {title && <div style={styles.title}>{title}</div>}
            {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
          </div>
          {isClickable && (
            <ChevronRight 
              size={16} 
              style={styles.chevron}
            />
          )}
        </div>
      )}
      <div style={styles.content}>
        {children}
      </div>
    </div>
  );
};

const styles = {
  card: {
    borderRadius: theme.radius.md,
    transition: `all ${theme.transitions.normal}`,
    ':hover': {
      borderColor: theme.colors.border.hover,
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  title: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.muted,
    letterSpacing: '1px',
    textTransform: 'uppercase',
    fontFamily: theme.fonts.mono,
  },
  subtitle: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '2px',
  },
  chevron: {
    color: theme.colors.text.disabled,
    transition: `transform ${theme.transitions.fast}`,
  },
  content: {
    // Content styling handled by children
  },
};

export default Card;
