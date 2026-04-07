# Report Template Reference

Tài liệu này mô tả chi tiết nội dung bên trong mỗi section của báo cáo.
Claude đọc file này khi cần hướng dẫn chi tiết về cách viết từng phần.

---

## Tên file & Header

```markdown
# 📊 BÁO CÁO PHÂN TÍCH [TÊN TÀI SẢN] ([TICKER]) — DD/MM/YYYY

> **Phương pháp**: Awesome Stock Trading Analysis
> **Ngày phân tích**: [ngày]
> **Giá hiện tại**: [giá] [đơn vị]
> **ATH / 52-Week High**: [giá]
> **Biến động từ ATH / 52W High**: [%]
> **Market Cap**: [nếu có]
> **Sector / Category**: [ngành / loại]
```

---

## Section 1: Executive Summary

Mục đích: Người đọc bận rộn cần nắm bắt ngay tình hình trong 30 giây.

Bao gồm:
- 1 paragraph tóm tắt tình hình hiện tại (3–5 câu)
- **Đánh giá tổng thể** bằng emoji + text: VD: ⚠️ TRUNG LẬP – THIÊN BEARISH
- Bảng xu hướng:

```markdown
| Khung thời gian | Xu hướng | Độ tin cậy |
|---|---|---|
| Ngắn hạn (1–3 tháng) | 🔴/🟡/🟢 [mô tả] | Cao/TB/Thấp |
| Trung hạn (3–6 tháng) | 🔴/🟡/🟢 [mô tả] | Cao/TB/Thấp |
| Dài hạn (6–12 tháng) | 🔴/🟡/🟢 [mô tả] | Cao/TB/Thấp |
```

---

## Section 2: Technical Analysis

### 2.1 Cấu trúc giá (Price Structure)
Mô tả xu hướng chính: Uptrend / Downtrend / Sideways.
Ghi rõ evidence: higher highs, lower lows, breakout/breakdown events.
Nêu thời điểm và mức giá quan trọng gần đây.

### 2.2 Hỗ trợ & Kháng cự

Bảng format:
```markdown
| Loại | Mức giá | Ý nghĩa |
|---|---|---|
| 🔴 Kháng cự mạnh | $XXX | [giải thích] |
| 🔴 Kháng cự | $XXX | [giải thích] |
| 🟡 Pivot | $XXX | [giải thích] |
| 🟢 Hỗ trợ | $XXX | [giải thích] |
| 🟢 Hỗ trợ chiến lược | $XXX | [giải thích] |
```

Nguyên tắc: Ít nhất 2 kháng cự + 3 hỗ trợ. Sắp xếp từ cao → thấp.

### 2.3 Chỉ báo kỹ thuật

Bảng format:
```markdown
| Chỉ báo | Giá trị / Trạng thái | Tín hiệu |
|---|---|---|
| SMA 50 | ... | 🔴/🟡/🟢 |
| SMA 200 | ... | 🔴/🟡/🟢 |
| RSI | ... | 🔴/🟡/🟢 |
| MACD | ... | 🔴/🟡/🟢 |
| Volume | ... | 🔴/🟡/🟢 |
```

Indicators bắt buộc: SMA 50, SMA 200, RSI, MACD.
Indicators tuỳ chọn theo loại: Bollinger Bands, OBV, Funding Rate (crypto), ADX...

### 2.4 Nhận định kỹ thuật
Viết nhận định riêng cho 3 timeframes: ngắn hạn, trung hạn, dài hạn.
Mỗi nhận định 2–3 câu, nêu rõ condition.

---

## Section 3: Fundamental & Macro Analysis

### 3.1 Bối cảnh vĩ mô

Bảng các yếu tố macro đang ảnh hưởng:
```markdown
| Yếu tố | Hiện trạng | Tác động |
|---|---|---|
| Fed Policy | ... | 🔴/🟡/🟢 |
| Inflation | ... | 🔴/🟡/🟢 |
| USD / DXY | ... | 🔴/🟡/🟢 |
| Geopolitics | ... | 🔴/🟡/🟢 |
```

