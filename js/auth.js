// Auth Module - Handles user registration, login, and session management

const Auth = {
    // Keys for LocalStorage
    USERS_KEY: 'viq_users',
    SESSION_KEY: 'viq_session',

    // Initialize - create empty users array if it doesn't exist
    init() {
        if (!localStorage.getItem(this.USERS_KEY)) {
            localStorage.setItem(this.USERS_KEY, JSON.stringify([]));
        }
    },

    // View registered users (internal use)
    getUsers() {
        this.init();
        return JSON.parse(localStorage.getItem(this.USERS_KEY));
    },

    // Create a new account
    signup(name, shopName, email, password) {
        return new Promise((resolve, reject) => {
            try {
                const users = this.getUsers();
                
                // Check if email exists
                if (users.find(u => u.email === email)) {
                    throw new Error("Email already registered. Please login.");
                }

                // Create new user object
                const newUser = {
                    id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name,
                    shopName,
                    email,
                    // Simple obfuscation for demo
                    password: btoa(password),
                    createdAt: new Date().toISOString()
                };

                users.push(newUser);
                localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
                
                // Initialize user data namespace
                DB.initUser(newUser.id);
                
                // Auto login
                this.setSession(newUser);
                resolve(newUser);
            } catch (err) {
                reject(err);
            }
        });
    },

    // Login to existing account
    login(email, password) {
        return new Promise((resolve, reject) => {
            try {
                const users = this.getUsers();
                const encodedPwd = btoa(password);
                
                const user = users.find(u => u.email === email && u.password === encodedPwd);
                
                if (!user) {
                    throw new Error("Invalid email or password.");
                }

                this.setSession(user);
                resolve(user);
            } catch (err) {
                reject(err);
            }
        });
    },

    // Set active session
    setSession(user) {
        const sessionData = {
            id: user.id,
            name: user.name,
            shopName: user.shopName,
            email: user.email
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    },

    // Get current logged-in user
    getCurrentUser() {
        const session = localStorage.getItem(this.SESSION_KEY);
        return session ? JSON.parse(session) : null;
    },

    // Check if logged in
    isLoggedIn() {
        return !!this.getCurrentUser();
    },

    // Logout
    logout() {
        localStorage.removeItem(this.SESSION_KEY);
        window.location.href = 'index.html';
    },
    
    // Protect routes
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'index.html';
        }
    }
};

Auth.init();
