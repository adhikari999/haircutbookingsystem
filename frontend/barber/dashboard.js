/* ============================================
   DASHBOARD.JS - Barber Dashboard Logic
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    checkBarberAuth();
    loadDashboardStats();
    loadAllBookings();
    setupTabNavigation();
});

const API_BASE_URL = 'http://localhost:5000/api/bookings';

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
        const response = await fetch(`${API_BASE_URL}/stats`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const stats = await response.json();
        
        if (response.ok) {
            document.getElementById('totalBookings').textContent = stats.totalBookings;
            document.getElementById('pendingBookings').textContent = stats.pendingBookings;
            document.getElementById('completedBookings').textContent = stats.completedBookings;
            document.getElementById('totalRevenue').textContent = `$${stats.revenue.toFixed(2)}`;
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
        const response = await fetch(`${API_BASE_URL}/all`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookings = await response.json();

        if (response.ok) {
            listBody.innerHTML = bookings.length ? "" : '<tr><td colspan="6" style="text-align: center;">No bookings found.</td></tr>';
            
            bookings.forEach(booking => {
                const date = new Date(booking.date).toLocaleDateString();
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
                                ${booking.status === 'pending' ? `<button onclick="updateStatus('${booking._id}', 'completed')" class="btn btn-sm btn-primary">Complete</button>` : ''}
                                ${booking.status !== 'cancelled' ? `<button onclick="updateStatus('${booking._id}', 'cancelled')" class="btn btn-sm btn-ghost">Cancel</button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
                listBody.innerHTML += row;
            });
        }
    } catch (error) {
        listBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to load data.</td></tr>';
        console.error('Bookings load error:', error);
    }
}

async function updateStatus(id, newStatus) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${API_BASE_URL}/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (response.ok) {
            loadAllBookings();
            loadDashboardStats();
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
            document.getElementById(target).classList.add('active');
        });
    });
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../auth/auth.html';
}
