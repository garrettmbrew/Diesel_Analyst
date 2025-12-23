import React, { useState } from 'react';
import { theme } from '../../styles/theme';
import { Tabs, TabPanel } from '../Common/Tabs';
import { sampleArbs } from '../../data/sampleData';
import { ARB_ROUTES } from '../../utils/constants';
import { Ship, DollarSign, TrendingUp, ExternalLink, AlertCircle } from 'lucide-react';

// Data source URLs for verification
const DATA_URLS = {
  PLATTS_FREIGHT: 'https://www.spglobal.com/commodityinsights/en/our-methodology/price-assessments/oil/tanker-freight-assessments',
  ARGUS_FREIGHT: 'https://www.argusmedia.com/en/oil-products/argus-freight',
};

/**
 * Arbitrage drill-down with regional spreads and freight economics
 */
export const ArbDrillDown = () => {
  const [activeTab, setActiveTab] = useState('economics');

  const tabs = [
    { id: 'economics', label: 'Arb Economics', icon: <DollarSign size={14} /> },
    { id: 'routes', label: 'Trade Routes', icon: <Ship size={14} /> },
    { id: 'flows', label: 'Trade Flows', icon: <TrendingUp size={14} /> },
  ];

  const getStatusColor = (status) => {
    if (status === 'open') return theme.colors.semantic.bullish;
    if (status === 'marginal') return theme.colors.semantic.warning;
    return theme.colors.semantic.bearish;
  };

  const getStatusLabel = (status) => {
    if (status === 'open') return 'OPEN';
    if (status === 'marginal') return 'MARGINAL';
    return 'CLOSED';
  };

  return (
    <div style={styles.container}>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <TabPanel isActive={activeTab === 'economics'}>
        {/* Data Source Header */}
        <div style={styles.dataSourceHeader}>
          <div style={styles.sourceBadgeRow}>
            <span style={{
              ...styles.sourceBadge,
              background: `${theme.colors.semantic.warning}20`,
              color: theme.colors.semantic.warning,
            }}>
              <AlertCircle size={10} style={{ marginRight: '4px' }} />
              SAMPLE DATA
            </span>
            <span style={styles.sourceNote}>Live arb data requires Platts/Argus subscription</span>
          </div>
          <div style={styles.verifyLinks}>
            <a href={DATA_URLS.PLATTS_FREIGHT} target="_blank" rel="noopener noreferrer" style={styles.verifyLink}>
              <ExternalLink size={10} /> Platts Freight
            </a>
            <a href={DATA_URLS.ARGUS_FREIGHT} target="_blank" rel="noopener noreferrer" style={styles.verifyLink}>
              <ExternalLink size={10} /> Argus Freight
            </a>
          </div>
        </div>

        {/* Current Arb Status */}
        <div style={styles.arbGrid}>
          <div style={styles.arbCard}>
            <div style={styles.arbHeader}>
              <span style={styles.arbRoute}>USGC → NW Europe</span>
              <span style={{ ...styles.arbStatus, color: getStatusColor(sampleArbs.usgcNwe.status) }}>
                {getStatusLabel(sampleArbs.usgcNwe.status)}
              </span>
            </div>
            <div style={styles.arbValue}>${sampleArbs.usgcNwe.value.toFixed(2)}/mt</div>
            <div style={styles.arbDetails}>
              <span>Freight: ${sampleArbs.usgcNwe.freight}/mt</span>
              <span>Transit: {sampleArbs.usgcNwe.transit} days</span>
            </div>
            <div style={styles.arbNote}>Primary US export route. Currently uneconomic.</div>
          </div>

          <div style={styles.arbCard}>
            <div style={styles.arbHeader}>
              <span style={styles.arbRoute}>USGC → Latin America</span>
              <span style={{ ...styles.arbStatus, color: getStatusColor(sampleArbs.usgcLatam.status) }}>
                {getStatusLabel(sampleArbs.usgcLatam.status)}
              </span>
            </div>
            <div style={{ ...styles.arbValue, color: theme.colors.semantic.bullish }}>
              +${sampleArbs.usgcLatam.value.toFixed(2)}/mt
            </div>
            <div style={styles.arbDetails}>
              <span>Freight: ${sampleArbs.usgcLatam.freight}/mt</span>
              <span>Transit: {sampleArbs.usgcLatam.transit} days</span>
            </div>
            <div style={styles.arbNote}>Short-haul, usually open. Key export destination.</div>
          </div>

          <div style={styles.arbCard}>
            <div style={styles.arbHeader}>
              <span style={styles.arbRoute}>Asia → Europe</span>
              <span style={{ ...styles.arbStatus, color: getStatusColor(sampleArbs.asiaEurope.status) }}>
                {getStatusLabel(sampleArbs.asiaEurope.status)}
              </span>
            </div>
            <div style={styles.arbValue}>${sampleArbs.asiaEurope.value.toFixed(2)}/mt</div>
            <div style={styles.arbDetails}>
              <span>Freight: ${sampleArbs.asiaEurope.freight}/mt</span>
              <span>Transit: {sampleArbs.asiaEurope.transit} days</span>
            </div>
            <div style={styles.arbNote}>Long-haul, rarely economic. Suez routing.</div>
          </div>

          <div style={styles.arbCard}>
            <div style={styles.arbHeader}>
              <span style={styles.arbRoute}>Middle East → Europe</span>
              <span style={{ ...styles.arbStatus, color: getStatusColor(sampleArbs.meEurope.status) }}>
                {getStatusLabel(sampleArbs.meEurope.status)}
              </span>
            </div>
            <div style={{ ...styles.arbValue, color: theme.colors.semantic.warning }}>
              +${sampleArbs.meEurope.value.toFixed(2)}/mt
            </div>
            <div style={styles.arbDetails}>
              <span>Freight: ${sampleArbs.meEurope.freight}/mt</span>
              <span>Transit: {sampleArbs.meEurope.transit} days</span>
            </div>
            <div style={styles.arbNote}>Key swing route. Watch Saudi/UAE flows.</div>
          </div>
        </div>

        {/* Arb Formula */}
        <div style={styles.formulaBox}>
          <h4 style={styles.formulaTitle}>Arb Economics Formula</h4>
          <div style={styles.formula}>
            <code style={styles.formulaCode}>
              Arb Value = Destination Price − (Origin FOB + Freight + Insurance + Port Costs)
            </code>
          </div>
          <p style={styles.formulaDesc}>
            Positive value = profitable to ship. Typically need +$2-3/mt minimum to cover execution risk and timing.
          </p>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'routes'}>
        <div style={styles.routesList}>
          {ARB_ROUTES.map((route) => (
            <div key={route.id} style={styles.routeCard}>
              <div style={styles.routeHeader}>
                <div style={styles.routePath}>
                  <span style={styles.routeOrigin}>{route.origin.name}</span>
                  <span style={styles.routeArrow}>→</span>
                  <span style={styles.routeDest}>{route.destination.name}</span>
                </div>
              </div>
              <div style={styles.routeStats}>
                <div style={styles.routeStat}>
                  <span style={styles.routeStatLabel}>Typical Freight</span>
                  <span style={styles.routeStatValue}>${route.typicalFreight.low}-${route.typicalFreight.high}/mt</span>
                </div>
                <div style={styles.routeStat}>
                  <span style={styles.routeStatLabel}>Transit Time</span>
                  <span style={styles.routeStatValue}>{route.transitDays.low}-{route.transitDays.high} days</span>
                </div>
              </div>
              <div style={styles.routeNote}>{route.notes}</div>
            </div>
          ))}
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'flows'}>
        <div style={styles.flowsContainer}>
          <div style={styles.flowSection}>
            <h4 style={styles.flowTitle}>Key Export Regions</h4>
            <div style={styles.flowGrid}>
              <div style={styles.flowCard}>
                <div style={styles.flowRegion}>US Gulf Coast</div>
                <div style={styles.flowVolume}>~1.5 MMbbl/day</div>
                <div style={styles.flowDesc}>Largest diesel exporter globally. Sends to LatAm, Europe.</div>
              </div>
              <div style={styles.flowCard}>
                <div style={styles.flowRegion}>Middle East</div>
                <div style={styles.flowVolume}>~1.2 MMbbl/day</div>
                <div style={styles.flowDesc}>Saudi, UAE, Kuwait. Sends to Asia, Africa, Europe.</div>
              </div>
              <div style={styles.flowCard}>
                <div style={styles.flowRegion}>Russia</div>
                <div style={styles.flowVolume}>~0.8 MMbbl/day</div>
                <div style={styles.flowDesc}>Post-sanctions: redirected from Europe to Asia, Turkey, Africa.</div>
              </div>
            </div>
          </div>

          <div style={styles.flowSection}>
            <h4 style={styles.flowTitle}>Key Import Regions</h4>
            <div style={styles.flowGrid}>
              <div style={styles.flowCard}>
                <div style={styles.flowRegion}>Europe (ARA)</div>
                <div style={styles.flowVolume}>~1.0 MMbbl/day</div>
                <div style={styles.flowDesc}>Structural deficit. Lost Russian supply, needs US/ME barrels.</div>
              </div>
              <div style={styles.flowCard}>
                <div style={styles.flowRegion}>Latin America</div>
                <div style={styles.flowVolume}>~0.6 MMbbl/day</div>
                <div style={styles.flowDesc}>Brazil, Mexico, Chile. Growing demand, limited refining.</div>
              </div>
              <div style={styles.flowCard}>
                <div style={styles.flowRegion}>Africa</div>
                <div style={styles.flowVolume}>~0.4 MMbbl/day</div>
                <div style={styles.flowDesc}>Nigeria, South Africa. Minimal local refining capacity.</div>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>Why Trade Flows Matter</h4>
          <p style={styles.infoText}>
            Understanding where diesel physically moves helps anticipate regional price dislocations. When arbs close, 
            regions become isolated and prices can diverge. Post-2022, Russian diesel that used to flow to Europe now 
            goes to Turkey, Africa, and Asia — creating longer supply chains and more volatile regional spreads.
          </p>
        </div>
      </TabPanel>
    </div>
  );
};

