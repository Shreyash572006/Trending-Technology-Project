// Database Module - Handles per-user data storage (LocalStorage simulation)

const DB = {
    // Generate isolated key for current user
    getUserKey(namespace) {
        const user = Auth.getCurrentUser();
        if (!user) throw new Error("Not authenticated");
        return `viq_${namespace}_${user.id}`;
    },

    // Initialize default structure for a new user
    initUser(userId) {
        const defaultData = {
            salesLog: [],
            inventory: [],
            expenses: []
        };
        localStorage.setItem(`viq_data_${userId}`, JSON.stringify(defaultData));
    },

    // Get all user data
    getAllData() {
        const user = Auth.getCurrentUser();
        if (!user) return null;
        const data = localStorage.getItem(`viq_data_${user.id}`);
        return data ? JSON.parse(data) : { salesLog: [], inventory: [], expenses: [] };
    },

    // Save all user data
    saveAllData(data) {
        const user = Auth.getCurrentUser();
        if (!user) return;
        localStorage.setItem(`viq_data_${user.id}`, JSON.stringify(data));
    },

    // --- Inventory Management ---
    getInventory() {
        return this.getAllData().inventory;
    },

    addInventoryItem(name, costPrice, targetSellingPrice, initialStock) {
        const data = this.getAllData();
        const newItem = {
            id: 'item_' + Date.now(),
            name,
            costPrice: parseFloat(costPrice),
            targetSellingPrice: parseFloat(targetSellingPrice),
            stock: parseInt(initialStock),
            addedAt: new Date().toISOString()
        };
        data.inventory.push(newItem);
        this.saveAllData(data);
        return newItem;
    },
    
    updateStock(itemId, quantitySold) {
        const data = this.getAllData();
        const item = data.inventory.find(i => i.id === itemId);
        if (item) {
            item.stock = Math.max(0, item.stock - quantitySold);
            this.saveAllData(data);
        }
    },

    // --- Sales Logging ---
    getSales() {
        return this.getAllData().salesLog;
    },

    addSale(date, productId, sellingPrice, quantity) {
        const data = this.getAllData();
        const item = data.inventory.find(i => i.id === productId);
        
        if (!item) throw new Error("Product not found in inventory");

        const qty = parseInt(quantity);
        const sp = parseFloat(sellingPrice);
        const totalSales = sp * qty;
        const totalCost = item.costPrice * qty;
        const profit = totalSales - totalCost;

        const newSale = {
            id: 'sale_' + Date.now(),
            date,
            productId,
            productName: item.name,
            costPrice: item.costPrice,
            sellingPrice: sp,
            quantity: qty,
            totalSales,
            totalCost,
            profit,
            profitMargin: (profit / totalSales) * 100
        };

        data.salesLog.push(newSale);
        this.saveAllData(data);
        
        // Auto deduct stock
        this.updateStock(productId, qty);
        
        return newSale;
    },
    
    deleteSale(saleId) {
        const data = this.getAllData();
        // Option to add stock back here if wanted (skipping for simplicity now)
        data.salesLog = data.salesLog.filter(s => s.id !== saleId);
        this.saveAllData(data);
    },

    // --- Expense Tracking ---
    getExpenses() {
        return this.getAllData().expenses;
    },

    addExpense(date, category, description, amount) {
        const data = this.getAllData();
        const newExpense = {
            id: 'exp_' + Date.now(),
            date,
            category,
            description,
            amount: parseFloat(amount)
        };
        data.expenses.push(newExpense);
        this.saveAllData(data);
        return newExpense;
    },
    
    deleteExpense(expenseId) {
        const data = this.getAllData();
        data.expenses = data.expenses.filter(e => e.id !== expenseId);
        this.saveAllData(data);
    },

    // --- Derived KPIs ---
    getKPIs() {
        const data = this.getAllData();
        if (!data) return { revenue: 0, expenses: 0, profit: 0, margin: 0 };

        const revenue = data.salesLog.reduce((sum, sale) => sum + sale.totalSales, 0);
        const expenses = data.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        // Base cost of goods sold (COGS)
        const cogs = data.salesLog.reduce((sum, sale) => sum + sale.totalCost, 0);
        
        // Net profit = Revenue - COGS - Expenses
        const netProfit = revenue - cogs - expenses;
        const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

        return {
            revenue,
            cogs,
            expenses,
            netProfit,
            profitMargin
        };
    }
};
