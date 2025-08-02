// userReg.js - this is where people register new accounts
// we save the info to the backend and check if the email is already taken

document.getElementById('registrationForm').addEventListener('submit', async function (e) {
  e.preventDefault(); // stop the form from reloading the page

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // make sure both password fields were filled
  if (!data.password || !data.confirmPassword) {
    document.getElementById('message').textContent = 'Please enter and confirm your password.';
    return;
  }

  // check if password and confirm match
  if (data.password !== data.confirmPassword) {
    document.getElementById('message').textContent = 'Passwords do not match.';
    return;
  }

  // generate an ID for the user (just use timestamp)
  data.userId = 'u' + Date.now();

  // now we check if the email is already in use
  try {
    const usersRes = await fetch('http://localhost:3000/api/users');
    const usersList = await usersRes.json();

    const existsOnServer = usersList.find(u => {
      return u.email && u.email.toLowerCase() === data.email.toLowerCase();
    });

    if (existsOnServer) {
      document.getElementById('message').textContent = 'An account with this email already exists.';
      return;
    }

  } catch (err) {
    // in case server is down or something
    document.getElementById('message').textContent = 'Error checking if email exists. Try again later.';
    return;
  }

  // now we register the user with the backend
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      // save userId only to keep session active (we don’t need whole user)
      localStorage.setItem('userId', data.userId);

      document.getElementById('message').textContent = 'Registration successful! Redirecting...';

      setTimeout(() => {
        window.location.href = 'index.html'; // go to home
      }, 2000);

    } else {
      document.getElementById('message').textContent = `Error: ${result.error}`;
    }

  } catch (err) {
    // maybe server not running
    document.getElementById('message').textContent = 'Could not reach server. Try again later.';
  }
});
