/* ============================================
   PROFILE.JS - Profile Specific Logic
   ============================================ */

const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  const userData = localStorage.getItem('user');

  if (!token || !userData) {
    // Not logged in, redirect to login
    window.location.href = '../auth/auth.html';
    return;
  }

  const user = JSON.parse(userData);

  // Redirect barbers and admins to their own dashboards
  if (user.role === 'barber') {
    window.location.href = '../barber/dashboard.html';
    return;
  }
  if (user.role === 'admin') {
    window.location.href = '../admin/dashboard.html';
    return;
  }

  // Update Role-based UI
  const dashboardTitle = document.getElementById('dashboardTitle');
  const roleBadge = document.getElementById('roleBadge');
  const welcomeMsg = document.getElementById('dashboardWelcomeMsg');

  if (user.role === 'barber') {
    if (dashboardTitle) dashboardTitle.textContent = 'Barber Dashboard';
    if (welcomeMsg) welcomeMsg.textContent = 'Manage your clients, schedules, and grooming services.';
    if (roleBadge) roleBadge.textContent = 'PRO BARBER';
  } else {
    if (dashboardTitle) dashboardTitle.textContent = 'Customer Dashboard';
    if (welcomeMsg) welcomeMsg.textContent = 'View your upcoming appointments and booking history.';
    if (roleBadge) roleBadge.textContent = 'VALUED CLIENT';
  }

  // Populate profile data
  document.getElementById('profileName').textContent = user.name || 'User Member';
  document.getElementById('profileRole').textContent = capitalizeRole(user.role);
  document.getElementById('profileRoleIcon').textContent = '';

  // Avatar initial
  const initials = user.name ? user.name.charAt(0).toUpperCase() : '';
  document.getElementById('avatarInitial').textContent = initials;

  // Personal info
  document.getElementById('infoName').textContent = user.name || '-';
  document.getElementById('infoEmail').textContent = user.email || '-';
  document.getElementById('infoPhone').textContent = user.phone || '-';
  document.getElementById('infoRole').textContent = capitalizeRole(user.role);

  // Member since
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  document.getElementById('memberSince').textContent = `${months[now.getMonth()]} ${now.getFullYear()}`;

  // Show welcome toast on first visit
  const hasVisited = localStorage.getItem('profileVisited');
  if (!hasVisited) {
    const toast = document.getElementById('welcomeToast');
    if (toast) {
      toast.style.display = 'flex';
      localStorage.setItem('profileVisited', 'true');

      // Auto-hide toast
      setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => {
          toast.style.display = 'none';
        }, 400);
      }, 4000);
    }
  }

  // Initial bookings fetch
  fetchBookings();
});

function capitalizeRole(role) {
  if (!role) return '-';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

// Fetch and display bookings
async function fetchBookings() {
  const token = localStorage.getItem('token');
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/mybookings`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const bookings = await response.json();
    const listContainer = document.getElementById('bookingsList');
    
    if (!response.ok) {
      listContainer.innerHTML = `<p style="text-align: center; color: var(--color-error);">Failed to load bookings</p>`;
      return;
    }

    if (bookings.length === 0) {
      listContainer.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="color: var(--color-text-muted); margin-bottom: 1rem;">You don't have any bookings yet.</p>
          <a href="../index.html#services" class="btn btn-primary">Book Your First Appointment</a>
        </div>
      `;
      return;
    }

    // Update stats
    document.getElementById('statBookings').textContent = bookings.length;
    const completedCount = bookings.filter(b => b.status === 'completed').length;
    document.getElementById('statCompleted').textContent = completedCount;
    if (bookings.length > 5) document.getElementById('statStatus').textContent = '';

    // Render list
    listContainer.innerHTML = bookings.map(booking => `
      <div class="info-row" style="flex-wrap: wrap; gap: 1rem; align-items: center;">
        <div style="display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 200px;">
          <div style="width: 48px; height: 48px; background: var(--color-surface); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
            ${getServiceIcon(booking.service)}
          </div>
          <div>
            <h4 style="font-size: 0.95rem; font-weight: 600;">${booking.service}</h4>
            <p style="font-size: 0.82rem; color: var(--color-text-muted);">${formatDate(booking.date)} at ${booking.time}</p>
          </div>
        </div>
        
        <div style="display: flex; align-items: center; gap: 2rem;">
          <div class="status-badge ${booking.status}" style="padding: 0.2rem 0.7rem; border-radius: var(--radius-xl); font-size: 0.75rem; font-weight: 600; text-transform: uppercase; background: ${getStatusBg(booking.status)}; color: ${getStatusColor(booking.status)}; border: 1px solid ${getStatusBorder(booking.status)};">
            ${booking.status}
          </div>
          <span style="font-weight: 700; color: var(--color-gold); min-width: 60px; text-align: right;">Rs ${booking.totalPrice?.toLocaleString()}</span>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Error fetching bookings:', error);
  }
}

function getServiceIcon(service) {
  return '';
}

function formatDate(dateString) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
}

function getStatusBg(status) {
  if (status === 'confirmed') return 'rgba(46, 204, 113, 0.1)';
  if (status === 'pending') return 'rgba(243, 156, 18, 0.1)';
  if (status === 'cancelled') return 'rgba(231, 76, 60, 0.1)';
  return 'rgba(255, 255, 255, 0.05)';
}

function getStatusColor(status) {
  if (status === 'confirmed') return 'var(--color-success)';
  if (status === 'pending') return 'var(--color-warning)';
  if (status === 'cancelled') return 'var(--color-error)';
  return 'var(--color-text-muted)';
}

function getStatusBorder(status) {
  if (status === 'confirmed') return 'rgba(46, 204, 113, 0.3)';
  if (status === 'pending') return 'rgba(243, 156, 18, 0.3)';
  if (status === 'cancelled') return 'rgba(231, 76, 60, 0.3)';
  return 'rgba(255, 255, 255, 0.1)';
}
