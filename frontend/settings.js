document.getElementById('userSettingsForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('http://localhost:3000/api/users/update', {
      method: 'PUT', // Make sure your backend supports updating
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
