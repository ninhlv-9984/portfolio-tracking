# Asset-Specific Analysis Guide

Hướng dẫn điều chỉnh framework cho từng loại tài sản.
Claude đọc file này khi cần biết cách tuỳ chỉnh nội dung báo cáo theo loại tài sản.

---

## Crypto (BTC, ETH, SOL...)

### Đặc điểm
- Giao dịch 24/7, volatility cao (drawdown 50–80% là bình thường)
- On-chain data là nguồn alpha quan trọng
- Halving cycles, tokenomics ảnh hưởng supply
- Regulatory landscape đang evolving nhanh
- Self-custody là yếu tố risk management riêng biệt

### Technical Analysis — Bổ sung
- Funding rates (futures market sentiment)
- Open interest
- Liquidation levels / heatmap
- CME gaps
- Exchange inflows/outflows

### Fundamental — Focus vào
- **On-chain**: SOPR, MVRV, NVT ratio, exchange reserves, active addresses, hash rate
- **Institutional**: ETF flows (daily), corporate treasury holdings, sovereign adoption
- **Cycle**: Halving countdown, 4-year cycle position, institutional vs retail dominance
- **Regulation**: Legislation pipeline, enforcement actions, ETF approvals
- **Tokenomics**: Supply schedule, staking ratio, burn mechanisms

### Risk — Bổ sung
- Exchange hack/insolvency risk → Self-custody hardware wallet
- Smart contract risk (cho altcoins/DeFi)
- Quantum computing threat (long-term)
- Stablecoin de-peg systemic risk
- Regulatory ban risk
- Rug pull risk (cho altcoins nhỏ)

### Allocation — Lưu ý
- DCA zones nên rộng hơn stock (vì volatility cao hơn)
- Nhấn mạnh self-custody (>70% holdings nên ở hardware wallet)
- Tuyệt đối không leverage cho long-term position
- Max allocation thường 5–30% tuỳ risk profile

---

## US Stock (AAPL, GOOGL, TSLA...)

### Đặc điểm
- Giao dịch giờ market hours (pre/after hours liquidity thấp)
- Earnings quarterly là catalyst chính
- Sector rotation ảnh hưởng lớn
- Institutional ownership data công khai

### Technical Analysis — Bổ sung
- Earnings gaps và post-earnings drift
- Sector relative strength
- Options flow / unusual activity
- Dark pool prints

### Fundamental — Focus vào
- **Financials**: Revenue growth, EPS, margins, free cash flow, guidance
- **Valuation**: P/E, P/S, PEG, EV/EBITDA, DCF
- **Competitive**: Moat analysis, market share, TAM
- **Management**: Track record, insider buying/selling, compensation alignment
- **Catalysts**: Product launches, M&A, partnerships, regulatory decisions

### Risk — Bổ sung
- Earnings miss risk → Size smaller before earnings
- Sector rotation risk → Monitor sector ETF relative strength
- Single stock concentration risk → Max 5–10% portfolio per stock
- Currency risk (nếu user không ở US)

### Allocation — Lưu ý
- Position sizing by conviction level (1–5% cho speculative, 5–10% cho high conviction)
- Consider selling covered calls for income
- Earnings straddle strategy cho uncertain quarters
- Tax-loss harvesting opportunities

---

## Korean Stock (Samsung 005930, SK Hynix 000660...)

### Đặc điểm
- KRX trading hours, T+2 settlement
- Chaebol governance structure
- Won/USD currency exposure
- Foreigner ownership limits / tracking

### Fundamental — Bổ sung
- Chaebol group dynamics
- Memory chip cycle (cho semicon stocks)
- Export data (Korea Trade)
- FX impact (KRW/USD)
- Dividend policy (thường thấp hơn US)

### Risk — Bổ sung
- Geopolitical risk (North Korea)
- Currency risk (KRW)
- Governance/transparency risk
- Capital control risk

---

## ETF (SPY, VT, QQQ...)

### Đặc điểm
- Diversified by design
- Expense ratio matters long-term
- Tracking error vs benchmark
- Creation/redemption mechanism

### Technical Analysis — Bổ sung
- Premium/discount to NAV
- Flows data (creation/redemption units)
- Sector breakdown shifts
- Correlation với benchmark

### Fundamental — Focus vào
- **Structure**: Holdings breakdown, concentration (top 10 weights)
- **Costs**: Expense ratio, bid-ask spread, tracking error
- **Flows**: AUM trend, net inflows/outflows
- **Comparison**: vs similar ETFs, vs direct indexing

### Risk — Bổ sung
- Tracking error risk
- Liquidity risk (cho niche ETFs)
- Closure risk (cho small AUM ETFs)
- Rebalancing drag

### Allocation — Lưu ý
- Core holding → higher allocation OK (20–50%)
- DCA is highly effective cho broad ETFs
- Rebalancing frequency matters
- Tax efficiency (in-kind redemptions)

---

## Commodity (Gold, Oil, Silver...)

### Đặc điểm
- Physical vs paper exposure
- Contango/backwardation in futures
- Seasonal patterns
- Central bank activity (gold)

### Fundamental — Focus vào
- **Supply/Demand**: Production, consumption, inventory levels
- **Macro**: Real rates, USD strength, inflation expectations
- **Geopolitics**: Supply disruptions, trade policies, sanctions
- **Central banks**: Reserve purchases, monetary policy signals

### Risk — Bổ sung
- Contango cost (for futures-based exposure)
- Storage cost (physical)
- Geopolitical supply disruption
- Substitution risk (tech changes)

---

## Vietnamese Stock (VN-Index, VNM...)

### Đặc điểm
- HOSE/HNX/UPCoM exchanges
- T+2.5 settlement, band limits (±7% HOSE, ±10% HNX)
- Foreign ownership limits
- Margin lending ảnh hưởng lớn
- VND/USD exposure

### Fundamental — Bổ sung
- Ngành nghề chủ đạo: Ngân hàng, Bất động sản, Thép, Chứng khoán
- Chính sách SBV (lãi suất, room tín dụng)
- FDI flows
- Margin debt levels

### Risk — Bổ sung
- Liquidity risk (nhiều cổ phiếu thanh khoản rất thấp)
- Transparency / governance risk
- Currency risk (VND depreciation)
- Band limit risk (bị kẹt khi giảm sàn liên tục)
- Margin call cascade risk
