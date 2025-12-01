(function() {
    // Configuration
    const API_BASE_URL = "https://tinytorch.netlify.app"; 

    // State Management
    function getSession() {
        const token = localStorage.getItem("tinytorch_token");
        const userStr = localStorage.getItem("tinytorch_user");
        let user = null;
        try { user = JSON.parse(userStr); } catch(e) {}
        
        // Allow window.USER_EMAIL to override or serve as fallback if no local storage (legacy support)
        const email = user ? user.email : (window.USER_EMAIL || null);
        return { token, email, isLoggedIn: !!token };
    }

    const session = getSession();
    const isLoggedIn = session.isLoggedIn;
    const userEmail = session.email;

    // 1. Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        /* --- Hamburger Menu --- */
        .menu-btn {
            position: fixed;
            top: 30px;
            left: 30px;
            z-index: 100;
            width: 35px;
            height: 25px;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: transparent;
            border: none;
            padding: 0;
        }

        .menu-btn span {
            display: block;
            width: 100%;
            height: 4px;
            background-color: #333;
            border-radius: 2px;
            transition: all 0.3s ease-in-out;
        }

        .menu-btn.active span:nth-child(1) {
            transform: translateY(10.5px) rotate(45deg);
        }
        .menu-btn.active span:nth-child(2) {
            opacity: 0;
        }
        .menu-btn.active span:nth-child(3) {
            transform: translateY(-10.5px) rotate(-45deg);
        }

        /* --- Login/Account Button --- */
        .login-btn {
            position: fixed;
            top: 30px;
            right: 30px;
            z-index: 100;
            font-family: 'Verdana', sans-serif;
            font-size: 0.95rem;
            font-weight: bold;
            color: rgba(30, 30, 30, 0.8); 
            background: transparent;
            border: 2px solid rgba(30, 30, 30, 0.8); 
            text-decoration: none;
            transition: all 0.2s ease;
            cursor: pointer;
            padding: 10px 20px;
            border-radius: 30px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .login-btn:hover {
            background: rgba(0, 0, 0, 0.05);
            color: #000;
            border-color: #000;
        }

        .login-icon {
            width: 18px;
            height: 18px;
            fill: currentColor;
        }

        /* Slide-out Sidebar (Desktop Default) */
        .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            width: 300px;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            z-index: 90;
            transform: translateX(-100%);
            transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
            box-shadow: 2px 0 15px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            padding-top: 100px;
            padding-left: 40px;
        }

        .sidebar.active {
            transform: translateX(0);
        }

        .nav-item {
            font-family: 'Verdana', sans-serif;
            font-size: 1.5rem;
            color: #333;
            text-decoration: none;
            margin-bottom: 20px;
            font-weight: bold;
            transition: color 0.2s;
        }

        .nav-item:hover {
            color: #ff6600;
        }

        /* --- Modal Styles --- */
        .auth-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            z-index: 200;
            display: flex;
            justify-content: center;
            align-items: center;
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s ease, visibility 0.3s;
        }
        
        .auth-overlay.active {
            opacity: 1;
            visibility: visible;
        }

        .auth-modal {
            background: white;
            padding: 40px;
            border-radius: 20px;
            width: 90%;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            position: relative;
            transform: translateY(20px);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .auth-overlay.active .auth-modal {
            transform: translateY(0);
        }

        .auth-close {
            position: absolute;
            top: 20px;
            right: 20px;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #888;
        }

        .auth-title {
            font-family: 'Verdana', sans-serif;
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: #333;
            text-align: center;
        }

        .auth-input {
            width: 100%;
            padding: 12px 15px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 10px;
            font-size: 1rem;
            outline: none;
            transition: border-color 0.2s;
            box-sizing: border-box;
        }

        .auth-input:focus {
            border-color: #ff6600;
        }

        .auth-submit {
            width: 100%;
            padding: 12px;
            background: #333;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: bold;
            cursor: pointer;
            transition: background 0.2s;
        }

        .auth-submit:hover {
            background: #ff6600;
        }

        .auth-toggle {
            display: block;
            text-align: center;
            margin-top: 15px;
            color: #666;
            text-decoration: underline;
            cursor: pointer;
            font-size: 0.9rem;
        }
        
        .auth-error {
            color: #d32f2f;
            font-size: 0.9rem;
            margin-bottom: 15px;
            text-align: center;
            display: none;
        }

        .auth-forgot-link {
            display: block;
            text-align: right;
            margin-top: -10px;
            margin-bottom: 15px;
            font-size: 0.85rem;
            color: #666;
            text-decoration: none;
            cursor: pointer;
        }
        .auth-forgot-link:hover {
            color: #ff6600;
            text-decoration: underline;
        }

        .hidden {
            display: none !important;
        }

        /* --- Mobile Optimizations --- */
        @media (max-width: 768px) {
            /* Sidebar becomes a bottom sheet */
            .sidebar {
                top: auto;
                bottom: 0;
                left: 0;
                width: 100%;
                height: auto;
                transform: translateY(100%);
                border-radius: 24px 24px 0 0;
                padding: 40px 20px 80px 20px; 
                box-shadow: 0 -5px 20px rgba(0,0,0,0.15);
                align-items: center; 
                padding-left: 0;     
            }

            .sidebar.active {
                transform: translateY(0);
            }
            
            .login-btn.logged-in {
                padding: 0;
                width: 45px;
                height: 45px;
                justify-content: center;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.8);
                border: 1px solid rgba(0,0,0,0.1);
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            
            .login-btn.logged-in .btn-text {
                display: none;
            }

            .login-btn.logged-in .login-icon {
                width: 24px;
                height: 24px;
                margin: 0;
            }
            
            .menu-btn {
                top: auto;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 100px; 
                height: 25px; 
                background: rgba(255, 255, 255, 0.95);
                border-radius: 16px 16px 0 0;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                padding: 0; 
                justify-content: center; 
                align-items: center; 
                border: 1px solid rgba(0,0,0,0.05);
                border-bottom: none;
                backdrop-filter: blur(5px);
            }

            .menu-btn span {
                width: 40px; 
                height: 4px; 
                background: #ccc;
                border-radius: 2px;
                margin: 0; 
            }

            .menu-btn span:nth-child(2),
            .menu-btn span:nth-child(3) {
                display: none;
            }

            .menu-btn.active span:nth-child(1) {
                transform: none;
                background: #ff6600; 
            }
            
            .login-btn {
                top: 20px;
                right: 20px;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Create and Inject HTML Elements
    
    const userIcon = `<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>`;
    const logoutIcon = `<path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>`;

    const currentIcon = isLoggedIn ? logoutIcon : userIcon;
    const btnText = isLoggedIn ? `Logout of ${userEmail}` : 'Create Account';
    const btnClass = isLoggedIn ? 'login-btn logged-in' : 'login-btn';

    const layoutHTML = `
        <button class="menu-btn" id="menuBtn">
            <span></span>
            <span></span>
            <span></span>
        </button>
        
        <a href="#" class="${btnClass}" id="authBtn">
            <svg class="login-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                ${currentIcon}
            </svg>
            <span class="btn-text">${btnText}</span>
        </a>

        <nav class="sidebar" id="sidebar">
            <a href="#" class="nav-item">Home</a>
            <a href="#" class="nav-item">About</a>
            <a href="#" class="nav-item">Events</a>
            <a href="community.html" class="nav-item">Community</a>
            <a href="#" class="nav-item">Contact</a>
        </nav>

        <!-- Auth Modal -->
        <div class="auth-overlay" id="authOverlay">
            <div class="auth-modal">
                <button class="auth-close" id="authClose">&times;</button>
                <h2 class="auth-title" id="authTitle">Create Account</h2>
                <div class="auth-error" id="authError"></div>
                <form id="authForm">
                    <input type="email" class="auth-input" id="authEmail" placeholder="Email" required>
                    <input type="password" class="auth-input" id="authPassword" placeholder="Password" required>
                    <div id="authForgotContainer" class="hidden">
                        <span class="auth-forgot-link" id="authForgotLink">Forgot Password?</span>
                    </div>
                    <button type="submit" class="auth-submit" id="authSubmit">Create Account</button>
                </form>
                <span class="auth-toggle" id="authToggle">Already have an account? Login</span>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('afterbegin', layoutHTML);

    // 3. Add Event Listeners
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    const authBtn = document.getElementById('authBtn');
    const authOverlay = document.getElementById('authOverlay');
    const authClose = document.getElementById('authClose');
    const authForm = document.getElementById('authForm');
    const authTitle = document.getElementById('authTitle');
    const authSubmit = document.getElementById('authSubmit');
    const authToggle = document.getElementById('authToggle');
    const authError = document.getElementById('authError');
    const emailInput = document.getElementById('authEmail');
    const passwordInput = document.getElementById('authPassword');
    const forgotLink = document.getElementById('authForgotLink');
    const forgotContainer = document.getElementById('authForgotContainer');

    // Modal State
    let currentMode = 'signup'; // 'login', 'signup', 'forgot'

    function openModal() {
        authOverlay.classList.add('active');
        // Default to signup if not specified, or maintain last state?
        // Let's default to signup like before, or intelligent default
        setMode('signup');
    }

    function closeModal() {
        authOverlay.classList.remove('active');
    }

    function resetForm() {
        authForm.reset();
        authError.style.display = 'none';
        authError.textContent = '';
    }

    function setMode(mode) {
        currentMode = mode;
        resetForm();
        
        if (mode === 'login') {
            authTitle.textContent = 'Login';
            authSubmit.textContent = 'Login';
            authToggle.textContent = 'Need an account? Create Account';
            passwordInput.classList.remove('hidden');
            passwordInput.required = true;
            forgotContainer.classList.remove('hidden');
        } else if (mode === 'signup') {
            authTitle.textContent = 'Create Account';
            authSubmit.textContent = 'Create Account';
            authToggle.textContent = 'Already have an account? Login';
            passwordInput.classList.remove('hidden');
            passwordInput.required = true;
            forgotContainer.classList.add('hidden');
        } else if (mode === 'forgot') {
            authTitle.textContent = 'Reset Password';
            authSubmit.textContent = 'Send Reset Link';
            authToggle.textContent = 'Back to Login';
            passwordInput.classList.add('hidden');
            passwordInput.required = false;
            forgotContainer.classList.add('hidden');
        }
    }

    function handleToggle() {
        if (currentMode === 'login') {
            setMode('signup');
        } else if (currentMode === 'signup') {
            setMode('login');
        } else if (currentMode === 'forgot') {
            setMode('login');
        }
    }

    // Auth Logic
    async function handleAuth(e) {
        e.preventDefault();
        const email = emailInput.value;
        const password = passwordInput.value;
        authError.style.display = 'none';
        authSubmit.disabled = true;
        authSubmit.textContent = 'Processing...';

        try {
            let endpoint, body;
            
            if (currentMode === 'forgot') {
                endpoint = '/api/auth/reset-password';
                body = { email };
            } else {
                endpoint = currentMode === 'login' ? '/api/auth/login' : '/api/auth/signup';
                body = { email, password };
            }
            
            const url = `${API_BASE_URL}${endpoint}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            // Check for success based on mode
            if (currentMode === 'forgot') {
                 // Forgot password always returns 200 OK with message, or 400 error
                 if (response.ok) {
                     alert(data.message || 'If an account exists, a reset link has been sent.');
                     setMode('login'); // Go back to login
                 } else {
                     throw new Error(data.error || 'Failed to send reset link');
                 }
            } else {
                if (!response.ok) {
                    throw new Error(data.error || (currentMode === 'login' ? 'Login failed' : 'Signup failed'));
                }

                if (currentMode === 'login') {
                    // Login Success
                    if (data.access_token) {
                        localStorage.setItem("tinytorch_token", data.access_token);
                        localStorage.setItem("tinytorch_user", JSON.stringify(data.user));
                        window.location.href = '/dashboard.html';
                    }
                } else {
                    // Signup Success
                    alert('Account created successfully! Please check your email to confirm before logging in.');
                    setMode('login'); // Switch to login
                }
            }

        } catch (error) {
            console.error("Auth error:", error);
            authError.textContent = error.message;
            authError.style.display = 'block';
        } finally {
            authSubmit.disabled = false;
            // Restore button text based on mode
            if (currentMode === 'login') authSubmit.textContent = 'Login';
            else if (currentMode === 'signup') authSubmit.textContent = 'Create Account';
            else authSubmit.textContent = 'Send Reset Link';
        }
    }

    function handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem("tinytorch_token");
            localStorage.removeItem("tinytorch_user");
            window.location.reload();
        }
    }

    // Wire up events
    if (menuBtn && sidebar) {
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('active') && 
                !sidebar.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                menuBtn.classList.remove('active');
                sidebar.classList.remove('active');
            }
        });
        
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            menuBtn.classList.toggle('active');
            sidebar.classList.toggle('active');
        });
    }

    if (authBtn) {
        authBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (isLoggedIn) {
                handleLogout();
            } else {
                openModal();
            }
        });
    }

    if (authClose) authClose.addEventListener('click', closeModal);
    if (authOverlay) {
        authOverlay.addEventListener('click', (e) => {
            if (e.target === authOverlay) closeModal();
        });
    }
    if (authToggle) authToggle.addEventListener('click', handleToggle);
    if (forgotLink) forgotLink.addEventListener('click', () => setMode('forgot'));
    if (authForm) authForm.addEventListener('submit', handleAuth);

})();
