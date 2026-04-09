// Chart Management — Overview charts use uploaded data when available

const ChartManager = {
    revenueChart: null,
    productPieChart: null,

    // Common options shared by overview charts
    getBaseOptions(extra) {
        if (typeof Chart === 'undefined') return {};
        Chart.defaults.color      = 'rgba(255,255,255,0.6)';
        Chart.defaults.font.family = 'Inter';
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { labels: { color:'rgba(255,255,255,0.7)', font:{ family:'Inter' }}}
            },
            scales: {
                y: { beginAtZero:true, grid:{ color:'rgba(255,255,255,0.05)' }, ticks:{ color:'rgba(255,255,255,0.5)' }},
                x: { grid:{ display:false }, ticks:{ color:'rgba(255,255,255,0.5)' }}
            },
            ...extra
        };
    },

    // ─── Revenue Chart (bar) ─────────────────────────────────
    // Source: uploaded timeline if available, otherwise manual DB sales
    renderRevenueChart(canvasId, data) {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.revenueChart) { this.revenueChart.destroy(); this.revenueChart = null; }

        // Build labels + values from whatever source we have
        let labels = [], values = [];

        const upData = UploadEngine.processedData;
        if (upData && upData.timeline && upData.timeline.length > 0) {
            // ── Use uploaded file data ──────────────────────────
            const tl = upData.timeline;
            labels = tl.map(t => t.date);
            values = tl.map(t => t.revenue);
        } else {
            // ── Fallback: manual DB sales grouped by date ───────
            const dailySales = {};
            (data || []).forEach(sale => {
                const d = sale.date || 'Unknown';
                dailySales[d] = (dailySales[d] || 0) + sale.totalSales;
            });
            const sorted = Object.keys(dailySales).sort();
            labels = sorted.map(d => {
                const dt = new Date(d);
                return isNaN(dt) ? d : `${dt.getDate()}/${dt.getMonth()+1}`;
            });
            values = sorted.map(d => dailySales[d]);
        }

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(124,58,237,0.85)');
        gradient.addColorStop(1, 'rgba(59,130,246,0.15)');

        this.revenueChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data:  values.length ? values : [0],
                    backgroundColor: gradient,
                    borderRadius: 5
                }]
            },
            options: this.getBaseOptions({
                plugins: { legend: { display: false }}
            })
        });
    },

    // ─── Product Pie/Doughnut Chart ──────────────────────────
    // Source: uploaded product list if available, else manual DB
    renderProductPieChart(canvasId, data) {
        if (typeof Chart === 'undefined') return;
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        if (this.productPieChart) { this.productPieChart.destroy(); this.productPieChart = null; }

        let labels = [], values = [];

        const upData = UploadEngine.processedData;
        if (upData && upData.sortedProducts && upData.sortedProducts.length > 0) {
            // ── Use uploaded file data ──────────────────────────
            const top = upData.sortedProducts.slice(0, 8);
            labels = top.map(p => p.name);
            values = top.map(p => p.revenue);
        } else {
            // ── Fallback: manual DB sales ───────────────────────
            const pMap = {};
            (data || []).forEach(sale => {
                pMap[sale.productName] = (pMap[sale.productName] || 0) + sale.totalSales;
            });
            labels = Object.keys(pMap);
            values = labels.map(l => pMap[l]);
        }

        const COLORS = ['#7C3AED','#3B82F6','#10B981','#F59E0B','#EF4444','#6366F1','#EC4899','#14B8A6'];

        this.productPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels.length ? labels : ['No Data'],
                datasets: [{
                    data: values.length ? values : [1],
                    backgroundColor: COLORS,
                    borderWidth: 0,
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '68%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color:'rgba(255,255,255,0.7)', font:{ family:'Inter' }, boxWidth:12 }
                    }
                }
            }
        });
    },

    // ─── Public: Refresh both overview charts ─────────────────
    updateAll() {
        const manualSales = DB.getSales();
        this.renderRevenueChart('revenueChart', manualSales);
        this.renderProductPieChart('productChart', manualSales);
    }
};
