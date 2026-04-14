/**
 * supabase-client.js — Greenfield Secondary School
 * Supabase JS SDK v2 integration
 *
 * SETUP: Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_ANON_KEY
 * with the values from your Supabase project dashboard.
 * (Settings → API → Project URL & anon/public key)
 */

// ── 1. Import Supabase from CDN (loaded via <script> in HTML) ──
// We use the UMD build from CDN — window.supabase is available globally.

const SUPABASE_URL  = 'djhbutydiuqoyifvmjnc.supabase.co';   // e.g. https://xxxx.supabase.co
const SUPABASE_ANON = 'sb_publishable_b2L99kog7dxUW4pZcs39Bg_gmHRfCai';

// Create the Supabase client
const _supabase = window.supabase.createClient(djhbutydiuqoyifvmjnc.supabase.co, sb_publishable_b2L99kog7dxUW4pZcs39Bg_gmHRfCai);

/* ─────────────────────────────────────────────
   AUTH FUNCTIONS
───────────────────────────────────────────── */

/**
 * Sign in with email and password.
 * @param {string} email
 * @param {string} password
 * @returns {{ data, error }}
 */
async function signIn(email, password) {
  const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
  if (!error && data.user) {
    // Store user type hint (portal page can set a flag before calling)
    localStorage.setItem('gss_user_id', data.user.id);
  }
  return { data, error };
}

/**
 * Sign out the current user.
 */
async function signOut() {
  const { error } = await _supabase.auth.signOut();
  localStorage.removeItem('gss_user_id');
  return { error };
}

/**
 * Get the currently logged-in user (if any).
 */
async function getCurrentUser() {
  const { data: { user } } = await _supabase.auth.getUser();
  return user;
}

/* ─────────────────────────────────────────────
   ANNOUNCEMENTS
───────────────────────────────────────────── */

/**
 * Fetch public announcements for the homepage ticker / news page.
 * @returns {Array} announcements sorted newest first
 */
async function fetchPublicAnnouncements() {
  const { data, error } = await _supabase
    .from('announcements')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching announcements:', error.message);
    return [];
  }
  return data || [];
}

/* ─────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────── */

/**
 * Submit a contact form message to Supabase.
 * Anyone (public) can insert — RLS policy allows this.
 * @param {string} name
 * @param {string} email
 * @param {string} message
 * @returns {{ success: boolean, error: string|null }}
 */
async function submitContactForm(name, email, message) {
  const { error } = await _supabase
    .from('contact_messages')
    .insert([{ sender_name: name, email, message }]);

  if (error) {
    console.error('Contact form error:', error.message);
    return { success: false, error: error.message };
  }
  return { success: true, error: null };
}

/* ─────────────────────────────────────────────
   RESULTS (Student Portal)
───────────────────────────────────────────── */

/**
 * Fetch results for a specific student.
 * RLS ensures students can only fetch their own results.
 * @param {string} studentId — UUID from students table
 * @returns {Array} results
 */
async function fetchStudentResults(studentId) {
  const { data, error } = await _supabase
    .from('results')
    .select('*')
    .eq('student_id', studentId)
    .order('term', { ascending: false });

  if (error) {
    console.error('Error fetching results:', error.message);
    return [];
  }
  return data || [];
}

/* ─────────────────────────────────────────────
   UI HELPERS — wired to page forms
───────────────────────────────────────────── */

/**
 * Wire the contact form (contact.html) to submitContactForm().
 * Call this from contact.html after DOM loads.
 */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const msgEl   = document.getElementById('form-message');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled    = true;
    btn.textContent = 'Sending…';

    const name    = form.querySelector('[name="name"]').value.trim();
    const email   = form.querySelector('[name="email"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    const { success, error } = await submitContactForm(name, email, message);

    if (success) {
      msgEl.className  = 'form-message success';
      msgEl.textContent = '✅ Thank you! Your message has been received. We will respond within 2 working days.';
      form.reset();
    } else {
      msgEl.className  = 'form-message error';
      msgEl.textContent = `❌ Error: ${error || 'Unable to send message. Please try again.'}`;
    }

    btn.disabled    = false;
    btn.textContent = 'Send Message';
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}

/**
 * Wire the portal login form (portal-login.html) to signIn().
 * Call this from portal-login.html after DOM loads.
 */
function initLoginForm() {
  const form  = document.getElementById('login-form');
  const msgEl = document.getElementById('login-message');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn  = form.querySelector('button[type="submit"]');
    btn.disabled    = true;
    btn.textContent = 'Signing in…';

    const email    = form.querySelector('[name="email"]').value.trim();
    const password = form.querySelector('[name="password"]').value;

    const { data, error } = await signIn(email, password);

    if (!error) {
      msgEl.className  = 'form-message success';
      msgEl.textContent = '✅ Login successful! Redirecting to your dashboard…';
      setTimeout(() => {
        // Redirect based on user role (adapt to your actual dashboard URL)
        window.location.href = 'dashboard.html';
      }, 1500);
    } else {
      msgEl.className  = 'form-message error';
      msgEl.textContent = `❌ ${error.message || 'Invalid email or password. Please try again.'}`;
      btn.disabled    = false;
      btn.textContent = 'Sign In';
    }
    msgEl.style.display = 'block';
  });
}

/**
 * Load public announcements into the ticker bar dynamically.
 * Falls back to static HTML if Supabase is not configured.
 */
async function loadTickerAnnouncements() {
  const PLACEHOLDER = SUPABASE_URL === 'YOUR_SUPABASE_URL';
  if (PLACEHOLDER) return; // Use static ticker in HTML

  const items = await fetchPublicAnnouncements();
  const track = document.querySelector('.ticker-content');
  if (!track || items.length === 0) return;

  const doubled = [...items, ...items]; // duplicate for seamless loop
  track.innerHTML = doubled
    .map(item => `<span>${item.title}</span>`)
    .join('');
}

// Auto-run ticker loader if on a page that has it
document.addEventListener('DOMContentLoaded', () => {
  if (document.querySelector('.ticker-bar')) {
    loadTickerAnnouncements();
  }
});
