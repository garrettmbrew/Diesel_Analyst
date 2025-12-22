import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Area } from 'recharts';
import { theme } from '../../styles/theme';
import { Tabs, TabPanel } from '../Common/Tabs';
import { useEIAData } from '../../hooks/useEIAData';
import { sampleEIAData, sampleInventories } from '../../data/sampleData';
import { THRESHOLDS } from '../../utils/constants';
import { Database, MapPin, Clock, AlertTriangle } from 'lucide-react';

/**
 * Inventory drill-down with EIA data integration
 */
export const InventoryDrillDown = () => {
  const [activeTab, setActiveTab] = useState('stocks');
  const { distillateStocks, loading, hasApiKey, refresh } = useEIAData();

  const data = distillateStocks || sampleEIAData;

  const tabs = [
    { id: 'stocks', label: 'US Stocks', icon: <Database size={14} /> },
    { id: 'padd', label: 'Regional', icon: <MapPin size={14} /> },
    { id: 'supply', label: 'Days of Supply', icon: <Clock size={14} /> },
  ];

  // Calculate stock position vs 5-year range
  const currentStocks = data[0]?.distillate || sampleInventories.usDistillate.current;
  const fiveYearAvg = sampleInventories.usDistillate.fiveYearAvg;
  const fiveYearLow = sampleInventories.usDistillate.fiveYearLow;
  const fiveYearHigh = sampleInventories.usDistillate.fiveYearHigh;
  const vsAverage = ((currentStocks - fiveYearAvg) / fiveYearAvg * 100).toFixed(1);
  const position = ((currentStocks - fiveYearLow) / (fiveYearHigh - fiveYearLow) * 100).toFixed(0);

  return (
    <div style={styles.container}>
      {/* API Key Warning */}
      {!hasApiKey && (
        <div style={styles.apiWarning}>
          <AlertTriangle size={16} />
          <span>Using sample data. Add EIA API key for live data.</span>
        </div>
      )}

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <TabPanel isActive={activeTab === 'stocks'}>
        {/* Current Position */}
        <div style={styles.positionCard}>
          <div style={styles.positionHeader}>
            <div>
              <div style={styles.positionLabel}>US Distillate Stocks</div>
              <div style={styles.positionValue}>{(currentStocks / 1000).toFixed(1)} MMbbl</div>
            </div>
            <div style={styles.positionMeta}>
              <div style={{
                ...styles.positionVsAvg,
                color: vsAverage < 0 ? theme.colors.semantic.bearish : theme.colors.semantic.bullish,
              }}>
                {vsAverage > 0 ? '+' : ''}{vsAverage}% vs 5-year avg
              </div>
            </div>
          </div>

          {/* Range Bar */}
          <div style={styles.rangeContainer}>
            <div style={styles.rangeLabels}>
              <span>5Y Low: {(fiveYearLow / 1000).toFixed(0)}MM</span>
              <span>5Y High: {(fiveYearHigh / 1000).toFixed(0)}MM</span>
            </div>
            <div style={styles.rangeBar}>
              <div 
                style={{
                  ...styles.rangeMarker,
                  left: `${position}%`,
                }}
              />
            </div>
            <div style={styles.rangePosition}>Current: {position}% of range</div>
          </div>
        </div>

        {/* Weekly Changes Chart */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Weekly Stock Changes (000 bbl)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.slice(0, 10).reverse()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis dataKey="week" stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 10 }} />
              <YAxis stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
              />
              <Bar 
                dataKey="change" 
                fill={theme.colors.accent.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Threshold Reference */}
        <div style={styles.thresholdGrid}>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.bearish }}>
            <div style={styles.thresholdLabel}>Very Tight</div>
            <div style={styles.thresholdValue}>&lt;105 MMbbl</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.warning }}>
            <div style={styles.thresholdLabel}>Tight</div>
            <div style={styles.thresholdValue}>105-120 MMbbl</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.neutral }}>
            <div style={styles.thresholdLabel}>Balanced</div>
            <div style={styles.thresholdValue}>120-140 MMbbl</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.bullish }}>
            <div style={styles.thresholdLabel}>Oversupplied</div>
            <div style={styles.thresholdValue}>&gt;150 MMbbl</div>
          </div>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'padd'}>
        <div style={styles.paddGrid}>
          <div style={styles.paddCard}>
            <div style={styles.paddHeader}>
              <span style={styles.paddName}>PADD 1 - East Coast</span>
              <span style={{ 
                ...styles.paddStatus,
                color: sampleInventories.padd1.current < THRESHOLDS.PADD1_STOCKS.TIGHT * 1000 
                  ? theme.colors.semantic.bearish 
                  : theme.colors.semantic.neutral
              }}>
                {sampleInventories.padd1.current < THRESHOLDS.PADD1_STOCKS.TIGHT * 1000 ? 'TIGHT' : 'NORMAL'}
              </span>
            </div>
            <div style={styles.paddValue}>{(sampleInventories.padd1.current / 1000).toFixed(1)} MMbbl</div>
            <div style={styles.paddChange}>
              WoW: {sampleInventories.padd1.change > 0 ? '+' : ''}{(sampleInventories.padd1.change / 1000).toFixed(1)}MM
            </div>
            <div style={styles.paddNote}>Critical region for heating oil. Watch in winter.</div>
          </div>

          <div style={styles.paddCard}>
            <div style={styles.paddHeader}>
              <span style={styles.paddName}>PADD 3 - Gulf Coast</span>
              <span style={{ ...styles.paddStatus, color: theme.colors.semantic.neutral }}>NORMAL</span>
            </div>
            <div style={styles.paddValue}>{(sampleInventories.padd3.current / 1000).toFixed(1)} MMbbl</div>
            <div style={styles.paddChange}>
              WoW: {sampleInventories.padd3.change > 0 ? '+' : ''}{(sampleInventories.padd3.change / 1000).toFixed(1)}MM
            </div>
            <div style={styles.paddNote}>Refining hub. Export-driven draws.</div>
          </div>

          <div style={styles.paddCard}>
            <div style={styles.paddHeader}>
              <span style={styles.paddName}>ARA - Europe</span>
              <span style={{ 
                ...styles.paddStatus,
                color: sampleInventories.araStocks.current < THRESHOLDS.ARA_STOCKS.TIGHT 
                  ? theme.colors.semantic.warning 
                  : theme.colors.semantic.neutral
              }}>
                {sampleInventories.araStocks.current < THRESHOLDS.ARA_STOCKS.TIGHT ? 'TIGHT' : 'NORMAL'}
              </span>
            </div>
            <div style={styles.paddValue}>{sampleInventories.araStocks.current.toFixed(2)} MMmt</div>
            <div style={styles.paddChange}>
              WoW: {sampleInventories.araStocks.change > 0 ? '+' : ''}{sampleInventories.araStocks.change.toFixed(2)}MM
            </div>
            <div style={styles.paddNote}>Amsterdam-Rotterdam-Antwerp hub.</div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>PADD Regions Explained</h4>
          <p style={styles.infoText}>
            PADD 1 (East Coast) is critical for heating oil demand. Below 25MM bbl in winter is concerning.
            PADD 3 (Gulf Coast) is the refining hub — draws here often indicate strong exports.
            ARA stocks are the European equivalent — below 1.8MM mt signals tightness.
          </p>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'supply'}>
        <div style={styles.supplyGrid}>
          <div style={styles.supplyCard}>
            <div style={styles.supplyLabel}>Current Days of Supply</div>
            <div style={styles.supplyValue}>28.5</div>
            <div style={styles.supplyContext}>days</div>
          </div>
          <div style={styles.supplyCard}>
            <div style={styles.supplyLabel}>5-Year Average</div>
            <div style={styles.supplyValue}>32.0</div>
            <div style={styles.supplyContext}>days</div>
          </div>
          <div style={styles.supplyCard}>
            <div style={styles.supplyLabel}>Deficit vs Average</div>
            <div style={{ ...styles.supplyValue, color: theme.colors.semantic.bearish }}>-3.5</div>
            <div style={styles.supplyContext}>days below normal</div>
          </div>
          <div style={styles.supplyCard}>
            <div style={styles.supplyLabel}>Implied Weekly Demand</div>
            <div style={styles.supplyValue}>4.15</div>
            <div style={styles.supplyContext}>MMbbl/day</div>
          </div>
        </div>

        <div style={styles.thresholdGrid}>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.bearish }}>
            <div style={styles.thresholdLabel}>Critical</div>
            <div style={styles.thresholdValue}>&lt;25 days</div>
            <div style={styles.thresholdDesc}>Supply crisis</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.warning }}>
            <div style={styles.thresholdLabel}>Tight</div>
            <div style={styles.thresholdValue}>25-28 days</div>
            <div style={styles.thresholdDesc}>Elevated prices</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.neutral }}>
            <div style={styles.thresholdLabel}>Normal</div>
            <div style={styles.thresholdValue}>28-35 days</div>
            <div style={styles.thresholdDesc}>Balanced market</div>
          </div>
          <div style={{ ...styles.thresholdCard, borderColor: theme.colors.semantic.bullish }}>
            <div style={styles.thresholdLabel}>Comfortable</div>
            <div style={styles.thresholdValue}>&gt;38 days</div>
            <div style={styles.thresholdDesc}>Oversupplied</div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Days of Supply Calculation</h4>
          <p style={styles.infoText}>
            Days of Supply = Total Stocks ÷ (Weekly Demand ÷ 7). This normalizes inventory levels 
            for demand and tells you how long current stocks would last at current consumption rates.
            It's more useful than absolute stock levels because it accounts for seasonal demand variations.
          </p>
        </div>
      </TabPanel>
    </div>
  );
};

