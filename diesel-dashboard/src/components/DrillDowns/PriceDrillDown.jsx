import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { theme } from '../../styles/theme';
import { Tabs, TabPanel } from '../Common/Tabs';
import { sampleHistoricalPrices } from '../../data/sampleData';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

/**
 * Price drill-down with historical charts and analysis
 */
export const PriceDrillDown = ({ product = 'gasoil' }) => {
  const [activeTab, setActiveTab] = useState('history');

  const tabs = [
    { id: 'history', label: 'History', icon: <TrendingUp size={14} /> },
    { id: 'correlation', label: 'Correlations', icon: <BarChart3 size={14} /> },
    { id: 'volatility', label: 'Volatility', icon: <Activity size={14} /> },
  ];

  const getProductConfig = () => {
    switch (product) {
      case 'brent':
        return { key: 'brent', label: 'ICE Brent', color: theme.colors.accent.tertiary, unit: '$/bbl' };
      case 'wti':
        return { key: 'brent', label: 'WTI', color: theme.colors.semantic.bullish, unit: '$/bbl' };
      case 'ulsd':
        return { key: 'ulsd', label: 'NYMEX ULSD', color: theme.colors.accent.primary, unit: '$/gal' };
      default:
        return { key: 'gasoil', label: 'ICE Gasoil', color: theme.colors.accent.secondary, unit: '$/mt' };
    }
  };

  const config = getProductConfig();

  return (
    <div style={styles.container}>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <TabPanel isActive={activeTab === 'history'}>
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>24-Month Price History</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleHistoricalPrices} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis 
                dataKey="date" 
                stroke={theme.colors.text.muted} 
                tick={{ fill: theme.colors.text.muted, fontSize: 11 }}
              />
              <YAxis 
                stroke={theme.colors.text.muted}
                tick={{ fill: theme.colors.text.muted, fontSize: 11 }}
                label={{ value: config.unit, angle: -90, position: 'insideLeft', fill: theme.colors.text.muted }}
              />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
                labelStyle={{ color: theme.colors.text.primary }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey={config.key} 
                stroke={config.color} 
                strokeWidth={2}
                dot={{ fill: config.color, r: 3 }}
                name={config.label}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Key Levels */}
        <div style={styles.levelsGrid}>
          <div style={styles.levelCard}>
            <div style={styles.levelLabel}>52-Week High</div>
            <div style={styles.levelValue}>$92.50</div>
            <div style={styles.levelDate}>Sep 2023</div>
          </div>
          <div style={styles.levelCard}>
            <div style={styles.levelLabel}>52-Week Low</div>
            <div style={styles.levelValue}>$70.20</div>
            <div style={styles.levelDate}>Jun 2023</div>
          </div>
          <div style={styles.levelCard}>
            <div style={styles.levelLabel}>200-Day MA</div>
            <div style={styles.levelValue}>$79.85</div>
            <div style={styles.levelSubtext}>Current: -6.3%</div>
          </div>
          <div style={styles.levelCard}>
            <div style={styles.levelLabel}>YTD Change</div>
            <div style={{ ...styles.levelValue, color: theme.colors.semantic.bearish }}>-8.2%</div>
            <div style={styles.levelSubtext}>From $81.50</div>
          </div>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'correlation'}>
        <div style={styles.correlationGrid}>
          <div style={styles.correlationCard}>
            <div style={styles.correlationPair}>Gasoil vs Brent</div>
            <div style={styles.correlationValue}>0.94</div>
            <div style={styles.correlationBar}>
              <div style={{ ...styles.correlationFill, width: '94%', background: theme.colors.semantic.bullish }} />
            </div>
            <div style={styles.correlationDesc}>Very strong positive correlation</div>
          </div>
          <div style={styles.correlationCard}>
            <div style={styles.correlationPair}>ULSD vs WTI</div>
            <div style={styles.correlationValue}>0.91</div>
            <div style={styles.correlationBar}>
              <div style={{ ...styles.correlationFill, width: '91%', background: theme.colors.semantic.bullish }} />
            </div>
            <div style={styles.correlationDesc}>Very strong positive correlation</div>
          </div>
          <div style={styles.correlationCard}>
            <div style={styles.correlationPair}>Gasoil vs ULSD</div>
            <div style={styles.correlationValue}>0.87</div>
            <div style={styles.correlationBar}>
              <div style={{ ...styles.correlationFill, width: '87%', background: theme.colors.semantic.bullish }} />
            </div>
            <div style={styles.correlationDesc}>Strong positive correlation</div>
          </div>
          <div style={styles.correlationCard}>
            <div style={styles.correlationPair}>Gasoil vs EUR/USD</div>
            <div style={styles.correlationValue}>-0.32</div>
            <div style={styles.correlationBar}>
              <div style={{ ...styles.correlationFill, width: '32%', background: theme.colors.semantic.bearish }} />
            </div>
            <div style={styles.correlationDesc}>Weak negative correlation</div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Why Correlations Matter</h4>
          <p style={styles.infoText}>
            Diesel prices correlate strongly with crude oil (~0.90+) but the spread between them (the crack) 
            is what drives refining profitability. EUR/USD correlation matters for Gasoil since it's priced 
            in USD but consumed in Europe — a weaker euro makes diesel more expensive for European buyers.
          </p>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'volatility'}>
        <div style={styles.volGrid}>
          <div style={styles.volCard}>
            <div style={styles.volLabel}>30-Day Realized Vol</div>
            <div style={styles.volValue}>24.5%</div>
            <div style={styles.volContext}>Below average</div>
          </div>
          <div style={styles.volCard}>
            <div style={styles.volLabel}>30-Day Implied Vol</div>
            <div style={styles.volValue}>28.2%</div>
            <div style={styles.volContext}>Options pricing in more risk</div>
          </div>
          <div style={styles.volCard}>
            <div style={styles.volLabel}>1-Year Avg Vol</div>
            <div style={styles.volValue}>32.8%</div>
            <div style={styles.volContext}>Historical baseline</div>
          </div>
          <div style={styles.volCard}>
            <div style={styles.volLabel}>Vol Regime</div>
            <div style={{ ...styles.volValue, color: theme.colors.semantic.bullish }}>LOW</div>
            <div style={styles.volContext}>Below 1-year average</div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Volatility Interpretation</h4>
          <p style={styles.infoText}>
            Low volatility regimes often precede big moves — the market is complacent. When implied vol exceeds 
            realized vol (as now), options are pricing in an expected pickup in volatility. High vol environments 
            (>40%) typically coincide with supply disruptions or demand shocks.
          </p>
        </div>
      </TabPanel>
    </div>
  );
};

const styles = {
  container: {
    // Container styling
  },
  chartContainer: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    marginBottom: '24px',
  },
  chartTitle: {
    margin: '0 0 16px 0',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  levelsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
  },
  levelCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
    textAlign: 'center',
  },
  levelLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '8px',
    letterSpacing: '1px',
  },
  levelValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  levelDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  levelSubtext: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginTop: '4px',
  },
  correlationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  correlationCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
  },
  correlationPair: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginBottom: '8px',
  },
  correlationValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
    marginBottom: '8px',
  },
  correlationBar: {
    height: '6px',
    background: theme.colors.background.primary,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    marginBottom: '8px',
  },
  correlationFill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
  correlationDesc: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
  },
  volGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  volCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
    textAlign: 'center',
  },
  volLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '8px',
  },
  volValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  volContext: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  infoBox: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    borderLeft: `3px solid ${theme.colors.accent.primary}`,
  },
  infoTitle: {
    margin: '0 0 8px 0',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  infoText: {
    margin: 0,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 1.6,
  },
};

export default PriceDrillDown;
