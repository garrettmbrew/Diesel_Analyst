import React from 'react';
import { ExternalLink, Database, Wifi, FileText } from 'lucide-react';
import { theme } from '../../styles/theme';

/**
 * Data source badge component for QA/QC
 * Shows whether data is LIVE or SAMPLE with optional link to raw data
 */
export const SourceBadge = ({
  isLive = false,
  source = 'Sample',
  dataUrl = null,
  lastUpdate = null,
  compact = false,
}) => {
  const handleClick = (e) => {
    if (dataUrl) {
      e.stopPropagation();
      window.open(dataUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (compact) {
    return (
      <div 
        style={{
          ...styles.compactBadge,
          background: isLive ? `${theme.colors.semantic.bullish}20` : `${theme.colors.semantic.warning}20`,
          color: isLive ? theme.colors.semantic.bullish : theme.colors.semantic.warning,
          cursor: dataUrl ? 'pointer' : 'default',
        }}
        onClick={handleClick}
        title={`Source: ${source}${dataUrl ? ' - Click to view raw data' : ''}`}
      >
        {isLive ? <Wifi size={10} /> : <FileText size={10} />}
        <span>{isLive ? 'LIVE' : 'SAMPLE'}</span>
        {dataUrl && <ExternalLink size={8} />}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div 
        style={{
          ...styles.badge,
          background: isLive ? `${theme.colors.semantic.bullish}15` : `${theme.colors.semantic.warning}15`,
          borderColor: isLive ? `${theme.colors.semantic.bullish}40` : `${theme.colors.semantic.warning}40`,
        }}
      >
        <div style={styles.statusRow}>
          {isLive ? (
            <Wifi size={12} style={{ color: theme.colors.semantic.bullish }} />
          ) : (
            <FileText size={12} style={{ color: theme.colors.semantic.warning }} />
          )}
          <span style={{
            ...styles.statusText,
            color: isLive ? theme.colors.semantic.bullish : theme.colors.semantic.warning,
          }}>
            {isLive ? 'LIVE' : 'SAMPLE DATA'}
          </span>
        </div>
        
        <div style={styles.sourceRow}>
          <Database size={10} style={{ color: theme.colors.text.disabled }} />
          <span style={styles.sourceText}>{source}</span>
        </div>
        
        {lastUpdate && (
          <div style={styles.updateRow}>
            Updated: {typeof lastUpdate === 'string' ? lastUpdate : lastUpdate.toLocaleString()}
          </div>
        )}
        
        {dataUrl && (
          <button 
            style={styles.linkButton}
            onClick={handleClick}
            title="View raw data source"
          >
            <ExternalLink size={10} />
            <span>View Raw Data</span>
          </button>
        )}
      </div>
    </div>
  );
};

/**
 * Inline source indicator - minimal version for card headers
 */
export const SourceIndicator = ({
  isLive = false,
  source = 'Sample',
  dataUrl = null,
}) => {
  const handleClick = (e) => {
    if (dataUrl) {
      e.stopPropagation();
      window.open(dataUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      style={{
        ...styles.indicator,
        background: isLive ? `${theme.colors.semantic.bullish}15` : `${theme.colors.text.disabled}15`,
        color: isLive ? theme.colors.semantic.bullish : theme.colors.text.disabled,
        cursor: dataUrl ? 'pointer' : 'default',
      }}
      onClick={handleClick}
      title={`${source}${dataUrl ? ' - Click for raw data' : ''}`}
    >
      {isLive ? <Wifi size={8} /> : <FileText size={8} />}
      <span>{isLive ? 'LIVE' : 'SAMPLE'}</span>
      {dataUrl && <ExternalLink size={8} style={{ marginLeft: '2px' }} />}
    </div>
  );
};

const styles = {
  container: {
    marginTop: '8px',
  },
  badge: {
    padding: '8px 12px',
    borderRadius: theme.radius.sm,
    border: '1px solid',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  statusText: {
    fontSize: '10px',
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '1px',
  },
  sourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  sourceText: {
    fontSize: '10px',
    color: theme.colors.text.muted,
  },
  updateRow: {
    fontSize: '9px',
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  linkButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: '6px',
    padding: '4px 8px',
    background: `${theme.colors.accent.primary}20`,
    border: 'none',
    borderRadius: theme.radius.sm,
    color: theme.colors.accent.primary,
    fontSize: '9px',
    fontWeight: theme.fontWeights.medium,
    cursor: 'pointer',
    transition: `all ${theme.transitions.fast}`,
  },
  indicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: theme.radius.full,
    fontSize: '9px',
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '0.5px',
  },
  compactBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    padding: '2px 6px',
    borderRadius: theme.radius.full,
    fontSize: '8px',
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '0.5px',
  },
};

export default SourceBadge;