const styles = {
  container: {},
  apiWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: `${theme.colors.semantic.warning}15`,
    borderRadius: theme.radius.md,
    marginBottom: '16px',
    color: theme.colors.semantic.warning,
    fontSize: theme.fontSizes.sm,
  },
  positionCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '24px',
    marginBottom: '24px',
  },
  positionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
  },
  positionLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginBottom: '4px',
  },
  positionValue: {
    fontSize: '36px',
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  positionMeta: {
    textAlign: 'right',
  },
  positionVsAvg: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
  },
  rangeContainer: {
    marginTop: '16px',
  },
  rangeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginBottom: '8px',
  },
  rangeBar: {
    height: '8px',
    background: `linear-gradient(90deg, ${theme.colors.semantic.bearish}40, ${theme.colors.semantic.warning}40, ${theme.colors.semantic.bullish}40)`,
    borderRadius: theme.radius.full,
    position: 'relative',
  },
  rangeMarker: {
    position: 'absolute',
    top: '-4px',
    width: '16px',
    height: '16px',
    background: theme.colors.text.primary,
    borderRadius: '50%',
    transform: 'translateX(-50%)',
    border: `2px solid ${theme.colors.background.primary}`,
  },
  rangePosition: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    textAlign: 'center',
    marginTop: '8px',
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
  thresholdGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
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
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  thresholdDesc: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  paddGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  paddCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
  },
  paddHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  paddName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  paddStatus: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '1px',
  },
  paddValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
    marginBottom: '4px',
  },
  paddChange: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginBottom: '12px',
  },
  paddNote: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
  },
  supplyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  supplyCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    textAlign: 'center',
  },
  supplyLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '8px',
  },
  supplyValue: {
    fontSize: theme.fontSizes['3xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  supplyContext: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  infoBox: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    marginTop: '24px',
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

export default InventoryDrillDown;
