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

### Complete Data Source Inventory

| Data Type | Source | Method | Status | Link | Automation Recommendation |
|-----------|--------|--------|--------|------|---------------------------|
| **Brent Crude Price** | FRED | API ✅ | LIVE | [DCOILBRENTEU](https://fred.stlouisfed.org/series/DCOILBRENTEU) | ✅ Fully automated |
| **WTI Crude Price** | FRED | API ✅ | LIVE | [DCOILWTICO](https://fred.stlouisfed.org/series/DCOILWTICO) | ✅ Fully automated |
| **ULSD Gulf Coast** | FRED | API ✅ | LIVE | [DDFUELUSGULF](https://fred.stlouisfed.org/series/DDFUELUSGULF) | ✅ Fully automated |
| **ULSD NY Harbor** | FRED | API ✅ | LIVE | [DDFUELNYH](https://fred.stlouisfed.org/series/DDFUELNYH) | ✅ Fully automated |
| **US Distillate Stocks (Total)** | EIA | API ✅ | LIVE | [EIA Petroleum](https://www.eia.gov/dnav/pet/pet_sum_sndw_dcus_nus_w.htm) | ✅ Fully automated |
| **PADD Regional Stocks** | EIA | API ✅ | LIVE | [EIA PADD Data](https://www.eia.gov/petroleum/supply/weekly/) | ✅ Fully automated |
| **ICE Gasoil Price** | Sample | Static | SAMPLE | [ICE Gasoil](https://www.theice.com/products/34361119/Low-Sulphur-Gasoil-Futures) | Use [ICE Connect API](https://www.theice.com/market-data/connectivity-and-feeds) ($) or [Refinitiv Eikon](https://www.refinitiv.com/en/products/eikon-trading-software) ($) |
| **Price Correlations** | Calculated | API ✅ | LIVE | — | ✅ Calculated from FRED data |
| **Volatility Metrics** | Calculated | API ✅ | LIVE | — | ✅ Calculated from FRED data |
| **Forward Curve** | Sample | Static | SAMPLE | [CME ULSD](https://www.cmegroup.com/markets/energy/refined-products/heating-oil.html) | Use [CME DataMine](https://www.cmegroup.com/market-data/datamine-api.html) ($) or [Quandl](https://data.nasdaq.com/publishers/cme) ($) |
| **Crack Spreads** | Calculated | API ✅ | LIVE | — | ✅ Calculated from FRED prices |
| **Timespreads** | Sample | Static | SAMPLE | [ICE/CME](https://www.theice.com/products/219/Brent-Crude-Futures) | Use exchange APIs above for M1/M2 contracts |
| **ARA Stocks (Europe)** | Sample | Static | SAMPLE | [Insights Global](https://www.insights-global.com/) | [Insights Global API](https://www.insights-global.com/api/) ($) or [Argus Media](https://www.argusmedia.com/) ($) |
| **Refiner Stock Prices** | Sample | Static | SAMPLE | [Yahoo Finance](https://finance.yahoo.com/quote/VLO) | Use [Yahoo Finance API](https://pypi.org/project/yfinance/) (Free) or [Alpha Vantage](https://www.alphavantage.co/) (Free tier) |
| **News Feed** | Sample | Static | SAMPLE | — | [NewsAPI](https://newsapi.org/) (Free tier) with energy keywords, or [Refinitiv News](https://www.refinitiv.com/) ($) |
| **Seasonality Data** | Sample | Static | SAMPLE | — | Calculate from 5-year EIA historical (already available via API) |
| **Demand Indicators** | Sample | Static | SAMPLE | — | [FRED Trucking](https://fred.stlouisfed.org/series/TRUCKD11) (Free), [EIA Product Supplied](https://www.eia.gov/dnav/pet/pet_cons_psup_dc_nus_mbblpd_w.htm) (Free API) |

### Status Legend
- **LIVE**: Real-time data from API, updates automatically
- **SAMPLE**: Static illustrative data, needs API integration for production

### Data Update Frequencies

| Source | Update Frequency | Best Time to Refresh |
|--------|------------------|---------------------|
| FRED Prices | Daily (1-day delay) | After 6 PM ET |
| EIA Weekly Stocks | Weekly | Wednesday 10:30 AM ET |
| ICE/CME Futures | Real-time (with subscription) | Market hours |
| Insights Global ARA | Weekly | Thursday |

### Recommended Path to Full Automation

**Phase 1 - Free APIs (Current)**
- ✅ FRED for crude & diesel spot prices
- ✅ EIA for US inventory data
- ✅ Calculated metrics (cracks, correlations, volatility)

**Phase 2 - Low-Cost Additions**
- Yahoo Finance API for refiner equities (free)
- NewsAPI for market news (free tier: 100 req/day)
- Calculate seasonality from EIA 5-year history

**Phase 3 - Premium Data (Production)**
- ICE Connect or CME DataMine for real-time futures (~$500-2000/mo)
- Refinitiv/Bloomberg for comprehensive market data (~$1500-2000/mo)
- Insights Global for European inventory data (~$500/mo)

### API Configuration

Current `.env` requirements:
```env
REACT_APP_EIA_API_KEY=your_eia_key_here
REACT_APP_FRED_API_KEY=your_fred_key_here
```

**Getting Free API Keys:**
- **EIA**: [eia.gov/opendata/register](https://www.eia.gov/opendata/register.php) (instant)
- **FRED**: [fred.stlouisfed.org/docs/api/api_key](https://fred.stlouisfed.org/docs/api/api_key.html) (instant)

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
