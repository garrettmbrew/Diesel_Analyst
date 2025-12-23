import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, ComposedChart, Bar } from 'recharts';
import { theme } from '../../styles/theme';
import { Tabs, TabPanel } from '../Common/Tabs';
import { sampleHistoricalPrices, sampleRefinerStocks, sampleSeasonality } from '../../data/sampleData';
import { THRESHOLDS } from '../../utils/constants';
import { TrendingUp, Building2, Calendar, ExternalLink } from 'lucide-react';

// Data sources for each crack spread type
const CRACK_SOURCES = {
  gasoil: {
    name: 'Gasoil vs Brent',
    productLabel: 'ICE Gasoil',
    productUrl: 'https://www.theice.com/products/34361119/Low-Sulphur-Gasoil-Futures',
    crudeLabel: 'ICE Brent',
    crudeUrl: 'https://www.theice.com/products/219/Brent-Crude-Futures',
    fredProduct: null, // ICE Gasoil not on FRED
    fredCrude: 'DCOILBRENTEU',
  },
  ulsd: {
    name: 'ULSD vs WTI',
    productLabel: 'CME ULSD',
    productUrl: 'https://www.cmegroup.com/markets/energy/refined-products/heating-oil.html',
    crudeLabel: 'CME WTI',
    crudeUrl: 'https://www.cmegroup.com/markets/energy/crude-oil/light-sweet-crude.html',
    fredProduct: 'DDFUELUSGULF',
    fredCrude: 'DCOILWTICO',
  },
};

/**
 * Crack spread drill-down with refiner equity correlation
 */
