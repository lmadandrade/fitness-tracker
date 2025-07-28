document.getElementById('exerciseForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  data.exerciseId = 'ex' + Date.now(); // e.g., ex1690305278304

  try {
    const response = await fetch('http://localhost:3000/api/exercises', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('message').textContent = '✅ Exercise created successfully!';
      this.reset();
    } else {
      document.getElementById('message').textContent = `❌ Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to connect to server.';
  }
});
