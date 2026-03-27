/* ============================================
   HAIRSTYLES.JS - Styles & Home Booking logic
   ============================================ */

const API_STYLES_URL = 'http://localhost:5000/api/hairstyles';
const API_BARBERS_URL = 'http://localhost:5000/api/schedules/barbers';
const API_BOOKING_URL = 'http://localhost:5000/api/bookings';

document.addEventListener('DOMContentLoaded', () => {
    fetchStyles();
    setupFilters();
    setupBookingForm();
});

// ---- Fetch & Render Styles ----
async function fetchStyles() {
    const grid = document.getElementById('stylesGrid');
    try {
        const res = await fetch(API_STYLES_URL);
        const styles = await res.json();
        
        if (styles.length === 0) {
            grid.innerHTML = '<div class="loading-spinner">No styles found. Add some from the admin panel!</div>';
            return;
        }

        renderStyles(styles);
    } catch (err) {
        grid.innerHTML = '<div class="loading-spinner">Error loading styles. Please ensure backend is running.</div>';
    }
}

function renderStyles(styles) {
    const grid = document.getElementById('stylesGrid');
    grid.innerHTML = '';
    
    styles.forEach(style => {
        const card = document.createElement('div');
        card.className = 'style-card scroll-animate';
        card.setAttribute('data-category', style.category);
        
        card.innerHTML = `
            <div class="style-card-image">
                <img src="${style.image}" alt="${style.name}" onerror="this.src='https://images.unsplash.com/photo-1621605815841-28d9446e364f?q=80&w=1170&auto=format&fit=crop'">
                <div class="style-overlay">
                    <span class="style-category">${style.category}</span>
                    <h3 class="style-name">${style.name}</h3>
                </div>
            </div>
            <div class="style-card-content">
                <p class="style-desc">${style.description}</p>
                <div class="style-footer">
                    <span class="style-price">Rs ${style.price.toLocaleString()}</span>
                    <button class="btn btn-outline" onclick="openStyleBooking('${style.name}', ${style.price})">Book Style</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });

    grid.classList.add('active');
    triggerScrollAnimate();
}

// ---- Filters ----
function setupFilters() {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            btns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const category = btn.getAttribute('data-category');
            const cards = document.querySelectorAll('.style-card');
            
            cards.forEach(card => {
                const cardCat = card.getAttribute('data-category');
                if (category === 'all' || category === cardCat) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// ---- Booking Logic ----
let selectedStyle = null;
let selectedPrice = 0;

async function openStyleBooking(name, price) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'auth/auth.html?message=please_login_to_book';
        return;
    }

    selectedStyle = name;
    selectedPrice = price;
    
    document.getElementById('modalStyleName').textContent = name;
    document.getElementById('modalPrice').textContent = `Rs ${price.toLocaleString()}`;
    
    // Fetch Barbers
    await fetchBarbers();
    
    // Show Modal
    document.getElementById('bookingModal').style.display = 'flex';
}

async function fetchBarbers() {
    const barberSelect = document.getElementById('bookingBarber');
    try {
        const res = await fetch(API_BARBERS_URL);
        const barbers = await res.json();
        
        barberSelect.innerHTML = '<option value="" disabled selected>Select a Barber</option>';
        barbers.forEach(b => {
            barberSelect.innerHTML += `<option value="${b._id}">${b.name}</option>`;
        });
    } catch (err) {
        console.error('Failed to fetch barbers');
    }
}

function setupBookingForm() {
    const bookingForm = document.getElementById('bookingForm');
    const bookingTypeRadios = document.getElementsByName('bookingType');
    const addressGroup = document.getElementById('homeAddressGroup');
    const barberSelect = document.getElementById('bookingBarber');
    const dateInput = document.getElementById('bookingDate');
    const timeSelect = document.getElementById('bookingTime');

    // Toggle Address field
    bookingTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'home-call') {
                addressGroup.style.display = 'block';
                document.getElementById('bookingAddress').required = true;
            } else {
                addressGroup.style.display = 'none';
                document.getElementById('bookingAddress').required = false;
            }
        });
    });

    // Populate Time Slots (Mock for now, should hit /api/schedules in real app)
    const updateTimeSlots = () => {
        if (barberSelect.value && dateInput.value) {
            timeSelect.innerHTML = `
                <option value="09:00 AM">09:00 AM</option>
                <option value="10:00 AM">10:00 AM</option>
                <option value="11:00 AM">11:00 AM</option>
                <option value="02:00 PM">02:00 PM</option>
                <option value="04:00 PM">04:00 PM</option>
            `;
        }
    };
    barberSelect.addEventListener('change', updateTimeSlots);
    dateInput.addEventListener('change', updateTimeSlots);

    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const submitBtn = document.getElementById('confirmBookingBtn');
        
        const bookingData = {
            service: selectedStyle,
            barber: barberSelect.value,
            date: dateInput.value,
            time: timeSelect.value,
            bookingType: document.querySelector('input[name="bookingType"]:checked').value,
            address: document.getElementById('bookingAddress').value,
            totalPrice: selectedPrice
        };

        setLoading(submitBtn, true);
        try {
            const res = await fetch(API_BOOKING_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(bookingData)
            });

            if (res.ok) {
                alert('Booking Confirmed! Expect a call soon.');
                closeBookingModal();
                window.location.href = 'profile/profile.html';
            } else {
                const data = await res.json();
                alert(data.message || 'Booking failed');
            }
        } catch (err) {
            alert('Server error. Please try again.');
        } finally {
            setLoading(submitBtn, false);
        }
    });
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

function triggerScrollAnimate() {
    const scrollElements = document.querySelectorAll('.scroll-animate');
    scrollElements.forEach(el => el.classList.add('visible'));
}

function setLoading(btn, isLoading) {
    btn.disabled = isLoading;
    btn.textContent = isLoading ? 'Processing...' : 'Confirm Booking';
}

window.closeBookingModal = closeBookingModal;
window.openStyleBooking = openStyleBooking;
