/* ============================================================
   cv.js  —  Password gate & CV page utilities
   ============================================================

   TO CHANGE THE PASSWORD:
   1. Decide on your new password.
   2. Generate its SHA-256 hash. Run:
      node -e "require('crypto').createHash('sha256').update('yourPassword').digest('hex')"
   3. Replace the CORRECT_HASH string below with the result.
   ============================================================ */

'use strict';

/* ── SHA-256 hash of "Harry_254!" ── */
const CORRECT_HASH = '8240932572a68495de8d94962d5c6a693943018bea63ced85cc568e1e55eb046';

/* ── Session storage key ── */
const SESSION_KEY = 'cv_unlocked';

/* ── DOM refs ── */
const gate      = document.getElementById('cv-gate');
const cvWrapper = document.getElementById('cv-wrapper');
const form      = document.getElementById('gate-form');
const input     = document.getElementById('gate-input');
const errMsg    = document.getElementById('gate-error');
const printBtn  = document.getElementById('cv-print-btn');

/* ──────────────────────────────────────────────────────────
   SHA-256 via Web Crypto API (returns hex string)
   ────────────────────────────────────────────────────────── */
async function sha256(message) {
    const msgBuffer  = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray  = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/* ──────────────────────────────────────────────────────────
   Unlock — fade out gate, reveal CV
   ────────────────────────────────────────────────────────── */
function unlock() {
    sessionStorage.setItem(SESSION_KEY, '1');

    gate.classList.add('gate-exit');
    gate.addEventListener('transitionend', () => {
        gate.style.display = 'none';
    }, { once: true });

    cvWrapper.classList.add('cv-visible');
}

/* ──────────────────────────────────────────────────────────
   Show error with shake animation
   ────────────────────────────────────────────────────────── */
function showError(msg) {
    errMsg.textContent = msg;
    errMsg.classList.remove('shake');
    void errMsg.offsetWidth; // force reflow
    errMsg.classList.add('shake');

    input.classList.add('input-error');
    setTimeout(() => input.classList.remove('input-error'), 600);
}

/* ──────────────────────────────────────────────────────────
   Form submit handler
   ────────────────────────────────────────────────────────── */
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pwd = input.value.trim();
    if (!pwd) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying…';

    try {
        const hash = await sha256(pwd);
        if (hash === CORRECT_HASH) {
            unlock();
        } else {
            showError('Incorrect password. Request access below.');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Unlock CV';
        }
    } catch (err) {
        showError('An error occurred. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Unlock CV';
    }
});

/* ──────────────────────────────────────────────────────────
   Clear error on new input
   ────────────────────────────────────────────────────────── */
input.addEventListener('input', () => {
    errMsg.textContent = '';
    input.classList.remove('input-error');
});

/* ──────────────────────────────────────────────────────────
   Show / hide password toggle
   ────────────────────────────────────────────────────────── */
const toggleVisBtn  = document.getElementById('gate-toggle-vis');
const toggleVisIcon = document.getElementById('gate-toggle-icon');

if (toggleVisBtn) {
    toggleVisBtn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        toggleVisIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
    });
}

/* ──────────────────────────────────────────────────────────
   Download PDF button — triggers direct download of resume.pdf
   ────────────────────────────────────────────────────────── */
if (printBtn) {
    printBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = 'assets/pdf/resume.pdf';
        link.download = 'Harry_Otieno_CV.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

/* ──────────────────────────────────────────────────────────
   On page load — DO NOT auto-unlock from session.
   User must re-enter password every visit (session cleared on load).
   ────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    // Always require re-entry — clear any stored session on page load
    sessionStorage.removeItem(SESSION_KEY);
});
