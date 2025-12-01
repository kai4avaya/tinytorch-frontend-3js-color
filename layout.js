(function() {
    const userEmail = window.USER_EMAIL;
    const isLoggedIn = !!userEmail;

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
                padding: 40px 20px 80px 20px; /* Extra padding bottom for handle */
                box-shadow: 0 -5px 20px rgba(0,0,0,0.15);
                align-items: center; /* Center items on mobile */
                padding-left: 0;     /* Reset desktop padding */
            }

            .sidebar.active {
                transform: translateY(0);
            }
            
            /* Adjust Login Button for Mobile if Logged In */
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
            
            /* Transform Hamburger into Bottom Handle */
            .menu-btn {
                top: auto;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 100px; /* Wider for easier tapping */
                height: 25px; /* Flatter */
                background: rgba(255, 255, 255, 0.95);
                border-radius: 16px 16px 0 0;
                box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
                padding: 0; /* Remove padding for true bottom connection */
                justify-content: center; /* Center content vertically */
                align-items: center; /* Center content horizontally */
                border: 1px solid rgba(0,0,0,0.05);
                border-bottom: none;
                backdrop-filter: blur(5px);
            }

            .menu-btn span {
                width: 40px; /* Wider handle line */
                height: 4px; /* Thinner handle line */
                background: #ccc;
                border-radius: 2px;
                margin: 0; /* Center vertically and horizontally */
            }

            .menu-btn span:nth-child(2),
            .menu-btn span:nth-child(3) {
                display: none;
            }

            .menu-btn.active span:nth-child(1) {
                transform: none;
                background: #ff6600; /* Highlight when active */
            }
            
            .login-btn {
                top: 20px;
                right: 20px;
            }
        }
    `;
    document.head.appendChild(style);

    // 2. Create and Inject HTML Elements
    
    // Icons
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
        
        <a href="#" class="${btnClass}">
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
    `;
    
    // Insert at the beginning of body
    document.body.insertAdjacentHTML('afterbegin', layoutHTML);

    // 3. Add Event Listeners
    const menuBtn = document.getElementById('menuBtn');
    const sidebar = document.getElementById('sidebar');
    
    // Close sidebar when clicking outside (Mobile UX improvement)
    document.addEventListener('click', (e) => {
        if (sidebar.classList.contains('active') && 
            !sidebar.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            
            menuBtn.classList.remove('active');
            sidebar.classList.remove('active');
        }
    });
    
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent immediate close
            menuBtn.classList.toggle('active');
            sidebar.classList.toggle('active');
        });
    }
})();