// @section: page-interactions
// Reply to Revenue — Med Spa Landing Page JS

/* ── CONFIGURATION ── */
// Set this to your backend endpoint for Telegram integration.
// See the HTML comments for Node.js/PHP backend examples.
const TELEGRAM_BACKEND_URL = '/api/lead'; // Change to your deployed backend URL

/* ── NAV SCROLL ── */
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

/* ── MOBILE DRAWER ── */
const hamburger = document.getElementById('hamburger');
const drawer = document.getElementById('mobileDrawer');
const overlay = document.getElementById('drawerOverlay');

function openDrawer() {
  drawer.classList.add('open');
  overlay.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  hamburger.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeDrawer() {
  drawer.classList.remove('open');
  overlay.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) hamburger.addEventListener('click', openDrawer);
if (overlay) overlay.addEventListener('click', closeDrawer);

// Close drawer on nav link click
drawer && drawer.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', closeDrawer);
});

/* ── SCROLL REVEAL ── */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.delay || 0, 10);
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, delay);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ── DEMO CONVERSATION TABS ── */
const tabs = document.querySelectorAll('.dtab');
const panels = document.querySelectorAll('.demo-panel');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetId = tab.dataset.tab;

    // Update tabs
    tabs.forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

    // Update panels
    panels.forEach(panel => {
      panel.classList.remove('active');
      panel.setAttribute('aria-hidden', 'true');
    });

    const target = document.getElementById(targetId);
    if (target) {
      target.classList.add('active');
      target.removeAttribute('aria-hidden');

      // Scroll to bottom of chat messages
      const msgs = target.querySelector('.msgs');
      if (msgs) {
        setTimeout(() => { msgs.scrollTop = msgs.scrollHeight; }, 100);
      }
    }
  });
});

// Auto-scroll initial chat to bottom
document.querySelectorAll('.demo-panel.active .msgs').forEach(m => {
  m.scrollTop = m.scrollHeight;
});

/* ── ROI CALCULATOR ── */
const slMissed = document.getElementById('sl-missed');
const slValue  = document.getElementById('sl-value');
const slConv   = document.getElementById('sl-conv');

function updateROI() {
  if (!slMissed) return;

  const missed = parseInt(slMissed.value, 10);
  const value  = parseInt(slValue.value, 10);
  const conv   = parseInt(slConv.value, 10) / 100;

  const monthlyMissed = missed * 4;
  const clientsLost   = Math.round(monthlyMissed * conv);
  const revenueLost   = clientsLost * value;

  const fmtNum = n => n.toLocaleString('en-US');

  document.getElementById('sl-missed-val').textContent = missed;
  document.getElementById('sl-value-val').textContent  = '$' + fmtNum(value);
  document.getElementById('sl-conv-val').textContent   = conv * 100 + '%';

  document.getElementById('calc-monthly').textContent  = fmtNum(monthlyMissed);
  document.getElementById('calc-clients').textContent  = fmtNum(clientsLost);
  document.getElementById('calc-revenue').textContent  = '$' + fmtNum(revenueLost);
}

if (slMissed) {
  slMissed.addEventListener('input', updateROI);
  slValue.addEventListener('input', updateROI);
  slConv.addEventListener('input', updateROI);
  updateROI();
}

/* ── SMOOTH SCROLL for anchor links ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const targetId = a.getAttribute('href').slice(1);
    if (!targetId) return;
    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      const offset = 80; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── FORM SUBMISSION ── */
window.submitForm = async function () {
  // Collect values
  const name      = document.getElementById('f-name');
  const email     = document.getElementById('f-email');
  const phone     = document.getElementById('f-phone');
  const business  = document.getElementById('f-business');
  const instagram = document.getElementById('f-instagram');
  const leads     = document.getElementById('f-leads');
  const challenge = document.getElementById('f-challenge');

  // Validate required fields
  const required = [name, email, phone, business, leads, challenge];
  let valid = true;

  required.forEach(el => {
    if (!el) return;
    if (!el.value.trim()) {
      el.classList.add('error');
      valid = false;
    } else {
      el.classList.remove('error');
    }
  });

  // Email format check
  if (email && email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    email.classList.add('error');
    valid = false;
  }

  if (!valid) {
    // Scroll to first error
    const firstError = document.querySelector('input.error, select.error');
    if (firstError) {
      const top = firstError.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top, behavior: 'smooth' });
    }
    return;
  }

  // Disable button during submission
  const btn = document.getElementById('submitBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Sending…';
  }

  // Build data object
  const data = {
    name:       name.value.trim(),
    email:      email.value.trim(),
    phone:      phone.value.trim(),
    business:   business.value.trim(),
    instagram:  instagram ? instagram.value.trim() : '',
    leads:      leads.value,
    challenge:  challenge.value,
    timestamp:  new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      dateStyle: 'short',
      timeStyle: 'short'
    })
  };

  // ── TELEGRAM INTEGRATION ──
  // Sends form data to your backend which forwards to Telegram.
  // Configure TELEGRAM_BACKEND_URL above (or replace this block
  // with the direct fetch to api.telegram.org for testing).
  try {
    await fetch(TELEGRAM_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // Note: we show success regardless of API response to avoid
    // discouraging leads if the backend is not yet configured.
  } catch (err) {
    // Silently continue — show success to user
    console.warn('Telegram integration not yet configured:', err.message);
  }

  // Show success message
  const formContent = document.getElementById('formContent');
  const successMsg  = document.getElementById('successMsg');

  if (formContent && successMsg) {
    formContent.style.display = 'none';
    successMsg.style.display  = 'block';

    // Scroll to success message
    successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  // Re-enable button (in case user navigates back)
  if (btn) {
    btn.disabled = false;
    btn.textContent = 'Get More Booked Consultations';
  }
};

/* ── REMOVE ERROR CLASS ON INPUT ── */
document.querySelectorAll('input, select, textarea').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('error'));
});
