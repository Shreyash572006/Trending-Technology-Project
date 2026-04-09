// ============================================================
// VENDRIXA IQ — Upload Engine
// Handles CSV/Excel parsing, analysis, chartting, AI insights
// ============================================================

const UploadEngine = {
    processedData: null,
    rawRows: [],
    columnMap: {},
    uploadCharts: {},
    STORAGE_KEY: null,

    // ─── Per-user storage key ────────────────────────────────
    getStorageKey() {
        const user = typeof Auth !== 'undefined' && Auth.getCurrentUser();
        return 'viq_upload_' + (user ? user.id : 'guest');
    },

    // Save processed data to localStorage (so Overview persists after refresh)
    saveToStorage() {
        if (!this.processedData) return;
        try {
            // Save essential aggregated data (skip full rawRows to stay compact)
            const toSave = {
                totalRevenue:  this.processedData.totalRevenue,
                totalCOGS:     this.processedData.totalCOGS,
                totalExpenses: this.processedData.totalExpenses,
                totalProfit:   this.processedData.totalProfit,
                avgMargin:     this.processedData.avgMargin,
                rowCount:      this.processedData.rowCount,
                products:      this.processedData.products,
                sortedProducts:this.processedData.sortedProducts,
                timeline:      this.processedData.timeline,
                rows:          this.processedData.rows   // full rows for table
            };
            localStorage.setItem(this.getStorageKey(), JSON.stringify(toSave));
        } catch(e) {
            console.warn('Could not save upload data to localStorage (quota?):', e);
        }
    },

    // Restore previously-uploaded data so Overview works after page refresh
    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.getStorageKey());
            if (saved) {
                this.processedData = JSON.parse(saved);
                return true;
            }
        } catch(e) { /* ignore */ }
        return false;
    },

    // Clear upload data (e.g. when user wants to reset)
    clearStorage() {
        localStorage.removeItem(this.getStorageKey());
        this.processedData = null;
    },

    // Column name aliases for auto-detection (case-insensitive)
    COLUMN_ALIASES: {
        date:         ['date','day','order date','sale date','transaction date','order_date','sale_date','month'],
        product:      ['product','product name','item','item name','name','sku','product_name','description'],
        costPrice:    ['cost','cost price','purchase price','cp','cost_price','buying price','mrp_cost'],
        sellingPrice: ['price','selling price','sale price','sp','selling_price','amount','rate','unit price'],
        quantity:     ['qty','quantity','units','sold','quantity sold','units sold','no of units','pieces'],
        expenses:     ['expense','expenses','overhead','extra cost','other cost','misc']
    },

    // ─── File Handler ─────────────────────────────────────────
    handleFile(file) {
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        document.getElementById('uploadFileName').textContent = '📄 ' + file.name;
        document.getElementById('uploadFileName').classList.remove('hidden');
        this.showLoader(true);

        if (ext === 'csv') {
            const reader = new FileReader();
            reader.onload = (e) => this.parseCSV(e.target.result);
            reader.readAsText(file);
        } else if (ext === 'xlsx' || ext === 'xls') {
            if (typeof XLSX === 'undefined') {
                this.showError('SheetJS library not loaded. Please check your internet connection.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => this.parseExcel(e.target.result);
            reader.readAsArrayBuffer(file);
        } else {
            this.showLoader(false);
            this.showError('Unsupported format. Please upload a .csv or .xlsx file.');
        }
    },

    // ─── CSV Parser ───────────────────────────────────────────
    parseCSV(text) {
        if (typeof Papa === 'undefined') {
            this.showError('PapaParse library not loaded. Please check your internet connection.');
            this.showLoader(false);
            return;
        }

        const result = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            transformHeader: h => h.trim()
        });

        if (result.errors.length && result.data.length === 0) {
            this.showError('Could not parse CSV. Please check the file format.');
            this.showLoader(false);
            return;
        }

        this.processRows(result.data, result.meta.fields || []);
    },

    // ─── Excel Parser ─────────────────────────────────────────
    parseExcel(buffer) {
        try {
            const workbook = XLSX.read(buffer, { type: 'arraybuffer', cellDates: true });
            const sheet    = workbook.Sheets[workbook.SheetNames[0]];
            const rows     = XLSX.utils.sheet_to_json(sheet, { defval: '' });
            const headers  = rows.length > 0 ? Object.keys(rows[0]) : [];
            this.processRows(rows, headers);
        } catch (err) {
            this.showError('Failed to read Excel file: ' + err.message);
            this.showLoader(false);
        }
    },

    // ─── Column Auto-Detector ─────────────────────────────────
    detectColumns(headers) {
        const map = {};
        const normalise = str => String(str).toLowerCase().trim();

        for (const [key, aliases] of Object.entries(this.COLUMN_ALIASES)) {
            for (const header of headers) {
                if (aliases.some(a => normalise(header).includes(normalise(a)))) {
                    map[key] = header;
                    break;
                }
            }
        }
        return map;
    },

    // ─── Row Processor ────────────────────────────────────────
    processRows(rows, headers) {
        if (rows.length === 0) {
            this.showError('The file appears to be empty.');
            this.showLoader(false);
            return;
        }

        const cMap = this.detectColumns(headers);
        this.columnMap = cMap;
        this.rawRows = rows;

        // Warn if required columns are missing
        const required = ['product', 'costPrice', 'sellingPrice', 'quantity'];
        const missing  = required.filter(k => !cMap[k]);

        if (missing.length > 0) {
            this.showColumnMapper(headers, cMap, rows);
            this.showLoader(false);
            return;
        }

        this.analyseData(rows, cMap);
    },

    // ─── Column Mapper UI ────────────────────────────────────
    showColumnMapper(headers, detected, rows) {
        document.getElementById('columnMapper').classList.remove('hidden');
        const fieldsEl = document.getElementById('mapperFields');
        const fields   = [
            { key:'date',         label:'Date',          required:false },
            { key:'product',      label:'Product Name',  required:true  },
            { key:'costPrice',    label:'Cost Price',    required:true  },
            { key:'sellingPrice', label:'Selling Price', required:true  },
            { key:'quantity',     label:'Quantity Sold', required:true  },
            { key:'expenses',     label:'Expenses',      required:false }
        ];

        fieldsEl.innerHTML = fields.map(f => `
            <div class="form-group">
                <label>${f.label} ${f.required ? '<span style="color:var(--danger)">*</span>':''}</label>
                <select class="form-control col-map-select" data-key="${f.key}">
                    <option value="">-- Select column --</option>
                    ${headers.map(h => `<option value="${h}" ${detected[f.key]===h?'selected':''}>${h}</option>`).join('')}
                </select>
            </div>
        `).join('');

        document.getElementById('applyMapBtn').onclick = () => {
            const newMap = {};
            document.querySelectorAll('.col-map-select').forEach(sel => {
                if (sel.value) newMap[sel.dataset.key] = sel.value;
            });

            const required = ['product','costPrice','sellingPrice','quantity'];
            const still    = required.filter(k => !newMap[k]);
            if (still.length > 0) {
                alert('Please map: ' + still.join(', '));
                return;
            }

            document.getElementById('columnMapper').classList.add('hidden');
            this.showLoader(true);
            this.analyseData(rows, newMap);
        };
    },

    // ─── Core Analysis Engine ────────────────────────────────
    analyseData(rows, cMap) {
        const get = (row, key) => {
            const col = cMap[key];
            if (!col) return null;
            const val = parseFloat(String(row[col]).replace(/[₹,\s]/g,''));
            return isNaN(val) ? 0 : val;
        };

        const getString = (row, key) => {
            const col = cMap[key];
            return col ? String(row[col] || '').trim() : '';
        };

        // Process each row
        const processed = rows.map((row, i) => {
            const qty        = get(row, 'quantity') || 1;
            const cost       = get(row, 'costPrice') || 0;
            const selling    = get(row, 'sellingPrice') || 0;
            const expense    = get(row, 'expenses') || 0;
            const totalSales = selling * qty;
            const totalCost  = cost * qty;
            const profit     = totalSales - totalCost - expense;
            const margin     = totalSales > 0 ? (profit / totalSales) * 100 : 0;

            return {
                index:       i,
                date:        getString(row, 'date') || '',
                product:     getString(row, 'product') || `Product ${i+1}`,
                costPrice:   cost,
                sellingPrice:selling,
                quantity:    qty,
                expenses:    expense,
                totalSales,
                totalCost,
                profit,
                margin
            };
        });

        // Aggregate KPIs
        const totalRevenue  = processed.reduce((s,r) => s + r.totalSales, 0);
        const totalCOGS     = processed.reduce((s,r) => s + r.totalCost,  0);
        const totalExpenses = processed.reduce((s,r) => s + r.expenses,   0);
        const totalProfit   = totalRevenue - totalCOGS - totalExpenses;
        const avgMargin     = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

        // Per-product aggregation
        const byProduct = {};
        processed.forEach(r => {
            if (!byProduct[r.product]) {
                byProduct[r.product] = { name:r.product, qty:0, revenue:0, profit:0, cost:0 };
            }
            byProduct[r.product].qty     += r.quantity;
            byProduct[r.product].revenue += r.totalSales;
            byProduct[r.product].profit  += r.profit;
            byProduct[r.product].cost    += r.totalCost;
        });

        const products = Object.values(byProduct).map(p => ({
            ...p,
            margin: p.revenue > 0 ? (p.profit / p.revenue) * 100 : 0
        }));

        const sorted = [...products].sort((a,b) => b.revenue - a.revenue);

        // Daily/Date aggregation
        const byDate = {};
        processed.forEach(r => {
            const d = r.date || 'Unknown';
            if (!byDate[d]) byDate[d] = { date:d, revenue:0, profit:0 };
            byDate[d].revenue += r.totalSales;
            byDate[d].profit  += r.profit;
        });
        const timeline = Object.values(byDate).sort((a,b) => new Date(a.date) - new Date(b.date));

        this.processedData = {
            rows: processed,
            rawRows: rows,
            totalRevenue,
            totalCOGS,
            totalExpenses,
            totalProfit,
            avgMargin,
            products,
            sortedProducts: sorted,
            timeline,
            rowCount: processed.length
        };

        // Persist to localStorage so Overview survives tab switches & refresh
        this.saveToStorage();

        this.showLoader(false);
        this.renderResults();

        // ← KEY FIX: push data into the Overview dashboard immediately
        if (typeof Dashboard !== 'undefined') {
            Dashboard.refreshFromUpload();
        }
    },

    // ─── Result Renderer ─────────────────────────────────────
    renderResults() {
        const d = this.processedData;
        document.getElementById('uploadResults').classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');

        // KPIs
        document.getElementById('upRevenue').textContent = formatMoney(d.totalRevenue);
        document.getElementById('upProfit').textContent  = formatMoney(d.totalProfit);
        document.getElementById('upMargin').textContent  = d.avgMargin.toFixed(1) + '%';
        document.getElementById('upRows').textContent    = d.rowCount;

        // Best / worst products
        const best  = [...d.products].sort((a,b) => b.revenue - a.revenue);
        const worst = [...d.products].sort((a,b) => a.margin - b.margin);

        document.getElementById('bestProduct').textContent  = best[0]  ? best[0].name  : '-';
        document.getElementById('worstProduct').textContent = worst[0] ? worst[0].name : '-';

        // Charts
        this.renderUploadCharts(d);

        // Table
        this.renderDataTable(d.rows);

        // Insights
        this.renderInsights(this.generateInsights(d));

        // Decisions
        this.renderDecisions(this.generateDecisions(d));
    },

    // ─── Chart Renderer ──────────────────────────────────────
    renderUploadCharts(d) {
        // Destroy old charts
        ['upLineChart','upBarChart','upPieChart','upProfitChart'].forEach(id => {
            if (this.uploadCharts[id]) {
                this.uploadCharts[id].destroy();
                delete this.uploadCharts[id];
            }
        });

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color:'rgba(255,255,255,0.7)', font:{ family:'Inter' }}}
            },
            scales: {
                y: { beginAtZero:true, grid:{ color:'rgba(255,255,255,0.05)' }, ticks:{ color:'rgba(255,255,255,0.5)' }},
                x: { grid:{ display:false }, ticks:{ color:'rgba(255,255,255,0.5)' }}
            }
        };

        const noLegendOptions = { ...chartOptions, plugins:{ legend:{ display:false }}};

        // 1. Line Chart: Sales over time
        const lc = document.getElementById('upLineChart');
        if (lc && d.timeline.length > 0) {
            const ctx = lc.getContext('2d');
            const grad = ctx.createLinearGradient(0,0,0,200);
            grad.addColorStop(0,'rgba(124,58,237,0.6)');
            grad.addColorStop(1,'rgba(59,130,246,0.05)');
            this.uploadCharts['upLineChart'] = new Chart(lc, {
                type: 'line',
                data: {
                    labels: d.timeline.map(t => t.date),
                    datasets: [{ label:'Revenue (₹)', data: d.timeline.map(t => t.revenue),
                        borderColor:'#7C3AED', backgroundColor:grad, fill:true,
                        tension:0.4, pointBackgroundColor:'#A855F7', pointRadius:4 }]
                },
                options: noLegendOptions
            });
        }

        // 2. Bar Chart: Product vs Quantity
        const topP = d.sortedProducts.slice(0,8);
        const bc = document.getElementById('upBarChart');
        if (bc && topP.length > 0) {
            this.uploadCharts['upBarChart'] = new Chart(bc, {
                type: 'bar',
                data: {
                    labels: topP.map(p => p.name.length > 12 ? p.name.substr(0,12)+'…' : p.name),
                    datasets: [{ label:'Qty Sold', data: topP.map(p => p.qty),
                        backgroundColor:'rgba(124,58,237,0.7)', borderRadius:4 }]
                },
                options: { ...noLegendOptions, indexAxis:'y',
                    scales:{ x:{ beginAtZero:true, grid:{ color:'rgba(255,255,255,0.05)' }, ticks:{ color:'rgba(255,255,255,0.5)' }},
                             y:{ grid:{ display:false }, ticks:{ color:'rgba(255,255,255,0.7)' }} }}
            });
        }

        // 3. Pie Chart: Revenue contribution
        const pc = document.getElementById('upPieChart');
        if (pc && topP.length > 0) {
            this.uploadCharts['upPieChart'] = new Chart(pc, {
                type: 'doughnut',
                data: {
                    labels: topP.map(p => p.name),
                    datasets:[{ data: topP.map(p => p.revenue),
                        backgroundColor:['#7C3AED','#3B82F6','#10B981','#F59E0B','#EF4444','#6366F1','#EC4899','#14B8A6'],
                        borderWidth:0, hoverOffset:6 }]
                },
                options: { responsive:true, maintainAspectRatio:false, cutout:'68%',
                    plugins:{ legend:{ position:'right', labels:{ color:'rgba(255,255,255,0.7)', font:{family:'Inter'}, boxWidth:12 }}}}
            });
        }

        // 4. Profit Trend
        const prc = document.getElementById('upProfitChart');
        if (prc && d.timeline.length > 0) {
            this.uploadCharts['upProfitChart'] = new Chart(prc, {
                type: 'line',
                data: {
                    labels: d.timeline.map(t => t.date),
                    datasets: [{ label:'Profit (₹)', data: d.timeline.map(t => t.profit),
                        borderColor:'#10B981', backgroundColor:'rgba(16,185,129,0.1)', fill:true,
                        tension:0.4, pointBackgroundColor:'#10B981', pointRadius:4 }]
                },
                options: noLegendOptions
            });
        }
    },

    // ─── Data Table ──────────────────────────────────────────
    renderDataTable(rows, filterText = '') {
        const tbody   = document.getElementById('uploadTableBody');
        const filtered = filterText
            ? rows.filter(r => r.product.toLowerCase().includes(filterText.toLowerCase())
                            || r.date.toLowerCase().includes(filterText.toLowerCase()))
            : rows;

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center" style="color:var(--text-muted)">No data found</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(r => `
            <tr>
                <td>${r.date || 'N/A'}</td>
                <td><strong>${r.product}</strong></td>
                <td>${formatMoney(r.costPrice)}</td>
                <td>${formatMoney(r.sellingPrice)}</td>
                <td>${r.quantity}</td>
                <td>${formatMoney(r.totalSales)}</td>
                <td style="color:${r.profit>=0?'var(--accent)':'var(--danger)'}">${formatMoney(r.profit)}</td>
                <td><span style="color:${r.margin>=15?'var(--accent)':r.margin>0?'#F59E0B':'var(--danger)'}">${r.margin.toFixed(1)}%</span></td>
            </tr>
        `).join('');
    },

    // ─── Sort Table ──────────────────────────────────────────
    sortTable(field, asc) {
        if (!this.processedData) return;
        const sorted = [...this.processedData.rows].sort((a,b) =>
            asc ? (a[field]||0) - (b[field]||0) : (b[field]||0) - (a[field]||0)
        );
        this.renderDataTable(sorted);
    },

    // ─── AI Insight Engine ───────────────────────────────────
    generateInsights(d) {
        const insights = [];

        // 1. Overall margin
        if (d.avgMargin < 10) {
            insights.push({ icon:'🚨', type:'critical', text:`Your overall profit margin is only ${d.avgMargin.toFixed(1)}%. Expenses and cost of goods are consuming most of your revenue. Urgent action needed.` });
        } else if (d.avgMargin < 20) {
            insights.push({ icon:'⚠️', type:'warning', text:`Profit margin is ${d.avgMargin.toFixed(1)}%, which is below the healthy 20% threshold. Focus on reducing COGS or increasing selling prices.` });
        } else {
            insights.push({ icon:'✅', type:'success', text:`Excellent! You are maintaining a strong profit margin of ${d.avgMargin.toFixed(1)}%. Continue your current pricing strategy.` });
        }

        // 2. Best product
        const best = d.sortedProducts[0];
        if (best) {
            insights.push({ icon:'⭐', type:'success', text:`"${best.name}" is your top performer — contributing ₹${best.revenue.toLocaleString('en-IN')} in revenue (${((best.revenue/d.totalRevenue)*100).toFixed(1)}% of total). Prioritise its stock.` });
        }

        // 3. Low-margin products
        const lowMargin = d.products.filter(p => p.margin < 10 && p.margin > -Infinity);
        if (lowMargin.length > 0) {
            insights.push({ icon:'📉', type:'warning', text:`${lowMargin.length} product(s) have low margins (<10%): ${lowMargin.map(p => `"${p.name}"`).join(', ')}. Consider raising prices or negotiating lower purchase costs.` });
        }

        // 4. Loss-making products
        const losers = d.products.filter(p => p.profit < 0);
        if (losers.length > 0) {
            insights.push({ icon:'🔴', type:'critical', text:`${losers.length} product(s) are running at a loss: ${losers.map(p => `"${p.name}"`).join(', ')}. Either remove from catalog or restructure pricing immediately.` });
        }

        // 5. High-quantity but low-revenue product
        const highQtyLowRev = d.products.find(p => p.qty > d.products.reduce((s,x) => s+x.qty,0)/d.products.length * 1.5 && p.margin < 15);
        if (highQtyLowRev) {
            insights.push({ icon:'💡', type:'info', text:`"${highQtyLowRev.name}" sells in high volume but has a low margin of ${highQtyLowRev.margin.toFixed(1)}%. A small price increase here could significantly boost profits.` });
        }

        // 6. Expense analysis
        if (d.totalExpenses > 0 && (d.totalExpenses / d.totalRevenue) > 0.3) {
            insights.push({ icon:'💰', type:'warning', text:`Overhead expenses are ${((d.totalExpenses/d.totalRevenue)*100).toFixed(1)}% of revenue. Review recurring costs and find areas to optimise.` });
        }

        // 7. Data size note
        if (d.rowCount > 100) {
            insights.push({ icon:'📊', type:'info', text:`Analysed ${d.rowCount} records across ${d.products.length} unique products. Your dataset is rich enough for reliable trend analysis.` });
        }

        return insights;
    },

    // ─── Decision Support ────────────────────────────────────
    generateDecisions(d) {
        const decisions = [];

        // Price increase suggestions
        const lowMargin = d.products.filter(p => p.margin > 0 && p.margin < 15);
        lowMargin.forEach(p => {
            const suggestedPrice = (p.cost / p.qty) / (1 - 0.20); // 20% target margin
            decisions.push({
                icon: '📈',
                action: 'Increase Price',
                product: p.name,
                detail: `Raise selling price to ~₹${suggestedPrice.toFixed(0)} to achieve 20% margin.`
            });
        });

        // Remove loss-makers
        const losers = d.products.filter(p => p.profit < 0);
        losers.forEach(p => {
            decisions.push({
                icon: '🗑️',
                action: 'Remove / Renegotiate',
                product: p.name,
                detail: `This product is making a loss of ₹${Math.abs(p.profit).toFixed(0)}. Either remove or renegotiate supplier cost.`
            });
        });

        // Stock up on winners
        const winner = d.sortedProducts[0];
        if (winner) {
            decisions.push({
                icon: '📦',
                action: 'Increase Stock',
                product: winner.name,
                detail: `Your best-seller "${winner.name}" should have buffer stock. Avoid stockouts on this item.`
            });
        }

        // Marketing suggestion
        if (d.totalRevenue > 0) {
            decisions.push({
                icon: '📢',
                action: 'Targeted Marketing',
                product: d.sortedProducts.slice(0,3).map(p => p.name).join(', '),
                detail: 'These top-3 products have the highest customer appeal. Increasing ad spend here will yield the best ROI.'
            });
        }

        // Bundle suggestion
        if (d.products.length >= 2) {
            const a = d.sortedProducts[0];
            const b = d.products.find(p => p.margin > 20 && p.name !== a?.name);
            if (a && b) {
                decisions.push({
                    icon: '🎁',
                    action: 'Bundle Offer',
                    product: `${a.name} + ${b.name}`,
                    detail: `Bundle your best-seller with "${b.name}" (high-margin). This increases average order value.`
                });
            }
        }

        return decisions;
    },

    // ─── Render Insights UI ──────────────────────────────────
    renderInsights(insights) {
        const el = document.getElementById('aiInsightsList');
        el.innerHTML = insights.map(i => `
            <div class="glass insight-card insight-${i.type}" style="padding:1rem 1.25rem; margin-bottom:0.75rem; border-left: 3px solid ${i.type==='critical'?'var(--danger)':i.type==='warning'?'#F59E0B':'var(--accent)'};">
                <div style="display:flex; gap:0.75rem; align-items:flex-start;">
                    <span style="font-size:1.25rem">${i.icon}</span>
                    <p style="font-size:0.875rem; line-height:1.6; color:rgba(255,255,255,0.85)">${i.text}</p>
                </div>
            </div>
        `).join('');
    },

    // ─── Render Decisions UI ─────────────────────────────────
    renderDecisions(decisions) {
        const el = document.getElementById('decisionsList');
        if (decisions.length === 0) {
            el.innerHTML = '<p style="color:var(--text-muted)">No specific actions needed — your data looks healthy!</p>';
            return;
        }
        el.innerHTML = decisions.map(d => `
            <div class="glass" style="padding:1rem 1.25rem; margin-bottom:0.75rem; display:flex; gap:1rem; align-items:flex-start;">
                <div style="font-size:1.5rem; line-height:1">${d.icon}</div>
                <div>
                    <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em; color:var(--primary-light); margin-bottom:0.25rem">${d.action}</div>
                    <div style="font-weight:700; margin-bottom:0.25rem;">${d.product}</div>
                    <div style="font-size:0.875rem; color:var(--text-muted)">${d.detail}</div>
                </div>
            </div>
        `).join('');
    },

    // ─── Export Report ───────────────────────────────────────
    exportReport() {
        if (!this.processedData) {
            alert('No data to export. Please upload a file first.');
            return;
        }

        const d = this.processedData;
        const header = ['Date','Product','Cost Price','Selling Price','Quantity','Total Sales','Profit','Margin (%)'];
        const rows = d.rows.map(r => [
            r.date, r.product, r.costPrice, r.sellingPrice,
            r.quantity, r.totalSales.toFixed(2), r.profit.toFixed(2), r.margin.toFixed(2)
        ]);

        const csv = [header, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type:'text/csv' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = 'vendrixa_report.csv';
        a.click();
        URL.revokeObjectURL(url);
    },

    // ─── Helpers ─────────────────────────────────────────────
    showLoader(show) {
        document.getElementById('uploadLoader').classList.toggle('hidden', !show);
    },

    showError(msg) {
        const el = document.getElementById('uploadError');
        el.textContent = '⚠️ ' + msg;
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 5000);
    }
};
