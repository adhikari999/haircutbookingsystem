/* ============================================
   BOOKING.JS - Booking Functionality
   ============================================ */

const API_BOOKING_URL = 'http://localhost:5000/api/bookings';

// Check if logged in before allowing booking
function initiateBooking(serviceName, price) {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'auth/auth.html?message=please_login_to_book';
    return;
  }

  // Set modal data
  document.getElementById('bookingModalService').textContent = serviceName;
  document.getElementById('bookingModalPrice').textContent = price;
  
  // Reset form
  document.getElementById('bookingDate').value = "";
  document.getElementById('bookingTime').value = "";
  
  // Show modal
  const modal = document.getElementById('bookingModal');
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Handle booking form submission
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const service = document.getElementById('bookingModalService').textContent;
    const priceRaw = document.getElementById('bookingModalPrice').textContent;
    const totalPrice = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const submitBtn = document.getElementById('confirmBookingBtn');

    if (!date || !time) {
      alert('Please select both date and time');
      return;
    }

    setLoading(submitBtn, true);

    try {
      const response = await fetch(API_BOOKING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ service, date, time, totalPrice })
      });

      const data = await response.json();

      if (response.ok) {
        // Successful booking
        closeBookingModal();
        alert('Booking Confirmed! Check your profile for details.');
        window.location.href = 'profile/profile.html';
      } else {
        alert(data.message || 'Booking failed. Try again.');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Unable to connect to server.');
    } finally {
      setLoading(submitBtn, false);
    }
  });
}

// Close modal on overlay click
document.getElementById('bookingModal')?.addEventListener('click', function(e) {
  if (e.target === this) {
    closeBookingModal();
  }
});

function setLoading(button, loading) {
  if (loading) {
    button.classList.add('loading');
    button.disabled = true;
  } else {
    button.classList.remove('loading');
    button.disabled = false;
  }
}
