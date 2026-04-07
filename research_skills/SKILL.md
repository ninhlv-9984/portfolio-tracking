---
name: awesome-stock-trading
description: >
  Phân tích toàn diện cổ phiếu, ETF, crypto token hoặc bất kỳ tài sản giao dịch nào
  theo framework đa chiều: Technical Analysis, Fundamental/Macro Analysis,
  Scenario Planning, Capital Allocation, Risk Management, và Contingency Plans.
  Sử dụng skill này khi user yêu cầu phân tích stock, coin, token, ETF, commodity,
  hoặc bất kỳ tài sản đầu tư nào. Cũng trigger khi user hỏi về "nên mua/bán không",
  "phân tích giúp", "đánh giá cổ phiếu", "kế hoạch đầu tư", "risk management",
  "phân bổ vốn", "DCA plan", "portfolio allocation", hoặc nhắc đến ticker symbols.
  Skill này tạo ra báo cáo Markdown chuyên sâu, có cấu trúc, sẵn sàng để lưu trữ
  và theo dõi theo thời gian.
---

# Awesome Stock Trading Analysis

## Mục đích

Skill này giúp Claude tạo ra báo cáo phân tích đầu tư chuyên sâu, có cấu trúc nhất quán, áp dụng được cho **mọi loại tài sản giao dịch**: cổ phiếu (US, KR, VN...), crypto (BTC, ETH, SOL...), ETF (SPY, VT, QQQ...), commodity (Gold, Oil...).

Báo cáo tuân theo framework **10 phần** cố định, đảm bảo không bỏ sót khía cạnh nào, từ kỹ thuật → cơ bản → kịch bản → phân bổ → rủi ro → dự phòng → hành động.

## Khi nào sử dụng

Bất kỳ khi nào user muốn:
- Phân tích một tài sản cụ thể (stock, token, ETF...)
- Lập kế hoạch phân bổ vốn cho một tài sản
- Đánh giá rủi ro đầu tư
- Xây dựng contingency plan
- So sánh kịch bản bull/bear/base

## Workflow

```
1. IDENTIFY  → Xác định tài sản, loại tài sản, thị trường
2. RESEARCH  → Web search giá hiện tại, tin tức, analyst opinions
3. ANALYZE   → Áp dụng framework 10 phần
4. GENERATE  → Tạo báo cáo Markdown
5. DELIVER   → Lưu file, present cho user
```

### Bước 1: Xác định tài sản (IDENTIFY)

Từ input của user, xác định:
- **Ticker/Symbol**: VD: BTC, AAPL, 005930.KS, SPY
- **Loại tài sản**: Stock / Crypto / ETF / Commodity / Index
- **Thị trường**: US / KR / VN / Global / Crypto
- **Khung thời gian phân tích**: Mặc định = năm hiện tại

### Bước 2: Thu thập dữ liệu (RESEARCH)

Thực hiện **3–5 web searches** tối thiểu để lấy:
1. **Giá hiện tại** + biến động gần đây
2. **Analyst price targets & predictions** cho khung thời gian phân tích
3. **Tin tức macro/fundamental** liên quan
4. **Technical indicators** hiện tại (nếu có)
5. **On-chain data** (cho crypto) hoặc **earnings/financials** (cho stock)

Ưu tiên nguồn: CNBC, Bloomberg, Reuters, CoinDesk, TradingView, Seeking Alpha, Grayscale Research, CryptoQuant, official filings.

### Bước 3: Phân tích & Tạo báo cáo (ANALYZE + GENERATE)

Đọc template chi tiết tại: `references/report-template.md`

Tên file output: `YYYYMMDD_[TICKER].md`

VD: `20260213_BITCOIN_BTC.md`, `20260213_AAPL.md`, `20260213_005930_SAMSUNG.md`

## Cấu trúc báo cáo — 10 phần bắt buộc

