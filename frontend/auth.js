// auth.js - this checks if the user is logged in

document.addEventListener('DOMContentLoaded', () => {
  const userId = localStorage.getItem('userId');
  const currentPage = window.location.pathname.split('/').pop();

  // Pages where user don't need to be logged in
  const publicPages = ['login.html', 'userReg.html', ''];

  // if not logged and not in public page => redirect

  if (!userId && !publicPages.includes(currentPage)) {
    window.location.href = 'login.html';
    return ;
}

  // if logged, we can add the userID in any input hidden
  if (userId) {
    document.querySelectorAll('input[name="userId"]').forEach(input => {
      input.value = userId;
    });
  }

});

// logout just delete userID and send to login
function logout() {

  localStorage.removeItem('userId');
  window.location.href = 'login.html';
}
