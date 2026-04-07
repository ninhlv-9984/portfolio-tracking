# Research Strategy Guide

Hướng dẫn tối ưu hoá web search để thu thập dữ liệu chất lượng nhất.

---

## Search Query Patterns

### Cho mọi tài sản (bắt buộc 3 searches tối thiểu)

| Mục đích | Query pattern | Ví dụ |
|---|---|---|
| Giá hiện tại | `[ticker] price today [month year]` | `AAPL price today February 2026` |
| Analyst predictions | `[ticker] price prediction [year]` | `BTC price prediction 2026` |
| Tin tức gần đây | `[ticker] news [month year]` | `Samsung 005930 news February 2026` |

### Bổ sung theo loại tài sản

**Crypto (thêm 2–3 searches):**
- `[ticker] on-chain analysis [year]` — on-chain metrics
- `[ticker] institutional ETF flows [year]` — institutional data
- `[ticker] halving cycle [year]` — cycle analysis (nếu relevant)

**Stock (thêm 2–3 searches):**
- `[ticker] earnings Q[X] [year]` — recent earnings
- `[ticker] analyst rating target price` — consensus estimates
- `[ticker] sector outlook [year]` — sector context

**ETF (thêm 1–2 searches):**
- `[ticker] ETF flows AUM [year]` — flows data
- `[ticker] holdings top stocks` — composition

---

## Source Quality Ranking

Ưu tiên sources theo thứ tự:

### Tier 1 — Nguồn gốc (Primary)
- Official filings (SEC, DART Korea, SSC Vietnam)
- Company earnings reports, investor presentations
- Central bank statements (Fed, ECB, SBV)
- On-chain data providers (CryptoQuant, Glassnode)

### Tier 2 — Phân tích uy tín (Reputable Analysis)
- CNBC, Bloomberg, Reuters, Financial Times
- Grayscale Research, Galaxy Digital, CoinShares
- Seeking Alpha (cho stocks)
- TradingView (cho technical data)

### Tier 3 — Dự báo / Tổng hợp
- CoinDesk, CoinTelegraph (crypto news)
- Investing.com, MarketWatch
- InvestingHaven, FXEmpire
- CoinDCX, Coinpedia (predictions)

### Tránh
- Random crypto blogs không có track record
- Social media predictions không có backing data
- Paid promotion disguised as analysis
- Sources quá cũ (>3 tháng cho fast-moving assets)

---

## Data Points Checklist

Trước khi viết báo cáo, đảm bảo đã thu thập:

### Must-have (không viết báo cáo nếu thiếu)
- [ ] Giá hiện tại (< 24h)
- [ ] ATH / 52-week high & low
- [ ] Biến động % từ ATH / gần đây
- [ ] Market cap (nếu applicable)
- [ ] Ít nhất 3 analyst price targets từ 3 nguồn khác nhau

### Should-have
- [ ] Key technical levels (support/resistance)
- [ ] Major macro factors đang ảnh hưởng
- [ ] Recent news / catalyst (< 2 tuần)
- [ ] Volume / liquidity data

### Nice-to-have
- [ ] Institutional positioning data
- [ ] Sentiment indicators (Fear & Greed, put/call ratio)
- [ ] Correlation data với các asset khác
- [ ] Historical analogs / cycle comparison

---

## Khi không tìm được data

Nếu search không trả về data cần thiết:
1. Thử search query khác (rút ngắn, dùng từ khoá khác)
2. Nếu vẫn không có → ghi rõ trong báo cáo: "Dữ liệu không khả dụng tại thời điểm phân tích"
3. KHÔNG BAO GIỜ bịa số liệu hoặc price targets
4. Giảm độ tin cậy (confidence) cho section liên quan