const styles = {
  container: {},
  dataSourceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
    padding: '12px 16px',
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
  },
  sourceBadgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  sourceBadge: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '10px',
    fontWeight: theme.fontWeights.semibold,
    padding: '4px 10px',
    borderRadius: theme.radius.full,
    letterSpacing: '0.5px',
  },
  sourceNote: {
    fontSize: '11px',
    color: theme.colors.text.muted,
    fontStyle: 'italic',
  },
  verifyLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
  arbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  arbCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
  },
  arbHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  arbRoute: {
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  arbStatus: {
    fontSize: theme.fontSizes.xs,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '1px',
  },
  arbValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
    marginBottom: '12px',
  },
  arbDetails: {
    display: 'flex',
    gap: '16px',
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '12px',
  },
  arbNote: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    fontStyle: 'italic',
  },
  formulaBox: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    borderLeft: `3px solid ${theme.colors.accent.primary}`,
  },
  formulaTitle: {
    margin: '0 0 12px 0',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  formula: {
    background: theme.colors.background.primary,
    borderRadius: theme.radius.sm,
    padding: '12px',
    marginBottom: '12px',
  },
  formulaCode: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.accent.primary,
    fontFamily: theme.fonts.mono,
  },
  formulaDesc: {
    margin: 0,
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  routesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  routeCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
  },
  routeHeader: {
    marginBottom: '16px',
  },
  routePath: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  routeOrigin: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.accent.primary,
  },
  routeArrow: {
    fontSize: theme.fontSizes.lg,
    color: theme.colors.text.disabled,
  },
  routeDest: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.accent.tertiary,
  },
  routeStats: {
    display: 'flex',
    gap: '32px',
    marginBottom: '12px',
  },
  routeStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  routeStatLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
  },
  routeStatValue: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  routeNote: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  flowsContainer: {
    marginBottom: '24px',
  },
  flowSection: {
    marginBottom: '24px',
  },
  flowTitle: {
    margin: '0 0 16px 0',
    fontSize: theme.fontSizes.sm,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.muted,
    letterSpacing: '1px',
    textTransform: 'uppercase',
  },
  flowGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  flowCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
  },
  flowRegion: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
    marginBottom: '4px',
  },
  flowVolume: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.accent.primary,
    fontFamily: theme.fonts.mono,
    marginBottom: '8px',
  },
  flowDesc: {
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

export default ArbDrillDown;
