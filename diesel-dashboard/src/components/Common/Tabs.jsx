import React from 'react';
import { theme } from '../../styles/theme';

/**
 * Reusable tabs component for drill-down navigation
 */
export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div style={styles.container}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          style={{
            ...styles.tab,
            ...(activeTab === tab.id ? styles.tabActive : {}),
          }}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span style={styles.icon}>{tab.icon}</span>}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

/**
 * Tab panel wrapper
 */
export const TabPanel = ({ children, isActive }) => {
  if (!isActive) return null;
  return <div style={styles.panel}>{children}</div>;
};

const styles = {
  container: {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    background: theme.colors.background.primary,
    borderRadius: theme.radius.md,
    marginBottom: '20px',
  },
  tab: {
    flex: 1,
    padding: '10px 16px',
    border: 'none',
    background: 'transparent',
    color: theme.colors.text.muted,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.medium,
    fontFamily: theme.fonts.sans,
    cursor: 'pointer',
    borderRadius: theme.radius.sm,
    transition: `all ${theme.transitions.fast}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  },
  tabActive: {
    background: theme.colors.background.tertiary,
    color: theme.colors.accent.primary,
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
  },
  panel: {
    animation: 'fadeIn 0.2s ease-out',
  },
};

// Add keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
}

export default Tabs;
