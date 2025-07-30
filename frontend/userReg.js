// Front‑end logic for the user registration form.
//
// This script captures the submission of the registration form, assigns
// a simple unique user ID, serialises the form data and sends it to the
// backend API. It gives the user basic success or error feedback.

document.getElementById('registrationForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Serialise the form fields into an object. FormData plus
  // Object.fromEntries avoids manually selecting each input.
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Generate a simple unique identifier for the new user. In a real
  // application this would likely be handled by the server, but for the
  // purposes of this assignment we construct it client‑side.
  data.userId = 'u' + Date.now();

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    const messageElement = document.getElementById('message');

    if (response.ok) {
      messageElement.textContent = 'Registration successful!';
      this.reset();
    } else {
      messageElement.textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
});