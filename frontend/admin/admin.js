/* ============================================
   ADMIN.JS - Admin Dashboard Logic
   ============================================ */
const API = 'http://localhost:5000/api';
let token, allBarbers = [], allBookings = [];

document.addEventListener('DOMContentLoaded', () => {
  token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || user.role !== 'admin') {
    alert('Access denied. Admins only.');
    window.location.href = '../auth/auth.html';
    return;
  }

  document.getElementById('adminName').textContent = user.name || 'Admin';
  loadStats();
  loadBookings();
  loadBarbers();
  loadHairstyles();
  loadUsers();
});

// ---- Navigation ----
function showSection(name, el) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById(`section-${name}`).classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('pageTitle').textContent = el?.textContent.trim() || name;
}

function toggleSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const main = document.querySelector('.admin-main');
  sidebar.classList.toggle('open');
  sidebar.classList.toggle('collapsed');
  main.classList.toggle('expanded');
}

// ---- Load Stats ----
async function loadStats() {
  const data = await apiFetch('/admin/stats');
  if (!data) return;
  document.getElementById('st-customers').textContent = data.totalUsers;
  document.getElementById('st-barbers').textContent = data.totalBarbers;
  document.getElementById('st-bookings').textContent = data.totalBookings;
  document.getElementById('st-revenue').textContent = `Rs ${data.revenue.toLocaleString()}`;
  document.getElementById('st-pending').textContent = data.pendingBookings;
  document.getElementById('st-completed').textContent = data.completedBookings;
  document.getElementById('st-pending-barbers').textContent = data.pendingBarbers;

  if (data.pendingBarbers > 0) {
    document.getElementById('pendingAlert').style.display = 'flex';
    document.getElementById('pendingAlertText').textContent = `${data.pendingBarbers} barber(s) awaiting verification`;
  }
}

// ---- Bookings ----
async function loadBookings() {
  allBookings = await apiFetch('/admin/bookings') || [];
  renderBookings(allBookings);
}

