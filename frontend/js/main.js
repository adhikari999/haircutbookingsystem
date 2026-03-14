/* ============================================
   MAIN.JS - Global JavaScript
   ============================================ */

// ---- Navbar Scroll Effect ----
const navbar = document.getElementById('navbar');

function handleNavbarScroll() {
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    // Only remove if not on auth pages (they always have scrolled)
    if (!navbar.classList.contains('always-scrolled')) {
      navbar.classList.remove('scrolled');
    }
  }
}

window.addEventListener('scroll', handleNavbarScroll);

// ---- Hamburger Menu ----
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navActions = document.getElementById('navActions');
const navOverlay = document.getElementById('navOverlay');

if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
    navActions.classList.toggle('open');
    navOverlay.classList.toggle('open');
    document.body.style.overflow = hamburger.classList.contains('active') ? 'hidden' : '';
  });
}

if (navOverlay) {
  navOverlay.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
    navActions.classList.remove('open');
    navOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });
}

// Close menu on link click
if (navLinks) {
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      navActions.classList.remove('open');
      navOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- Scroll Animations ----
const scrollElements = document.querySelectorAll('.scroll-animate');

const observerOptions = {
  root: null,
  rootMargin: '0px 0px -80px 0px',
  threshold: 0.1,
};

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      // Stagger animation delay
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, index * 100);
      scrollObserver.unobserve(entry.target);
    }
  });
}, observerOptions);

scrollElements.forEach(el => scrollObserver.observe(el));

// ---- Smooth Scroll for Anchor Links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const navHeight = navbar.offsetHeight;
      const targetPosition = target.offsetTop - navHeight - 20;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ---- Active Nav Link Highlight ----
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinksAll = document.querySelectorAll('.navbar-links a');
  
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    const sectionHeight = section.clientHeight;
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      current = section.getAttribute('id');
    }
  });
  
  navLinksAll.forEach(link => {
    link.classList.remove('active');
    const href = link.getAttribute('href');
    if (href === `#${current}` || (current === 'hero' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

window.addEventListener('scroll', updateActiveNavLink);

// ---- Counter Animation ----
function animateCounters() {
  const counters = document.querySelectorAll('.hero-stat .number');
  
  counters.forEach(counter => {
    const text = counter.textContent;
    const hasPlus = text.includes('+');
    const hasDot = text.includes('.');
    const numericValue = parseFloat(text.replace(/[^0-9.]/g, ''));
    
    let startValue = 0;
    const duration = 2000;
    const startTime = performance.now();
    
    function updateCounter(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (numericValue - startValue) * eased;
      
      if (hasDot) {
        counter.textContent = currentValue.toFixed(1) + (hasPlus ? '+' : '');
      } else {
        counter.textContent = Math.floor(currentValue) + (text.includes('K') ? 'K' : '') + (hasPlus ? '+' : '');
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    }
    
    requestAnimationFrame(updateCounter);
  });
}

// Trigger counter animation when hero is in view
const heroSection = document.querySelector('.hero');
if (heroSection) {
  const heroObserver = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        animateCounters();
        heroObserver.unobserve(heroSection);
      }
    },
    { threshold: 0.3 }
  );
  heroObserver.observe(heroSection);
}

// ---- Page Load Animation ----
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  requestAnimationFrame(() => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
  });

  // ---- Dynamic Navbar based on auth state ----
  updateNavbarAuth();
});

function updateNavbarAuth() {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const navActionsEl = document.getElementById('navActions');
  
  // Skip if no nav actions element or if on profile page (it has its own nav)
  if (!navActionsEl || document.querySelector('.profile-page')) return;
  
  if (token && user) {
    const userData = JSON.parse(user);
    const firstName = userData.name ? userData.name.split(' ')[0] : 'Profile';
    navActionsEl.innerHTML = `
      <a href="profile.html" class="btn btn-ghost" style="color: var(--color-gold);">👤 ${firstName}</a>
      <button class="btn btn-outline" onclick="handleLogout()">Logout</button>
    `;
  }
}

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('profileVisited');
  window.location.href = 'login.html';
}

console.log('%c✂️ SharpCuts', 'color: #d4af37; font-size: 24px; font-weight: bold;');
console.log('%cPremium Barbershop & Grooming', 'color: #a0a0a0; font-size: 12px;');