### 3.2 Yếu tố đặc thù tài sản

Tuỳ loại tài sản, phân thành các nhóm con (dùng #### headings):

**Cho Stock:**
- Financials: Revenue, EPS, margins, guidance
- Competitive position: moat, market share
- Catalysts: product launches, M&A, partnerships
- Insider activity: buying/selling

**Cho Crypto:**
- On-chain data: SOPR, exchange reserves, active addresses, hash rate
- Institutional landscape: ETF flows, corporate holdings, sovereign adoption
- Cycle position: halving, structural shifts
- Regulation: legislation progress, enforcement actions

**Cho ETF:**
- Holdings breakdown
- AUM & flows
- Expense ratio, tracking error
- Sector/geographic exposure

**Cho Commodity:**
- Supply/demand dynamics
- Inventory levels
- Seasonal patterns
- Producer/consumer balance

### 3.3 Narrative Analysis

Bảng 2 cột đối chiếu Bull vs Bear narratives:
```markdown
| Narrative Bullish 🐂 | Narrative Bearish 🐻 |
|---|---|
| [point 1] | [point 1] |
| [point 2] | [point 2] |
```
Ít nhất 4–6 points mỗi bên. Trình bày công bằng, không bias.

---

## Section 4: Scenario Analysis

LUÔN có ít nhất 3 kịch bản chính + 1 kịch bản black swan.

Mỗi kịch bản bao gồm:
- Tên + emoji
- Range giá
- Xác suất (tổng ~92–95%)
- Triggers: 4–5 điều kiện dẫn đến kịch bản này
- Quarterly price targets (Q1–Q4)
- Hành động khuyến nghị (1–2 câu)

Format mỗi kịch bản:
```markdown
### Kịch bản N: [EMOJI] [TÊN] — $XX,XXX – $XX,XXX (Xác suất: XX%)

**Triggers:**
- [trigger 1]
- [trigger 2]
- ...

**Price targets:**
- Q1: $XXX – $XXX
- Q2: $XXX – $XXX
- Q3: $XXX – $XXX
- Q4: $XXX – $XXX
```

Mẫu tên kịch bản:
1. 🐻 Bear Case (20–30%)
2. 🦀 Base Case (40–50%)
3. 🐂 Bull Case (15–25%)
4. 🦢 Black Swan (5–10%)

---

## Section 5: Capital Allocation Plan

### 5.1 Nguyên tắc cốt lõi
1 blockquote cảnh báo rủi ro phù hợp loại tài sản.

### 5.2 Mô hình phân bổ portfolio

Bảng phân bổ tổng thể (giả định user có diversified portfolio):
```markdown
| Phân khúc | Tỷ trọng | Mô tả |
|---|---|---|
| [Tài sản đang phân tích] | XX–XX% | Core position |
| [Asset class 2] | XX–XX% | ... |
| Cash / Dry powder | XX–XX% | Dự phòng cơ hội |
```

### 5.3 Chiến lược vào lệnh

Chia thành 3 giai đoạn:

**Giai đoạn 1: ACCUMULATION**
Bảng DCA theo vùng giá:
```markdown
| Vùng giá | Hành động | % vốn/đợt | Tần suất |
|---|---|---|---|
| [vùng hiện tại] | DCA cơ bản | XX% | 2 tuần/lần |
| [vùng thấp hơn] | DCA tăng cường | XX% | Hàng tuần |
| [vùng extreme low] | Max conviction | XX% | Khi chạm |
```

**Giai đoạn 2: HOLD & MONITOR**
Mô tả ngắn gọn điều kiện giữ.

**Giai đoạn 3: TAKE PROFIT**
Bảng chốt lời theo vùng giá:
```markdown
| Vùng giá | Hành động | % vị thế bán |
|---|---|---|
| [target 1] | Bắt đầu chốt | XX% |
| [target 2] | Scale out | XX% |
| [ATH zone] | Trailing stop XX% | Dynamic |
```

Nguyên tắc quan trọng: **Luôn giữ lại ít nhất 20% dry powder.**

---

## Section 6: Risk Management

### 6.1 Ma trận rủi ro

```markdown
| # | Rủi ro | Xác suất | Tác động | Mức độ | Biện pháp |
|---|---|---|---|---|---|
| 1 | [rủi ro] | Cao/TB/Thấp | Cao/TB/Thấp | 🔴/🟠/🟡 | [hành động] |
```

Ít nhất 6–8 rủi ro. Xếp theo mức độ giảm dần.
Bắt buộc cover: Market risk, Liquidity risk, Regulatory risk, Black swan risk.
Thêm theo loại tài sản: Exchange risk (crypto), Earnings risk (stock), Tracking error (ETF).

### 6.2 Quy tắc quản lý vốn

Bảng rules cứng:
```markdown
| Quy tắc | Chi tiết |
|---|---|
| Max loss per trade | X% tổng portfolio |
| Max allocation | X% tổng portfolio |
| Stop-loss condition | [mô tả cụ thể] |
| Leverage policy | [thường là: Không dùng] |
| Custody/Security | [phù hợp loại tài sản] |
| Emergency fund | Giữ X tháng chi phí NGOÀI portfolio |
```

---

## Section 7: Contingency Plans

Dùng **decision tree format** trong code blocks cho mỗi kịch bản.
Ít nhất 3–4 contingency plans.

Bắt buộc có:
1. Bear scenario activate (giá phá vỡ support)
2. Bull scenario activate (giá breakout resistance)
3. Black swan response
4. Macro pivot (policy change)

Format:
```
TRIGGER: [điều kiện cụ thể, đo lường được]
├── Hành động 1: [hành động ngay]
├── Hành động 2: [hành động tiếp theo]
├── Hành động 3: [nếu tiếp tục...]
│   ├── Sub-condition A → [response]
│   └── Sub-condition B → [response]
└── Monitoring: [chỉ số cần theo dõi]
```

Mỗi TRIGGER phải cụ thể và đo lường được. VD: "BTC close weekly < $60,000" chứ KHÔNG phải "giá giảm nhiều".

---

## Section 8: Monitoring Dashboard

Bảng chỉ số cần theo dõi:
```markdown
| Chỉ số | Nguồn | Tần suất | Bullish signal | Bearish signal |
|---|---|---|---|---|
| Giá | TradingView | Hàng ngày | Close > $X | Close < $X |
| [chỉ số 2] | [nguồn] | [tần suất] | [signal] | [signal] |
```

Ít nhất 8–10 chỉ số. Bao gồm cả metrics đặc thù (on-chain cho crypto, earnings cho stock, flows cho ETF).

---

## Section 9: Timeline & Events

```markdown
| Thời gian | Sự kiện | Tác động tiềm năng |
|---|---|---|
| [date/period] | [event] | [impact] |
```

Bao gồm: scheduled events (earnings, FOMC, halving...) + potential catalysts.
Sắp xếp theo thời gian.

---

## Section 10: Conclusion & Recommendation

### Tóm tắt tình hình
2–3 paragraphs tóm tắt key findings.

### Bảng khuyến nghị theo risk profile:
```markdown
| Profile | Hành động | Allocation |
|---|---|---|
| 🟢 Conservative | [hành động] | X–X% |
| 🟡 Moderate | [hành động] | X–X% |
| 🔴 Aggressive | [hành động] | X–X% |
```

### Disclaimer
> ⚠️ **DISCLAIMER**: Đây là phân tích mang tính tham khảo, KHÔNG phải lời khuyên đầu tư.
> [Thêm cảnh báo phù hợp loại tài sản]

### Nguồn dữ liệu
> 📡 **Nguồn dữ liệu**: [liệt kê các nguồn đã dùng]

### Footer
```
*Báo cáo được tạo ngày [date] bằng phương pháp Awesome Stock Trading Analysis.*
*Cập nhật tiếp theo: [điều kiện cập nhật]*
```
