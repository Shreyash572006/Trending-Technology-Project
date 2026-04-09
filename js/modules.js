// modules.js — Marketing, Competitor, Reviews, Reports, Pricing, Advisor modules

// ─── Reports ────────────────────────────────────────────────────────────────
const Reports = {
    downloadCSV(filename, header, rows) {
        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    generateFull() {
        const sales    = DB.getSales();
        const expenses = DB.getExpenses();
        const kpis     = DB.getKPIs();

        const rows = [
            ...sales.map(s => ['SALE', s.date, s.productName, s.quantity, s.sellingPrice, s.totalSales, s.profit, s.profitMargin.toFixed(2)+'%']),
            ...expenses.map(e => ['EXPENSE', e.date, e.category, '-', '-', -e.amount, -e.amount, '-'])
        ];

        this.downloadCSV('vendrixa_full_report.csv',
            ['Type','Date','Product/Category','Qty','Unit Price','Total','Profit','Margin'],
            rows
        );

        this.renderPreview(kpis, sales, expenses);
        showToast('Full report downloaded!', 'success');
    },

    generateSalesOnly() {
        const sales = DB.getSales();
        if (!sales.length) { showToast('No sales data to export', 'error'); return; }
        this.downloadCSV('vendrixa_sales.csv',
            ['Date','Product','Qty','Selling Price','Total Sales','Profit','Margin'],
            sales.map(s => [s.date, s.productName, s.quantity, s.sellingPrice, s.totalSales, s.profit.toFixed(2), s.profitMargin.toFixed(2)+'%'])
        );
        showToast('Sales report downloaded!', 'success');
    },

    generateExpensesOnly() {
        const exps = DB.getExpenses();
        if (!exps.length) { showToast('No expenses to export', 'error'); return; }
        this.downloadCSV('vendrixa_expenses.csv',
            ['Date','Category','Description','Amount'],
            exps.map(e => [e.date, e.category, e.description, e.amount])
        );
        showToast('Expense report downloaded!', 'success');
    },

    renderPreview(kpis, sales, expenses) {
        const el = document.getElementById('reportSummaryContent');
        el.innerHTML = `
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1rem;margin-bottom:1rem">
                <div style="background:rgba(124,58,237,0.1);padding:1rem;border-radius:0.5rem">
                    <div style="font-size:0.75rem;color:var(--text-muted)">TOTAL REVENUE</div>
                    <div style="font-size:1.5rem;font-weight:800">${formatMoney(kpis.revenue)}</div>
                </div>
                <div style="background:rgba(239,68,68,0.1);padding:1rem;border-radius:0.5rem">
                    <div style="font-size:0.75rem;color:var(--text-muted)">TOTAL EXPENSES</div>
                    <div style="font-size:1.5rem;font-weight:800">${formatMoney(kpis.expenses)}</div>
                </div>
                <div style="background:rgba(16,185,129,0.1);padding:1rem;border-radius:0.5rem">
                    <div style="font-size:0.75rem;color:var(--text-muted)">NET PROFIT</div>
                    <div style="font-size:1.5rem;font-weight:800">${formatMoney(kpis.netProfit)}</div>
                </div>
                <div style="background:rgba(59,130,246,0.1);padding:1rem;border-radius:0.5rem">
                    <div style="font-size:0.75rem;color:var(--text-muted)">PROFIT MARGIN</div>
                    <div style="font-size:1.5rem;font-weight:800">${kpis.profitMargin.toFixed(1)}%</div>
                </div>
            </div>
            <p style="font-size:0.875rem">📦 ${sales.length} sales entries · 🧾 ${expenses.length} expense entries · Report generated at ${new Date().toLocaleString()}</p>
        `;
    }
};

// ─── Competitor Analysis ─────────────────────────────────────────────────────
const Competitor = {
    items: [],

    init() {
        const savedKey = 'viq_competitors_' + (Auth.getCurrentUser()?.id || 'guest');
        const saved = localStorage.getItem(savedKey);
        if (saved) this.items = JSON.parse(saved);
        this.render();

        document.getElementById('addCompBtn').addEventListener('click', () => {
            const product  = document.getElementById('compProduct').value.trim();
            const yourPrice = parseFloat(document.getElementById('compYourPrice').value);
            const compPrice = parseFloat(document.getElementById('compPrice').value);
            const compName  = document.getElementById('compName').value.trim() || 'Competitor';

            if (!product || isNaN(yourPrice) || isNaN(compPrice)) {
                showToast('Please fill all competitor fields', 'error');
                return;
            }

            this.items.push({ id: 'comp_' + Date.now(), product, yourPrice, compPrice, compName });
            localStorage.setItem(savedKey, JSON.stringify(this.items));
            this.render();

            // Reset
            ['compProduct','compYourPrice','compPrice','compName'].forEach(id => document.getElementById(id).value = '');
            showToast('Comparison added!', 'success');
        });
    },

    render() {
        const tbody = document.getElementById('competitorTableBody');
        if (!this.items.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="color:var(--text-muted)">No comparisons added yet</td></tr>';
            return;
        }
        tbody.innerHTML = this.items.map(item => {
            const diff    = item.yourPrice - item.compPrice;
            const verdict = diff > 0
                ? `<span style="color:var(--danger)">₹${Math.abs(diff).toFixed(0)} higher — Consider reducing</span>`
                : diff < 0
                    ? `<span style="color:var(--accent)">₹${Math.abs(diff).toFixed(0)} cheaper — Competitive advantage!</span>`
                    : `<span style="color:#F59E0B">Same price — Differentiate on quality</span>`;
            return `<tr>
                <td><strong>${item.product}</strong></td>
                <td>${formatMoney(item.yourPrice)}</td>
                <td>${item.compName}</td>
                <td>${formatMoney(item.compPrice)}</td>
                <td style="color:${diff>0?'var(--danger)':diff<0?'var(--accent)':'#F59E0B'}">${diff>=0?'+':''}₹${diff.toFixed(0)}</td>
                <td>${verdict}</td>
                <td><button class="btn btn-danger" style="padding:0.2rem 0.5rem;font-size:0.75rem" onclick="Competitor.remove('${item.id}')">Del</button></td>
            </tr>`;
        }).join('');
    },

    remove(id) {
        if (!confirm('Remove this comparison?')) return;
        this.items = this.items.filter(i => i.id !== id);
        const k = 'viq_competitors_' + (Auth.getCurrentUser()?.id || 'guest');
        localStorage.setItem(k, JSON.stringify(this.items));
        this.render();
    }
};

// ─── Reviews Module ──────────────────────────────────────────────────────────
const ReviewsModule = {
    items: [],
    KEYWORDS_NEG: ['bad','worst','poor','slow','broken','defective','terrible','waste','disappointed','dirty','rude','overpriced'],
    KEYWORDS_POS: ['excellent','great','love','amazing','perfect','fast','quality','wonderful','happy','good','best','satisfied'],

    init() {
        const k = 'viq_reviews_' + (Auth.getCurrentUser()?.id || 'guest');
        const saved = localStorage.getItem(k);
        if (saved) this.items = JSON.parse(saved);
        this.render();

        document.getElementById('addReviewBtn').addEventListener('click', () => {
            const product  = document.getElementById('revProduct').value.trim();
            const customer = document.getElementById('revCustomer').value.trim() || 'Anonymous';
            const rating   = parseInt(document.getElementById('revRating').value);
            const text     = document.getElementById('revText').value.trim();

            if (!product || !text) { showToast('Product and review text are required', 'error'); return; }

            const sentiment = this.analyse(text, rating);

            this.items.unshift({ id: 'rev_' + Date.now(), product, customer, rating, text, sentiment, date: new Date().toLocaleDateString() });
            localStorage.setItem(k, JSON.stringify(this.items));
            this.render();

            ['revProduct','revCustomer','revText'].forEach(id => document.getElementById(id).value = '');
            document.getElementById('revRating').value = '5';
            showToast(`Review saved — Sentiment: ${sentiment.label}`, 'success');
        });
    },

    analyse(text, rating) {
        const lower     = text.toLowerCase();
        const negHits   = this.KEYWORDS_NEG.filter(k => lower.includes(k));
        const posHits   = this.KEYWORDS_POS.filter(k => lower.includes(k));
        const score     = (posHits.length - negHits.length) + (rating - 3);

        const label = score > 1 ? 'Positive 😊' : score < -1 ? 'Negative 😟' : 'Neutral 😐';
        const color = score > 1 ? 'var(--accent)' : score < -1 ? 'var(--danger)' : '#F59E0B';
        return { label, color, negHits, posHits, score };
    },

    render() {
        const listEl = document.getElementById('reviewsList');
        const sumEl  = document.getElementById('sentimentSummary');

        if (!this.items.length) {
            listEl.innerHTML = '<p style="color:var(--text-muted)">No reviews yet.</p>';
            return;
        }

        const pos = this.items.filter(r => r.sentiment.score > 1).length;
        const neg = this.items.filter(r => r.sentiment.score < -1).length;
        const neu = this.items.length - pos - neg;
        const avgRating = (this.items.reduce((s,r) => s + r.rating, 0) / this.items.length).toFixed(1);

        sumEl.innerHTML = `
            <h3 style="margin-bottom:1rem">Sentiment Summary</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem">
                <div style="background:rgba(16,185,129,0.1);padding:0.75rem;border-radius:0.5rem;text-align:center">
                    <div style="font-size:1.5rem;font-weight:800;color:var(--accent)">${pos}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">Positive</div>
                </div>
                <div style="background:rgba(239,68,68,0.1);padding:0.75rem;border-radius:0.5rem;text-align:center">
                    <div style="font-size:1.5rem;font-weight:800;color:var(--danger)">${neg}</div>
                    <div style="font-size:0.75rem;color:var(--text-muted)">Negative</div>
                </div>
            </div>
            <p style="font-size:0.875rem;color:var(--text-muted)">Average Rating: ⭐ ${avgRating} / 5 · ${this.items.length} reviews</p>
            ${neg > pos ? '<p style="color:var(--danger);font-size:0.875rem;margin-top:0.5rem">⚠️ More negative reviews than positive. Focus on product quality.</p>' : ''}
        `;

        listEl.innerHTML = this.items.map(r => `
            <div style="padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.05)">
                <div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:0.25rem">
                    <strong>${r.product}</strong>
                    <span style="color:${r.sentiment.color}">${r.sentiment.label}</span>
                </div>
                <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.25rem">${'⭐'.repeat(r.rating)} — ${r.customer} · ${r.date}</div>
                <p style="font-size:0.875rem;color:rgba(255,255,255,0.7)">${r.text}</p>
            </div>
        `).join('');
    }
};

// ─── Pricing Module ──────────────────────────────────────────────────────────
const PricingModule = {
    init() {
        const range = document.getElementById('pricingPriceRange');
        const valEl = document.getElementById('priceRangeVal');
        range.oninput = () => { valEl.textContent = '₹' + range.value; };

        document.getElementById('calcPricing').addEventListener('click', () => {
            const product = document.getElementById('pricingProduct').value || 'Product';
            const cost    = parseFloat(document.getElementById('pricingCost').value);
            const price   = parseFloat(range.value);
            const qty     = parseInt(document.getElementById('pricingQty').value) || 100;

            if (isNaN(cost) || cost <= 0) { showToast('Enter a valid cost price', 'error'); return; }

            const margin      = ((price - cost) / price) * 100;
            const monthProfit = (price - cost) * qty;

            // Simulate 3 scenarios
            const scenarios = [
                { label: 'Conservative (+5%)',  price: Math.round(price * 1.05), highlight: false },
                { label: 'Recommended (+15%)',  price: Math.round(cost / 0.80),  highlight: true  },
                { label: 'Premium (+25%)',       price: Math.round(cost / 0.70),  highlight: false }
            ];

            const el = document.getElementById('pricingResults');
            el.innerHTML = `
                <div style="margin-bottom:1rem;padding:1rem;background:rgba(124,58,237,0.1);border-radius:0.5rem">
                    <div style="font-size:0.75rem;color:var(--text-muted)">CURRENT METRICS</div>
                    <div style="font-size:1.25rem;font-weight:700">${product} @ ₹${price}</div>
                    <div style="color:${margin>15?'var(--accent)':'var(--danger)'}">Margin: ${margin.toFixed(1)}% · Monthly Profit: ${formatMoney(monthProfit)}</div>
                </div>
                <h4 style="margin-bottom:0.75rem;font-size:0.875rem;color:var(--text-muted)">PRICING SCENARIOS:</h4>
                ${scenarios.map(s => {
                    const sm   = ((s.price - cost) / s.price * 100);
                    const sprof = (s.price - cost) * qty;
                    return `<div style="padding:0.75rem;border-radius:0.5rem;margin-bottom:0.5rem;background:${s.highlight?'rgba(124,58,237,0.2)':'rgba(255,255,255,0.04)'};border:1px solid ${s.highlight?'var(--primary)':'transparent'}">
                        <div style="display:flex;justify-content:space-between;align-items:center">
                            <span>${s.label}</span>
                            <strong>₹${s.price}</strong>
                        </div>
                        <div style="font-size:0.8rem;color:var(--text-muted)">Margin: ${sm.toFixed(1)}% · Profit/mo: ${formatMoney(sprof)}</div>
                        ${s.highlight ? '<div style="font-size:0.75rem;color:var(--primary-light);margin-top:0.25rem">⭐ Recommended for 20% margin</div>' : ''}
                    </div>`;
                }).join('')}
            `;
        });

        this.loadUploadedPricingData();
    },

    loadUploadedPricingData() {
        const el = document.getElementById('pricingTableContainer');
        if (!UploadEngine.processedData) return;

        const products = UploadEngine.processedData.products;
        el.innerHTML = `<div class="table-container"><table>
            <thead><tr><th>Product</th><th>Avg Cost</th><th>Avg Sell Price</th><th>Current Margin</th><th>AI Suggest</th></tr></thead>
            <tbody>${products.map(p => {
                const avgCost = p.cost / p.qty;
                const avgSell = p.revenue / p.qty;
                const suggested = (avgCost / 0.80).toFixed(0);
                return `<tr>
                    <td>${p.name}</td>
                    <td>${formatMoney(avgCost)}</td>
                    <td>${formatMoney(avgSell)}</td>
                    <td style="color:${p.margin>15?'var(--accent)':'var(--danger)'}">${p.margin.toFixed(1)}%</td>
                    <td style="color:var(--primary-light)">${p.margin < 20 ? `Raise to ₹${suggested} for 20% margin` : '✅ Margin is healthy'}</td>
                </tr>`;
            }).join('')}</tbody>
        </table></div>`;
    }
};

// ─── Business Advisor ────────────────────────────────────────────────────────
const BusinessAdvisor = {
    init() { this.refresh(); },

    refresh() {
        const kpis = DB.getKPIs();
        const inv  = DB.getInventory();
        const sales = DB.getSales();

        const cards = [
            {
                icon: '📈',
                title: 'Revenue Health',
                value: formatMoney(kpis.revenue),
                status: kpis.revenue > 0 ? 'Active' : 'No data',
                color: kpis.revenue > 0 ? 'var(--accent)' : 'var(--text-muted)',
                tip: kpis.revenue > 0 ? 'Add more products to increase revenue streams.' : 'Log your first sale to start tracking.'
            },
            {
                icon: '💰',
                title: 'Profit Margin',
                value: kpis.profitMargin.toFixed(1) + '%',
                status: kpis.profitMargin > 20 ? 'Excellent' : kpis.profitMargin > 10 ? 'Average' : 'Critical',
                color: kpis.profitMargin > 20 ? 'var(--accent)' : kpis.profitMargin > 10 ? '#F59E0B' : 'var(--danger)',
                tip: kpis.profitMargin < 15 ? 'Reduce COGS or raise selling prices to hit 20%+ margin.' : 'Keep optimising costs.'
            },
            {
                icon: '📦',
                title: 'Inventory Status',
                value: inv.length + ' products',
                status: inv.filter(i => i.stock < 5).length > 0 ? 'Low Stock!' : 'Healthy',
                color: inv.filter(i => i.stock < 5).length > 0 ? 'var(--danger)' : 'var(--accent)',
                tip: inv.filter(i => i.stock < 5).length > 0 ? 'Restock critically low items immediately.' : 'Inventory well maintained.'
            },
            {
                icon: '🧾',
                title: 'Expense Control',
                value: formatMoney(kpis.expenses),
                status: kpis.revenue > 0 && (kpis.expenses/kpis.revenue) > 0.3 ? 'High' : 'OK',
                color: kpis.revenue > 0 && (kpis.expenses/kpis.revenue) > 0.3 ? 'var(--danger)' : 'var(--accent)',
                tip: 'Review recurring expenses monthly and negotiate better rates.'
            }
        ];

        document.getElementById('advisorCards').innerHTML = cards.map(c => `
            <div class="glass" style="padding:1.5rem">
                <div style="font-size:2rem;margin-bottom:0.75rem">${c.icon}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em">${c.title}</div>
                <div style="font-size:1.75rem;font-weight:800;margin:0.25rem 0">${c.value}</div>
                <div style="color:${c.color};font-size:0.875rem;font-weight:600;margin-bottom:0.75rem">${c.status}</div>
                <p style="font-size:0.8rem;color:var(--text-muted);line-height:1.5">${c.tip}</p>
            </div>
        `).join('');

        // Scorecard
        const scores = [
            { metric:'Sales Volume', score: Math.min(100, sales.length * 10) },
            { metric:'Profitability', score: Math.min(100, Math.max(0, kpis.profitMargin * 3)) },
            { metric:'Inventory', score: inv.length > 0 ? 80 : 10 },
            { metric:'Expense Control', score: kpis.revenue > 0 ? Math.max(0, 100 - (kpis.expenses/kpis.revenue)*100) : 50 }
        ];

        document.getElementById('scorecard').innerHTML = scores.map(s => `
            <div>
                <div style="display:flex;justify-content:space-between;font-size:0.875rem;margin-bottom:0.5rem">
                    <span>${s.metric}</span><span style="font-weight:700">${Math.round(s.score)}/100</span>
                </div>
                <div style="background:rgba(255,255,255,0.05);border-radius:9999px;height:6px">
                    <div style="height:6px;border-radius:9999px;background:linear-gradient(90deg,var(--primary),var(--secondary));width:${s.score}%;transition:width 0.5s"></div>
                </div>
            </div>
        `).join('');
    }
};

// ─── Marketing Module ────────────────────────────────────────────────────────
const Marketing = {
    init() {
        document.getElementById('calcROI').addEventListener('click', () => {
            const name        = document.getElementById('campName').value || 'Campaign';
            const spend       = parseFloat(document.getElementById('campSpend').value);
            const rev         = parseFloat(document.getElementById('campRevenue').value);
            const conversions = parseInt(document.getElementById('campConversions').value) || 1;

            if (isNaN(spend) || isNaN(rev)) { showToast('Enter valid campaign values', 'error'); return; }

            const roi     = ((rev - spend) / spend * 100).toFixed(1);
            const cpa     = (spend / conversions).toFixed(0);
            const roas    = (rev / spend).toFixed(2);

            document.getElementById('roiResult').innerHTML = `
                <h3 style="margin-bottom:1rem">📊 ${name}</h3>
                <div style="display:grid;gap:0.75rem">
                    <div style="display:flex;justify-content:space-between;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:0.5rem">
                        <span>ROI</span><strong style="color:${roi>0?'var(--accent)':'var(--danger)'}">${roi}%</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:0.5rem">
                        <span>ROAS (Return on Ad Spend)</span><strong>${roas}x</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:0.5rem">
                        <span>Cost Per Acquisition</span><strong>₹${cpa}</strong>
                    </div>
                    <div style="display:flex;justify-content:space-between;padding:0.75rem;background:rgba(255,255,255,0.04);border-radius:0.5rem">
                        <span>Net Profit from Campaign</span><strong style="color:${(rev-spend)>0?'var(--accent)':'var(--danger)'}">${formatMoney(rev-spend)}</strong>
                    </div>
                </div>
                <p style="font-size:0.8rem;color:var(--text-muted);margin-top:1rem">${roi>100?'🚀 Excellent ROI! Scale this campaign immediately.':roi>0?'✅ Campaign profitable. Optimise for better CPA.':'⚠️ Campaign not profitable. Pause and rethink targeting.'}</p>
            `;
        });

        // Peak hours grid
        const slots = [
            { time:'06–09 AM', score:3, label:'Low' },
            { time:'09–12 PM', score:7, label:'High' },
            { time:'12–02 PM', score:6, label:'Medium' },
            { time:'02–05 PM', score:5, label:'Medium' },
            { time:'05–08 PM', score:9, label:'Peak 🔥' },
            { time:'08–11 PM', score:8, label:'High' }
        ];

        document.getElementById('peakHoursGrid').innerHTML = slots.map(s => `
            <div style="background:rgba(${s.score>7?'124,58,237':'255,255,255'},0.08);border:1px solid rgba(${s.score>7?'124,58,237':'255,255,255'},0.1);padding:1rem;border-radius:0.75rem;text-align:center">
                <div style="font-size:0.8rem;color:var(--text-muted)">${s.time}</div>
                <div style="font-size:1.25rem;font-weight:800;margin:0.25rem 0">${s.score}/10</div>
                <div style="font-size:0.75rem;color:${s.score>7?'var(--primary-light)':'var(--text-muted)'}">${s.label}</div>
                <div style="background:rgba(255,255,255,0.05);border-radius:9999px;height:4px;margin-top:0.5rem">
                    <div style="height:4px;border-radius:9999px;background:var(--primary);width:${s.score*10}%"></div>
                </div>
            </div>
        `).join('');
    }
};
