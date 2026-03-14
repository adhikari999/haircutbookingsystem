/* ============================================
   AUTH.JS - Authentication JavaScript
   ============================================ */

const API_BASE_URL = 'http://localhost:5000/api';

// ---- Password Toggle ----
document.querySelectorAll('.password-toggle').forEach(toggle => {
  toggle.addEventListener('click', function () {
    const targetId = this.getAttribute('data-target') || 'password';
    const input = document.getElementById(targetId);
    
    if (input.type === 'password') {
      input.type = 'text';
      this.textContent = '🙈';
    } else {
      input.type = 'password';
      this.textContent = '👁️';
    }
  });
});

// For single toggle (login page)
const singleToggle = document.getElementById('togglePassword');
if (singleToggle) {
  singleToggle.addEventListener('click', function () {
    const input = document.getElementById('password');
    if (input.type === 'password') {
      input.type = 'text';
      this.textContent = '🙈';
    } else {
      input.type = 'password';
      this.textContent = '👁️';
    }
  });
}

// ---- Show Message ----
function showMessage(type, text) {
  const messageDiv = document.getElementById('formMessage');
  if (!messageDiv) return;
  
  const messageIcon = messageDiv.querySelector('.message-icon');
  const messageText = messageDiv.querySelector('.message-text');
  
  messageDiv.className = 'form-message ' + type;
  messageIcon.textContent = type === 'error' ? '⚠️' : '✅';
  messageText.textContent = text;
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    messageDiv.className = 'form-message';
  }, 5000);
}

// ---- Set Button Loading State ----
function setLoading(button, loading) {
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}

// ---- Email Validation ----
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ---- Login Form ----
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  // Show welcome message if coming from registration
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('registered') === 'true') {
    setTimeout(() => {
      showMessage('success', 'Registration successful! Please sign in with your credentials.');
    }, 300);
  }

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.getElementById('loginBtn');
    
    // Validation
    if (!email || !password) {
      showMessage('error', 'Please fill in all fields.');
      return;
    }
    
    if (!isValidEmail(email)) {
      showMessage('error', 'Please enter a valid email address.');
      return;
    }
    
    // Submit
    setLoading(loginBtn, true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Save token
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          _id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role,
        }));
        
        showMessage('success', 'Login successful! Redirecting to profile...');
        
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1500);
      } else {
        showMessage('error', data.message || 'Invalid credentials. Please try again.');
      }
    } catch (error) {
      showMessage('error', 'Unable to connect to server. Please check if the backend is running.');
      console.error('Login error:', error);
    } finally {
      setLoading(loginBtn, false);
    }
  });
}

// ---- Register Form ----
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const name = document.getElementById('fullName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const terms = document.getElementById('terms').checked;
    const registerBtn = document.getElementById('registerBtn');
    
    // Validation
    if (!name || !phone || !email || !password || !confirmPassword) {
      showMessage('error', 'Please fill in all fields.');
      return;
    }
    
    if (!isValidEmail(email)) {
      showMessage('error', 'Please enter a valid email address.');
      return;
    }
    
    if (password.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long.');
      return;
    }
    
    if (password !== confirmPassword) {
      showMessage('error', 'Passwords do not match.');
      return;
    }
    
    if (!terms) {
      showMessage('error', 'Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    
    // Submit
    setLoading(registerBtn, true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, role }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showMessage('success', 'Account created successfully! Redirecting to login...');
        
        setTimeout(() => {
          window.location.href = 'login.html?registered=true';
        }, 1500);
      } else {
        showMessage('error', data.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      showMessage('error', 'Unable to connect to server. Please check if the backend is running.');
      console.error('Registration error:', error);
    } finally {
      setLoading(registerBtn, false);
    }
  });
}

// ---- Input Focus Animations ----
document.querySelectorAll('.form-input, .form-select').forEach(input => {
  input.addEventListener('focus', function () {
    this.closest('.form-group').classList.add('focused');
  });
  
  input.addEventListener('blur', function () {
    this.closest('.form-group').classList.remove('focused');
  });
});

// ---- Check Auth Status ----
function isLoggedIn() {
  return !!localStorage.getItem('token');
}

function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login.html';
}

console.log('%c🔐 Auth Module Loaded', 'color: #2ecc71; font-size: 12px;');
