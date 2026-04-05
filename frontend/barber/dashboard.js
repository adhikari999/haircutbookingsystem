/* ============================================
   DASHBOARD.JS - Barber Dashboard Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    checkBarberAuth();
    loadDashboardStats();
    loadAllBookings();
    setupTabNavigation();
    
    // Set default date for schedule to today
    const dateInput = document.getElementById('scheduleDateSelector');
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
        dateInput.addEventListener('change', loadDailyTimeline);
    }
});

const API_BASE_URL = 'http://localhost:5000/api';
let allBookingsCache = [];

function checkBarberAuth() {
    const token = localStorage.getItem('token');
    const userJson = localStorage.getItem('user');
    
    if (!token || !userJson) {
        window.location.href = '../auth/auth.html';
        return;
    }

    const user = JSON.parse(userJson);
    if (user.role !== 'barber' && user.role !== 'admin') {
        window.location.href = '../profile/profile.html';
        return;
    }

    document.getElementById('barberName').textContent = user.name;
    document.getElementById('sidebarName').textContent = user.name;
}

async function loadDashboardStats() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await response.json();
        
        if (response.ok) {
            document.getElementById('totalBookings').textContent = stats.totalBookings;
            document.getElementById('pendingBookings').textContent = stats.pendingBookings;
            document.getElementById('completedBookings').textContent = stats.completedBookings;
            document.getElementById('totalRevenue').textContent = `Rs ${stats.revenue.toLocaleString()}`;
        }
    } catch (error) {
        console.error('Stats loading error:', error);
    }
}

async function loadAllBookings() {
    const token = localStorage.getItem('token');
    const listBody = document.getElementById('bookingsList');
    listBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading bookings...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookings = await response.json();

        if (response.ok) {
            allBookingsCache = bookings;
            renderRecentBookings(bookings);
            loadDailyTimeline();
        }
    } catch (error) {
        listBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data.</td></tr>';
        console.error('Bookings load error:', error);
    }
}

function renderRecentBookings(bookings) {
    const listBody = document.getElementById('bookingsList');
    listBody.innerHTML = bookings.length ? "" : '<tr><td colspan="6" style="text-align: center;">No bookings found.</td></tr>';
    
    // Show only first 10 for overview
    bookings.slice(0, 10).forEach(booking => {
        const date = new Date(booking.date).toLocaleDateString('en-IN');
        const userName = booking.user ? booking.user.name : "Guest";
        
        const row = `
            <tr>
                <td>${userName}</td>
                <td>${booking.service}</td>
                <td>${date}</td>
                <td>${booking.time}</td>
                <td><span class="status-tag ${booking.status}">${booking.status}</span></td>
                <td>
                    <div class="action-btns">
                        ${booking.status === 'pending' ? `<button onclick="updateStatus('${booking._id}', 'completed')" class="btn btn-sm btn-primary">Done</button>` : ''}
                        ${booking.status !== 'cancelled' && booking.status !== 'completed' ? `<button onclick="updateStatus('${booking._id}', 'cancelled')" class="btn btn-sm btn-ghost">Cancel</button>` : '---'}
                    </div>
                </td>
            </tr>
        `;
        listBody.innerHTML += row;
    });
}

function loadDailyTimeline() {
    const timeline = document.getElementById('dailyTimeline');
    const selectedDate = document.getElementById('scheduleDateSelector').value;
    
    if (!timeline || !selectedDate) return;

    const filtered = allBookingsCache.filter(b => {
        const bDate = new Date(b.date).toISOString().split('T')[0];
        return bDate === selectedDate && b.status !== 'cancelled';
    });

    if (filtered.length === 0) {
        timeline.innerHTML = '<div style="padding: 2rem; color: #ccc;">No appointments scheduled for this date.</div>';
        return;
    }

    // Sort by time
    filtered.sort((a,b) => a.time.localeCompare(b.time));

    timeline.innerHTML = filtered.map(b => `
        <div class="timeline-item" style="display:flex; gap:1rem; padding:1rem; border-left: 3px solid var(--color-gold); background: rgba(0,0,0,0.2); margin-bottom: 0.5rem; border-radius: 0 8px 8px 0;">
            <div style="font-weight:700; min-width:80px; color: var(--color-gold);">${b.time}</div>
            <div style="flex:1;">
                <h4 style="margin:0; font-size:1.1rem;">${b.user?.name || 'Guest'}</h4>
                <p style="margin:2px 0; font-size:0.9rem; color: #aaa;">${b.service} (${b.bookingType})</p>
                <small>${b.user?.phone || ''}</small>
            </div>
            <div class="status-tag ${b.status}">${b.status}</div>
        </div>
    `).join('');
}

async function updateStatus(id, newStatus) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadDashboardStats();
            loadAllBookings(); // This will refresh Cache and Timeline
            showSuccessToast('Status updated!');
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error('Status update error:', error);
    }
}

function setupTabNavigation() {
    const navLinks = document.querySelectorAll('.sidebar-nav a');
    const tabContents = document.querySelectorAll('.tab-content');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href').substring(1);

            navLinks.forEach(l => l.classList.remove('active'));
            tabContents.forEach(t => t.classList.remove('active'));

            link.classList.add('active');
            const targetTab = document.getElementById(target);
            if (targetTab) targetTab.classList.add('active');
        });
    });
}

function showSuccessToast(msg) {
    const t = document.createElement('div');
    t.style.cssText = 'position:fixed; bottom:20px; right:20px; background:var(--color-gold); color:black; padding:10px 20px; border-radius:8px; font-weight:700; z-index:10000; transition: opacity 0.3s;';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2000);
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../auth/auth.html';
}