export const CrackDrillDown = ({ spread = 'gasoil', hasFredKey = false, priceDate = null }) => {
  const [activeTab, setActiveTab] = useState('history');
  const source = CRACK_SOURCES[spread] || CRACK_SOURCES.gasoil;

  const tabs = [
    { id: 'history', label: 'History', icon: <TrendingUp size={14} /> },
    { id: 'equities', label: 'Refiner Stocks', icon: <Building2 size={14} /> },
    { id: 'seasonal', label: 'Seasonality', icon: <Calendar size={14} /> },
  ];

  // Generate seasonal data
  const seasonalData = [
    { month: 'Jan', avg: 22, high: 35, low: 12 },
    { month: 'Feb', avg: 20, high: 32, low: 10 },
    { month: 'Mar', avg: 18, high: 28, low: 8 },
    { month: 'Apr', avg: 16, high: 25, low: 7 },
    { month: 'May', avg: 14, high: 22, low: 6 },
    { month: 'Jun', avg: 13, high: 20, low: 5 },
    { month: 'Jul', avg: 14, high: 22, low: 6 },
    { month: 'Aug', avg: 18, high: 28, low: 9 },
    { month: 'Sep', avg: 22, high: 35, low: 12 },
    { month: 'Oct', avg: 24, high: 38, low: 14 },
    { month: 'Nov', avg: 26, high: 42, low: 15 },
    { month: 'Dec', avg: 25, high: 40, low: 14 },
  ];

  // Determine if we have live data (both components need FRED data for live calc)
  const hasLiveData = hasFredKey && source.fredCrude;

  return (
    <div style={styles.container}>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <TabPanel isActive={activeTab === 'history'}>
        <div style={styles.chartContainer}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>{source.name} Crack Spread History ($/bbl)</h3>
            <div style={styles.sourceBadgeRow}>
              <span style={{
                ...styles.sourceBadge,
                background: hasLiveData ? `${theme.colors.semantic.bullish}20` : `${theme.colors.semantic.warning}20`,
                color: hasLiveData ? theme.colors.semantic.bullish : theme.colors.semantic.warning,
              }}>
                {hasLiveData ? `● LIVE spot from FRED` : '○ SAMPLE DATA'}
                {hasLiveData && priceDate && ` (${priceDate})`}
              </span>
              <span style={styles.chartNote}>Chart: Illustrative history</span>
              <a href={source.productUrl} target="_blank" rel="noopener noreferrer" style={styles.verifyLink}>
                <ExternalLink size={10} /> {source.productLabel}
              </a>
              <a href={source.crudeUrl} target="_blank" rel="noopener noreferrer" style={styles.verifyLink}>
                <ExternalLink size={10} /> {source.crudeLabel}
              </a>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={sampleHistoricalPrices} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis dataKey="date" stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} />
              <YAxis stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} domain={[0, 35]} />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
              />
              <Legend />
              {/* Threshold zones */}
              <Area type="monotone" dataKey={() => THRESHOLDS.CRACK.VERY_STRONG} fill={`${theme.colors.semantic.bullish}10`} stroke="none" name="" />
              <Line type="monotone" dataKey="crack" stroke={theme.colors.accent.primary} strokeWidth={2} dot={false} name="Crack Spread" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Threshold Reference */}
        <div style={styles.thresholdGrid}>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.bullish }}>
            <div style={styles.thresholdLabel}>Very Strong</div>
            <div style={styles.thresholdValue}>&gt;$25/bbl</div>
            <div style={styles.thresholdDesc}>Max refinery runs</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.bullish }}>
            <div style={styles.thresholdLabel}>Strong</div>
            <div style={styles.thresholdValue}>$20-25/bbl</div>
            <div style={styles.thresholdDesc}>High profitability</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.warning }}>
            <div style={styles.thresholdLabel}>Healthy</div>
            <div style={styles.thresholdValue}>$15-20/bbl</div>
            <div style={styles.thresholdDesc}>Normal operations</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.bearish }}>
            <div style={styles.thresholdLabel}>Weak</div>
            <div style={styles.thresholdValue}>&lt;$10/bbl</div>
            <div style={styles.thresholdDesc}>Run cuts likely</div>
          </div>
        </div>

        <div style={styles.formulaBox}>
          <h4 style={styles.formulaTitle}>Crack Spread Formulas</h4>
          <div style={styles.formulaGrid}>
            <div style={styles.formula}>
              <span style={styles.formulaName}>Gasoil/Brent:</span>
              <code style={styles.formulaCode}>(Gasoil $/mt ÷ 7.45) − Brent $/bbl</code>
            </div>
            <div style={styles.formula}>
              <span style={styles.formulaName}>ULSD/WTI:</span>
              <code style={styles.formulaCode}>(ULSD $/gal × 42) − WTI $/bbl</code>
            </div>
            <div style={styles.formula}>
              <span style={styles.formulaName}>3-2-1:</span>
              <code style={styles.formulaCode}>((2×RBOB + 1×ULSD) × 42 − 3×WTI) ÷ 3</code>
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'equities'}>
        <div style={styles.chartContainer}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Refiner Stock Performance (Indexed to 100)</h3>
            <div style={styles.sourceBadgeRow}>
              <span style={{
                ...styles.sourceBadge,
                background: `${theme.colors.semantic.warning}20`,
                color: theme.colors.semantic.warning,
              }}>
                ○ SAMPLE DATA
              </span>
              <span style={styles.chartNote}>Illustrative correlation patterns</span>
              <a href="https://finance.yahoo.com/quote/VLO" target="_blank" rel="noopener noreferrer" style={styles.verifyLink}>
                <ExternalLink size={10} /> VLO
              </a>
              <a href="https://finance.yahoo.com/quote/MPC" target="_blank" rel="noopener noreferrer" style={styles.verifyLink}>
                <ExternalLink size={10} /> MPC
              </a>
              <a href="https://finance.yahoo.com/quote/PSX" target="_blank" rel="noopener noreferrer" style={styles.verifyLink}>
                <ExternalLink size={10} /> PSX
              </a>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleRefinerStocks} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis dataKey="date" stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} />
              <YAxis stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} domain={[70, 140]} />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="VLO" stroke="#f59e0b" strokeWidth={2} dot={false} name="Valero (VLO)" />
              <Line type="monotone" dataKey="MPC" stroke="#3b82f6" strokeWidth={2} dot={false} name="Marathon (MPC)" />
              <Line type="monotone" dataKey="PSX" stroke="#10b981" strokeWidth={2} dot={false} name="Phillips 66 (PSX)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Refiner Profiles */}
        <div style={styles.refinerGrid}>
          <div style={{ ...styles.refinerCard, borderLeftColor: '#f59e0b' }}>
            <div style={{ ...styles.refinerTicker, color: '#f59e0b' }}>VLO</div>
            <div style={styles.refinerName}>Valero Energy</div>
            <div style={styles.refinerStats}>
              <span>Capacity: 3.2M bpd</span>
              <span>Div Yield: ~3%</span>
            </div>
            <div style={styles.refinerDesc}>
              Largest independent US refiner. Pure-play refining, most levered to cracks.
            </div>
          </div>
          <div style={{ ...styles.refinerCard, borderLeftColor: '#3b82f6' }}>
            <div style={{ ...styles.refinerTicker, color: '#3b82f6' }}>MPC</div>
            <div style={styles.refinerName}>Marathon Petroleum</div>
            <div style={styles.refinerStats}>
              <span>Capacity: 2.9M bpd</span>
              <span>Div Yield: ~2%</span>
            </div>
            <div style={styles.refinerDesc}>
              Largest US refiner. Also owns midstream (MPLX). More diversified.
            </div>
          </div>
          <div style={{ ...styles.refinerCard, borderLeftColor: '#10b981' }}>
            <div style={{ ...styles.refinerTicker, color: '#10b981' }}>PSX</div>
            <div style={styles.refinerName}>Phillips 66</div>
            <div style={styles.refinerStats}>
              <span>Capacity: 1.9M bpd</span>
              <span>Div Yield: ~3.5%</span>
            </div>
            <div style={styles.refinerDesc}>
              Most diversified. Refining + Midstream + Chemicals. Lower beta.
            </div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Crack/Equity Relationship</h4>
          <p style={styles.infoText}>
            Refiner stocks are leveraged plays on crack spreads. When cracks are strong, refiners generate 
            significant free cash flow, buy back shares, and pay dividends. The correlation between crack 
            spreads and refiner equities is typically 0.6-0.8, meaning equity moves amplify the underlying 
            commodity move.
          </p>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'seasonal'}>
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Seasonal Crack Spread Pattern (5-Year Avg)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={seasonalData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis dataKey="month" stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} />
              <YAxis stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} domain={[0, 45]} />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
              />
              <Area type="monotone" dataKey="high" stackId="1" stroke="none" fill={`${theme.colors.accent.primary}20`} name="High" />
              <Area type="monotone" dataKey="low" stackId="2" stroke="none" fill={theme.colors.background.primary} name="Low" />
              <Line type="monotone" dataKey="avg" stroke={theme.colors.accent.primary} strokeWidth={2} dot={{ fill: theme.colors.accent.primary, r: 4 }} name="Average" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.seasonGrid}>
          <div style={styles.seasonCard}>
            <div style={styles.seasonLabel}>Q1 (Jan-Mar)</div>
            <div style={{ ...styles.seasonSignal, color: theme.colors.semantic.bullish }}>STRONG</div>
            <div style={styles.seasonDesc}>Peak heating demand. Turnarounds begin, limiting supply.</div>
          </div>
          <div style={styles.seasonCard}>
            <div style={styles.seasonLabel}>Q2 (Apr-Jun)</div>
            <div style={{ ...styles.seasonSignal, color: theme.colors.semantic.warning }}>TRANSITIONAL</div>
            <div style={styles.seasonDesc}>Planting season. Turnarounds end, supply returns.</div>
          </div>
          <div style={styles.seasonCard}>
            <div style={styles.seasonLabel}>Q3 (Jul-Sep)</div>
            <div style={{ ...styles.seasonSignal, color: theme.colors.semantic.bearish }}>WEAKEST</div>
            <div style={styles.seasonDesc}>Low demand, refiners building inventory. Often contango.</div>
          </div>
          <div style={styles.seasonCard}>
            <div style={styles.seasonLabel}>Q4 (Oct-Dec)</div>
            <div style={{ ...styles.seasonSignal, color: theme.colors.semantic.bullish }}>STRONGEST</div>
            <div style={styles.seasonDesc}>Harvest + heating returns. Holiday freight surge.</div>
          </div>
        </div>
      </TabPanel>
    </div>
  );
};

