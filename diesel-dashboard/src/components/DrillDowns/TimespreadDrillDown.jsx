import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { theme } from '../../styles/theme';
import { Tabs, TabPanel } from '../Common/Tabs';
import { sampleForwardCurve } from '../../data/sampleData';
import { TrendingUp, Layers, Calculator } from 'lucide-react';

/**
 * Timespread drill-down with forward curve and storage economics
 */
export const TimespreadDrillDown = () => {
  const [activeTab, setActiveTab] = useState('curve');

  const tabs = [
    { id: 'curve', label: 'Forward Curve', icon: <TrendingUp size={14} /> },
    { id: 'structure', label: 'Structure', icon: <Layers size={14} /> },
    { id: 'storage', label: 'Storage Econ', icon: <Calculator size={14} /> },
  ];

  return (
    <div style={styles.container}>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <TabPanel isActive={activeTab === 'curve'}>
        <div style={styles.chartContainer}>
          <h3 style={styles.chartTitle}>ICE Gasoil Forward Curve ($/mt)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sampleForwardCurve} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.colors.border.default} />
              <XAxis dataKey="month" stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} />
              <YAxis stroke={theme.colors.text.muted} tick={{ fill: theme.colors.text.muted, fontSize: 11 }} domain={['dataMin - 20', 'dataMax + 10']} />
              <Tooltip 
                contentStyle={{
                  background: theme.colors.background.primary,
                  border: `1px solid ${theme.colors.border.default}`,
                  borderRadius: theme.radius.md,
                }}
              />
              <Area 
                type="monotone" 
                dataKey="gasoil" 
                stroke={theme.colors.accent.primary} 
                fill={`${theme.colors.accent.primary}20`}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Key Spreads */}
        <div style={styles.spreadGrid}>
          <div style={styles.spreadCard}>
            <div style={styles.spreadLabel}>M1/M2</div>
            <div style={{ ...styles.spreadValue, color: theme.colors.semantic.warning }}>+$2.75</div>
            <div style={styles.spreadStatus}>Backwardation</div>
          </div>
          <div style={styles.spreadCard}>
            <div style={styles.spreadLabel}>M1/M3</div>
            <div style={{ ...styles.spreadValue, color: theme.colors.semantic.warning }}>+$8.25</div>
            <div style={styles.spreadStatus}>Backwardation</div>
          </div>
          <div style={styles.spreadCard}>
            <div style={styles.spreadLabel}>M1/M6</div>
            <div style={{ ...styles.spreadValue, color: theme.colors.semantic.warning }}>+$23.50</div>
            <div style={styles.spreadStatus}>Backwardation</div>
          </div>
          <div style={styles.spreadCard}>
            <div style={styles.spreadLabel}>M1/M12</div>
            <div style={{ ...styles.spreadValue, color: theme.colors.text.primary }}>+$0.50</div>
            <div style={styles.spreadStatus}>Flat</div>
          </div>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'structure'}>
        <div style={styles.structureExplainer}>
          <div style={styles.structureRow}>
            <div style={{ ...styles.structureCard, borderColor: theme.colors.semantic.warning }}>
              <div style={styles.structureTitle}>BACKWARDATION</div>
              <div style={styles.structureFormula}>Front Month &gt; Deferred</div>
              <div style={styles.structureDesc}>
                <p><strong>What it signals:</strong> Tight market. Buyers paying premium for immediate delivery.</p>
                <p><strong>Causes:</strong> Low inventories, supply disruptions, strong current demand.</p>
                <p><strong>Trading implication:</strong> Rolling long positions costs money (sell high, buy low).</p>
              </div>
            </div>

            <div style={{ ...styles.structureCard, borderColor: theme.colors.accent.tertiary }}>
              <div style={styles.structureTitle}>CONTANGO</div>
              <div style={styles.structureFormula}>Front Month &lt; Deferred</div>
              <div style={styles.structureDesc}>
                <p><strong>What it signals:</strong> Oversupplied market. No urgency to buy now.</p>
                <p><strong>Causes:</strong> High inventories, weak demand, excess supply.</p>
                <p><strong>Trading implication:</strong> Rolling longs generates positive carry. Storage plays attractive.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Structure */}
        <div style={styles.currentStructure}>
          <div style={styles.currentLabel}>Current Structure</div>
          <div style={{ ...styles.currentValue, color: theme.colors.semantic.warning }}>BACKWARDATION</div>
          <div style={styles.currentDesc}>
            Front months trading at premium to deferred. Market is tight. Suggests current supply/demand 
            imbalance favoring buyers paying up for immediate delivery.
          </div>
        </div>

        <div style={styles.interpretationGrid}>
          <div style={styles.interpretCard}>
            <div style={styles.interpretLabel}>Strong Backwardation</div>
            <div style={styles.interpretValue}>&gt;$3/bbl</div>
            <div style={styles.interpretDesc}>Very tight, potential crisis</div>
          </div>
          <div style={styles.interpretCard}>
            <div style={styles.interpretLabel}>Moderate Backwardation</div>
            <div style={styles.interpretValue}>$1-3/bbl</div>
            <div style={styles.interpretDesc}>Healthy tightness</div>
          </div>
          <div style={styles.interpretCard}>
            <div style={styles.interpretLabel}>Flat</div>
            <div style={styles.interpretValue}>±$0.50/bbl</div>
            <div style={styles.interpretDesc}>Balanced market</div>
          </div>
          <div style={styles.interpretCard}>
            <div style={styles.interpretLabel}>Contango</div>
            <div style={styles.interpretValue}>&gt;$1/bbl</div>
            <div style={styles.interpretDesc}>Oversupplied, storage play</div>
          </div>
        </div>
      </TabPanel>

      <TabPanel isActive={activeTab === 'storage'}>
        <div style={styles.storageCalc}>
          <h3 style={styles.calcTitle}>Storage Economics Calculator</h3>
          
          <div style={styles.calcGrid}>
            <div style={styles.calcInput}>
              <label style={styles.calcLabel}>6-Month Contango ($/mt)</label>
              <div style={styles.calcValue}>$15.00</div>
            </div>
            <div style={styles.calcInput}>
              <label style={styles.calcLabel}>Storage Cost ($/mt/month)</label>
              <div style={styles.calcValue}>$2.50</div>
            </div>
            <div style={styles.calcInput}>
              <label style={styles.calcLabel}>Financing Cost (%/yr)</label>
              <div style={styles.calcValue}>5.0%</div>
            </div>
            <div style={styles.calcInput}>
              <label style={styles.calcLabel}>Product Price ($/mt)</label>
              <div style={styles.calcValue}>$700</div>
            </div>
          </div>

          <div style={styles.calcResults}>
            <div style={styles.resultRow}>
              <span>6-Month Storage Cost</span>
              <span style={styles.resultValue}>$15.00</span>
            </div>
            <div style={styles.resultRow}>
              <span>6-Month Financing Cost</span>
              <span style={styles.resultValue}>$17.50</span>
            </div>
            <div style={styles.resultRow}>
              <span>Insurance/Handling</span>
              <span style={styles.resultValue}>$3.00</span>
            </div>
            <div style={{ ...styles.resultRow, ...styles.resultTotal }}>
              <span>Total Carry Cost</span>
              <span style={styles.resultValue}>$35.50</span>
            </div>
            <div style={{ ...styles.resultRow, ...styles.resultFinal }}>
              <span>Contango vs Carry</span>
              <span style={{ ...styles.resultValue, color: theme.colors.semantic.bearish }}>-$20.50</span>
            </div>
          </div>

          <div style={{ ...styles.verdictBox, background: `${theme.colors.semantic.bearish}15`, borderColor: theme.colors.semantic.bearish }}>
            <div style={styles.verdictLabel}>VERDICT</div>
            <div style={{ ...styles.verdictValue, color: theme.colors.semantic.bearish }}>STORAGE UNECONOMIC</div>
            <div style={styles.verdictDesc}>
              Contango is insufficient to cover carry costs. Storage play would lose $20.50/mt over 6 months.
              Need contango &gt;$35.50/mt for storage to be profitable.
            </div>
          </div>
        </div>

        <div style={styles.infoBox}>
          <h4 style={styles.infoTitle}>When Storage Works</h4>
          <p style={styles.infoText}>
            Storage is profitable when contango exceeds total carry costs (storage + financing + insurance). 
            This typically happens during severe oversupply (e.g., COVID-19 in 2020). When profitable, traders 
            buy spot, store, and sell forward — locking in the spread. Current backwardation makes this irrelevant, 
            but understanding the economics prepares you for when conditions change.
          </p>
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
  chartTitle: {
    margin: '0 0 16px 0',
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  spreadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '12px',
  },
  spreadCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
    textAlign: 'center',
  },
  spreadLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '4px',
  },
  spreadValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    fontFamily: theme.fonts.mono,
  },
  spreadStatus: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  structureExplainer: {
    marginBottom: '24px',
  },
  structureRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  structureCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '20px',
    borderLeft: '4px solid',
  },
  structureTitle: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '2px',
    marginBottom: '8px',
    color: theme.colors.text.primary,
  },
  structureFormula: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginBottom: '16px',
    fontFamily: theme.fonts.mono,
  },
  structureDesc: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 1.6,
    '& p': {
      margin: '8px 0',
    },
  },
  currentStructure: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '24px',
    textAlign: 'center',
    marginBottom: '24px',
  },
  currentLabel: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.muted,
    marginBottom: '8px',
  },
  currentValue: {
    fontSize: theme.fontSizes['2xl'],
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '3px',
    marginBottom: '12px',
  },
  currentDesc: {
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6,
  },
  interpretationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  interpretCard: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '16px',
    textAlign: 'center',
  },
  interpretLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    marginBottom: '4px',
  },
  interpretValue: {
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  interpretDesc: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.disabled,
    marginTop: '4px',
  },
  storageCalc: {
    background: theme.colors.background.card,
    borderRadius: theme.radius.md,
    padding: '24px',
    marginBottom: '24px',
  },
  calcTitle: {
    margin: '0 0 20px 0',
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.text.primary,
  },
  calcGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  calcInput: {
    background: theme.colors.background.primary,
    borderRadius: theme.radius.sm,
    padding: '12px',
  },
  calcLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    display: 'block',
    marginBottom: '4px',
  },
  calcValue: {
    fontSize: theme.fontSizes.lg,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.text.primary,
    fontFamily: theme.fonts.mono,
  },
  calcResults: {
    borderTop: `1px solid ${theme.colors.border.default}`,
    paddingTop: '16px',
  },
  resultRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    fontSize: theme.fontSizes.sm,
    color: theme.colors.text.secondary,
  },
  resultValue: {
    fontWeight: theme.fontWeights.semibold,
    fontFamily: theme.fonts.mono,
    color: theme.colors.text.primary,
  },
  resultTotal: {
    borderTop: `1px solid ${theme.colors.border.default}`,
    marginTop: '8px',
    paddingTop: '16px',
    fontWeight: theme.fontWeights.semibold,
  },
  resultFinal: {
    background: theme.colors.background.primary,
    margin: '16px -24px -24px -24px',
    padding: '16px 24px',
    borderRadius: `0 0 ${theme.radius.md} ${theme.radius.md}`,
    fontSize: theme.fontSizes.md,
    fontWeight: theme.fontWeights.bold,
  },
  verdictBox: {
    borderRadius: theme.radius.md,
    padding: '20px',
    textAlign: 'center',
    border: '1px solid',
    marginTop: '24px',
  },
  verdictLabel: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.text.muted,
    letterSpacing: '2px',
    marginBottom: '4px',
  },
  verdictValue: {
    fontSize: theme.fontSizes.xl,
    fontWeight: theme.fontWeights.bold,
    letterSpacing: '2px',
    marginBottom: '8px',
  },
  verdictDesc: {
    fontSize: theme.fontSizes.sm,
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

export default TimespreadDrillDown;