Mỗi báo cáo LUÔN có đầy đủ 10 section sau. Đây là backbone của framework — không bỏ sót section nào, nhưng độ sâu của mỗi section có thể adjust tuỳ loại tài sản.

| # | Section | Mô tả ngắn |
|---|---------|-------------|
| 1 | Executive Summary | Tóm tắt 1 paragraph + bảng xu hướng 3 khung thời gian |
| 2 | Technical Analysis | Price structure, S/R levels, indicators, nhận định |
| 3 | Fundamental & Macro | Macro environment + asset-specific fundamentals |
| 4 | Scenario Analysis | 3–4 kịch bản giá với xác suất, triggers, quarterly targets |
| 5 | Capital Allocation | Portfolio model + DCA strategy theo vùng giá |
| 6 | Risk Management | Ma trận rủi ro + quy tắc quản lý vốn |
| 7 | Contingency Plans | Decision trees dạng code block cho từng kịch bản |
| 8 | Monitoring Dashboard | Bảng chỉ số cần theo dõi + signals |
| 9 | Timeline & Events | Mốc sự kiện quan trọng trong khung thời gian |
| 10 | Conclusion & Recommendation | Khuyến nghị theo 3 risk profiles + disclaimer |

Chi tiết từng section → xem `references/report-template.md`

## Nguyên tắc viết báo cáo

### Về dữ liệu
- **Luôn dùng dữ liệu thực** từ web search. Không bịa số liệu.
- Ghi rõ nguồn khi trích dẫn analyst opinion hoặc price target.
- Nếu không tìm được data cụ thể, ghi rõ "Không có dữ liệu" thay vì đoán.

### Về ngôn ngữ
- Mặc định viết bằng **ngôn ngữ user sử dụng**. Nếu user nói tiếng Việt → báo cáo tiếng Việt.
- Thuật ngữ chuyên ngành giữ nguyên tiếng Anh (ATH, DCA, RSI, MACD, EMA...).
- Giọng văn: chuyên nghiệp, rõ ràng, không hoa mỹ. Như analyst viết cho trader.

### Về format
- Dùng Markdown tables cho dữ liệu có cấu trúc.
- Dùng code blocks (```` ``` ````) cho decision trees trong Contingency Plans.
- Dùng emoji sparingly cho section headers để dễ scan.
- Mỗi section bắt đầu bằng `## N. [EMOJI] [TÊN SECTION]`.

### Về tính khách quan
- Luôn present cả bull case VÀ bear case. Không bias.
- Ghi rõ mức độ tin cậy (Cao / Trung bình / Thấp) cho mỗi nhận định.
- Kịch bản có xác suất — tổng xác suất các kịch bản chính = ~92–95%, còn lại cho black swan.

## Điều chỉnh theo loại tài sản

Framework 10 phần giữ nguyên, nhưng NỘI DUNG bên trong thay đổi:

Đọc chi tiết tại: `references/asset-specific-guide.md`

| Aspect | Stock | Crypto | ETF | Commodity |
|--------|-------|--------|-----|-----------|
| Section 2 (Technical) | Chart patterns, earnings gaps | On-chain metrics, funding rates | Sector rotation, flows | Seasonality, COT report |
| Section 3 (Fundamental) | P/E, revenue, margins, guidance | Tokenomics, TVL, adoption | Holdings, expense ratio, AUM | Supply/demand, inventory |
| Section 5 (Allocation) | Position sizing by conviction | DCA zones + self-custody | Core vs satellite | Physical vs paper exposure |
| Section 6 (Risk) | Earnings risk, sector risk | Protocol risk, exchange risk | Tracking error, rebalancing | Contango, storage cost |

## Lưu ý quan trọng

> Báo cáo này mang tính tham khảo, KHÔNG phải lời khuyên đầu tư.
> Luôn kèm disclaimer ở cuối báo cáo.

Khi deliver, lưu file vào `/mnt/user-data/outputs/` và dùng `present_files` để user có thể download.
