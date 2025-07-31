/*
 * login.js
 *
 * This script powers the simple login page. Users provide their
 * email and password, which are checked against a list of locally
 * stored credentials. On success, the corresponding userId is
 * saved to localStorage and the user is redirected into the app.
 *
 * NOTE: Because the backend does not persist passwords, we store
 * credential data in the browser's localStorage under the key
 * "authUsers". Each entry contains an email, password and
 * associated userId. This is purely for demonstration purposes
 * within a single browser session and is not secure.
 */

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageEl = document.getElementById('message');

  // Handle submission of the login form.
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      messageEl.textContent = 'Please enter both email and password.';
      return;
    }

    // Retrieve stored credentials from localStorage. If none exist,
    // initialise an empty array.
    const stored = JSON.parse(localStorage.getItem('authUsers') || '[]');

    // Look for a matching user entry with the same email and password.
    const entry = stored.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (entry) {
      // Save the associated userId and redirect to the home page.
      localStorage.setItem('userId', entry.userId);
      window.location.href = 'index.html';
    } else {
      messageEl.textContent = 'Invalid email or password. Please try again.';
    }
  });
});
