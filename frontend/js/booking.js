/* ============================================
   BOOKING.JS - Booking Functionality
   ============================================ */

const API_BOOKING_URL = 'http://localhost:5000/api/bookings';

// Check if logged in before allowing booking
// Allow anyone to see the modal; check for login only on final confirmation
function initiateBooking(serviceName, price) {
  // Set modal data (supporting multiple IDs for shared logic)
  const serviceLabel = document.getElementById('bookingModalService') || document.getElementById('modalStyleName');
  const priceLabel = document.getElementById('bookingModalPrice') || document.getElementById('modalPrice');
  
  if (serviceLabel) serviceLabel.textContent = serviceName;
  if (priceLabel) priceLabel.textContent = price;
  
  // Reset form
  const dateInput = document.getElementById('bookingDate');
  const timeInput = document.getElementById('bookingTime');
  if (dateInput) dateInput.value = "";
  if (timeInput) timeInput.value = "";
  
  // Show modal
  const modal = document.getElementById('bookingModal');
  if (modal) {
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
}

function closeBookingModal() {
  const modal = document.getElementById('bookingModal');
  modal.style.display = 'none';
  document.body.style.overflow = '';
}

// Handle booking form submission
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  // Toggle Address field based on booking type
  const bookingTypeRadios = document.getElementsByName('bookingType');
  const addressGroup = document.getElementById('homeAddressGroup');
  
  bookingTypeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'home-call') {
        if (addressGroup) addressGroup.style.display = 'block';
        const addressInput = document.getElementById('bookingAddress');
        if (addressInput) addressInput.required = true;
      } else {
        if (addressGroup) addressGroup.style.display = 'none';
        const addressInput = document.getElementById('bookingAddress');
        if (addressInput) addressInput.required = false;
      }
    });
  });

  bookingForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in to complete your booking.');
      window.location.href = 'auth/auth.html?message=please_login_to_book';
      return;
    }

    const service = (document.getElementById('bookingModalService') || document.getElementById('modalStyleName'))?.textContent;
    const priceLabel = document.getElementById('bookingModalPrice') || document.getElementById('modalPrice');
    const priceRaw = priceLabel?.textContent || "0";
    const totalPrice = parseFloat(priceRaw.replace(/[^0-9.]/g, ''));
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const bookingType = document.querySelector('input[name="bookingType"]:checked').value;
    const address = document.getElementById('bookingAddress')?.value || '';
    const submitBtn = document.getElementById('confirmBookingBtn');

    if (bookingType === 'home-call' && !address) {
      alert('Please provide your home address for home call service.');
      return;
    }

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
        body: JSON.stringify({ service, date, time, totalPrice, bookingType, address })
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
