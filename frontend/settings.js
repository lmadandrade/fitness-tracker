// Front‑end logic for the user settings form.
//
// This script intercepts the settings form submission, serialises the
// form data and sends it to the backend API via a PUT request. It
// provides basic feedback to the user about whether the update was
// successful. Note that the backend must support this route.

document.getElementById('userSettingsForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Convert form fields into a plain object. This uses the browser's
  // FormData API for convenience.
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('http://localhost:3000/api/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    const messageEl = document.getElementById('message');

    if (response.ok) {
      // On success, display a confirmation message. You might choose to
      // reload the user profile or update the UI in other ways.
      messageEl.textContent = 'Profile updated successfully!';
      this.reset();
    } else {
      // Display the error returned by the API.
      messageEl.textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
});