// this is for user to change his profile info
// we load the data when page loads, and let him save changes

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

    if (!response.ok) throw new Error('Could not get user');

    const user = await response.json();

    // filling the form with info from user
    document.getElementById('name').value = user.name || '';
    document.getElementById('email').value = user.email || '';
    document.getElementById('age').value = user.age || '';
    document.getElementById('height').value = user.height || '';
    document.getElementById('weight').value = user.weight || '';
    document.getElementById('experienceLevel').value = user.experienceLevel || '';

  } catch (err) {
       // If something fails
    messageEl.textContent = 'Could not load user profile.';
    messageEl.classList.add('error');
  }
});

// When user presses save, we update it
document.getElementById('userSettingsForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const userId = localStorage.getItem('userId');
  if (!userId) {

    alert('You must be logged in.');
    return;
  }

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  data.userId = userId;

  try {
    const res = await fetch('http://localhost:3000/api/users/update', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    const messageEl = document.getElementById('message');

    if (res.ok) {
      messageEl.textContent = 'Profile updated successfully!';
      messageEl.classList.add('success');
    } else {
      messageEl.textContent = `Error: ${result.error}` ;
      messageEl.classList.add('error');
    }

  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
    
  }
});
