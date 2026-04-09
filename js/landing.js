const Landing = {
    init() {
        if(Auth.isLoggedIn()) {
            window.location.href = 'dashboard.html';
            return;
        }

        const authModal = document.getElementById('authModal');
        const loginBtn = document.getElementById('loginBtn');
        const getStartedBtn = document.getElementById('getStartedBtn');
        const closeModal = document.querySelector('.close-modal');
        
        // Modal toggles
        const openModal = () => {
            authModal.classList.remove('hidden');
            setTimeout(() => authModal.style.opacity = '1', 10);
        };
        
        const closeAuthModal = () => {
            authModal.style.opacity = '0';
            setTimeout(() => authModal.classList.add('hidden'), 300);
        };

        loginBtn.addEventListener('click', () => {
            this.switchTab('login');
            openModal();
        });

        getStartedBtn.addEventListener('click', () => {
            this.switchTab('signup');
            openModal();
        });

        closeModal.addEventListener('click', closeAuthModal);
        
        // Close on outside click
        authModal.addEventListener('click', (e) => {
            if(e.target === authModal) closeAuthModal();
        });

        // Tab Switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.target);
            });
        });

        // Form Submission
        document.getElementById('authForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('authSubmit');
            const mode = document.querySelector('.tab-btn.active').dataset.target;
            
            btn.textContent = 'Processing...';
            btn.disabled = true;
            
            try {
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                if (mode === 'signup') {
                    const name = document.getElementById('fullName').value;
                    const shop = document.getElementById('shopName').value;
                    if(!name || !shop) throw new Error("Please fill all details");
                    await Auth.signup(name, shop, email, password);
                } else {
                    await Auth.login(email, password);
                }
                
                // Redirect on success
                window.location.href = 'dashboard.html';
                
            } catch (err) {
                const errorDiv = document.getElementById('authError');
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('hidden');
                
                setTimeout(() => errorDiv.classList.add('hidden'), 3000);
            } finally {
                btn.textContent = mode === 'signup' ? 'Create Account' : 'Sign In';
                btn.disabled = false;
            }
        });
    },

    switchTab(target) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active', 'btn-primary'));
        const activeBtn = document.querySelector(`.tab-btn[data-target="${target}"]`);
        activeBtn.classList.add('active', 'btn-primary');
        
        const signupFields = document.getElementById('signupFields');
        const submitBtn = document.getElementById('authSubmit');
        
        if (target === 'signup') {
            signupFields.classList.remove('hidden');
            // Required properties toggle
            document.getElementById('fullName').required = true;
            document.getElementById('shopName').required = true;
            submitBtn.textContent = 'Create Account';
        } else {
            signupFields.classList.add('hidden');
            document.getElementById('fullName').required = false;
            document.getElementById('shopName').required = false;
            submitBtn.textContent = 'Sign In';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Landing.init());
