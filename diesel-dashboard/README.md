# Diesel Market Analysis Dashboard

A professional trading desk tool for monitoring diesel/gasoil market fundamentals with drill-down capabilities into underlying drivers.

![Dashboard Preview](docs/preview.png)

## Features

### Main Dashboard
- **Benchmark Prices**: ICE Brent, WTI, ICE Gasoil, NYMEX ULSD with real-time updates
- **Crack Spreads**: Gasoil/Brent, ULSD/WTI, 3-2-1 refinery margins
- **Timespreads**: M1/M2 structure with backwardation/contango signals
- **News Feed**: Market intelligence with impact tagging

### Drill-Down Panels
Click any metric to access detailed analysis:

| Panel | What It Shows | Why It Matters |
|-------|--------------|----------------|
| **Price** | Historical charts, correlations, volatility | Context for current levels |
| **Crack Spreads** | Margin history, refiner stocks, seasonality | Refinery economics & equity plays |
| **Inventories** | EIA data, PADD breakdown, days of supply | Supply/demand balance |
| **Timespreads** | Forward curve, storage economics | Market structure signals |
| **Arbitrage** | Regional price diffs, freight, trade flows | Where product is moving |
| **Demand** | Trucking, weather, industrial indicators | Demand-side drivers |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/diesel-dashboard.git
cd diesel-dashboard

# Install dependencies
npm install

# Add your API keys (see Configuration below)
cp .env.example .env

# Start development server
npm start
```

## Configuration

### API Keys Required

Create a `.env` file in the root directory:

```env
REACT_APP_EIA_API_KEY=your_eia_key_here
REACT_APP_FRED_API_KEY=your_fred_key_here
```

**Getting API Keys:**
- **EIA**: Free at [eia.gov/opendata](https://www.eia.gov/opendata/register.php)
- **FRED**: Free at [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html)

### Without API Keys
The dashboard works without API keys using sample data. Live data features will be disabled.

## Project Structure

```
src/
├── components/
│   ├── Dashboard/           # Main dashboard components
│   │   ├── Overview.jsx     # Main dashboard layout
│   │   ├── PriceCard.jsx    # Individual price displays
│   │   ├── CrackCard.jsx    # Crack spread displays
│   │   ├── TimespreadCard.jsx
│   │   └── NewsFeed.jsx
│   │
│   ├── DrillDowns/          # Detailed analysis modals
│   │   ├── PriceDrillDown.jsx
│   │   ├── CrackDrillDown.jsx
│   │   ├── InventoryDrillDown.jsx
│   │   ├── TimespreadDrillDown.jsx
│   │   ├── ArbDrillDown.jsx
│   │   └── DemandDrillDown.jsx
│   │
│   ├── Charts/              # Reusable chart components
│   │   ├── PriceChart.jsx
│   │   ├── SeasonalChart.jsx
│   │   └── ForwardCurve.jsx
│   │
│   └── Common/              # Shared UI components
│       ├── Modal.jsx
│       ├── Card.jsx
│       ├── Tabs.jsx
│       └── Tooltip.jsx
│
├── hooks/                   # Custom React hooks
│   ├── useMarketData.js     # Main data fetching
│   ├── useEIAData.js        # EIA API integration
│   └── useFREDData.js       # FRED API integration
│
├── utils/                   # Utility functions
│   ├── calculations.js      # Crack spreads, conversions
│   ├── constants.js         # Thresholds, endpoints
│   └── formatters.js        # Number/date formatting
│
├── data/                    # Sample/fallback data
│   └── sampleData.js
│
└── styles/                  # Styling
    ├── theme.js             # Design tokens
    └── globals.css
```

## Key Formulas

The dashboard calculates these metrics automatically:

```javascript
// Crack Spreads (refining margins)
gasoilCrack = (gasoil_$/mt / 7.45) - brent_$/bbl
ulsdCrack = (ulsd_$/gal * 42) - wti_$/bbl
crack321 = ((2 * rbob * 42) + (ulsd * 42) - (3 * wti)) / 3

// Unit Conversions
barrels_per_mt = 7.45  // for gasoil
gallons_per_bbl = 42

// Days of Supply
daysOfSupply = stocks_bbl / (weekly_demand / 7)
```

## Key Thresholds

### Crack Spreads
| Level | Signal | Meaning |
|-------|--------|---------|
| >$25/bbl | Very Strong | Refiners maximizing runs |
| $15-25 | Healthy | Normal profitability |
| $10-15 | Moderate | Marginal economics |
| <$10 | Weak | Run cuts likely |

### US Distillate Stocks
| Level | Signal |
|-------|--------|
| <110mm bbl | Very tight |
| 110-130mm | Tight |
| 130-150mm | Balanced |
| >150mm | Oversupplied |

### Timespreads
| Structure | Signal |
|-----------|--------|
| Backwardation >$3 | Very tight market |
| Backwardation $1-3 | Healthy |
| Flat ±$0.50 | Balanced |
| Contango >$1 | Oversupplied |

## Data Sources

| Source | Data | Update Frequency |
|--------|------|------------------|
| EIA | US inventories, production, demand | Weekly (Wed 10:30 ET) |
| FRED | Economic indicators | Varies |
| Insights Global | ARA stocks | Weekly |
| ICE/NYMEX | Futures prices | Real-time |

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/new-drilldown`)
3. Commit changes (`git commit -am 'Add new drilldown'`)
4. Push to branch (`git push origin feature/new-drilldown`)
5. Open a Pull Request

## Adding New Drill-Downs

1. Create component in `src/components/DrillDowns/`
2. Add to drill-down registry in `src/utils/constants.js`
3. Import and add case in `Overview.jsx`
4. Add any new data hooks in `src/hooks/`

## License

MIT

## Acknowledgments

Built for diesel market analysis training. Data sources include EIA, FRED, and various market data providers.

---

**Disclaimer**: This tool is for educational and analytical purposes. Always verify data with primary sources before making trading decisions.
