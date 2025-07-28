document.getElementById('logForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  const logData = {
    logId: 'log' + Date.now(),
    userId: data.userId,
    date: data.date,
    scheduledWorkoutId: data.scheduledWorkoutId || undefined,
    duration: Number(data.duration),
    wasSkipped: data.wasSkipped === 'true',
    rpe: Number(data.rpe),
    exercises: [
      {
        exerciseId: data.exerciseId,
        setsPerformed: Number(data.setsPerformed),
        repsPerformed: Number(data.repsPerformed),
        actualWeight: Number(data.actualWeight),
        restInterval: Number(data.restInterval),
        duration: Number(data.exerciseDuration),
        notes: data.notes
      }
    ]
  };

  try {
    const response = await fetch('http://localhost:3000/api/workouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('message').textContent = '✅ Workout logged!';
      this.reset();
    } else {
      document.getElementById('message').textContent = `❌ Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to connect to server.';
  }
});
