document.getElementById('checkInForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

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

    if (response.ok) {
      document.getElementById('message').textContent = '✅ Check-in logged successfully!';
      this.reset();
    } else {
      document.getElementById('message').textContent = `❌ Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to connect to server.';
  }
});
