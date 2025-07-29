document.getElementById('registrationForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  data.userId = 'u' + Date.now(); // Generate a unique user ID (e.g., u1690305278304)

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    const messageElement = document.getElementById('message');

    if (response.ok) {
      messageElement.textContent = '✅ Registration successful!';
      messageElement.classList.add('success');
      this.reset();
    } else {
      messageElement.textContent = `❌ Error: ${result.error}`;
      messageElement.classList.add('error');
    }
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to connect to server.';
  }
});
