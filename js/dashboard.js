// Dashboard Orchestrator — dashboard.js (updated with all new modules)

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const formatMoney = (amount) =>
    '₹' + parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Dashboard = {
    init() {
        Auth.requireAuth();
        const user = Auth.getCurrentUser();
        document.getElementById('userNameDisplay').textContent = user.name;
        document.getElementById('shopNameDisplay').textContent = user.shopName;
        document.getElementById('userInitials').textContent    = user.name.charAt(0).toUpperCase();

        // ← Restore any previously-uploaded file data so Overview is populated on refresh
        UploadEngine.loadFromStorage();

        this.setupNavigation();
        this.setupForms();
        this.setupUploadModule();
        this.setupAIChat();
        this.refreshAllData();

        // Init all helper modules
        BusinessAdvisor.init();
        Marketing.init();
        PricingModule.init();
        Competitor.init();
        ReviewsModule.init();

        // Initial AI greeting after a moment
        setTimeout(() => {
            const insight = AIEngine.generateInsights()[0];
            this.addAIChatMessage('assistant', insight);
        }, 800);
    },

    // ─── Navigation ────────────────────────────────────────────
    setupNavigation() {
        const navItems   = document.querySelectorAll('.nav-item[data-target]');
        const sections   = document.querySelectorAll('.section');
        const sidebar    = document.getElementById('sidebar');
        const mobileBtn  = document.getElementById('mobileMenuBtn');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const target = item.getAttribute('data-target');
                navItems.forEach(n => n.classList.remove('active'));
                item.classList.add('active');
                sections.forEach(s => s.classList.remove('active'));
                document.getElementById(target).classList.add('active');

                // Refresh on section switch
                if (target === 'overview') {
                    this.refreshAllData();
                } else if (target === 'advisor') {
                    BusinessAdvisor.refresh();
                } else if (target === 'pricing') {
                    PricingModule.loadUploadedPricingData();
                } else if (target === 'sales') {
                    this.populateProductSelects();
                    this.refreshSalesTable();
                } else if (target === 'inventory') {
                    this.refreshInventoryUI();
                } else if (target === 'expenses') {
                    this.refreshExpenseTable();
                } else if (target === 'reports') {
                    Reports.renderPreview(DB.getKPIs(), DB.getSales(), DB.getExpenses());
                }

                if (window.innerWidth <= 768) sidebar.classList.remove('open');
            });
        });

        mobileBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
        document.getElementById('logoutBtn').addEventListener('click', () => Auth.logout());
    },

    // ─── Upload Module Setup ──────────────────────────────────
    setupUploadModule() {
        const dropZone  = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        // Drag & Drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) UploadEngine.handleFile(file);
        });

        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) UploadEngine.handleFile(file);
        });

        // Search in data table
        document.getElementById('tableSearch').addEventListener('input', (e) => {
            if (UploadEngine.processedData) {
                UploadEngine.renderDataTable(UploadEngine.processedData.rows, e.target.value);
            }
        });
    },

    // ─── Form Setup ────────────────────────────────────────────
    setupForms() {
        // Inventory Form
        document.getElementById('inventoryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            DB.addInventoryItem(
                document.getElementById('invName').value,
                document.getElementById('invCost').value,
                document.getElementById('invPrice').value,
                document.getElementById('invStock').value
            );
            e.target.reset();
            showToast('Product added to inventory 📦', 'success');
            this.refreshInventoryUI();
            this.populateProductSelects();
        });

        // Sales Form
        document.getElementById('salesForm').addEventListener('submit', (e) => {
            e.preventDefault();
            try {
                DB.addSale(
                    document.getElementById('saleDate').value,
                    document.getElementById('saleProduct').value,
                    document.getElementById('salePrice').value,
                    document.getElementById('saleQty').value
                );
                e.target.reset();
                showToast('Sale logged successfully 💳', 'success');
                this.refreshAllData();
            } catch (err) {
                showToast(err.message, 'error');
            }
        });

        // Expense Form
        document.getElementById('expenseForm').addEventListener('submit', (e) => {
            e.preventDefault();
            DB.addExpense(
                document.getElementById('expDate').value,
                document.getElementById('expCat').value,
                document.getElementById('expDesc').value,
                document.getElementById('expAmount').value
            );
            e.target.reset();
            showToast('Expense recorded 🧾', 'success');
            this.refreshAllData();
        });
    },




    // ─── Called by UploadEngine when a file is analysed ──────
    // Updates Overview KPIs, charts, banner, and AI summary
    refreshFromUpload() {
        const d = UploadEngine.processedData;
        if (!d) return;

        // Update the 4 KPI cards
        document.getElementById('kpiRevenue').textContent  = formatMoney(d.totalRevenue);
        document.getElementById('kpiExpenses').textContent = formatMoney(d.totalExpenses);
        document.getElementById('kpiProfit').textContent   = formatMoney(d.totalProfit);

        const marginEl = document.getElementById('kpiMargin');
        marginEl.textContent = d.avgMargin.toFixed(1) + '%';
        marginEl.style.color = d.avgMargin > 15 ? 'var(--accent)' : 'var(--danger)';

        // Show which data source is active
        this.showDataSourceBanner(`📊 Overview is showing data from your uploaded file (${d.rowCount} rows)`);

        // Redraw overview charts with upload data
        ChartManager.updateAll();

        // Refresh AI summary
        this.updateOverviewAI();

        showToast('✅ Overview updated with uploaded data!', 'success');
    },

    // Show a subtle banner under the KPI cards indicating data source
    showDataSourceBanner(text) {
        let banner = document.getElementById('dataSrcBanner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'dataSrcBanner';
            banner.style.cssText = 'margin-bottom:1.5rem;padding:0.6rem 1rem;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:0.5rem;font-size:0.8rem;color:rgba(59,130,246,1);display:flex;justify-content:space-between;align-items:center';
            // Insert after the kpi-grid
            const kpiGrid = document.querySelector('#overview .kpi-grid');
            if (kpiGrid) kpiGrid.insertAdjacentElement('afterend', banner);
        }
        banner.innerHTML = `<span>${text}</span>
            <button onclick="UploadEngine.clearStorage();Dashboard.refreshAllData();document.getElementById('dataSrcBanner').remove();" 
                style="background:none;border:1px solid rgba(59,130,246,0.4);color:rgba(59,130,246,1);padding:0.2rem 0.5rem;border-radius:0.25rem;cursor:pointer;font-size:0.75rem;">
                Clear & use manual data
            </button>`;
    },

    // ─── Refresh All Data ──────────────────────────────────────
    // If uploaded data exists → show it in Overview; else show manual DB data
    refreshAllData() {
        if (UploadEngine.processedData) {
            this.refreshFromUpload();
        } else {
            this.updateKPIs();
            ChartManager.updateAll();
            this.updateOverviewAI();
        }

        this.refreshInventoryUI();
        this.populateProductSelects();
        this.refreshSalesTable();
        this.refreshExpenseTable();

        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        document.querySelectorAll('input[type="date"]').forEach(i => { if (!i.value) i.value = today; });
    },

    // ─── KPIs ──────────────────────────────────────────────────
    updateKPIs() {
        const kpis = DB.getKPIs();
        document.getElementById('kpiRevenue').textContent = formatMoney(kpis.revenue);
        document.getElementById('kpiExpenses').textContent = formatMoney(kpis.expenses);
        document.getElementById('kpiProfit').textContent  = formatMoney(kpis.netProfit);

        const marginEl = document.getElementById('kpiMargin');
        marginEl.textContent = kpis.profitMargin.toFixed(1) + '%';
        marginEl.style.color = kpis.profitMargin > 15 ? 'var(--accent)' : 'var(--danger)';
    },

    updateOverviewAI() {
        // Prefer insights generated from richer upload data
        const upData = UploadEngine.processedData;
        let insights = [];

        if (upData && upData.products && upData.products.length > 0) {
            // Generate text-form insights from the upload engine
            const raw = UploadEngine.generateInsights(upData);
            insights  = raw.map(i => i.icon + ' ' + i.text);
        } else {
            insights = AIEngine.generateInsights();
        }

        const el = document.getElementById('overviewAISummary');
        el.innerHTML = insights.map(i =>
            `<p style="margin-bottom:0.6rem">${i.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`
        ).join('');
    },

    // ─── Inventory UI ─────────────────────────────────────────
    refreshInventoryUI() {
        const inv   = DB.getInventory();
        const tbody = document.getElementById('inventoryTableBody');
        const alert = document.getElementById('lowStockAlert');

        const hasLow = inv.some(i => i.stock < 5);
        alert.classList.toggle('hidden', !hasLow);

        if (!inv.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center" style="color:var(--text-muted)">No products yet</td></tr>';
            return;
        }

        tbody.innerHTML = inv.map(item => {
            const margin = ((item.targetSellingPrice - item.costPrice) / item.targetSellingPrice * 100).toFixed(1);
            let stockBadge = `<span class="badge ${item.stock < 5 ? 'badge-danger' : 'badge-success'}">${item.stock === 0 ? '🚨 Out' : item.stock + ' left'}</span>`;
            return `<tr>
                <td><strong>${item.name}</strong></td>
                <td>${formatMoney(item.costPrice)}</td>
                <td>${formatMoney(item.targetSellingPrice)}</td>
                <td style="color:${margin>15?'var(--accent)':'var(--danger)'}">${margin}%</td>
                <td>${stockBadge}</td>
                <td><button class="btn btn-danger" style="padding:0.2rem 0.5rem;font-size:0.75rem" onclick="Dashboard.deleteInventory('${item.id}')">Del</button></td>
            </tr>`;
        }).join('');
    },

    deleteInventory(id) {
        if (!confirm('Delete product?')) return;
        const data = DB.getAllData();
        data.inventory = data.inventory.filter(i => i.id !== id);
        DB.saveAllData(data);
        this.refreshAllData();
    },

    // ─── Product Selects ──────────────────────────────────────
    populateProductSelects() {
        const inv    = DB.getInventory();
        const select = document.getElementById('saleProduct');
        const current = select.value;
        select.innerHTML = '<option value="">Select a product…</option>';
        inv.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = `${item.name} (${item.stock} in stock)`;
            opt.dataset.price = item.targetSellingPrice;
            if (item.id === current) opt.selected = true;
            select.appendChild(opt);
        });

        // Auto-fill price
        if (!select.dataset.bound) {
            select.dataset.bound = '1';
            select.addEventListener('change', function () {
                const sel = this.options[this.selectedIndex];
                if (sel?.dataset.price) document.getElementById('salePrice').value = sel.dataset.price;
            });
        }
    },

    // ─── Sales Table ──────────────────────────────────────────
    refreshSalesTable() {
        const sales = [...DB.getSales()].sort((a, b) => new Date(b.date) - new Date(a.date));
        const tbody = document.getElementById('salesTableBody');
        if (!sales.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center" style="color:var(--text-muted)">No sales yet</td></tr>';
            return;
        }
        tbody.innerHTML = sales.map(s => `
            <tr>
                <td>${new Date(s.date).toLocaleDateString()}</td>
                <td>${s.productName}</td>
                <td>${s.quantity}</td>
                <td>${formatMoney(s.sellingPrice)}</td>
                <td>${formatMoney(s.totalSales)}</td>
                <td style="color:${s.profit >= 0 ? 'var(--accent)' : 'var(--danger)'}">${formatMoney(s.profit)}</td>
                <td><button class="btn btn-danger" style="padding:0.2rem 0.5rem;font-size:0.75rem" onclick="Dashboard.deleteSale('${s.id}')">Del</button></td>
            </tr>`).join('');
    },

    deleteSale(id) {
        if (!confirm('Delete this sale?')) return;
        DB.deleteSale(id);
        this.refreshAllData();
    },

    // ─── Expense Table ─────────────────────────────────────────
    refreshExpenseTable() {
        const exps  = [...DB.getExpenses()].sort((a, b) => new Date(b.date) - new Date(a.date));
        const tbody = document.getElementById('expenseTableBody');
        if (!exps.length) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color:var(--text-muted)">No expenses yet</td></tr>';
            return;
        }
        tbody.innerHTML = exps.map(e => `
            <tr>
                <td>${new Date(e.date).toLocaleDateString()}</td>
                <td>${e.category}</td>
                <td>${e.description}</td>
                <td>${formatMoney(e.amount)}</td>
                <td><button class="btn btn-danger" style="padding:0.2rem 0.5rem;font-size:0.75rem" onclick="Dashboard.deleteExpense('${e.id}')">Del</button></td>
            </tr>`).join('');
    },

    deleteExpense(id) {
        if (!confirm('Delete this expense?')) return;
        DB.deleteExpense(id);
        this.refreshAllData();
    },

    // ─── Markdown Parser ──────────────────────────────────────
    parseMarkdown(text) {
        if (!text) return '';

        // Escape HTML first
        let html = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Tables: | Col | Col |
        html = html.replace(/(\|.+\|\n?)+/g, (tableText) => {
            const rows = tableText.trim().split('\n').filter(r => r.trim() && !r.match(/^\|[-| :]+\|$/));
            if (rows.length < 1) return tableText;
            const cells = r => r.match(/\|([^|]+)/g)?.map(c => c.replace('|','').trim()) || [];
            const header = cells(rows[0]);
            const body   = rows.slice(1);
            return `<table><thead><tr>${header.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${body.map(r=>`<tr>${cells(r).map(c=>`<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
        });

        // Code blocks (triple backticks)
        html = html.replace(/```[\w]*\n?([\s\S]*?)```/g, (_,code) => `<pre style="background:rgba(124,58,237,0.12);padding:0.75rem;border-radius:0.5rem;overflow-x:auto;margin:0.75rem 0;font-size:0.8rem">${code.trim()}</pre>`);

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Headings
        html = html.replace(/^# (.+)$/gm,   '<h1>$1</h1>');
        html = html.replace(/^## (.+)$/gm,  '<h2>$2</h2>'.replace('$2','$1'));
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');

        // Blockquotes
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');

        // Bold + italic
        html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
        html = html.replace(/\*\*(.+?)\*\*/g,     '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g,          '<em>$1</em>');

        // Horizontal rules
        html = html.replace(/^---$/gm, '<hr>');

        // Ordered lists
        html = html.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
            const items = block.trim().split('\n').map(l => `<li>${l.replace(/^\d+\. /,'')}</li>`).join('');
            return `<ol>${items}</ol>`;
        });

        // Unordered lists
        html = html.replace(/((?:^[-*] .+\n?)+)/gm, (block) => {
            const items = block.trim().split('\n').map(l => `<li>${l.replace(/^[-*] /,'')}</li>`).join('');
            return `<ul>${items}</ul>`;
        });

        // Line breaks (double newline = paragraph break, single = br)
        html = html.replace(/\n\n/g, '</p><p style="margin:0.5rem 0">');
        html = html.replace(/\n/g,   '<br>');
        html = '<p style="margin:0">' + html + '</p>';

        return html;
    },

    // ─── Build message DOM node ──────────────────────────────
    buildMessageEl(role, htmlContent) {
        const user = Auth.getCurrentUser();
        const initials = user ? user.name.charAt(0).toUpperCase() : 'U';

        const wrap = document.createElement('div');
        wrap.className = `message ${role}`;

        const avatarHtml = role === 'assistant'
            ? `<div class="msg-avatar-wrap"><div class="msg-avatar assistant-avatar">
                <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                    <defs>
                        <linearGradient id="ag${Date.now()}" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                            <stop offset="0%" stop-color="#A855F7"/><stop offset="100%" stop-color="#3B82F6"/>
                        </linearGradient>
                    </defs>
                    <circle cx="24" cy="16" r="5" fill="white" opacity="0.9"/>
                    <circle cx="14" cy="26" r="4" fill="white" opacity="0.7"/>
                    <circle cx="34" cy="26" r="4" fill="white" opacity="0.7"/>
                    <circle cx="19" cy="36" r="3.5" fill="white" opacity="0.8"/>
                    <circle cx="29" cy="36" r="3.5" fill="white" opacity="0.8"/>
                    <circle cx="24" cy="27" r="3" fill="white"/>
                    <line x1="24" y1="21" x2="24" y2="24" stroke="white" stroke-width="1.5"/>
                    <line x1="21" y1="16" x2="15" y2="23" stroke="white" stroke-width="1.3" opacity="0.7"/>
                    <line x1="27" y1="16" x2="33" y2="23" stroke="white" stroke-width="1.3" opacity="0.7"/>
                </svg>
               </div></div>`
            : `<div class="msg-avatar-wrap"><div class="msg-avatar user-avatar-msg">${initials}</div></div>`;

        const senderName = role === 'assistant' ? 'VENDRIXA AI' : 'You';
        wrap.innerHTML = `${avatarHtml}<div class="msg-content-wrap">
            <div class="msg-sender">${senderName}</div>
            <div class="msg-content">${htmlContent}</div>
        </div>`;
        return wrap;
    },

    // ─── Stream message word by word (ChatGPT style) ─────────
    async streamMessage(role, rawText) {
        const container = document.getElementById('chatMessages');
        const el = this.buildMessageEl(role, '');
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;

        const contentEl = el.querySelector('.msg-content');
        const words = rawText.split(' ');
        let accumulated = '';

        // Hide prompts while streaming
        document.getElementById('chatPrompts').style.opacity = '0.3';

        const SPEED = 18; // ms per word
        for (let i = 0; i < words.length; i++) {
            accumulated += (i === 0 ? '' : ' ') + words[i];
            contentEl.innerHTML = this.parseMarkdown(accumulated) + '<span class="stream-cursor"></span>';
            container.scrollTop = container.scrollHeight;
            await new Promise(r => setTimeout(r, SPEED));
        }

        // Final render without cursor
        contentEl.innerHTML = this.parseMarkdown(rawText);
        container.scrollTop = container.scrollHeight;
        document.getElementById('chatPrompts').style.opacity = '1';

        if (role === 'assistant' && window.VoiceAssistant) {
            VoiceAssistant.addReplayButton(el, rawText);
        }
    },

    // ─── Add instant message (user or simple) ────────────────
    addAIChatMessage(role, content) {
        const container = document.getElementById('chatMessages');
        const el = this.buildMessageEl(role, role === 'assistant' ? this.parseMarkdown(content) : content);
        container.appendChild(el);
        container.scrollTop = container.scrollHeight;
    },

    // ─── "Thinking…" indicator ───────────────────────────────
    showThinkingIndicator() {
        const id = 'think_' + Date.now();
        const container = document.getElementById('chatMessages');
        const wrap = document.createElement('div');
        wrap.className = 'message assistant thinking-msg';
        wrap.id = id;
        const user = Auth.getCurrentUser();
        wrap.innerHTML = `<div class="msg-avatar-wrap"><div class="msg-avatar assistant-avatar" style="font-size:1rem">✨</div></div>
            <div class="msg-content-wrap">
                <div class="msg-sender">VENDRIXA AI</div>
                <div class="msg-content">
                    <span style="color:var(--text-muted);font-style:italic;font-size:0.8rem">Thinking…</span>
                    <div class="thinking-dots">
                        <div class="t-dot"></div><div class="t-dot"></div><div class="t-dot"></div>
                    </div>
                </div>
            </div>`;
        container.appendChild(wrap);
        container.scrollTop = container.scrollHeight;
        return id;
    },

    removeThinkingIndicator(id) { document.getElementById(id)?.remove(); },

    // ─── AI Chat Setup ─────────────────────────────────────────
    setupAIChat() {
        const input  = document.getElementById('aiChatInput');
        const sendBtn = document.getElementById('aiChatSend');
        const clearBtn = document.getElementById('clearChatBtn');

        const sendMsg = async () => {
            const text = input.value.trim();
            if (!text || sendBtn.disabled) return;
            input.value = '';
            sendBtn.disabled = true;

            // User message
            this.addAIChatMessage('user', text);

            // Thinking indicator
            const thinkId = this.showThinkingIndicator();

            try {
                const response = await AIEngine.ask(text);
                this.removeThinkingIndicator(thinkId);
                if (window.VoiceAssistant) {
                    VoiceAssistant.speak(response);
                }
                await this.streamMessage('assistant', response);
            } catch(e) {
                this.removeThinkingIndicator(thinkId);
                this.addAIChatMessage('assistant', 'Sorry, I had trouble processing that. Please try again.');
            }

            sendBtn.disabled = false;
            input.focus();
        };

        sendBtn.addEventListener('click', sendMsg);
        input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(); }});

        // Prompt pills
        document.querySelectorAll('.prompt').forEach(btn => {
            btn.addEventListener('click', () => { input.value = btn.textContent; sendMsg(); });
        });

        // Clear chat
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                document.getElementById('chatMessages').innerHTML = '';
                // Add welcome back
                setTimeout(() => this.addAIChatMessage('assistant', '✨ Chat cleared! I\'m ready for your next question. Ask me anything about your business!'), 200);
            });
        }
    },

}; // ← END of Dashboard object

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Dashboard.init());
} else {
    Dashboard.init();
}
