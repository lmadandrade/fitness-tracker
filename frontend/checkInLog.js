// checkInLog.js
// Handles the submission of the check‑in form. It collects all values,
// attaches the logged in userId, and sends a POST request to the
// backend. Energy level is captured using a range slider and the
// current value is displayed next to the label.

document.addEventListener('DOMContentLoaded', () => {
  const energySlider = document.getElementById('energyLevel');
  const energyValue = document.getElementById('energyValue');

  // Get the logged in userId from localStorage. auth.js should
  // redirect to login if userId is missing.
  const userId = localStorage.getItem('userId');
  if (!userId) {
    alert('You must be logged in to use this feature.');
    window.location.href = 'login.html';
    return;
  }

  // Update the displayed energy value when the slider changes
  if (energySlider && energyValue) {
    energySlider.addEventListener('input', () => {
      energyValue.textContent = energySlider.value;
    });
  }

  // Fetch existing check-ins on page load
  fetchCheckIns(userId);

  const form = document.getElementById('checkInForm');
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Build the check‑in object. Convert numeric fields appropriately.
    const checkInData = {
      checkInId: 'ci' + Date.now(),
      userId: userId,
      date: data.date,
      energyLevel: Number(data.energyLevel),
      mood: data.mood,
      bodyWeight: data.bodyWeight ? Number(data.bodyWeight) : undefined,
      muscleMeasurements: {
        chest: data.chest ? Number(data.chest) : undefined,
        waist: data.waist ? Number(data.waist) : undefined,
        arms: data.arms ? Number(data.arms) : undefined,
        thighs: data.thighs ? Number(data.thighs) : undefined,
        shoulders: data.shoulders ? Number(data.shoulders) : undefined,
        calves: data.calves ? Number(data.calves) : undefined
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
        document.getElementById('message').textContent = 'Check‑in logged successfully!';
        form.reset();
        // Reset the slider display to its default value if needed
        if (energyValue) energyValue.textContent = energySlider.value;

        // Reload check-ins after submission
        fetchCheckIns(userId);
      } else {
        document.getElementById('message').textContent = `Error: ${result.error || 'Unknown error'}`;
      }
    } catch (err) {
      document.getElementById('message').textContent = 'Failed to connect to server.';
    }
  });
});


// Load and display check-ins that belong to the current user
async function fetchCheckIns(userId) {
  const listEl = document.getElementById('checkInList');
  if (!listEl) return;

  listEl.innerHTML = '';

  try {
    const res = await fetch(`http://localhost:3000/api/checkins?userId=${userId}`);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      listEl.textContent = 'No check-ins found.';
      return;
    }

    data.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'checkin-card';
      card.innerHTML = `
        <h4>${entry.date}</h4>
        <p><strong>Mood:</strong> ${entry.mood || '-'}</p>
        <p><strong>Energy:</strong> ${entry.energyLevel ?? '-'} / 10</p>
        <p><strong>Weight:</strong> ${entry.bodyWeight ?? '-'} kg</p>
        <p><strong>Note:</strong> ${entry.note || '-'}</p>
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    listEl.textContent = 'Error loading check-ins.';
  }
}
