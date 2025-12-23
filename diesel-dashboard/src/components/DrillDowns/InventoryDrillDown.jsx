import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { theme } from '../../styles/theme';
import { Tabs, TabPanel } from '../Common/Tabs';
import { useEIAData } from '../../hooks/useEIAData';
import { sampleEIAData, sampleInventories } from '../../data/sampleData';
import { THRESHOLDS, EIA_AREAS } from '../../utils/constants';
import { Database, MapPin, Clock, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

// EIA Data URLs for QA/QC verification
const EIA_URLS = {
  WEEKLY_STOCKS: 'https://www.eia.gov/dnav/pet/pet_stoc_wstk_dcu_nus_w.htm',
  PADD1: 'https://www.eia.gov/dnav/pet/pet_stoc_wstk_dcu_r10_w.htm',
  PADD2: 'https://www.eia.gov/dnav/pet/pet_stoc_wstk_dcu_r20_w.htm',
  PADD3: 'https://www.eia.gov/dnav/pet/pet_stoc_wstk_dcu_r30_w.htm',
  PADD4: 'https://www.eia.gov/dnav/pet/pet_stoc_wstk_dcu_r40_w.htm',
  PADD5: 'https://www.eia.gov/dnav/pet/pet_stoc_wstk_dcu_r50_w.htm',
  API_DOCS: 'https://www.eia.gov/opendata/browser/petroleum/sum/sndw',
};

// Time range options for PADD charts
const TIME_RANGES = [
  { id: '3m', label: '3 Months', weeks: 13 },
  { id: '6m', label: '6 Months', weeks: 26 },
  { id: '1y', label: '1 Year', weeks: 52 },
];

/**
 * Inventory drill-down with EIA data integration
 */
export const InventoryDrillDown = () => {
  const [activeTab, setActiveTab] = useState('stocks');
  const [paddTimeRange, setPaddTimeRange] = useState('3m');
  const { distillateStocks, paddBreakdown, loading, hasApiKey, refresh, error } = useEIAData();

  // Use live data if available, otherwise sample data
  const data = distillateStocks && distillateStocks.length > 0 ? distillateStocks : sampleEIAData;

  const tabs = [
    { id: 'stocks', label: 'US Stocks', icon: <Database size={14} /> },
    { id: 'padd', label: 'Regional', icon: <MapPin size={14} /> },
    { id: 'supply', label: 'Days of Supply', icon: <Clock size={14} /> },
  ];

  // Get current stocks - EIA data is in thousand barrels
  const currentStocks = data[0]?.distillate || sampleInventories.usDistillate.current;
  const previousStocks = data[1]?.distillate || currentStocks;
  const weeklyChange = currentStocks - previousStocks;
  
  // 5-year range reference values (in thousand barrels)
  const fiveYearAvg = 125000;
  const fiveYearLow = 104000;
  const fiveYearHigh = 148000;
  
  const vsAverage = ((currentStocks - fiveYearAvg) / fiveYearAvg * 100).toFixed(1);
  const position = Math.max(0, Math.min(100, ((currentStocks - fiveYearLow) / (fiveYearHigh - fiveYearLow) * 100))).toFixed(0);

  // Get PADD data from API or use sample
  const getPaddValue = (paddCode) => {
    if (paddBreakdown) {
      const padd = paddBreakdown.find(p => p.padd === paddCode);
      return padd?.value ? parseInt(padd.value) : null;
    }
    return null;
  };

  // Get EIA URL for a PADD code
  const getPaddUrl = (paddCode) => {
    const urlMap = {
      [EIA_AREAS.PADD1]: EIA_URLS.PADD1,
      [EIA_AREAS.PADD2]: EIA_URLS.PADD2,
      [EIA_AREAS.PADD3]: EIA_URLS.PADD3,
      [EIA_AREAS.PADD4]: EIA_URLS.PADD4,
      [EIA_AREAS.PADD5]: EIA_URLS.PADD5,
    };
    return urlMap[paddCode] || EIA_URLS.WEEKLY_STOCKS;
  };

  // Get the number of weeks to display based on selected range
  const selectedWeeks = TIME_RANGES.find(r => r.id === paddTimeRange)?.weeks || 13;

  // Prepare PADD chart data with the selected time range
  const paddChartData = useMemo(() => {
    if (!paddBreakdown) {
      return [];
    }
    
    return paddBreakdown.map(padd => {
      const history = padd.history || [];
      const slicedHistory = history.slice(0, selectedWeeks).reverse();
      
      return {
        ...padd,
        chartData: slicedHistory.map(item => ({
          week: item.week.slice(5), // MM-DD format
          value: item.value / 1000, // Convert to MMbbl
          fullDate: item.week,
        })),
      };
    });
  }, [paddBreakdown, selectedWeeks]);

  const padd1Value = getPaddValue(EIA_AREAS.PADD1) || sampleInventories.padd1.current;
  const padd3Value = getPaddValue(EIA_AREAS.PADD3) || sampleInventories.padd3.current;

  // Format chart data - show changes in thousand barrels
  const chartData = data.slice(0, 12).map(item => ({
    ...item,
    week: item.week ? item.week.slice(5) : '', // Show MM-DD format
    change: item.change / 1000, // Convert to millions for display
  })).reverse();

  return (
    <div style={styles.container}>
      {/* API Status Indicator */}
      {hasApiKey ? (
        <div style={styles.apiSuccess}>
          <CheckCircle size={16} />
          <span>Live EIA Data • Last report: {data[0]?.week || 'N/A'}</span>
          <a 
            href={EIA_URLS.WEEKLY_STOCKS} 
            target="_blank" 
            rel="noopener noreferrer"
            style={styles.verifyLink}
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={12} />
            Verify Data
          </a>
        </div>
      ) : (
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
              <div style={styles.weeklyChange}>
                Weekly Change: 
                <span style={{ 
                  color: weeklyChange >= 0 ? theme.colors.semantic.bullish : theme.colors.semantic.bearish,
                  marginLeft: '8px'
                }}>
                  {weeklyChange >= 0 ? '+' : ''}{(weeklyChange / 1000).toFixed(2)} MMbbl
                </span>
              </div>
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
          <h3 style={styles.chartTitle}>Weekly Stock Changes (MMbbl)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis dataKey="week" stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 10 }} />
              <YAxis 
                stroke={theme.colors.text.muted} 
                tick={{ fill: theme.colors.text.muted, fontSize: 11 }}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
                formatter={(value) => [`${value.toFixed(2)} MMbbl`, 'Change']}
              />
              <Bar 
                dataKey="change" 
                fill={theme.colors.accent.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stock Level Chart */}
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>Stock Level Trend (MMbbl)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.slice(0, 12).map(d => ({
              ...d,
              week: d.week ? d.week.slice(5) : '',
              level: d.distillate / 1000
            })).reverse()} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis dataKey="week" stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 10 }} />
              <YAxis 
                stroke={theme.colors.text.muted} 
                tick={{ fill: theme.colors.text.muted, fontSize: 11 }}
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
                formatter={(value) => [`${value.toFixed(1)} MMbbl`, 'Stocks']}
              />
              <Line 
                type="monotone" 
                dataKey="level" 
                stroke={theme.colors.accent.secondary}
                strokeWidth={2}
                dot={{ fill: theme.colors.accent.secondary, r: 3 }}
              />
            </LineChart>
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
        {/* Time Range Selector */}
        <div style={styles.timeRangeSelector}>
          <span style={styles.timeRangeLabel}>Time Range:</span>
          <div style={styles.timeRangeButtons}>
            {TIME_RANGES.map(range => (
              <button
                key={range.id}
                style={{
                  ...styles.timeRangeButton,
                  ...(paddTimeRange === range.id ? styles.timeRangeButtonActive : {}),
                }}
                onClick={() => setPaddTimeRange(range.id)}
              >
                {range.label}
              </button>
            ))}
          </div>
          <div style={styles.paddDataStatus}>
            <span style={{
              ...styles.paddSourceBadge,
              background: hasApiKey && paddBreakdown ? `${theme.colors.semantic.bullish}20` : `${theme.colors.semantic.warning}20`,
              color: hasApiKey && paddBreakdown ? theme.colors.semantic.bullish : theme.colors.semantic.warning,
            }}>
              {hasApiKey && paddBreakdown ? '● LIVE EIA DATA' : '○ SAMPLE DATA'}
            </span>
          </div>
        </div>

        {/* PADD Charts Grid */}
        {paddChartData.length > 0 ? (
          <div style={styles.paddChartsGrid}>
            {paddChartData.map((padd) => {
              const currentValue = padd.value && padd.value > 0 ? (padd.value / 1000).toFixed(1) : 'N/A';
              const chartValues = padd.chartData.map(d => d.value);
              const hasChartData = chartValues.length > 0;
              const minValue = hasChartData ? Math.min(...chartValues) * 0.95 : 0;
              const maxValue = hasChartData ? Math.max(...chartValues) * 1.05 : 100;
              
              return (
                <div key={padd.padd} style={styles.paddChartCard}>
                  <div style={styles.paddChartHeader}>
                    <div>
                      <div style={styles.paddChartName}>{padd.name}</div>
                      <div style={styles.paddChartValue}>{currentValue} MMbbl</div>
                    </div>
                    <a 
                      href={getPaddUrl(padd.padd)} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={styles.paddVerifyLink}
                    >
                      <ExternalLink size={10} /> Verify
                    </a>
                  </div>
                  {hasChartData ? (
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={padd.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`gradient-${padd.padd}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={theme.colors.accent.primary} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={theme.colors.accent.primary} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
                      <XAxis 
                        dataKey="week" 
                        stroke={theme.colors.text.muted} 
                        tick={{ fill: theme.colors.text.muted, fontSize: 9 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis 
                        stroke={theme.colors.text.muted}
                        tick={{ fill: theme.colors.text.muted, fontSize: 9 }}
                        domain={[minValue, maxValue]}
                        tickFormatter={(v) => v.toFixed(0)}
                      />
                      <Tooltip 
                        contentStyle={{
                          background: theme.colors.background.primary,
                          border: `1px solid ${theme.colors.border.default}`,
                          borderRadius: theme.radius.md,
                          fontSize: '12px',
                        }}
                        formatter={(value) => [`${value.toFixed(2)} MMbbl`, 'Stocks']}
                        labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke={theme.colors.accent.primary}
                        strokeWidth={2}
                        fill={`url(#gradient-${padd.padd})`}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  ) : (
                    <div style={styles.noChartData}>Loading chart data...</div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Fallback: Original card view when no historical data */
          <div style={styles.paddGrid}>
            <div style={styles.paddCard}>
              <div style={styles.paddHeader}>
                <span style={styles.paddName}>PADD 1 - East Coast</span>
                <span style={{ 
                  ...styles.paddStatus,
                  color: padd1Value < 25000 
                    ? theme.colors.semantic.bearish 
                    : theme.colors.semantic.neutral
                }}>
                  {padd1Value < 25000 ? 'TIGHT' : 'NORMAL'}
                </span>
              </div>
              <div style={styles.paddValue}>{(padd1Value / 1000).toFixed(1)} MMbbl</div>
              <div style={styles.paddNote}>Critical region for heating oil. Watch in winter.</div>
            </div>
            <div style={styles.paddCard}>
              <div style={styles.paddHeader}>
                <span style={styles.paddName}>PADD 3 - Gulf Coast</span>
                <span style={{ ...styles.paddStatus, color: theme.colors.semantic.neutral }}>NORMAL</span>
              </div>
              <div style={styles.paddValue}>{(padd3Value / 1000).toFixed(1)} MMbbl</div>
              <div style={styles.paddNote}>Refining hub. Export-driven draws.</div>
            </div>
          </div>
        )}

        {/* ARA Europe Card - Always sample data */}
        <div style={styles.paddAraSection}>
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
            <div style={styles.paddSourceRow}>
              <span style={{
                ...styles.paddSourceBadge,
                background: `${theme.colors.semantic.warning}20`,
                color: theme.colors.semantic.warning,
              }}>
                ○ SAMPLE
              </span>
            </div>
            <div style={styles.paddNote}>ARA requires IES/PJK subscription. Amsterdam-Rotterdam-Antwerp hub.</div>
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
  apiSuccess: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    background: `${theme.colors.semantic.bullish}15`,
    borderRadius: theme.radius.md,
    marginBottom: '16px',
    color: theme.colors.semantic.bullish,
    fontSize: theme.fontSizes.sm,
  },
  verifyLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginLeft: 'auto',
    padding: '4px 8px',
    background: `${theme.colors.accent.primary}20`,
    borderRadius: theme.radius.sm,
    color: theme.colors.accent.primary,
    fontSize: '10px',
    fontWeight: theme.fontWeights.medium,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  weeklyChange: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginTop: '8px',
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
  paddSourceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  paddSourceBadge: {
    fontSize: '10px',
    fontWeight: theme.fontWeights.semibold,
    padding: '2px 8px',
    borderRadius: theme.radius.full,
    letterSpacing: '0.5px',
  },
  paddVerifyLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    fontSize: '10px',
    color: theme.colors.accent.primary,
    textDecoration: 'none',
    padding: '2px 6px',
    borderRadius: theme.radius.sm,
    background: `${theme.colors.accent.primary}10`,
    transition: 'background 0.2s',
  },
  // Time Range Selector styles
  timeRangeSelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
    padding: '12px 16px',
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
  },
  timeRangeLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    fontWeight: theme.fontWeights.medium,
  },
  timeRangeButtons: {
    display: 'flex',
    gap: '4px',
  },
  timeRangeButton: {
    padding: '6px 12px',
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.medium,
    color: theme.colors.text.secondary,
    background: 'transparent',
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.radius.sm,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  timeRangeButtonActive: {
    background: theme.colors.accent.primary,
    color: theme.colors.text.inverse || '#000',
    borderColor: theme.colors.accent.primary,
  },
  paddDataStatus: {
    display: 'flex',
    alignItems: 'center',
  },
  // PADD Charts Grid styles
  paddChartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  paddChartCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
  },
  noChartData: {
    height: '150px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.colors.text.muted,
    fontSize: theme.fontSizes.sm,
  },
  paddChartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  paddChartName: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
    marginBottom: '4px',
  },
  paddChartValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.accent.primary,
    fontFamily: theme.fonts.mono,
  },
  paddAraSection: {
    maxWidth: '400px',
    marginBottom: '24px',
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
