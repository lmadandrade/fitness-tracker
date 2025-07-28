document.getElementById('scheduleForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // ✅ Automatically generate a unique scheduleId
  const scheduleId = 's' + Date.now(); // e.g., s1690891234567

  // ✅ Prepare the data to match the WorkoutSchedule model
  const scheduleData = {
    scheduleId: scheduleId,
    userId: data.userId,
    dayOfWeek: data.dayOfWeek,
    scheduleTitle: data.scheduleTitle,
    exercises: [
      {
        exerciseId: data.exerciseId,
        sets: Number(data.sets),
        reps: Number(data.reps),
        targetWeight: Number(data.targetWeight),
        restInterval: Number(data.restInterval),
        duration: Number(data.duration)
      }
    ]
  };

  try {
    const response = await fetch('http://localhost:3000/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scheduleData)
    });

    const result = await response.json();

    if (response.ok) {
      document.getElementById('message').textContent = '✅ Schedule created!';
      this.reset();
    } else {
      document.getElementById('message').textContent = `❌ Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = '❌ Failed to connect to server.';
  }
});