const styles = {
  container: {},
  chartContainer: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    marginBottom: '24px',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  chartTitle: {
    margin: 0,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  sourceBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  sourceBadge: {
    fontSize: '10px',
    fontWeight: theme.fontWeights.semibold,
    padding: '3px 10px',
    borderRadius: theme.radius.full,
    letterSpacing: '0.5px',
  },
  chartNote: {
    fontSize: '10px',
    color: theme.colors.text.muted,
    fontStyle: 'italic',
  },
  verifyLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    color: theme.colors.accent.primary,
    textDecoration: 'none',
    padding: '3px 8px',
    borderRadius: theme.radius.sm,
    background: `${theme.colors.accent.primary}10`,
  },
  thresholdGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '24px',
  },
  thresholdCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
    textAlign: 'center',
    borderLeft: '3px solid',
  },
  thresholdLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '4px',
  },
  thresholdValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  thresholdDesc: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  formulaBox: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
  },
  formulaTitle: {
    margin: '0 0 16px 0',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  formulaGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formula: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    background: theme.colors.background.primary,
    borderRadius: theme.radius.sm,
  },
  formulaName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
  },
  formulaCode: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.accent.primary,
    fontFamily: theme.fonts.mono,
    background: `${theme.colors.accent.primary}15`,
    padding: '4px 8px',
    borderRadius: theme.radius.sm,
  },
  refinerGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  refinerCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    borderLeft: '3px solid',
  },
  refinerTicker: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    marginBottom: '4px',
  },
  refinerName: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginBottom: '12px',
  },
  refinerStats: {
    display: 'flex',
    gap: '16px',
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginBottom: '12px',
  },
  refinerDesc: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 1.5,
  },
  seasonGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  seasonCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
    textAlign: 'center',
  },
  seasonLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginBottom: '8px',
  },
  seasonSignal: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '1px',
    marginBottom: '8px',
  },
  seasonDesc: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.secondary,
    lineHeight: 1.5,
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

export default CrackDrillDown;
