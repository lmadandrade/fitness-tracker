/*
 * auth.js
 *
 * This shared script ensures that a user is logged in on pages that
 * require authentication. It checks localStorage for a stored userId.
 * If none is found, the user is redirected to the login page. It also
 * fills hidden userId fields automatically and exposes a logout
 * function that clears the login state.
 */

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const currentPage = window.location.pathname.split('/').pop();

  // Pages that don't require authentication (login and registration)
  const publicPages = ['login.html', 'userReg.html', ''];

  // If there is no userId and we're not on a public page, redirect to login.
  if (!userId && !publicPages.includes(currentPage)) {
    window.location.href = 'login.html';
    return;
  }

  // Populate any hidden userId inputs on the page with the stored value.
  if (userId) {
    document.querySelectorAll('input[name="userId"]').forEach(input => {
      input.value = userId;
    });
  }
});

// Global logout function. Clears the stored userId and redirects to login.
function logout() {
  localStorage.removeItem('userId');
  window.location.href = 'login.html';
}