function renderBookings(bookings) {
  const tbody = document.getElementById('bookingsTbody');
  if (!bookings.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#666;padding:2rem;">No bookings found</td></tr>';
    return;
  }
  tbody.innerHTML = bookings.map(b => `
    <tr>
      <td>${b.user?.name || 'N/A'}<br><small style="color:#666">${b.user?.phone || ''}</small></td>
      <td>${b.service}</td>
      <td>${b.date ? new Date(b.date).toLocaleDateString('en-IN') : '-'}</td>
      <td>${b.time}</td>
      <td><span class="status-badge ${b.bookingType === 'home-call' ? 'confirmed' : 'pending'}">${b.bookingType || 'in-shop'}</span></td>
      <td><span class="status-badge ${b.status}">${b.status}</span></td>
      <td>Rs ${b.totalPrice?.toLocaleString()}</td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-edit" onclick="editBooking('${b._id}')">Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteBooking('${b._id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddBookingModal() {
  document.getElementById('bookingModalTitle').textContent = 'Add Booking';
  document.getElementById('bookingId').value = '';
  document.getElementById('bookingForm').reset();
  populateBarberDropdown('bBarberId');
  openModal('bookingModal');
}

async function editBooking(id) {
  const b = allBookings.find(x => x._id === id);
  if (!b) return;
  document.getElementById('bookingModalTitle').textContent = 'Edit Booking';
  document.getElementById('bookingId').value = b._id;
  document.getElementById('bUserId').value = b.user?._id || b.user;
  document.getElementById('bBarberId').value = b.barber?._id || b.barber || '';
  document.getElementById('bService').value = b.service;
  document.getElementById('bPrice').value = b.totalPrice;
  document.getElementById('bDate').value = b.date ? new Date(b.date).toISOString().split('T')[0] : '';
  document.getElementById('bTime').value = b.time;
  document.getElementById('bType').value = b.bookingType || 'in-shop';
  document.getElementById('bStatus').value = b.status;
  document.getElementById('bAddress').value = b.address || '';
  await populateBarberDropdown('bBarberId', b.barber?._id || b.barber);
  openModal('bookingModal');
}

async function submitBooking(e) {
  e.preventDefault();
  const id = document.getElementById('bookingId').value;
  const payload = {
    user: document.getElementById('bUserId').value,
    barber: document.getElementById('bBarberId').value || undefined,
    service: document.getElementById('bService').value,
    totalPrice: Number(document.getElementById('bPrice').value),
    date: document.getElementById('bDate').value,
    time: document.getElementById('bTime').value,
    bookingType: document.getElementById('bType').value,
    status: document.getElementById('bStatus').value,
    address: document.getElementById('bAddress').value || undefined,
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `/admin/bookings/${id}` : '/admin/bookings';
  const result = await apiFetch(url, method, payload);
  if (result) {
    closeModal('bookingModal');
    loadBookings();
    loadStats();
  }
}

async function deleteBooking(id) {
  if (!confirm('Delete this booking?')) return;
  await apiFetch(`/admin/bookings/${id}`, 'DELETE');
  loadBookings();
  loadStats();
}

// ---- Barbers ----
async function loadBarbers() {
  allBarbers = await apiFetch('/admin/barbers') || [];
  renderBarbers(allBarbers);
}

function renderBarbers(barbers) {
  const grid = document.getElementById('barbersGrid');
  if (!barbers.length) {
    grid.innerHTML = '<p style="color:#666;padding:2rem;">No barbers found.</p>';
    return;
  }
  grid.innerHTML = barbers.map(b => `
    <div class="barber-card ${b.isVerified ? '' : 'pending'}">
      <div class="barber-avatar"></div>
      <div class="barber-name">${b.name}</div>
      <div class="barber-email">Email: ${b.email}</div>
      <div class="barber-email">Phone: ${b.phone}</div>
      <div class="barber-spec">Spec: ${b.specialization || 'General'}</div>
      <div style="margin-bottom:1rem;">
        <span class="status-badge ${b.isVerified ? 'verified' : 'unverified'}">${b.isVerified ? 'Verified' : 'Pending'}</span>
      </div>
      <div class="barber-actions">
        ${!b.isVerified 
          ? `<button class="btn-sm btn-verify" onclick="verifyBarber('${b._id}', this)">Verify</button>` 
          : `<button class="btn-sm btn-reject" onclick="rejectBarber('${b._id}', this)">Unverify</button>`
        }
        <button class="btn-sm btn-delete" onclick="deleteUser('${b._id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

function filterBarbers(type, el) {
  document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  if (type === 'all') renderBarbers(allBarbers);
  else if (type === 'pending') renderBarbers(allBarbers.filter(b => !b.isVerified));
  else if (type === 'verified') renderBarbers(allBarbers.filter(b => b.isVerified));
}

async function verifyBarber(id, btn) {
  const orig = btn.textContent;
  btn.textContent = 'Verifying...';
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/admin/barbers/${id}/verify`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Barber verified successfully!');
      loadBarbers();
      loadStats();
    } else {
      showToast(`Failed: ${data.message}`, true);
      btn.textContent = orig;
      btn.disabled = false;
    }
  } catch(e) {
    showToast('Network error. Try again.', true);
    btn.textContent = orig;
    btn.disabled = false;
  }
}

async function rejectBarber(id, btn) {
  if (!confirm('Un-verify this barber? They will not be able to log in.')) return;
  btn.textContent = '...';
  btn.disabled = true;
  try {
    const res = await fetch(`${API}/admin/barbers/${id}/reject`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      showToast('Barber unverified.');
      loadBarbers();
      loadStats();
    } else {
      showToast(`Failed: ${data.message}`, true);
      btn.textContent = 'Unverify';
      btn.disabled = false;
    }
  } catch(e) {
    showToast('Network error.', true);
    btn.disabled = false;
  }
}

function showToast(msg, isError = false) {
  let t = document.getElementById('adminToast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'adminToast';
    t.style.cssText = 'position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;border-radius:12px;font-weight:600;z-index:9999;transition:all 0.3s ease;';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = isError ? 'rgba(231,76,60,0.9)' : 'rgba(46,204,113,0.9)';
  t.style.color = '#fff';
  t.style.display = 'block';
  t.style.opacity = '1';
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.style.display='none', 300); }, 3000);
}

// ---- Hairstyles ----
async function loadHairstyles() {
  const styles = await apiFetch('/hairstyles') || [];
  const tbody = document.getElementById('hairstylesTbody');
  tbody.innerHTML = styles.map(s => `
    <tr>
      <td><img src="${s.image}" class="th-img" alt="${s.name}" onerror="this.style.display='none'"></td>
      <td>${s.name}</td>
      <td>${s.category}</td>
      <td>Rs ${s.price?.toLocaleString()}</td>
      <td>
        <div class="action-btns">
          <button class="btn-sm btn-edit" onclick="editHairstyle('${s._id}','${encodeURIComponent(s.name)}','${encodeURIComponent(s.description)}','${encodeURIComponent(s.image)}',${s.price},'${s.category}')">Edit</button>
          <button class="btn-sm btn-delete" onclick="deleteHairstyle('${s._id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openAddHairstyleModal() {
  document.getElementById('hairstyleModalTitle').textContent = 'Add Hairstyle';
  document.getElementById('hairstyleId').value = '';
  document.getElementById('hairstyleForm').reset();
  openModal('hairstyleModal');
}

function editHairstyle(id, name, desc, image, price, cat) {
  document.getElementById('hairstyleModalTitle').textContent = 'Edit Hairstyle';
  document.getElementById('hairstyleId').value = id;
  document.getElementById('hsName').value = decodeURIComponent(name);
  document.getElementById('hsDesc').value = decodeURIComponent(desc);
  document.getElementById('hsImage').value = decodeURIComponent(image);
  document.getElementById('hsPrice').value = price;
  document.getElementById('hsCategory').value = cat;
  openModal('hairstyleModal');
}

async function submitHairstyle(e) {
  e.preventDefault();
  const id = document.getElementById('hairstyleId').value;
  const payload = {
    name: document.getElementById('hsName').value,
    description: document.getElementById('hsDesc').value,
    image: document.getElementById('hsImage').value,
    price: Number(document.getElementById('hsPrice').value),
    category: document.getElementById('hsCategory').value,
  };
  const method = id ? 'PUT' : 'POST';
  const url = id ? `/admin/hairstyles/${id}` : '/hairstyles';
  await apiFetch(url, method, payload);
  closeModal('hairstyleModal');
  loadHairstyles();
}

async function deleteHairstyle(id) {
  if (!confirm('Delete this hairstyle?')) return;
  await apiFetch(`/admin/hairstyles/${id}`, 'DELETE');
  loadHairstyles();
}

// ---- Users ----
async function loadUsers() {
  const users = await apiFetch('/admin/users') || [];
  const customers = users.filter(u => u.role === 'customer');
  const tbody = document.getElementById('usersTbody');
  tbody.innerHTML = customers.map(u => `
    <tr>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td>${u.phone}</td>
      <td><span class="status-badge confirmed">${u.role}</span></td>
      <td>${new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
      <td>
        <button class="btn-sm btn-delete" onclick="deleteUser('${u._id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function deleteUser(id) {
  if (!confirm('Delete this user? This cannot be undone.')) return;
  await apiFetch(`/admin/users/${id}`, 'DELETE');
  loadUsers();
  loadBarbers();
  loadStats();
}

// ---- Helpers ----
async function populateBarberDropdown(selectId, selectedId) {
  const barbers = await apiFetch('/admin/barbers') || [];
  const sel = document.getElementById(selectId);
  sel.innerHTML = '<option value="">-- Select Barber --</option>' +
    barbers.filter(b => b.isVerified).map(b => `<option value="${b._id}" ${b._id === selectedId ? 'selected' : ''}>${b.name}</option>`).join('');
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

async function apiFetch(path, method = 'GET', body = null) {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API}${path}`, opts);
    if (res.status === 403 || res.status === 401) {
      alert('Session expired. Please log in again.');
      window.location.href = '../auth/auth.html';
      return null;
    }
    return await res.json();
  } catch (err) {
    console.error('API error:', err);
    return null;
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../auth/auth.html';
}

window.showSection = showSection;
window.toggleSidebar = toggleSidebar;
window.openAddBookingModal = openAddBookingModal;
window.editBooking = editBooking;
window.deleteBooking = deleteBooking;
window.submitBooking = submitBooking;
window.verifyBarber = verifyBarber;
window.rejectBarber = rejectBarber;
window.filterBarbers = filterBarbers;
window.openAddHairstyleModal = openAddHairstyleModal;
window.editHairstyle = editHairstyle;
window.submitHairstyle = submitHairstyle;
window.deleteHairstyle = deleteHairstyle;
window.deleteUser = deleteUser;
window.closeModal = closeModal;
window.handleLogout = handleLogout;
