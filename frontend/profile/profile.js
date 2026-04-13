/* ============================================
   PROFILE.JS - Profile Specific Logic
   ============================================ */

const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupTabNavigation();
    fetchBookings();
    
    // Member since
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const memberSinceEl = document.getElementById('memberSince');
    if (memberSinceEl) memberSinceEl.textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
        window.location.href = '../auth/auth.html';
        return;
    }

    const user = JSON.parse(userData);

    // Populate user info
    const sidebarName = document.getElementById('sidebarName');
    const navProfileName = document.getElementById('navProfileName');
    const userInitial = document.getElementById('userInitial');

    if (sidebarName) sidebarName.textContent = user.name || 'User Member';
    if (navProfileName) navProfileName.textContent = user.name || 'User Member';
    if (userInitial) userInitial.textContent = (user.name || 'C').charAt(0).toUpperCase();
}

function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);

                // Update active link
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');

                // Show target tab
                tabContents.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.id === targetId) {
                        tab.classList.add('active');
                    }
                });
            }
        });
    });
}

// Fetch and display bookings
async function fetchBookings() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/mybookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const bookings = await response.json();
        const activeList = document.getElementById('activeBookingsList');
        const pastList = document.getElementById('pastBookingsList');
        
        if (!response.ok) {
            console.error('Failed to load bookings');
            return;
        }

        // Update stats
        const statBookings = document.getElementById('statBookings');
        const statCompleted = document.getElementById('statCompleted');
        if (statBookings) statBookings.textContent = bookings.length;
        const completedCount = bookings.filter(b => b.status === 'completed').length;
        if (statCompleted) statCompleted.textContent = completedCount;

        // Separate Active and Past bookings
        const activeBookings = bookings.filter(b => ['pending', 'confirmed'].includes(b.status));
        const pastBookings = bookings.filter(b => ['completed', 'cancelled', 'rejected'].includes(b.status));

        // Render Active
        if (activeList) {
            activeList.innerHTML = activeBookings.length ? activeBookings.map(b => renderRitualCard(b)).join('') : '<p class="text-muted text-center py-4">No active appointments.</p>';
        }

        // Render Past
        if (pastList) {
            pastList.innerHTML = pastBookings.length ? pastBookings.map(b => renderRitualCard(b)).join('') : '<p class="text-muted text-center py-4">No past history found.</p>';
        }

    } catch (error) {
        console.error('Error fetching bookings:', error);
    }
}

function renderRitualCard(booking) {
    const date = formatDate(booking.date);
    const statusLabel = (booking.status === 'rejected' ? 'CANCELLED' : booking.status).toUpperCase();
    
    return `
        <div class="ritual-card" style="background: var(--color-bg-card); border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; border: 1px solid #222;">
            <div class="ritual-header d-flex justify-content-between align-items-center mb-2">
                <h3 style="font-size: 1.25rem; color: var(--color-gold); margin: 0;">${booking.service}</h3>
                <span class="status-tag ${booking.status === 'rejected' ? 'cancelled' : booking.status}" style="font-size: 0.7rem;">${statusLabel}</span>
            </div>
            <div class="ritual-time" style="color: #888; font-size: 0.9rem; margin-bottom: 0.5rem;">
                <i class="bi bi-calendar3 me-2"></i> ${date} &bull; <i class="bi bi-clock me-2 ms-2"></i> ${booking.time}
            </div>
            <div class="ritual-location" style="font-size: 0.85rem; color: #aaa; margin-bottom: 1rem;">
                <span style="text-transform: capitalize; color: var(--color-gold); font-weight: 600;">${booking.bookingType}</span>
                ${booking.address ? ` &bull; <i class="bi bi-geo-alt-fill me-1 ms-1"></i> ${booking.address}` : ''}
            </div>
            <div class="ritual-bottom d-flex justify-content-between align-items-center mt-3 pt-3" style="border-top: 1px solid #222;">
                <div class="ritual-price" style="font-weight: 700;">
                    <span style="color: #666; font-size: 0.8rem; font-weight: 400; margin-right: 8px;">PRICE</span>
                    Rs ${booking.totalPrice?.toLocaleString() || '---'}
                </div>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../auth/auth.html';
}

function logout() {
    handleLogout();
}
