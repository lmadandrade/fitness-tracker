// settings.js
// This script loads the user's current data into the settings form
// and handles updates via PUT to /api/users/update

document.addEventListener('DOMContentLoaded', async () => {
  const userId = localStorage.getItem('userId');
  const messageEl = document.getElementById('message');

  if (!userId) {
    alert('You must be logged in to view this page.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/users/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch user data');

    const user = await response.json();

    // Populate form fields
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('age').value = user.age || '';
    document.getElementById('height').value = user.height || '';
    document.getElementById('weight').value = user.weight || '';
    document.getElementById('experienceLevel').value = user.experienceLevel || '';

  } catch (err) {
    messageEl.textContent = '❌ Could not load user profile.';
    messageEl.classList.add('error');
  }
});

document.getElementById('userSettingsForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('You must be logged in.');
    return;
  }

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  data.userId = userId; // Ensure userId is included in the update

  try {
    const response = await fetch('http://localhost:3000/api/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    const messageEl = document.getElementById('message');

    if (response.ok) {
      messageEl.textContent = '✅ Profile updated successfully!';
      messageEl.classList.add('success');
    } else {
      messageEl.textContent = `❌ Error: ${result.error}`;
      messageEl.classList.add('error');
    }
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to connect to server.';
  }
});
