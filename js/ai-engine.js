// ============================================================
// VENDRIXA IQ — Comprehensive AI Engine v2
// Full seller knowledge base · Data-aware · Markdown output
// ============================================================

const AIEngine = {

    // ─── Build live context from user data ───────────────────
    buildContext() {
        try {
            const kpis     = DB.getKPIs();
            const inv      = DB.getInventory();
            const sales    = DB.getSales();
            const expenses = DB.getExpenses();
            const upData   = (typeof UploadEngine !== 'undefined') ? UploadEngine.processedData : null;
            const hasManualData = sales.length > 0;
            const hasUploadData = !!(upData && upData.rowCount > 0);

            return { kpis, inv, sales, expenses, upData, hasManualData, hasUploadData };
        } catch(e) {
            return { kpis:{}, inv:[], sales:[], expenses:[], upData:null, hasManualData:false, hasUploadData:false };
        }
    },

    // ─── Keyword matching helper ──────────────────────────────
    matches(q, keywords) {
        return keywords.some(k => q.includes(k));
    },

    // ─── Format money ─────────────────────────────────────────
    fmt(n) { return '₹' + parseFloat(n||0).toLocaleString('en-IN',{minimumFractionDigits:2}); },

    // ─── Main entry point: route query to handler ─────────────
    ask(query) {
        return new Promise(resolve => {
            const q   = query.toLowerCase().trim();
            const ctx = this.buildContext();
            let response = '';

            // ── Greeting ──────────────────────────────────────
            if (this.matches(q, ['hello','hi','hey','namaste','good morning','good evening','good afternoon','hii','hlo'])) {
                response = this.greet(ctx);

            // ── Profit & Margin ───────────────────────────────
            } else if (this.matches(q, ['profit margin','profit %','margin','profitability','net profit','gross profit','how much profit'])) {
                response = this.answerProfitMargin(ctx);

            // ── How to improve / increase profit ─────────────
            } else if (this.matches(q, ['improve profit','increase profit','boost profit','grow profit','maximize profit','more profit','profit badhana'])) {
                response = this.answerImproveProfit(ctx);

            // ── Revenue / Sales ───────────────────────────────
            } else if (this.matches(q, ['revenue','total sales','how much sale','sales data','sales today','earning','income'])) {
                response = this.answerRevenue(ctx);

            // ── Expenses / Costs ──────────────────────────────
            } else if (this.matches(q, ['expense','cost','overhead','spending','kharcha','rent','salary','spend'])) {
                response = this.answerExpenses(ctx);

            // ── Inventory / Stock ─────────────────────────────
            } else if (this.matches(q, ['stock','inventory','low stock','reorder','restock','out of stock','items left','quantity left'])) {
                response = this.answerInventory(ctx);

            // ── Best product / Top product ────────────────────
            } else if (this.matches(q, ['best product','top product','best selling','highest selling','star product','bestseller','top performer'])) {
                response = this.answerBestProduct(ctx);

            // ── Worst / Low product ───────────────────────────
            } else if (this.matches(q, ['worst product','low performing','bad product','loss product','low margin product','which product to remove'])) {
                response = this.answerWorstProduct(ctx);

            // ── Pricing Strategy ──────────────────────────────
            } else if (this.matches(q, ['pricing','price strategy','how to price','set price','increase price','price kaise','selling price','optimal price','right price'])) {
                response = this.answerPricingStrategy(ctx);

            // ── Marketing / Ads ───────────────────────────────
            } else if (this.matches(q, ['marketing','advertis','ad','ads','promotion','facebook','instagram','google ads','campaign','digital marketing'])) {
                response = this.answerMarketing();

            // ── Growth Strategy ───────────────────────────────
            } else if (this.matches(q, ['grow','growth','scale','expand','business grow','kaise badhaye','strategies','next level','grow my business'])) {
                response = this.answerGrowth(ctx);

            // ── Inventory Management Tips ─────────────────────
            } else if (this.matches(q, ['manage inventory','inventory management','stock management','handle inventory','how to manage stock'])) {
                response = this.answerInventoryManagement();

            // ── Customer Retention ────────────────────────────
            } else if (this.matches(q, ['customer','loyalty','retain customer','repeat customer','customer satisfaction','customer return','khush rakhna'])) {
                response = this.answerCustomerRetention();

            // ── Competitor Analysis ───────────────────────────
            } else if (this.matches(q, ['competitor','competition','market','rival','competitors price','beat competitor','spy on competitor'])) {
                response = this.answerCompetitors();

            // ── Cash Flow ─────────────────────────────────────
            } else if (this.matches(q, ['cash flow','cash','liquidity','working capital','paise','fund','capital','paisa','invest'])) {
                response = this.answerCashFlow(ctx);

            // ── Product Research ──────────────────────────────
            } else if (this.matches(q, ['new product','product research','which product to sell','trending product','hot product','product idea','what to sell'])) {
                response = this.answerProductResearch();

            // ── Amazon / Flipkart Selling ─────────────────────
            } else if (this.matches(q, ['amazon','flipkart','meesho','marketplace','ecommerce','online sell','online selling','platform'])) {
                response = this.answerEcommerce();

            // ── GST / Tax ─────────────────────────────────────
            } else if (this.matches(q, ['gst','tax','taxation','invoice','billing','government tax','gst filing','return filing'])) {
                response = this.answerGST();

            // ── Returns / Refunds ─────────────────────────────
            } else if (this.matches(q, ['return','refund','return policy','product return','customer return','wapas','reverse logistics'])) {
                response = this.answerReturns();

            // ── Supplier / Vendor ─────────────────────────────
            } else if (this.matches(q, ['supplier','vendor','manufacturer','wholesale','bulk buy','source product','sourcing','negotiate supplier'])) {
                response = this.answerSupplier();

            // ── Bundling / Upsell ─────────────────────────────
            } else if (this.matches(q, ['bundle','combo','upsell','cross sell','package deal','offer','discount strategy'])) {
                response = this.answerBundling(ctx);

            // ── Seasonal Strategy ─────────────────────────────
            } else if (this.matches(q, ['season','festival','diwali','holi','sale season','offer season','peak season','festive'])) {
                response = this.answerSeasonal();

            // ── Reduce Expenses ───────────────────────────────
            } else if (this.matches(q, ['reduce expense','cut cost','save money','lower cost','expense kam karo','expense reduce','bachana'])) {
                response = this.answerReduceExpenses(ctx);

            // ── Branding ──────────────────────────────────────
            } else if (this.matches(q, ['brand','branding','logo','identity','brand build','reputation','brand value'])) {
                response = this.answerBranding();

            // ── What is VENDRIXA ──────────────────────────────
            } else if (this.matches(q, ['vendrixa','what are you','who are you','about you','your name','tumhara naam'])) {
                response = this.answerAbout();

            // ── General business advice ───────────────────────
            } else if (this.matches(q, ['business','advice','suggest','idea','tips','help','guide','bata','kaise kare'])) {
                response = this.answerBusinessGeneral(ctx);

            // ── Analysis / Report ────────────────────────────
            } else if (this.matches(q, ['analyse','analyze','report','summary','overview','status','performance','how am i doing'])) {
                response = this.answerAnalyse(ctx);

            // ── Catch-all ─────────────────────────────────────
            } else {
                response = this.answerCatchAll(q, ctx);
            }

            // Simulate natural AI thinking delay
            const delay = 700 + Math.random() * 600;
            setTimeout(() => resolve(response), delay);
        });
    },

    // ─── RESPONSE HANDLERS ─────────────────────────────────────

    greet(ctx) {
        const user = (typeof Auth !== 'undefined' && Auth.getCurrentUser());
        const name = user ? user.name.split(' ')[0] : 'there';
        return `# 👋 Hey ${name}! Welcome to VENDRIXA AI

I'm your **AI-powered business analyst and seller coach** — trained specifically for small business owners and sellers like you.

Here's what I can help you with right now:

- 📊 **Profit & Revenue Analysis** — margins, trends, best products
- 💰 **Pricing Strategy** — optimal price points, margin improvement
- 📦 **Inventory Management** — restock alerts, demand forecasting
- 📢 **Marketing & Growth** — ads, customer retention, scaling tips
- 🏆 **Competitor Analysis** — market positioning, pricing gaps
- 🔢 **Tax & GST** — filing tips, invoice management

${ctx.hasManualData || ctx.hasUploadData
    ? '✅ I can see you have business data loaded. I\'ll give you **data-specific insights** tailored to your shop!'
    : '💡 Upload your sales data or log entries to get **personalised AI insights** on your business.'}

**Just ask me anything!** For example: *"What is my profit margin?"* or *"How do I increase sales?"*`;
    },

    answerProfitMargin(ctx) {
        const { kpis, hasManualData, hasUploadData, upData } = ctx;

        let dataSection = '';
        if (hasManualData && kpis.revenue > 0) {
            const status = kpis.profitMargin > 25 ? '🟢 Excellent' : kpis.profitMargin > 15 ? '🟡 Average' : '🔴 Critical';
            dataSection = `## 📊 Your Current Numbers

| Metric | Value |
|--|--|
| Total Revenue | ${this.fmt(kpis.revenue)} |
| Total Expenses | ${this.fmt(kpis.expenses)} |
| Net Profit | ${this.fmt(kpis.netProfit)} |
| **Profit Margin** | **${kpis.profitMargin.toFixed(1)}%** |

**Status: ${status}**

${kpis.profitMargin < 15 ? '⚠️ Your margin is below 15%. This means for every ₹100 you earn, you keep less than ₹15. Urgent action needed.' : kpis.profitMargin > 25 ? '✅ Strong margin! You\'re in a healthy position. Focus on scaling now.' : '📈 Your margin is decent but improvable. Target: 25%+.'}

---
`;
        } else if (hasUploadData && upData) {
            dataSection = `## 📊 From Your Uploaded Data

- **Total Revenue:** ${this.fmt(upData.totalRevenue)}
- **Net Profit:** ${this.fmt(upData.totalProfit)}
- **Average Margin:** **${upData.avgMargin.toFixed(1)}%**

${upData.avgMargin < 15 ? '⚠️ Low margin detected across your uploaded sales.' : '✅ Healthy margin in your uploaded data.'}

---
`;
        }

        return `${dataSection}## 💡 Understanding Profit Margin

**Profit Margin** = (Revenue - All Costs) ÷ Revenue × 100

### Industry Benchmarks
- 🔴 Below 10% → Danger zone
- 🟡 10–20% → Survivable, needs work
- 🟢 20–35% → Healthy for retail
- 💎 35%+ → Excellent (focus on scaling)

### 5 Proven Ways to Improve Your Margin

**1. Reduce Cost of Goods (COGS)**
- Negotiate with suppliers for bulk discount (even 3-5% off makes huge impact)
- Source directly from manufacturers vs. distributors

**2. Raise Prices Strategically**
- A 5% price increase on a 20% margin product = **25% more profit per unit**
- Use psychological pricing: ₹499 instead of ₹500

**3. Cut Operational Overhead**
- Audit your fixed costs monthly (rent, electricity, subscriptions)
- Automate repetitive tasks to reduce staff hours

**4. Remove Loss-Making Products**
- Any product with margin < 5% is likely dragging your average down
- Focus catalog on high-margin winners

**5. Increase Average Order Value**
- Bundle products together (combo = higher perceived value)
- Upsell: "Add X for just ₹50 more"

---
💬 **Ask me:** *"Which product should I raise the price on?"* or *"How do I find my best margin product?"*`;
    },

    answerImproveProfit(ctx) {
        const { kpis, hasManualData, upData } = ctx;
        let dataLine = '';
        if (hasManualData && kpis.revenue > 0) {
            dataLine = `\n> 📊 **Your Data:** Current margin is **${kpis.profitMargin.toFixed(1)}%** on ₹${kpis.revenue.toFixed(0)} revenue. Net profit: **${this.fmt(kpis.netProfit)}**\n`;
        }
        return `# 🚀 How To Increase Your Profit — Complete Guide
${dataLine}
## The 3 Levers of Profit

Every business has exactly 3 ways to increase profit. Here's how to pull each:

---

### ⚡ Lever 1: Increase Revenue (Sell More)

**a) Launch on more channels**
- If you're only on Flipkart → add Amazon, Meesho
- Use WhatsApp Business as a free sales channel
- Run flash sales every Friday to create urgency

**b) Get more repeat customers**
- Follow up within 48 hours of a purchase
- Offer loyalty discount: "5th purchase is 10% off"
- Send WhatsApp reminders during festive season

**c) Raise average order value**
- Bundle complementary products
- "Buy 2 Get 1 at Half Price" promotions
- Minimum order for free delivery

---

### 💰 Lever 2: Reduce Costs (Spend Less)

**a) Negotiate every 3 months**
- Most suppliers expect negotiation — never accept the first price
- Buy in bulk (2-3 months stock) for 8-15% discount

**b) Cut invisible costs**
- Unused SaaS subscriptions, excess packaging
- Switch to local suppliers to cut shipping costs

**c) Reduce returns** (returns kill profit)
- Improve product photos/descriptions
- Set clear packaging standards

---

### 📈 Lever 3: Improve Product Mix (Sell Smarter)

**Focus 70% of effort on your top 20% products** — this is the Pareto Principle.

- **Drop** products with margin < 8%
- **Promote** products with margin > 25%
- **Fix** products with high volume but low margin (just needs a price tweak)

---

## 90-Day Profit Improvement Plan

| Month | Action | Expected Impact |
|--|--|--|
| Month 1 | Audit & remove loss-makers | +3-5% margin |
| Month 2 | Negotiate with top 3 suppliers | +2-4% COGS saving |
| Month 3 | Launch bundle offers | +10-15% avg order value |

---
💬 **Try asking me:** *"Analyse my best products"* or *"Which expenses should I cut?"*`;
    },

    answerRevenue(ctx) {
        const { kpis, sales, hasManualData, upData, hasUploadData } = ctx;
        let dataSection = '';

        if (hasManualData && kpis.revenue > 0) {
            const topByRevenue = [...sales].sort((a,b) => b.totalSales - a.totalSales);
            const topProduct = topByRevenue[0];
            dataSection = `## 📊 Your Revenue Snapshot

- **Total Revenue Logged:** ${this.fmt(kpis.revenue)}
- **Total Sales Entries:** ${sales.length}
- **Top Earner:** ${topProduct ? `**${topProduct.productName}** (${this.fmt(topProduct.totalSales)})` : '—'}

---
`;
        } else if (hasUploadData && upData) {
            const top = upData.sortedProducts && upData.sortedProducts[0];
            dataSection = `## 📊 Revenue from Uploaded Data

- **Total Revenue:** ${this.fmt(upData.totalRevenue)}
- **Records Analysed:** ${upData.rowCount}
- **Top Revenue Product:** ${top ? `**${top.name}** (${this.fmt(top.revenue)})` : '—'}

---
`;
        }

        return `${dataSection}## 💡 How to Grow Revenue — 7 Proven Methods

**1. Expand Your Sales Channels**
Don't rely on a single platform. Successful sellers use 3-5 channels simultaneously: offline store + Amazon + Meesho + WhatsApp + Instagram.

**2. Master Flash Sales**
Run a 24-hour sale every week. Even a 10% discount creates urgency and spikes volume. The volume compensates for the discount if margin is healthy.

**3. Capture Festive Demand**
Indian e-commerce peaks during:
- Diwali (Oct-Nov): 3-4x normal volume
- Raksha Bandhan: Gift-related surge
- New Year / Republic Day sale windows

**4. Build WhatsApp Broadcast Lists**
Free, direct, high open-rate (80%+). Send:
- New arrivals
- Stock-out warnings ("only 5 left!")
- Festival deals

**5. Referral Program**
"Refer a friend, get ₹50 off" — word-of-mouth is your cheapest sales channel.

**6. Upsell at Checkout**
"Customers who bought this also buy..." increases average basket size by 15-30%.

**7. Review & Rating Strategy**
Higher ratings → Better rankings → More organic sales. Ask every customer for a review via WhatsApp within 24 hours.

---
💬 Ask me: *"How do I price products optimally?"* or *"Which platform should I sell on?"*`;
    },

    answerExpenses(ctx) {
        const { kpis, expenses, hasManualData } = ctx;
        let dataSection = '';

        if (hasManualData && expenses.length > 0) {
            // Group by category
            const byCat = {};
            expenses.forEach(e => byCat[e.category] = (byCat[e.category]||0) + e.amount);
            const top = Object.entries(byCat).sort((a,b) => b[1]-a[1]);
            dataSection = `## 📊 Your Expense Breakdown

${top.map(([cat, amt]) => `- **${cat}:** ${this.fmt(amt)}`).join('\n')}

**Total Expenses:** ${this.fmt(kpis.expenses)}
**Expense-to-Revenue Ratio:** ${kpis.revenue > 0 ? ((kpis.expenses/kpis.revenue)*100).toFixed(1) : 'N/A'}%

${kpis.revenue > 0 && (kpis.expenses/kpis.revenue) > 0.35 ? '⚠️ **Alert:** Expenses are consuming more than 35% of revenue. This is a red flag.' : '✅ Expense ratio looks manageable.'}

---
`;
        }

        return `${dataSection}## 💡 Expense Optimization Strategy

### The 3 Types of Business Expenses

**1. Fixed Expenses** (Don't change with sales)
- Rent, salaries, insurance, software
- *Strategy:* Negotiate annually. Try to fix these for 12 months to remove uncertainty.

**2. Variable Expenses** (Scale with sales)
- Packaging, shipping, payment gateway fees
- *Strategy:* Negotiate bulk rates. At ₹50K+/month shipping, couriers will give 15-25% discount.

**3. Hidden Expenses** (Often overlooked)
- Returns & damaged goods
- Failed payment gateway fees
- Excess inventory that goes unsold
- *Strategy:* Track and quantify these. They often represent 5-10% of real cost.

---

### 🔪 The Expense Audit Checklist

✅ **Do you review expenses monthly?** (Most sellers don't — fatal mistake)
✅ **Are you on the best payment gateway rate?** (Razorpay vs Cashfree — compare every 6 months)
✅ **Is your packaging optimised?** (Right-sized boxes = lower DIM weight charges)
✅ **Do you track return cost per product?** (High-return products silently kill margins)
✅ **Are staff hours productive?** (Part-time vs full-time calculation)

---

### 💰 Quick Wins to Cut Costs This Week

1. **Switch to digital invoicing** (₹0 cost vs ₹2 per paper bill)
2. **Bulk buy packaging** material for 30-day supply
3. **Cancel unused subscriptions** — audit your bank statement
4. **Negotiate electricity bill** timing (shift heavy equipment to off-peak hours)
5. **Use Google Sheets** instead of paying for expensive accounting software

---
💬 Ask me: *"How to reduce packaging cost?"* or *"Is my rent too high?"*`;
    },

    answerInventory(ctx) {
        const { inv } = ctx;
        const lowStock = inv.filter(i => i.stock < 5);
        const outStock = inv.filter(i => i.stock === 0);

        let dataSection = '';
        if (inv.length > 0) {
            dataSection = `## 📦 Your Inventory Status

**Total SKUs:** ${inv.length}
${outStock.length > 0 ? `🚨 **Out of Stock (${outStock.length}):** ${outStock.map(i => i.name).join(', ')}` : ''}
${lowStock.length > 0 ? `⚠️ **Low Stock (<5 units) (${lowStock.length}):** ${lowStock.map(i => `${i.name} (${i.stock})`).join(', ')}` : ''}
${lowStock.length === 0 && outStock.length === 0 ? '✅ All products have healthy stock levels.' : ''}

---
`;
        }

        return `${dataSection}## 💡 Smart Inventory Management

### The Golden Rule: Never Stockout on Top Sellers

A stockout on your best product for even **3 days** can cost you:
- Lost sales (obvious)
- Lost ranking on platforms (Amazon/Flipkart penalise OOS listings)
- Customers going to competitors and **not returning**

---

### 📊 The ABC Analysis Framework

Categorize your products:

| Category | Description | Strategy |
|--|--|--|
| **A items** (top 20%) | 80% of your revenue | Never stockout. Keep 45-day buffer. |
| **B items** (next 30%) | 15% of revenue | Keep 30-day buffer. Review monthly. |
| **C items** (bottom 50%) | 5% of revenue | Minimum stock. Consider removing. |

---

### 🔄 Reorder Point Formula

**Reorder Point = Daily Sales × Lead Time + Safety Stock**

*Example:* If you sell 5 units/day, supplier takes 7 days, and you want 10 units buffer:
→ Reorder when stock hits: (5×7) + 10 = **45 units**

---

### 🛑 How to Handle Dead Stock

Products sitting unsold for 60+ days:
1. Bundle with fast-moving products at a discount
2. Run a clearance sale (even at cost price — frees up capital)
3. Return to supplier if possible
4. Donate for tax benefits (section 80G)

---
💬 Ask me: *"Which product should I restock first?"* or *"How to forecast demand?"*`;
    },

    answerBestProduct(ctx) {
        const { sales, upData, hasManualData, hasUploadData } = ctx;

        let dataSection = '';
        if (hasManualData && sales.length > 0) {
            const pMap = {};
            sales.forEach(s => {
                if (!pMap[s.productName]) pMap[s.productName] = { rev:0, profit:0, qty:0 };
                pMap[s.productName].rev += s.totalSales;
                pMap[s.productName].profit += s.profit;
                pMap[s.productName].qty += s.quantity;
            });
            const sorted = Object.entries(pMap).sort((a,b)=>b[1].rev-a[1].rev);
            dataSection = `## ⭐ Your Top Products (by Revenue)

${sorted.slice(0,5).map(([name,d],i) => `**${i+1}. ${name}**
   - Revenue: ${this.fmt(d.rev)} | Profit: ${this.fmt(d.profit)} | Units Sold: ${d.qty}`).join('\n')}

---
`;
        } else if (hasUploadData && upData && upData.sortedProducts) {
            const top = upData.sortedProducts.slice(0,5);
            dataSection = `## ⭐ Top Products from Uploaded Data

${top.map((p,i) => `**${i+1}. ${p.name}** — Revenue: ${this.fmt(p.revenue)} | Margin: ${p.margin.toFixed(1)}%`).join('\n')}

---
`;
        }

        return `${dataSection}## 💡 How to Maximise Your Star Products

Once you know your best sellers, here's the playbook:

### 🔥 The Star Product Strategy

**Step 1: Never Let It Stockout**
Your best product is your revenue engine. Keep 45-day buffer stock.

**Step 2: Expand Variants**
If "Blue T-Shirt L" sells well → stock S, M, XL, XXL and other colors.

**Step 3: Push It on Ads**
Spend 70% of your ad budget on proven winners, not experiments.

**Step 4: Feature It First**
Home page, first-in-catalog, first photo — put winners where eyes go.

**Step 5: Use It as an Anchor**
Bundle low-margin products *with* your star product to move slower stock.

---

### 📊 Beyond Revenue: The Real "Best" Product

Revenue ≠ Best. Look at all 4 metrics:

| Metric | Why It Matters |
|--|--|
| High Revenue | Volume driver of your business |
| High Margin % | Profit per rupee earned |
| High Volume | Demand signal — market wants it |
| Low Returns | Customer satisfaction signal |

The *true* best product scores well on **all four**.

---
💬 Ask me: *"How do I promote my best product?"* or *"Should I create variants?"*`;
    },

    answerWorstProduct(ctx) {
        const { sales, upData, hasManualData, hasUploadData } = ctx;

        let dataSection = '';
        if (hasManualData && sales.length > 0) {
            const pMap = {};
            sales.forEach(s => {
                if (!pMap[s.productName]) pMap[s.productName] = { rev:0, profit:0, qty:0 };
                pMap[s.productName].rev += s.totalSales;
                pMap[s.productName].profit += s.profit;
                pMap[s.productName].qty += s.quantity;
            });
            const sorted = Object.entries(pMap).sort((a,b)=>a[1].profit-b[1].profit);
            dataSection = `## 📉 Your Low-Performing Products

${sorted.slice(0,3).map(([name,d]) => `- **${name}** — Profit: ${this.fmt(d.profit)} (${d.profit < 0 ? '🔴 Loss-making' : '⚠️ Low profit'})`).join('\n')}

---
`;
        } else if (hasUploadData && upData) {
            const worst = [...upData.products].sort((a,b)=>a.margin-b.margin).slice(0,3);
            dataSection = `## 📉 Low-Margin Products (Uploaded Data)

${worst.map(p => `- **${p.name}** — Margin: ${p.margin.toFixed(1)}% ${p.profit < 0 ? '🔴 LOSS' : '⚠️'}`).join('\n')}

---
`;
        }

        return `${dataSection}## 💡 What to Do with Underperforming Products

### The Decision Framework

For each weak product, ask 3 questions:

**Q1: Is the problem price or cost?**
- If cost is too high → negotiate supplier
- If price is too low → raise it and monitor conversion

**Q2: Is there demand but wrong execution?**
- Bad product photos → fix them (30% conversion improvement typical)
- Poor title/description → rewrite with keywords
- Wrong category listing → shift it

**Q3: Is the market simply saturated?**
- Too many sellers → compete on price (unsustainable)
- → Better to find a niche or variant that's less competitive

---

### 🔪 The Cut-Improve-Fix Framework

| Situation | Action |
|--|--|
| Margin < 0% (Loss) | **Cut** immediately — it's burning cash |
| Margin 0-8% | **Fix** — raise price 15-20% and test |
| Margin 8-15% | **Improve** — reduce cost or bundle it |
| Margin 15%+ | Keep and grow |

---

### ⚡ Quick Fixes to Try Before Cutting

1. Raise price by 10% and monitor sales for 14 days
2. Improve main product image (use white background, 5+ angles)
3. Add it to a bundle to sell alongside a star product
4. Run it in a BOGO (Buy One Get One) promotion

---
💬 Ask me: *"Should I remove this product?"* or *"How to improve product listing?"*`;
    },

    answerPricingStrategy() {
        return `# 💰 Pricing Strategy — The Complete Seller Guide

Good pricing is **the single most powerful lever** for profitability. Most sellers price wrong.

---

## The 5 Pricing Frameworks

### 1. Cost-Plus Pricing (Most Common, Often Wrong)
**Formula:** Cost Price + Fixed Markup %
- Simple but ignores market demand
- Use as a **minimum floor**, not your actual price

### 2. Value-Based Pricing ⭐ (Best for Profit)
Price based on what the customer *perceives* the product is worth — not what it costs you.
- Example: A branded bottle of water costs ₹3 to make. Sells for ₹50 because of brand. That's value-based pricing.
- Ask: *"What problem does this solve? What would the customer pay to solve it?"*

### 3. Competitive Pricing
Match or slightly undercut competitors.
- ⚠️ Danger: This is a race to the bottom
- Use only temporarily to gain market share, not permanently

### 4. Psychological Pricing
- ₹499 vs ₹500 = feels much cheaper (charm pricing)
- ₹999 vs ₹1,200 with strikethrough = perceived deal
- Bundle: "₹299 for 2" feels better than "₹150 each"

### 5. Dynamic Pricing
Change prices based on demand:
- Raise prices during festive season (Diwali, Holi)
- Lower during slow months to maintain volume

---

## 🎯 Optimal Margin Targets by Category

| Product Category | Target Margin |
|--|--|
| FMCG / Grocery | 10–20% |
| Electronics | 15–25% |
| Fashion / Clothing | 30–60% |
| Home Decor | 40–70% |
| Handmade / Crafts | 50–80% |
| Digital Products | 70–90% |

---

## The Price Increase Playbook

If you need to raise prices without losing customers:

1. **Raise gradually** — 5% every 3 months feels less than 15% at once
2. **Add value first** — improved packaging, free extra item, better warranty
3. **Frame it right** — "New & Improved" justifies a price increase
4. **Test on new customers first** — existing customers are price-sensitive

---
💬 Ask me: *"What price is optimal for my product?"* or *"How to use discounts without killing margin?"*`;
    },

    answerMarketing() {
        return `# 📢 Marketing Strategy for Sellers — Full Playbook

Marketing doesn't have to be expensive. Here's what actually works in 2024-25:

---

## 🔥 Free / Low-Cost Marketing (Start Here)

### 1. WhatsApp Business (ROI: Extremely High)
- Create broadcast list of customers
- Post new arrivals, offers, and stock updates
- Personalize messages: "Hi Priya, your favourite product just restocked!"
- **Cost: ₹0** | Response Rate: 40-60%

### 2. Instagram Reels (Organic Growth)
- Short 15-30 second videos of products in use
- Trending audio + product demonstration = viral potential
- 3-4 Reels per week is the minimum
- **Cost: ₹0** | Reach: Unlimited

### 3. Google My Business
- Free listing for local sellers
- Customers searching "shop near me" will find you
- Add products, photos, and respond to reviews
- **Cost: ₹0** | Local SEO boost

---

## 💰 Paid Advertising (When You Have Budget)

### Facebook/Instagram Ads
- Best for: Fashion, Home Decor, Beauty
- Start with: ₹200-300/day budget
- Target: Age, location, interests matching your buyer
- Winning formula: Video ad → Retarget website visitors → Lookalike audience

### Google Ads
- Best for: Products people actively search for
- Use Shopping Ads (product photos appear in search)
- Start with high-intent keywords: "buy [product] online India"

### Amazon/Flipkart Sponsored Ads
- Boosts your listing in search results
- Start with Automatic targeting → switch to Manual after data
- Budget: 8-12% of target revenue

---

## 📊 The Marketing ROI Formula

**ROAS (Return on Ad Spend) = Revenue from Ads ÷ Ad Spend**
- ROAS 2x = Breaking even (cover ad cost + COGS)
- ROAS 3-4x = Profitable
- ROAS 5x+ = Scale immediately!

---

## 🎯 Content Calendar Framework

| Day | Content Type |
|--|--|
| Monday | Product highlight / demo video |
| Wednesday | Customer review / testimonial |
| Friday | Weekend offer / flash sale |
| Sunday | Behind the scenes / story |

---
💬 Ask me: *"How do I run Facebook ads?"* or *"What's the best time to post?"*`;
    },

    answerGrowth(ctx) {
        const { kpis, hasManualData } = ctx;
        let snapshot = '';
        if (hasManualData && kpis.revenue > 0) {
            snapshot = `> 📊 **Your baseline:** Revenue = ${this.fmt(kpis.revenue)}, Margin = ${kpis.profitMargin.toFixed(1)}%\n\n`;
        }
        return `# 🚀 Business Growth Strategy — Scale to Next Level
${snapshot}
Growing a business requires scaling **three things simultaneously:** Revenue, Efficiency, and Systems.

---

## Phase 1: Foundation (₹0 – ₹1 Lakh/month)

**Priority: Prove your model works**

- ✅ Identify 2-3 products with 25%+ margin
- ✅ Establish consistent cash flow
- ✅ Build first 100 loyal customers
- ✅ Learn your sales cycle length

**Key metric to track:** Monthly Recurring Revenue (MRR)

---

## Phase 2: Growth (₹1L – ₹5L/month)

**Priority: Systematic scaling**

1. **Hire your first team member** — free your time for high-value work
2. **Automate repetitive tasks** — inventory alerts, invoice generation
3. **Open 2nd sales channel** — if offline, add online; if single platform, add another
4. **Build supplier relationships** — negotiate credit period (30-45 days = free working capital)

---

## Phase 3: Scale (₹5L+/month)

**Priority: Build systems that run without you**

1. **Delegate operations** — you should work ON the business, not IN it
2. **Invest in data analytics** — know your unit economics deeply
3. **Explore private labeling** — your own brand = 40-60% margins
4. **Consider B2B channel** — bulk orders to institutions/retailers

---

## The Growth Pyramid

\`\`\`
        [Scale]        ← Systems, Team, Data
      [Optimize]       ← Reduce costs, Improve margins
    [Prove Model]      ← Find what works
  [Foundation]         ← Skills, Capital, Product-Market fit
\`\`\`

---

## ⚡ 30-Day Quick Growth Actions

1. **List your top 5 products on one new platform** this week
2. **Message 20 previous customers** with a special offer
3. **Ask every customer for a WhatsApp number** (build your list)
4. **Raise price on 1 product by 10%** and track if sales drop
5. **Track daily revenue** — what gets measured gets managed

---
💬 Ask me: *"How do I scale from ₹50K to ₹2L/month?"* or *"Should I hire staff?"*`;
    },

    answerInventoryManagement() {
        return `# 📦 Complete Inventory Management Guide

Poor inventory management is the #1 silent killer of small businesses.

---

## 🔑 The 5 Core Inventory Principles

### 1. Know Your Lead Time
**Lead Time** = Days from placing order to receiving stock.
- Short lead time (1-3 days): Keep 7-day buffer
- Medium (4-7 days): Keep 14-day buffer
- Long (8-15 days): Keep 21-30 day buffer

### 2. Calculate Safety Stock
**Safety Stock** = Daily Sales × Maximum Lead Time Variability
- If you sell 10/day and supplier sometimes delays 3 extra days → Safety Stock = 30 units

### 3. Set Reorder Points
**Reorder Point = (Daily Sales × Lead Time) + Safety Stock**
When stock hits this number — **order immediately**

### 4. Track Fast vs Slow Movers
Review every 30 days:
- Fast movers → Always in stock (A-category)
- Slow movers → Tight stock, bundles to clear (C-category)

### 5. Seasonal Adjustment
- Festive season: Order 2-3x normal quantity 6 weeks before
- Off-season: Reduce to minimum viable stock

---

## 📊 Common Inventory Mistakes and Fixes

| Mistake | Fix |
|--|--|
| Ordering by gut feeling | Use data: avg daily sales × lead time |
| Same reorder point for all products | ABC analysis — category-specific buffers |
| Not tracking expiry dates | FIFO system (First In, First Out) |
| No shrinkage tracking | Weekly physical count vs system count |
| Overstock in slow season | Dynamic pricing to clear excess |

---

## Tools for Small Sellers

- **Google Sheets** — Free, customizable, perfect for beginners
- **Vyapar App** — ₹1,500/year, GST billing + inventory
- **Zoho Inventory** — ₹2,500/year, multi-channel
- **VENDRIXA IQ** — Real-time AI-powered alerts ✅

---
💬 Ask me: *"How many units should I order?"* or *"How to handle festive season stock?"*`;
    },

    answerCustomerRetention() {
        return `# 🤝 Customer Retention Strategy

**Fact:** Acquiring a new customer costs 5x more than retaining an existing one. Repeat customers spend 67% more on average.

---

## The Customer Loyalty Pyramid

\`\`\`
         [Advocates]  ← Tell others, leave reviews, bring referrals
        [Loyal]        ← Buy repeatedly without discounts
       [Regular]       ← Buy when there's an offer
      [One-Time]       ← Bought once, needs nurturing
    [Leads]            ← Haven't bought yet
\`\`\`

**Goal:** Move customers UP the pyramid.

---

## 🔥 7 Proven Retention Tactics

### 1. Post-Purchase WhatsApp Message (24-48 hours)
"Hi [Name]! Your [product] — hope you're loving it! If you have any questions, I'm here 🙏"
- Shows you care → 3x more likely to buy again

### 2. Loyalty Program
Simple version: Buy 5, get 5% off next purchase. Track manually on Google Sheets.

### 3. Birthday/Anniversary Recognition
Collect birth dates. Send a special offer on their birthday.

### 4. Exclusive Early Access
"As our loyal customer, you get to see our new collection 24 hours before everyone else."

### 5. Personalized Recommendations
If customer bought Product A → message them when the complementary Product B comes in.

### 6. Review Request (3-7 days after delivery)
"Would you mind sharing a quick review? It helps our small business grow 🙏"
- Customers who leave reviews return 2x more often

### 7. Surprise & Delight
Add a free small gift or handwritten thank-you note for orders above ₹500. Costs ₹5, creates lifetime loyalty.

---

## 📊 Key Retention Metrics

| Metric | How to Calculate | Target |
|--|--|--|
| Repeat Purchase Rate | Returning buyers ÷ Total buyers | 30%+ |
| Customer Lifetime Value | Avg order × Avg purchase frequency × Lifespan | Know your ₹ value |
| Net Promoter Score | "Would you recommend us?" (1-10) | 8+ |

---
💬 Ask me: *"How to create a loyalty program?"* or *"How to get more reviews?"*`;
    },

    answerCompetitors() {
        return `# 🏆 Competitor Analysis — Stay Ahead in the Market

Understanding your competition is not optional — it's survival.

---

## 🔍 How to Research Competitors (Free Methods)

### 1. Platform Search Analysis
- Search your product on Amazon/Flipkart
- Note: Top 5 results' pricing, reviews, ratings, delivery time
- Look for gaps: What complaints do they get? That's your opportunity.

### 2. "Review Mining" Strategy
Read 1-star and 2-star reviews of your competitors' products:
- What do customers hate? → Your differentiation opportunity
- "Delivery was slow" → You offer faster delivery
- "Poor packaging" → You invest in better packaging

### 3. Google Search
Search "[Product] price India", "[Product] buy online"
- See who ranks #1-5 on Google Shopping
- Their Google Ads tell you what keywords they're bidding on

### 4. Social Media Spy
- Follow competitor Instagram/Facebook pages
- See which posts get most engagement → tells you what their audience loves
- Check their ad library (Facebook Ad Library is free)

---

## 📊 Competitor Comparison Framework

Build a simple table for your top 3 competitors:

| Factor | You | Competitor A | Competitor B |
|--|--|--|--|
| Price | ₹X | ₹Y | ₹Z |
| Rating | _/5 | _/5 | _/5 |
| Delivery Speed | X days | Y days | Z days |
| Review Count | _ | _ | _ |
| Return Policy | _ | _ | _ |

**Where you're better → market that loudly**
**Where you're worse → fix it immediately**

---

## ⚡ Ways to Win Without Price War

1. **Win on Speed** — same-day delivery is a massive differentiator
2. **Win on Quality** — premium packaging, QC before shipping
3. **Win on Trust** — more reviews, better photos, detailed descriptions
4. **Win on Niche** — go deep into one segment instead of competing broadly
5. **Win on Relationship** — personal WhatsApp support vs. competitor's chat bot

---
💬 Ask me: *"How do I find competitor pricing?"* or *"Should I undercut my competitor?"*`;
    },

    answerCashFlow(ctx) {
        const { kpis, hasManualData } = ctx;
        let snap = '';
        if (hasManualData && kpis.revenue > 0) {
            snap = `> 📊 Your current data: Revenue ${this.fmt(kpis.revenue)}, Expenses ${this.fmt(kpis.expenses)}, Net: ${this.fmt(kpis.netProfit)}\n\n`;
        }
        return `# 💵 Cash Flow Management Guide
${snap}
**Critical truth:** A business can be profitable on paper but still go bankrupt due to poor cash flow. Profit ≠ Cash.

---

## Understanding Cash Flow vs Profit

**Profit** = Revenue - Costs (accounting number)
**Cash Flow** = Actual money in your bank account right now

Why they differ:
- You have stock you paid for but haven't sold yet (cash tied up)
- Customers owe you money (receivables)
- You have unpaid bills (payables)

---

## 🔴 Warning Signs of Cash Flow Problems

- You're profitable but can't pay salaries
- You delay supplier payments regularly
- You take personal loans for business expenses
- Your bank balance fluctuates wildly

---

## ✅ 8 Ways to Improve Cash Flow

**Collect Faster:**
1. **Invoice immediately** — don't wait until month end
2. **Offer 2% discount for early payment** (worth it to get cash faster)
3. **Accept UPI/online payments** — instant settlement vs. 3-day checks

**Pay Slower (Ethically):**
4. **Negotiate 30-45 day credit** with suppliers
5. **Pay strategic vendors last** (those with less leverage)

**Reduce Cash Tied Up:**
6. **Don't overstock** — every unsold unit is cash sitting idle
7. **Run clearance sales** monthly to convert dead stock to cash
8. **Lease equipment** instead of buying

**Build a Cash Buffer:**
9. **Keep 60 days of expenses** as emergency fund
10. **Separate business and personal accounts** — critical for clarity

---

## 💡 The Working Capital Formula

**Working Capital = Current Assets - Current Liabilities**
= (Stock value + Cash + Receivables) - (Amount you owe)

**Healthy:** Positive and growing
**Danger:** Negative or shrinking

---
💬 Ask me: *"How to manage cash during slow months?"* or *"Should I take a business loan?"*`;
    },

    answerProductResearch() {
        return `# 🔍 Product Research — How to Find Winning Products

The best product to sell: **High demand + Low competition + Good margin**

---

## 🔥 Trending Categories in India (2024-25)

### High Growth Categories:
- **Pet Products** — India's pet economy growing 20%+ YoY
- **Home Organisation** — WFH trend continues
- **Ayurvedic & Wellness** — Post-COVID focus on health
- **Sustainable Products** — Eco-friendly alternatives
- **D2C Fashion Accessories** — High margin, easy to differentiate
- **Regional Language Products** — Underserved tier 2-3 market
- **Educational Toys** — Growing middle-class investment in children

---

## 🛠️ Free Research Tools

### 1. Amazon Best Sellers
amazon.in/gp/bestsellers → See what's selling right now in every category

### 2. Google Trends
trends.google.com/trends → Track search interest over time
Look for: Rising trends (not yet oversaturated)

### 3. Flipkart Quick Checkout
Sticky products here = verified demand + fast delivery expectation

### 4. Meesho (for B2C potential)
Check what's trending in tier-2/3 cities — often underserved

### 5. Instagram Explore Tab
What products keep appearing in your feed? Brands are paying to show them → demand signal

---

## ✅ Product Validation Checklist

Before investing in a new product, verify:

- [ ] **Minimum 100+ searches/month** on Google Trends
- [ ] **Less than 50 sellers** for the exact variant you plan to sell
- [ ] **Selling price 3-4x your cost price** (Minimum 30% margin)
- [ ] **Not a seasonal-only product** (unless you plan for that)
- [ ] **Easy to ship** (not fragile, not overweight, not too bulky)
- [ ] **Not heavily branded** (avoid competing with established brands directly)

---

## 💡 A Framework: 4 Product Types

| Type | Example | Margin | Risk |
|--|--|--|--|
| **Staple** | Sugar, Flour | Low | Low |
| **Impulse** | Snacks, Accessories | Medium | Medium |
| **Premium** | Branded items | High | Medium |
| **Niche** | Specialty items | Very High | High effort, low competition |

*Best for beginners: Impulse + Niche combination*

---
💬 Ask me: *"What's the best product to sell on Meesho?"* or *"How to find low-competition products?"*`;
    },

    answerEcommerce() {
        return `# 🛒 E-commerce Platforms — Complete Seller Guide

Choosing the right platform is critical. Each has different buyer demographics and commission structures.

---

## Platform Comparison (India)

| Platform | Best For | Commission | Competition |
|--|--|--|--|
| **Amazon** | Electronics, Books, Branded goods | 5-15% | Very High |
| **Flipkart** | Fashion, Electronics, Home | 5-12% | High |
| **Meesho** | Fashion, Home Decor (Tier 2-3 cities) | 0-1% | Medium-High |
| **Nykaa** | Beauty, Wellness | 25-30% | Medium |
| **Myntra** | Fashion (Premium) | 20-25% | High |
| **D2C Website** | Any (your own brand) | 0-2% (payments only) | Low (you own it) |

---

## 🔑 Amazon Seller Tips

1. **Optimise listing title:** Brand + Product Type + Key Feature + Size/Color
2. **Use all 7 product images:** Front, back, dimensions, lifestyle, feature callouts
3. **A+ Content** unlocks at brand registration → 15-20% conversion boost
4. **FBA vs FBM:** FBA = faster delivery + buy box advantage (worth the ~15% extra fee for volume sellers)
5. **Review velocity:** 1 review per 15 orders is healthy. Use "Request Review" button within Seller Central.

---

## 💡 Meesho-Specific Strategy

- Best for: Very competitive prices + Tier 2-3 buyers
- Commission is almost 0% — your logistics is the main cost
- Product needs to work at ₹99–499 price range for best conversion
- No branding needed — product quality speaks

---

## 🌐 Why You Need Your Own D2C Site Eventually

- 0 commission (vs 5-25% on marketplaces)
- Build your own customer data (email, WhatsApp number)
- Launch on Shopify (₹1,500/month) or WooCommerce (free, self-hosted)
- Drive traffic with Instagram + Google Ads

---

## 📊 The Multi-Channel Strategy

**Don't depend on one platform.** If Amazon suspends your listing (it happens), your business shouldn't die.

Ideal mix for ₹5L+/month sellers:
- 40% Amazon
- 30% Flipkart/Meesho
- 20% D2C website
- 10% WhatsApp + offline

---
💬 Ask me: *"How to rank on Amazon?"* or *"Should I start a D2C website?"*`;
    },

    answerGST() {
        return `# 📋 GST for Sellers — Everything You Need to Know

GST (Goods and Services Tax) is mandatory once your annual turnover exceeds ₹20 lakh (₹10 lakh for some states).

---

## 💡 GST Basics for Sellers

**GST Structure:**
- 0% → Essential foods (raw grains, vegetables)
- 5% → Packaged foods, textbooks
- 12% → Processed foods, mobile phones
- 18% → Electronics, clothing >₹1,000
- 28% → Luxury goods, aerated drinks

**CGST + SGST = IGST**
- Intra-state sales: Pay CGST (50%) + SGST (50%)
- Inter-state sales: Pay IGST (100%)

---

## 📅 GST Filing Schedule

| Return | Frequency | Due Date |
|--|--|--|
| GSTR-1 | Monthly | 11th of next month |
| GSTR-3B | Monthly | 20th of next month |
| GSTR-9 | Annual | 31st December |

**Late Fees:** ₹50/day (₹20 for NIL returns)

---

## ✅ GST Best Practices for Sellers

1. **Maintain digital invoices** — mandatory for e-commerce sellers
2. **Track Input Tax Credit (ITC)** — you can claim tax paid on purchases
3. **Separate HSN codes** per product — Amazon/Flipkart require correct codes
4. **Use Vyapar or Busy** software for automatic GSTIN filing
5. **Reconcile every month** — match your platform settlement with your books

---

## E-Commerce GST Special Rule

For Amazon/Flipkart sellers:
- The marketplace deducts **TCS (Tax Collected at Source) at 1%** of your sales
- You claim this back in your ITR/GST return
- Keep Form 26AS updated — shows all TCS deducted

---

## 🚨 Common GST Mistakes to Avoid

- Filing only annual return without monthly GSTR-1 ❌
- Using personal account for business transactions ❌
- Not claiming ITC on business purchases ❌
- Ignoring notices from GST department ❌

---
💬 Ask me: *"How to register for GST?"* or *"What is the HSN code for my product?"*`;
    },

    answerReturns() {
        return `# 📦 Returns & Refunds Management Guide

Returns are the silent profit killer. A 10% return rate on ₹5L/month = ₹50,000 gone every month.

---

## 📊 Industry Return Benchmarks

| Category | Acceptable Return Rate |
|--|--|
| Electronics | 3-5% |
| Fashion | 15-25% (size issues) |
| Beauty | 5-8% |
| Home Decor | 5-10% |
| FMCG | 1-3% |

If you're above these: investigate immediately.

---

## 🔍 Why Products Get Returned (and fixes)

| Return Reason | Fix |
|--|--|
| "product looks different" | Better, accurate photos |
| "size doesn't fit" | Clear size chart + exact measurements |
| "quality not as expected" | Honest description + customer review-based calibration |
| "wrong item received" | QC check before packing |
| "damaged in transit" | Better packaging (bubble wrap, double box) |
| "changed my mind" | Nothing to do — buyer's privilege |

---

## 💡 How to Reduce Returns by 40%

### Step 1: Improve Product Listings
- Use all allowed images to show EVERY angle
- Include customer-shot photos (more authentic)
- Use video if allowed

### Step 2: Set Right Expectations
- List exact dimensions and weight
- Mention material clearly
- Add FAQ answer to common questions in description

### Step 3: Improve Packaging
- 70% of returns start with damage in transit
- Anti-moisture bags for electronics/clothing
- Proper fill material for fragile items

### Step 4: Pre-Delivery Customer Communication
"Your order is on the way! Here's a care guide for [product]" → reduces usage-related returns

---

## 🔄 When You Get Returns

1. **Inspect immediately** — Is it resaleable?
2. **Refurbish if needed** — Repack, fix minor issues
3. **Move to outlet channel** — Sell at slight discount via Meesho
4. **Track return reason codes** — Build a monthly dashboard

---
💬 Ask me: *"How to write a return policy?"* or *"Should I offer free returns?"*`;
    },

    answerSupplier() {
        return `# 🤝 Supplier & Vendor Management Guide

Your supplier relationship directly determines your cost structure and therefore your profit margin.

---

## 🔍 Where to Find Suppliers in India

### For Physical Products:
- **IndiaMart** (indiamart.com) — India's largest B2B marketplace
- **TradeIndia** — Alternative to IndiaMart
- **Alibaba** — For imports/large quantities
- **Local APMC Markets** — FMCG, agricultural products
- **Manufacturer Direct** — Best margins, requires relationship building
- **Wholesale Markets** — Surat (textiles), Delhi's Sadar Bazar, Mumbai's Dharavi

---

## 💰 The Negotiation Framework

**Remember:** Suppliers EXPECT negotiation. The first quote is never the final price.

### Before Negotiating:
1. Get quotes from at least 3 suppliers
2. Know the market rate (research IndiaMart)
3. Know your order quantity clearly

### During Negotiation:
- Start 20-25% below what you want to pay
- Ask for: Volume discounts, credit period, free samples
- Leverage: "I'm looking at 3 suppliers currently"
- Don't reveal your urgency

### What to Negotiate Beyond Price:
- **Credit period**: 30, 45, or 60 days = free working capital
- **Minimum order quantity (MOQ)**: Lower MOQ = less cash tied up
- **Lead time**: Faster delivery = lower safety stock needed
- **Return policy**: Can you return unsold inventory?
- **Exclusivity**: For high-volume buyers, ask for exclusive pricing

---

## 📊 Supplier Rating System

Track each supplier on:
- Price competitiveness (1-5)
- Delivery reliability (1-5)
- Quality consistency (1-5)
- Communication responsiveness (1-5)

Total score → Grade A/B/C suppliers. Replace C-grade suppliers every 6 months.

---

## ⚡ Pro Tips

1. **Never have a single supplier** — dependence = vulnerability
2. **Visit supplier premises at least once** — builds trust and reveals quality
3. **Pay on time** — good payment history = priority treatment + better prices
4. **Share your growth roadmap** — suppliers give better terms to buyers they see as long-term partners

---
💬 Ask me: *"How to negotiate with suppliers?"* or *"Should I import from China?"*`;
    },

    answerBundling(ctx) {
        const { hasManualData, hasUploadData } = ctx;
        let tip = '';
        if (hasManualData || hasUploadData) {
            tip = `\n> 💡 **Your data tip:** Check your Sales Logger or Upload data to identify which products are frequently bought together — that's your natural bundle!\n`;
        }
        return `# 🎁 Product Bundling & Upselling Strategy
${tip}
Bundling is one of the most underused profit-boosters for small sellers. Done right, it raises average order value by **25-40%**.

---

## Why Bundling Works

- Customers perceive **more value** at the same or slightly higher price
- You **move slower-moving inventory** attached to bestsellers
- Reduces per-unit shipping cost in some cases
- Creates a **unique offering** that competitors don't have

---

## 5 Types of Bundles

### 1. Complementary Bundle
Products that naturally go together.
- Shampoo + Conditioner + Hair mask
- Phone + Case + Tempered glass
- Notebook + Pen + Highlighter set

### 2. Volume Bundle (BOGO or Multi-pack)
- "Buy 3, save 15%" — encourages stocking up
- Great for FMCG, consumables

### 3. Sample Bundle (Discovery Bundle)
- 5 products × small quantity
- Perfect for new customers to try your range
- Higher perceived value vs single item

### 4. Gift Bundle (Festive / Occasion)
- Valentine's Day, Diwali, Wedding gifting
- Add premium packaging → 30-40% price premium justified

### 5. Mystery Box Bundle
- Surprise collection at fixed price (e.g., "₹499 Box - ₹800 worth of value")
- Creates excitement, helps clear varied inventory

---

## 💰 Pricing Your Bundle

**Rule: Bundle price should feel like 15-25% savings vs buying items separately**

Example:
- Product A (₹299) + Product B (₹199) = ₹498 if sold separately
- Bundle price: ₹399 → Customer saves ₹99 (20% off)
- Your cost: Still profitable at ₹399 if margins are healthy

---

## 📊 Upselling Tactics

**At point of sale:**
- "Add X (₹99 more) and complete your set"
- "Customers who bought this also bought..."
- "Upgrade to the 3-piece set for just ₹50 more"

**Post-purchase:**
- "Since you bought [Product A], here's 10% off [Product B]"
- Upsell during delivery tracking page

---
💬 Ask me: *"How to bundle my products?"* or *"What's a good combo offer?"*`;
    },

    answerSeasonal() {
        return `# 📅 Seasonal & Festive Sales Strategy

Indian retail is heavily seasonal. **30-40% of annual revenue** happens in 3-4 peak months. Miss it, and it's a full year lost.

---

## 📆 India's Key Selling Seasons

| Season | Month | Opportunity |
|--|--|--|
| Republic Day Sale | Jan | Electronics, Clothing |
| Valentine's Day | Feb 14 | Gifts, Flowers, Chocolates |
| Holi | March | Colors, FMCG, Clothing |
| Summer | Apr-Jun | Coolers, Summer wear, Beverages |
| Raksha Bandhan | Aug | Rakhis, Gift hampers |
| Independence Day | Aug 15 | Electronics, Clothing |
| Navratri | Sep-Oct | Traditional wear, Accessories |
| Dussehra-Diwali | Oct-Nov | **PEAK SEASON — Everything** |
| Christmas / New Year | Dec | Gifts, Electronics, Party |

---

## 🔥 Diwali Preparation Checklist (6 Weeks Before)

- [ ] **Stock up 3x normal inventory** (Diwali = 3-4x sales for most categories)
- [ ] **Pre-fund working capital** (Don't run out of cash during peak)
- [ ] **Create gift packs** with premium packaging
- [ ] **Brief suppliers on deadlines** — stock must arrive 3 weeks before
- [ ] **Prepare promotional content** in advance (WhatsApp messages, Instagram posts)
- [ ] **Test your website / app** for load capacity

---

## 💡 Off-Season Strategies (Don't Go Silent)

**Jan-March and June-July** are typically slow. Use this time to:

1. **Clear inventory** — deep discounts on slow movers
2. **Audit and negotiate** — renegotiate supplier contracts
3. **Train and systemize** — build SOP documents
4. **Test new products** — less to lose when sales are anyway slow
5. **Build your community** — grow WhatsApp list, Instagram followers

---

## 📊 Season-Specific Pricing

- **Peak season:** Don't discount — demand is high. Protect margin.
- **Pre-peak:** Slight discount to build buzz (early access)
- **Post-peak:** Clearance on leftover seasonal stock
- **Off-season:** Volume discounts to keep cash flowing

---
💬 Ask me: *"How to prepare for Diwali sales?"* or *"What to sell in summer?"*`;
    },

    answerReduceExpenses(ctx) {
        const { expenses, kpis, hasManualData } = ctx;
        let dataLine = '';
        if (hasManualData && expenses.length > 0) {
            const top = [...expenses].sort((a,b)=>b.amount-a.amount)[0];
            dataLine = `\n> 📊 **Your Data:** Biggest expense is **${top.category}** (${this.fmt(top.amount)}). Total expenses: ${this.fmt(kpis.expenses)}\n`;
        }
        return `# ✂️ How to Reduce Business Expenses
${dataLine}
**The goal is not to be cheapest — it's to be efficient. Cut waste, not quality.**

---

## 🔍 The Expense Audit Process

### Step 1: List every single expense for last 3 months
Group into:
- **Variable:** Packaging, shipping, cost of goods
- **Fixed:** Rent, salaries, subscriptions
- **One-time:** Equipment, setup costs

### Step 2: For each expense, ask:
1. Is this necessary? (If no → eliminate)
2. Can I get the same for less? (If yes → negotiate)
3. Can I replace this with something else? (If yes → substitute)

---

## 💰 Quick Wins — Cost Cuts You Can Do This Week

**Packaging:**
- Right-size your boxes (courier charges on dimensional weight — smaller box = lower charge)
- Buy 3-month supply in bulk for 15-20% discount
- Use sustainable materials (cost neutral + marketing benefit)

**Shipping:**
- Compare Delhivery, Shiprocket, Blue Dart rates quarterly
- Aggregate volume across platforms for better rates
- Zone -wise pricing — avoid heavy-item zones when possible

**Subscriptions:**
- Cancel anything you haven't used in 30 days
- Switch to annual plan for tools you definitely use (20-30% cheaper)
- Share accounts where terms permit (Canva Pro, etc.)

**Staff:**
- Hire contractual/part-time for peak periods only
- Measure productivity — output per hour, not hours present
- Automate data entry, reporting, invoicing

---

## ⚡ The 80/20 Rule for Expense Cuts

Focus on the **20% of expenses that represent 80% of cost.**
For most sellers, this is:
1. Cost of Goods → Supplier negotiation
2. Labour → Efficiency improvement
3. Rent → Renegotiate or optimize space usage

Small cuts everywhere = exhausting. Big cuts in 3 places = powerful.

---
💬 Ask me: *"Is my rent too high?"* or *"How to cut packaging cost by 30%?"*`;
    },

    answerBranding() {
        return `# 🎨 Brand Building for Small Sellers

A brand is not your logo — it's what customers say about you when you're not in the room.

---

## Why Branding Matters for Profit

- **Branded products command 20-50% premium** over generic equivalents
- Customers return to brands, not just products
- Strong brand = direct traffic = 0 acquisition cost

---

## Building Your Brand in 5 Steps

### Step 1: Define Your Brand Identity
Answer these questions:
- Who is my ideal customer? (Age, income, lifestyle)
- What problem do I solve for them?
- What 3 words would I want customers to use to describe me?
- What makes me different from competitors?

### Step 2: Visual Identity (DIY Option)
- **Logo:** Canva (free) → professionally enough for first ₹10L
- **Colour palette:** Choose 2-3 consistent colours (builds recognition)
- **Typography:** Stick to 2 fonts maximum
- **Cost:** ₹0-₹5,000 for custom design

### Step 3: Packaging as Brand Building
Unboxing experience = free marketing.
- Branded tissue paper inside the box
- Thank-you card with your social handles
- "Made with care" stamp
- Premium look costs ₹5-10 more per unit → but customers photograph it and post online (free marketing)

### Step 4: Consistent Voice & Tone
- Formal vs. casual? (Know your audience)
- Use consistent language across WhatsApp, Instagram, packaging
- Reply to every review and comment (builds community)

### Step 5: Private Label (When Ready)
Once you're at ₹3-5L/month:
- Get products manufactured under your own brand name
- Margin jumps from 20% to 40-60%
- You own the brand — no competition can replicate

---

## 📊 Brand Value = Business Value

When selling your business, branded businesses sell for **3-5x revenue** vs 0.5-1x for generic resellers.

---
💬 Ask me: *"How to create a private label?"* or *"How to build brand on Instagram?"*`;
    },

    answerAbout() {
        return `# 🤖 About VENDRIXA AI

I am **VENDRIXA IQ** — an AI-powered business analyst built specifically for sellers, shop owners, and small business operators.

---

## What I Can Do

- 📊 **Analyse your sales and profit data** in real-time
- 💡 **Give strategic business advice** based on proven frameworks
- 💰 **Help with pricing, margins, and expense optimization**
- 📦 **Monitor inventory and restock alerts**
- 🔍 **Research products, competitors, and markets**
- 🤝 **Coach you on marketing, customer retention, and growth**

---

## My Knowledge Covers

- E-commerce platforms (Amazon, Flipkart, Meesho, Nykaa)
- Indian retail & GST compliance
- Supply chain & supplier management
- Digital marketing & social media
- Cash flow management
- Business scaling strategies
- Customer psychology & sales tactics

---

## How to Get the Best From Me

1. **Be specific:** "How do I reduce my rent?" gets a better answer than "Help me"
2. **Share context:** Upload your sales data for personalized insights
3. **Ask follow-up questions:** Like a real advisor, I respond better to conversation
4. **Challenge my answers:** If something doesn't fit your situation, tell me

---

> *"I am not just a chatbot. I am your always-available, data-driven business advisor — trained to help sellers like you grow, profit, and thrive."*

**— VENDRIXA AI v2**`;
    },

    answerBusinessGeneral(ctx) {
        const { hasManualData, hasUploadData, kpis } = ctx;
        let snap = '';
        if ((hasManualData || hasUploadData) && kpis.revenue > 0) {
            snap = `\n> 📊 **Snapshot:** Revenue ${this.fmt(kpis.revenue)} | Margin ${kpis.profitMargin.toFixed(1)}% | Net Profit ${this.fmt(kpis.netProfit)}\n`;
        }
        return `# 💼 General Business Advice for Sellers
${snap}
Here are the top principles that separate thriving sellers from struggling ones:

---

## The 5 Laws of Profitable Selling

**Law 1: Know Your Numbers**
Most sellers don't know their exact margin, their best product, or their monthly cash burn. Knowledge is profit. Use VENDRIXA IQ to track this in real-time.

**Law 2: Focus on Margin, Not Revenue**
Revenue is vanity. Profit is sanity. A ₹10L revenue business with 5% margin makes ₹50K. A ₹2L business with 40% margin makes ₹80K. Smaller can be better.

**Law 3: Your Top 20% Products Drive 80% of Success**
Find them, protect them, promote them, and never let them stockout.

**Law 4: Customer Acquisition Cost (CAC) must be less than Lifetime Value (LTV)**
- CAC: How much to get a new customer?
- LTV: How much does that customer spend over their lifetime?
- If LTV > 3× CAC → you have a healthy business model

**Law 5: Cash is Oxygen**
Track cash weekly. A profitable business can die from cash starvation. Build a 60-day expense buffer.

---

## Today's Action Items

Based on best practices, here's what you should do **this week:**

1. ✅ Log all your sales and expenses in VENDRIXA IQ
2. ✅ Identify your top 3 and bottom 3 products by margin
3. ✅ Message 10 past customers with a special offer
4. ✅ Get 3 quotes from alternative suppliers for your top products
5. ✅ Calculate: How many sales do you need daily to hit your monthly goal?

---
💬 **I'm here for any specific question!** Try: *"How to increase profit margin?"* or *"Which product should I focus on?"*`;
    },

    answerAnalyse(ctx) {
        const { kpis, inv, sales, expenses, upData, hasManualData, hasUploadData } = ctx;

        if (!hasManualData && !hasUploadData) {
            return `# 📊 Business Analysis — No Data Yet

It looks like you haven't uploaded any data or logged entries yet.

### To get your personalized analysis:

**Option 1: Upload a file** (fastest)
- Go to **📤 Upload & Analyse** in the sidebar
- Upload your CSV or Excel sales data
- I'll instantly generate full analytics

**Option 2: Manual entry**
- Go to **📦 Inventory** → Add your products
- Go to **💳 Sales Logger** → Log today's sales
- Go to **🧾 Expenses** → Log your monthly costs
- Come back here and ask me again!

Once I have your data, I can tell you:
- Exactly which products are making vs losing you money
- Where your hidden costs are draining profit
- Which products to push, which to drop
- Your realistic growth trajectory`;
        }

        const source = hasUploadData && upData ? upData : null;
        const revenue = source ? source.totalRevenue : kpis.revenue;
        const profit  = source ? source.totalProfit  : kpis.netProfit;
        const margin  = source ? source.avgMargin    : kpis.profitMargin;
        const expAmt  = source ? source.totalExpenses : kpis.expenses;

        const health  = margin > 25 ? '🟢 Healthy' : margin > 15 ? '🟡 Average' : '🔴 Needs Attention';

        return `# 📊 Your Business Performance Analysis

**Overall Health: ${health}**

---

## Key Metrics

| Metric | Value | Status |
|--|--|--|
| Total Revenue | ${this.fmt(revenue)} | ${revenue > 0 ? '✅' : '⚠️'} |
| Net Profit | ${this.fmt(profit)} | ${profit > 0 ? '✅' : '🔴 Loss'} |
| Profit Margin | ${margin.toFixed(1)}% | ${margin > 20 ? '✅ Healthy' : margin > 10 ? '⚠️ Improvable' : '🔴 Critical'} |
| Expenses | ${this.fmt(expAmt)} | — |

---

## Product Portfolio Analysis

${source && source.sortedProducts ? `**Top Performers:**
${source.sortedProducts.slice(0,3).map((p,i) => `${i+1}. **${p.name}** — ₹${p.revenue.toFixed(0)} revenue, ${p.margin.toFixed(1)}% margin`).join('\n')}

**Needs Attention:**
${[...source.products].sort((a,b)=>a.margin-b.margin).slice(0,2).map(p => `- **${p.name}** — ${p.margin.toFixed(1)}% margin ${p.profit < 0 ? '(LOSS-MAKING 🔴)' : ''}`).join('\n')}` : 
`You have **${sales.length}** sales entries across **${inv.length}** products.`}

---

## Immediate Recommendations

${margin < 15 ? '1. 🚨 **Priority 1:** Profit margin is critically low. Raise prices on top products by 10-15% immediately.\n' : ''}${expAmt > revenue * 0.35 ? '2. ⚠️ **Priority 2:** Expenses exceed 35% of revenue. Audit top 3 expense categories.\n' : ''}${inv.filter(i=>i.stock<5).length > 0 ? `3. 📦 **Priority 3:** ${inv.filter(i=>i.stock<5).length} products need restocking.\n` : ''}
4. 📈 Focus marketing budget on your top-performing products
5. 💡 Review pricing on any product with margin below 20%

---
💬 Ask me anything specific: *"How to improve my margin?"* or *"Which product should I promote?"*`;
    },

    answerCatchAll(q, ctx) {
        // Attempt to give a relevant answer even for unknown queries
        const topicHints = [
            'profit and margins', 'pricing strategy', 'inventory management',
            'sales growth', 'expense reduction', 'marketing', 'customers',
            'product research', 'e-commerce platforms', 'GST and taxes',
            'cash flow', 'supplier negotiation', 'bundling', 'branding'
        ];

        return `# 🤖 VENDRIXA AI — I'm Here to Help!

I wasn't able to find a perfect match for your query: *"${q}"*

But I'm a comprehensive seller intelligence platform! Here are the topics I can answer deeply:

---

## 📚 What I Know About

| Topic | Example Questions |
|--|--|
| 💰 Profit & Margins | "What is my profit margin?" "How to improve profit?" |
| 📊 Revenue & Sales | "What are my total sales?" "How to increase revenue?" |
| 📦 Inventory | "Which products need restocking?" "How to manage stock?" |
| 💵 Expenses | "How to reduce costs?" "What are my biggest expenses?" |
| 🏷️ Pricing | "How should I price my product?" "Is my price too low?" |
| 📢 Marketing | "How to run ads?" "How to use Instagram?" |
| 🚀 Growth | "How to scale my business?" "Reach ₹1 lakh/month" |
| 🛒 E-commerce | "Amazon vs Flipkart?" "How to rank my listing?" |
| 🤝 Suppliers | "How to negotiate?" "Where to find suppliers?" |
| 📋 GST | "How to file GST?" "What is ITC?" |
| ↩️ Returns | "How to reduce returns?" "Return policy tips" |
| 🎯 Customers | "How to retain customers?" "Loyalty programs" |
| 📅 Seasons | "Diwali strategy?" "Off-season tips?" |

---

Try rephrasing your question or pick a topic from above!

**Tip:** The more specific you are, the better my answer. For example:
- ❌ "Help me" 
- ✅ "How do I increase my profit margin on clothing products?"

---
💬 I'm ready! What would you like to know?`;
    },

    // ─── LEGACY: generateInsights (used by Overview AI Summary) ─
    generateInsights() {
        const ctx = this.buildContext();
        const { kpis, inv, sales, upData, hasManualData, hasUploadData } = ctx;

        const insights = [];

        if (!hasManualData && !hasUploadData) {
            return ["I'm ready! Upload your business data or log sales to get intelligent insights automatically."];
        }

        if (hasUploadData && upData) {
            if (upData.avgMargin < 15) {
                insights.push(`⚠️ **Margin Alert:** Your average profit margin from the uploaded data is **${upData.avgMargin.toFixed(1)}%** — below the healthy 20% threshold.`);
            } else {
                insights.push(`✅ **Healthy Margins:** Uploaded data shows **${upData.avgMargin.toFixed(1)}%** average margin across ${upData.rowCount} records.`);
            }
            const best = upData.sortedProducts[0];
            if (best) insights.push(`⭐ **Top Revenue Driver:** **${best.name}** contributes ${this.fmt(best.revenue)} (${((best.revenue/upData.totalRevenue)*100).toFixed(1)}% of total).`);
            const losers = upData.products.filter(p => p.profit < 0);
            if (losers.length) insights.push(`🔴 **Loss-Making Products:** ${losers.map(p=>`**${p.name}**`).join(', ')} are running at a loss. Immediate action needed.`);
        } else if (hasManualData) {
            if (kpis.profitMargin < 15 && kpis.revenue > 0) {
                insights.push(`⚠️ **Low Margin Alert:** Net margin is **${kpis.profitMargin.toFixed(1)}%**. Aim for 20%+ by reducing COGS or raising prices.`);
            }
            const low = inv.filter(i => i.stock > 0 && i.stock < 5);
            if (low.length) insights.push(`📦 **Restock Alert:** ${low.map(i=>i.name).join(', ')} have less than 5 units.`);
            if (kpis.expenses/kpis.revenue > 0.4) insights.push(`💰 **Expense Warning:** Overhead is eating **${((kpis.expenses/kpis.revenue)*100).toFixed(1)}%** of revenue. Review rent and salaries.`);
        }

        if (!insights.length) insights.push('✅ All key metrics are stable. No critical issues detected. Focus on growth!');
        return insights;
    }
};
