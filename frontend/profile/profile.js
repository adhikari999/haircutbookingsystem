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
  
  const roleEl = document.getElementById('profileRole');
  if (roleEl) {
      roleEl.textContent = user.role === 'barber' ? 'PRO BARBER' : 'VALUED CLIENT';
  }

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
      <div class="ritual-card">
        <div class="ritual-header">
          <h3>${booking.service}</h3>
          <span class="ritual-badge">${booking.status === 'rejected' ? 'CANCELLED' : booking.status.toUpperCase()}</span>
        </div>
        <div class="ritual-time">
          ${formatDate(booking.date)} &bull; ${booking.time}
        </div>
        <div class="ritual-bottom">
          <div class="ritual-price">
            <i class="bi bi-wallet2"></i> 
            <span>Rs ${booking.totalPrice?.toLocaleString() || '---'}</span>
          </div>
          <a href="#" class="ritual-details">DETAILS <i class="bi bi-chevron-right"></i></a>
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
  if (status === 'cancelled' || status === 'rejected') return 'rgba(231, 76, 60, 0.1)';
  return 'rgba(255, 255, 255, 0.05)';
}

function getStatusColor(status) {
  if (status === 'confirmed') return 'var(--color-success)';
  if (status === 'pending') return 'var(--color-warning)';
  if (status === 'cancelled' || status === 'rejected') return 'var(--color-error)';
  return 'var(--color-text-muted)';
}

function getStatusBorder(status) {
  if (status === 'confirmed') return 'rgba(46, 204, 113, 0.3)';
  if (status === 'pending') return 'rgba(243, 156, 18, 0.3)';
  if (status === 'cancelled' || status === 'rejected') return 'rgba(231, 76, 60, 0.3)';
  return 'rgba(255, 255, 255, 0.1)';
}
