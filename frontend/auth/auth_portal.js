/* ============================================
   AUTH PORTAL - Unified Logic
   ============================================ */

const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // ---- Check if user is already logged in ----
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
        const user = JSON.parse(userData);
        // User is already logged in, redirect to appropriate dashboard
        if (user.role === 'admin') {
            window.location.href = '../admin/dashboard.html';
        } else if (user.role === 'barber') {
            window.location.href = '../barber/dashboard.html';
        } else {
            window.location.href = '../profile/profile.html';
        }
        return; // Stop execution if redirecting
    }

    // ---- Tab Switching ----
    const authTabs = document.querySelector('.auth-tabs');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.auth-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            // UI Update
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            authTabs.setAttribute('data-active', tabName);

            // Visibility
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(`${tabName}Content`).classList.add('active');

            // Reset messages
            const msgCenter = document.getElementById('formMessage');
            msgCenter.style.display = 'none';
        });
    });

    // ---- Login Logic ----
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const btn = document.getElementById('loginBtn');

        if (!email || !password) return showStatus('error', 'Fields cannot be empty');

        setLoading(btn, true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    name: data.name,
                    role: data.role,
                    email: data.email
                }));
                showStatus('success', 'Logged in! Redirecting...');
                
                // Role-based redirection
                setTimeout(() => {
                    if (data.role === 'admin') {
                        window.location.href = '../admin/dashboard.html';
                    } else if (data.role === 'barber') {
                        window.location.href = '../barber/dashboard.html';
                    } else {
                        window.location.href = '../profile/profile.html';
                    }
                }, 1200);
            } else {
                showStatus('error', data.message || 'Verification failed');
            }
        } catch (err) {
            showStatus('error', 'Server offline');
        } finally {
            setLoading(btn, false);
        }
    });

    // ---- Register Logic ----
    const regForm = document.getElementById('registerForm');
    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('regName').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const role = document.getElementById('regRole').value;
        const password = document.getElementById('regPassword').value;
        const confirm = document.getElementById('regConfirmPassword').value;
        const btn = document.getElementById('registerBtn');

        if (password !== confirm) return showStatus('error', 'Passwords do not match');
        if (password.length < 6) return showStatus('error', 'Password too short');

        setLoading(btn, true);
        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, role, password })
            });
            const data = await res.json();

            if (res.ok) {
                showStatus('success', 'Account created! Please sign in.');
                // Dynamic switch to login
                setTimeout(() => {
                    document.querySelector('[data-tab="login"]').click();
                    document.getElementById('loginEmail').value = email;
                }, 1500);
            } else {
                showStatus('error', data.message || 'Registration failed');
            }
        } catch (err) {
            showStatus('error', 'Network error');
        } finally {
            setLoading(btn, false);
        }
    });
});

// ---- Utilities ----
function showStatus(type, text) {
    const el = document.getElementById('formMessage');
    el.className = `form-message ${type}`;
    el.querySelector('.message-text').textContent = text;
    el.style.display = 'block';
}

function setLoading(btn, isLoading) {
    btn.classList.toggle('loading', isLoading);
    btn.disabled = isLoading;
}

function togglePass(id, icon) {
    const input = document.getElementById(id);
    if (input.type === 'password') {
        input.type = 'text';
        icon.textContent = 'Hide';
    } else {
        input.type = 'password';
        icon.textContent = 'Show';
    }
}
