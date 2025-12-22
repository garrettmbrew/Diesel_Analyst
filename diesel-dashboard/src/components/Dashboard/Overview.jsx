import React, { useState } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { theme } from '../../styles/theme';
import { useMarketData } from '../../hooks/useMarketData';
import { formatTime } from '../../utils/formatters';

import PriceCard from './PriceCard';
import CrackCard from './CrackCard';
import TimespreadCard from './TimespreadCard';
import NewsFeed from './NewsFeed';

import Modal from '../Common/Modal';
import PriceDrillDown from '../DrillDowns/PriceDrillDown';
import CrackDrillDown from '../DrillDowns/CrackDrillDown';
import InventoryDrillDown from '../DrillDowns/InventoryDrillDown';
import TimespreadDrillDown from '../DrillDowns/TimespreadDrillDown';
import ArbDrillDown from '../DrillDowns/ArbDrillDown';

/**
 * Main dashboard overview component
 */
export const Overview = () => {
  const { 
    prices, 
    cracks, 
    timespreads, 
    inventories,
    arbs,
    news, 
    loading, 
    lastUpdate, 
    refresh 
  } = useMarketData();

  const [activeModal, setActiveModal] = useState(null);
  const [modalData, setModalData] = useState(null);

  const openDrillDown = (type, data = null) => {
    setActiveModal(type);
    setModalData(data);
  };

  const closeDrillDown = () => {
    setActiveModal(null);
    setModalData(null);
  };

  if (loading && !prices) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner} />
        <div style={styles.loadingText}>Loading market data...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>DIESEL DESK</h1>
          <span style={styles.subtitle}>Market Fundamentals Monitor</span>
        </div>
        <div style={styles.headerRight}>
          <button style={styles.refreshBtn} onClick={refresh}>
            <RefreshCw size={14} />
          </button>
          <div style={styles.updateTime}>
            Last update: {lastUpdate ? formatTime(lastUpdate) : '-'}
          </div>
          <div style={styles.marketStatus}>
            <Activity size={12} style={styles.statusIcon} />
            LIVE
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.nav}>
        {['overview', 'inventories', 'cracks', 'arbs'].map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.navBtn,
              ...(tab === 'overview' ? styles.navBtnActive : {}),
            }}
            onClick={() => {
              if (tab === 'inventories') openDrillDown('inventory');
              if (tab === 'cracks') openDrillDown('crack');
              if (tab === 'arbs') openDrillDown('arb');
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={styles.main}>
        {/* Benchmark Prices */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>BENCHMARK PRICES</h2>
          <div style={styles.priceGrid}>
            <PriceCard
              title="ICE Brent (M1)"
              price={prices?.brent?.price}
              change={prices?.brent?.change}
              changePercent={prices?.brent?.changePercent}
              unit="$/bbl"
              onClick={() => openDrillDown('price', { product: 'brent' })}
            />
            <PriceCard
              title="NYMEX WTI (M1)"
              price={prices?.wti?.price}
              change={prices?.wti?.change}
              changePercent={prices?.wti?.changePercent}
              unit="$/bbl"
              onClick={() => openDrillDown('price', { product: 'wti' })}
            />
            <PriceCard
              title="ICE Gasoil (M1)"
              price={prices?.iceGasoil?.price}
              change={prices?.iceGasoil?.change}
              changePercent={prices?.iceGasoil?.changePercent}
              unit="$/mt"
              onClick={() => openDrillDown('price', { product: 'gasoil' })}
            />
            <PriceCard
              title="NYMEX ULSD (M1)"
              price={prices?.nymexUlsd?.price}
              change={prices?.nymexUlsd?.change}
              changePercent={prices?.nymexUlsd?.changePercent}
              unit="$/gal"
              decimals={4}
              onClick={() => openDrillDown('price', { product: 'ulsd' })}
            />
          </div>
        </section>

        {/* Crack Spreads */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>CRACK SPREADS</h2>
          <div style={styles.crackGrid}>
            <CrackCard
              title="Gasoil vs Brent"
              value={cracks?.gasoilBrent?.value}
              change={cracks?.gasoilBrent?.change}
              onClick={() => openDrillDown('crack', { spread: 'gasoil' })}
            />
            <CrackCard
              title="ULSD vs WTI"
              value={cracks?.ulsdWti?.value}
              change={cracks?.ulsdWti?.change}
              onClick={() => openDrillDown('crack', { spread: 'ulsd' })}
            />
            <TimespreadCard
              title="Gasoil M1/M2 Spread"
              value={timespreads?.gasoilM1M2?.value}
              structure={timespreads?.gasoilM1M2?.structure}
              onClick={() => openDrillDown('timespread')}
            />
          </div>
        </section>

        {/* News Feed */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>MARKET INTELLIGENCE</h2>
          <NewsFeed news={news} />
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div>Built for the diesel desk | Data refresh: 30s</div>
        <div>Prices indicative only - verify with live feeds</div>
      </footer>

      {/* Drill-Down Modals */}
      <Modal
        isOpen={activeModal === 'price'}
        onClose={closeDrillDown}
        title="Price Analysis"
        subtitle={`Detailed view for ${modalData?.product || 'selected product'}`}
        size="large"
      >
        <PriceDrillDown product={modalData?.product} />
      </Modal>

      <Modal
        isOpen={activeModal === 'crack'}
        onClose={closeDrillDown}
        title="Crack Spread Analysis"
        subtitle="Refining margins, historical patterns, and equity correlations"
        size="large"
      >
        <CrackDrillDown spread={modalData?.spread} />
      </Modal>

      <Modal
        isOpen={activeModal === 'inventory'}
        onClose={closeDrillDown}
        title="Inventory Analysis"
        subtitle="US distillate stocks, PADD breakdown, and days of supply"
        size="large"
      >
        <InventoryDrillDown />
      </Modal>

      <Modal
        isOpen={activeModal === 'timespread'}
        onClose={closeDrillDown}
        title="Timespread Analysis"
        subtitle="Forward curve structure and storage economics"
        size="large"
      >
        <TimespreadDrillDown />
      </Modal>

      <Modal
        isOpen={activeModal === 'arb'}
        onClose={closeDrillDown}
        title="Arbitrage Analysis"
        subtitle="Regional spreads, freight economics, and trade flows"
        size="large"
      >
        <ArbDrillDown />
      </Modal>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.background.secondary} 50%, ${theme.colors.background.primary} 100%)`,
    color: theme.colors.text.secondary,
    fontFamily: theme.fonts.sans,
  },
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.background.primary,
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: `3px solid ${theme.colors.accent.primary}30`,
    borderTop: `3px solid ${theme.colors.accent.primary}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '16px',
    color: theme.colors.text.muted,
    letterSpacing: '2px',
    fontSize: theme.fontSizes.sm,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 32px',
    borderBottom: `1px solid ${theme.colors.border.default}`,
    background: `${theme.colors.background.primary}cc`,
    backdropFilter: 'blur(10px)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '28px',
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '4px',
    background: `linear-gradient(90deg, ${theme.colors.accent.primary}, ${theme.colors.accent.secondary})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontFamily: theme.fonts.mono,
  },
  subtitle: {
    color: theme.colors.text.disabled,
    fontSize: theme.fontSizes.sm,
    letterSpacing: '2px',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  refreshBtn: {
    background: 'transparent',
    border: `1px solid ${theme.colors.border.default}`,
    color: theme.colors.text.muted,
    padding: '8px',
    borderRadius: theme.radius.sm,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${theme.transitions.fast}`,
  },
  updateTime: {
    color: theme.colors.text.disabled,
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fonts.mono,
  },
  marketStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: theme.colors.semantic.bullish,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    letterSpacing: '1px',
  },
  statusIcon: {
    animation: 'pulse 2s infinite',
  },
  nav: {
    display: 'flex',
    gap: '4px',
    padding: '16px 32px',
    borderBottom: `1px solid ${theme.colors.border.default}`,
    background: `${theme.colors.background.secondary}80`,
  },
  navBtn: {
    padding: '10px 20px',
    border: 'none',
    background: 'transparent',
    color: theme.colors.text.disabled,
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    letterSpacing: '2px',
    cursor: 'pointer',
    borderRadius: theme.radius.sm,
    transition: `all ${theme.transitions.fast}`,
    fontFamily: theme.fonts.sans,
  },
  navBtnActive: {
    background: `${theme.colors.accent.primary}20`,
    color: theme.colors.accent.primary,
  },
  main: {
    padding: '32px',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    margin: '0 0 20px 0',
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    letterSpacing: '3px',
    color: theme.colors.text.muted,
    borderBottom: `1px solid ${theme.colors.border.default}`,
    paddingBottom: '12px',
    fontFamily: theme.fonts.mono,
  },
  priceGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  },
  crackGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  footer: {
    padding: '20px 32px',
    borderTop: `1px solid ${theme.colors.border.default}`,
    display: 'flex',
    justifyContent: 'space-between',
    color: theme.colors.text.disabled,
    fontSize: theme.fontSizes.xs,
    letterSpacing: '1px',
  },
};

// Add keyframes
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
if (typeof document !== 'undefined') {
  document.head.appendChild(styleSheet);
}

export default Overview;
