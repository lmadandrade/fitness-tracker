// login.js - login page logic
// when user types email + password, we send to server to check

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const messageEl = document.getElementById('message');

  // when user clicks login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    // make sure they type both fields
    if (!email || !password) {
      messageEl.textContent = 'Please type both email and password.';
      return;
    }

    try {
      // send email and password to server
      const res = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await res.json();

      if (res.ok) {
        // if correct → save userId in localStorage and go to homepage
        localStorage.setItem('userId', result.userId);
        window.location.href = 'index.html';
      } else {
        // if wrong login
        messageEl.textContent = result.error || 'Wrong email or password.';
      }

    } catch (err) {
      // if server broke or not open
      messageEl.textContent = 'Could not connect to server.';
    }
  });
});
