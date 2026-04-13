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
        // Default to showing all bookings instead of forcing 'Today'
        dateInput.value = ""; 
        dateInput.addEventListener('change', loadDailySchedule);
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

    document.getElementById('barberName').innerHTML = `<i class="bi bi-person-circle me-2"></i>${user.name}`;
    document.getElementById('sidebarName').textContent = user.name;
    const initialEl = document.getElementById('barberInitial');
    if (initialEl) initialEl.textContent = user.name.charAt(0).toUpperCase();
}

async function loadDashboardStats() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await response.json();
        
        if (response.ok) {
            const elTotal = document.getElementById('totalBookings');
            const elPending = document.getElementById('pendingBookings');
            const elCompleted = document.getElementById('completedBookings');
            const elRevenue = document.getElementById('totalRevenue');
            const elRevenueHeader = document.getElementById('totalRevenueHeader');

            if (elTotal) elTotal.textContent = stats.totalBookings;
            if (elPending) elPending.textContent = stats.pendingBookings;
            if (elCompleted) elCompleted.textContent = stats.completedBookings;
            if (elRevenue) elRevenue.textContent = `Rs ${stats.revenue.toLocaleString()}`;
            if (elRevenueHeader) elRevenueHeader.textContent = `Rs ${stats.revenue.toLocaleString()}`;
        }
    } catch (error) {
        console.error('Stats loading error:', error);
    }
}

async function loadAllBookings() {
    const token = localStorage.getItem('token');
    const listBody = document.getElementById('bookingsList');
    if (listBody) listBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading...</td></tr>';

    try {
        const response = await fetch(`${API_BASE_URL}/bookings/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookings = await response.json();

        if (response.ok) {
            allBookingsCache = bookings;
            renderRecentBookings(allBookingsCache);
            loadDailySchedule();
            renderHistory(allBookingsCache);
        }
    } catch (error) {
        if (listBody) listBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Error.</td></tr>';
        console.error('Bookings load error:', error);
    }
}

function renderRecentBookings(bookings) {
    const listBody = document.getElementById('bookingsList');
    if (!listBody) return;
    listBody.innerHTML = bookings.length ? "" : '<tr><td colspan="5" style="text-align: center;">No bookings found.</td></tr>';
    
    // Show only first 10 for overview
    bookings.slice(0, 10).forEach(booking => {
        const date = new Date(booking.date).toLocaleDateString('en-IN');
        const userName = booking.user ? booking.user.name : "Guest";
        
        const row = `
            <tr>
                <td style="font-weight: 600;">${userName}</td>
                <td>${booking.service}</td>
                <td style="color: var(--color-text-muted);">${date}</td>
                <td style="color: var(--color-gold); font-weight: 700;">${booking.time}</td>
                <td><span class="status-tag ${booking.status === 'rejected' ? 'cancelled' : booking.status}">${booking.status === 'rejected' ? 'cancelled' : booking.status}</span></td>
            </tr>
        `;
        listBody.innerHTML += row;
    });
}

function loadDailySchedule() {
    const list = document.getElementById('fullScheduleList');
    const selectedDate = document.getElementById('scheduleDateSelector').value;
    
    if (!list) return;

    // Filter by date ONLY if a date is selected, otherwise show all active/pending
    const filtered = selectedDate 
        ? allBookingsCache.filter(b => new Date(b.date).toISOString().split('T')[0] === selectedDate)
        : allBookingsCache.filter(b => !['completed', 'cancelled'].includes(b.status));

    if (filtered.length === 0) {
        list.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 2rem; color: #ccc;">No active appointments found ${selectedDate ? 'for this date' : ''}.</td></tr>`;
        return;
    }

    // Sort by Date then Time
    filtered.sort((a,b) => {
        const d1 = new Date(a.date), d2 = new Date(b.date);
        if (d1 - d2 !== 0) return d2 - d1; 
        return a.time.localeCompare(b.time);
    });

    list.innerHTML = filtered.map(b => `
        <tr>
            <td style="color:#aaa; font-size:0.85rem;">${new Date(b.date).toLocaleDateString('en-IN')}</td>
            <td style="font-weight:700; color: var(--color-gold);">${b.time}</td>
            <td>
                <div style="font-weight:600;">${b.user?.name || 'Guest'}</div>
                <small style="color:#888;">${b.user?.phone || ''}</small>
            </td>
            <td>${b.service}</td>
            <td>
                <div style="text-transform: capitalize; font-weight: 600;">${b.bookingType}</div>
                ${b.address ? `<div style="font-size: 0.8rem; color: var(--color-gold); margin-top: 4px;"><i class="bi bi-geo-alt-fill me-1"></i>${b.address}</div>` : ''}
            </td>
            <td><span class="status-tag ${b.status === 'rejected' ? 'cancelled' : b.status}">${b.status === 'rejected' ? 'cancelled' : b.status}</span></td>
            <td>
                <div class="action-btns">
                    ${b.status === 'pending' ? `<button onclick="updateStatus('${b._id}', 'confirmed')" class="btn btn-sm btn-primary" style="background: var(--color-success); border:none;" title="Confirm">Confirm</button>` : ''}
                    ${['pending', 'confirmed'].includes(b.status) ? `<button onclick="updateStatus('${b._id}', 'cancelled')" class="btn btn-sm btn-ghost" title="Cancel">Cancel</button>` : ''}
                    ${b.status === 'confirmed' ? `<button onclick="updateStatus('${b._id}', 'completed')" class="btn btn-sm btn-primary" title="Complete">Complete</button>` : ''}
                    <button onclick="confirmDelete('${b._id}')" class="btn btn-sm btn-delete" style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.4);" title="Delete Record">
                        <i class="bi bi-trash-fill me-1"></i> Delete
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderHistory(bookings) {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    // History includes everything, but usually sorted by most recent date
    const history = bookings.slice().sort((a, b) => new Date(b.date) - new Date(a.date));

    if (history.length === 0) {
        historyList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">No history records found.</td></tr>';
        return;
    }

    historyList.innerHTML = history.map(b => `
        <tr>
            <td style="color:#aaa;">${new Date(b.date).toLocaleDateString('en-IN')}</td>
            <td style="font-weight:600;">${b.user?.name || 'Guest'}</td>
            <td>${b.service}</td>
            <td>${b.time}</td>
            <td>
                <div style="text-transform: capitalize; font-weight: 600;">${b.bookingType}</div>
                ${b.address ? `<div style="font-size: 0.8rem; color: var(--color-gold); margin-top: 4px;"><i class="bi bi-geo-alt-fill me-1"></i>${b.address}</div>` : ''}
            </td>
            <td><span class="status-tag ${b.status === 'rejected' ? 'cancelled' : b.status}">${b.status === 'rejected' ? 'cancelled' : b.status}</span></td>
        </tr>
    `).join('');
}

async function updateStatus(id, newStatus) {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
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
            loadAllBookings();
            showSuccessToast(`Booking ${newStatus}!`);
        } else {
            alert('Failed to update status');
        }
    } catch (error) {
        console.error('Status update error:', error);
    }
}

async function confirmDelete(id) {
    if (!confirm('PERMANENTLY DELETE this booking from record? This cannot be undone.')) return;
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            loadDashboardStats();
            loadAllBookings();
            showSuccessToast('Booking deleted successfully');
        } else {
            const data = await response.json();
            alert(data.message || 'Deletion failed');
        }
    } catch (error) {
        console.error('Delete error:', error);
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
