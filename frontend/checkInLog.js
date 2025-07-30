// Front‑end logic for the check‑in form.
//
// This script handles submission of the check‑in form by gathering the
// form values, building a payload object with the proper structure and
// sending it to the server. It provides basic success/error feedback
// messages to the user and prevents a full page reload.

document.getElementById('checkInForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Collect the form fields into an object. Using FormData makes this
  // straightforward and avoids manually reading each input.
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Construct the API payload. The backend expects numeric types for
  // measurements and energy level, so we explicitly cast them. A simple
  // timestamp‑based ID is used for the checkInId.
  const checkInData = {
    checkInId: 'ci' + Date.now(),
    userId: data.userId,
    date: data.date,
    energyLevel: Number(data.energyLevel),
    mood: data.mood,
    bodyWeight: Number(data.bodyWeight),
    muscleMeasurements: {
      chest: Number(data.chest),
      waist: Number(data.waist),
      arms: Number(data.arms),
      thighs: Number(data.thighs),
      shoulders: Number(data.shoulders),
      calves: Number(data.calves)
    },
    progressPhotoUrl: data.progressPhotoUrl,
    note: data.note
  };

  try {
    const response = await fetch('http://localhost:3000/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkInData)
    });

    const result = await response.json();
    const messageEl = document.getElementById('message');

    if (response.ok) {
      // Inform the user that the check‑in was recorded and reset the form.
      messageEl.textContent = 'Check‑in logged successfully!';
      this.reset();
    } else {
      // Show any errors returned by the API.
      messageEl.textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    // Provide a simple connection error message. More sophisticated error
    // handling could be added here if desired.
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
});