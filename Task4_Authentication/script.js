/* --- Utility: Toast Notifications --- */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-exclamation-circle';

    toast.innerHTML = `<i class="fas ${icon}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* --- Utility: Password Visibility --- */
window.togglePasswordVisibility = function(inputId, iconElement) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        iconElement.classList.remove('fa-eye');
        iconElement.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        iconElement.classList.remove('fa-eye-slash');
        iconElement.classList.add('fa-eye');
    }
}

/* --- Utility: Password Strength --- */
window.checkPasswordStrength = function(password) {
    const bar = document.getElementById('strengthBar');
    const text = document.getElementById('strengthText');
    if (!bar || !text) return;

    if (password.length === 0) {
        bar.style.width = '0%';
        text.textContent = 'Password Strength';
        return;
    }

    let strength = 0;
    if (password.length >= 6) strength += 25;
    if (password.length >= 10) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;

    bar.style.width = `${strength}%`;

    if (strength <= 25) {
        bar.style.background = 'var(--error)';
        text.textContent = 'Weak';
    } else if (strength <= 50) {
        bar.style.background = 'var(--warning)';
        text.textContent = 'Fair';
    } else if (strength <= 75) {
        bar.style.background = 'var(--accent-primary)';
        text.textContent = 'Good';
    } else {
        bar.style.background = 'var(--success)';
        text.textContent = 'Strong';
    }
}

/* --- SHA-256 password hashing --- */
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/* --- REGISTER --- */
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async e => {
        e.preventDefault();

        const email = document.getElementById("regEmail").value;
        const password = document.getElementById("regPassword").value;
        const confirmPassword = document.getElementById("regConfirmPassword").value;

        if (password !== confirmPassword) {
            showToast("Passwords do not match!", "error");
            return;
        }

        let users = JSON.parse(localStorage.getItem("users")) || [];

        if (users.find(u => u.email === email)) {
            showToast("User already exists with this email.", "error");
            return;
        }

        const hashed = await hashPassword(password);
        users.push({ email, password: hashed });
        localStorage.setItem("users", JSON.stringify(users));

        showToast("Registration successful! Redirecting...", "success");
        setTimeout(() => window.location.href = "login.html", 1500);
    });
}

/* --- LOGIN --- */
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async e => {
        e.preventDefault();

        const email = document.getElementById("loginEmail").value;
        const password = document.getElementById("loginPassword").value;
        const rememberMe = document.getElementById("rememberMe").checked;

        let users = JSON.parse(localStorage.getItem("users")) || [];
        const hashed = await hashPassword(password);
        const user = users.find(u => u.email === email && u.password === hashed);

        if (user) {
            // Save session
            if (rememberMe) {
                localStorage.setItem("session", email);
            } else {
                sessionStorage.setItem("session", email);
            }
            
            showToast("Login successful!", "success");
            setTimeout(() => window.location.href = "dashboard.html", 1000);
        } else {
            showToast("Invalid email or password", "error");
        }
    });
}

/* --- DASHBOARD PROTECTION & INIT --- */
if (window.location.pathname.includes("dashboard")) {
    
    // Check both local and session storage
    const session = localStorage.getItem("session") || sessionStorage.getItem("session");

    if (!session) {
        window.location.href = "login.html";
    } else {
        // Initialize dashboard
        const emailDisplay = document.getElementById("userEmailDisplay");
        const nameDisplay = document.getElementById("userName");
        
        if (emailDisplay) emailDisplay.textContent = session;
        if (nameDisplay) {
            // Extract name from email for display
            const name = session.split('@')[0];
            nameDisplay.textContent = name.charAt(0).toUpperCase() + name.slice(1);
        }
    }
}

/* --- LOGOUT --- */
window.logout = function() {
    localStorage.removeItem("session");
    sessionStorage.removeItem("session");
    window.location.href = "login.html";
}