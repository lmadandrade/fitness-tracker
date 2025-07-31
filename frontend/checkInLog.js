// checkInLog.js - Handles check-in logging functionality
// All data is connected through the API.

document.addEventListener("DOMContentLoaded", () => {
  const energySlider = document.getElementById("energyLevel");
  const energyValue = document.getElementById("energyValue");

  // Get the logged in userId from localStorage. auth.js should
  // redirect to login if userId is missing.
  const userId = localStorage.getItem("userId");
  if (!userId) {
    alert("You must be logged in to use this feature.");
    window.location.href = "login.html";
    return;
  }

  // Update the displayed energy value when the slider changes
  if (energySlider && energyValue) {
    energyValue.textContent = energySlider.value;
    energySlider.addEventListener("input", () => {
      energyValue.textContent = energySlider.value;
    });
  }

  // Fetch existing check-ins on page load
  fetchCheckIns(userId);

  const form = document.getElementById("checkInForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Build the check-in object. Convert numeric fields appropriately.
    const checkInData = {
      checkInId: "ci" + Date.now(), // Simple unique ID for demonstration
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
      const response = await fetch("http://localhost:3000/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkInData)
      });

      const result = await response.json();
      const messageEl = document.getElementById("message");

      if (response.ok) {
        if (messageEl) {
          messageEl.textContent = "Check-in logged successfully!";
          messageEl.className = "message-container success";
        }
        form.reset();
        // Reset the slider display to its default value if needed
        if (energyValue) energyValue.textContent = energySlider.value;

        // Reload check-ins after submission
        fetchCheckIns(userId);
        setTimeout(() => { if (messageEl) { messageEl.textContent = ""; messageEl.className = "message-container"; } }, 3000);
      } else {
        if (messageEl) {
          messageEl.textContent = `Error: ${result.error || "Unknown error"}`;
          messageEl.className = "message-container error";
        }
      }
    } catch (err) {
      const messageEl = document.getElementById("message");
      if (messageEl) {
        messageEl.textContent = "Failed to connect to server.";
        messageEl.className = "message-container error";
      }
    }
  });
});

// Load and display check-ins that belong to the current user
async function fetchCheckIns(userId) {
  const listEl = document.getElementById("checkInList");
  if (!listEl) return;

  listEl.innerHTML = 
    `<p class="message-container">Loading your check-in history...</p>`; // Show loading message

  try {
    const res = await fetch(`http://localhost:3000/api/checkins?userId=${userId}`);
    const data = await res.json();

    listEl.innerHTML = ""; // Clear loading message

    if (!Array.isArray(data) || data.length === 0) {
      listEl.innerHTML = 
        `<p class="message-container no-data">No check-ins found. Start tracking your progress!</p>`;
      return;
    }

    // Sort check-ins by date (newest first)
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    data.forEach(entry => {
      const card = document.createElement("div");
      card.className = "card checkin-card"; // Reusing .card style
      
      // Format the date nicely
      const date = new Date(entry.date);
      const formattedDate = date.toLocaleDateString("en-US", { 
        weekday: "short", 
        year: "numeric", 
        month: "short", 
        day: "numeric" 
      });

      // Build measurements section if any measurements exist
      let measurementsHtml = "";
      if (entry.muscleMeasurements) {
        const measurements = [];
        if (entry.muscleMeasurements.chest) measurements.push(`Chest: ${entry.muscleMeasurements.chest}cm`);
        if (entry.muscleMeasurements.waist) measurements.push(`Waist: ${entry.muscleMeasurements.waist}cm`);
        if (entry.muscleMeasurements.arms) measurements.push(`Arms: ${entry.muscleMeasurements.arms}cm`);
        if (entry.muscleMeasurements.thighs) measurements.push(`Thighs: ${entry.muscleMeasurements.thighs}cm`);
        if (entry.muscleMeasurements.shoulders) measurements.push(`Shoulders: ${entry.muscleMeasurements.shoulders}cm`);
        if (entry.muscleMeasurements.calves) measurements.push(`Calves: ${entry.muscleMeasurements.calves}cm`);
        
        if (measurements.length > 0) {
          measurementsHtml = `
            <div class="measurements">
              <strong>Measurements:</strong>
              <div class="measurement-grid">
                ${measurements.map(m => `<span>${m}</span>`).join("")}
              </div>
            </div>
          `;
        }
      }

      card.innerHTML = `
        <h4>${formattedDate}</h4>
        <p><strong>Energy:</strong> ${entry.energyLevel ?? "-"}/10 | <strong>Mood:</strong> ${entry.mood || "No mood"}</p>
        ${entry.bodyWeight ? `<p><strong>Weight:</strong> ${entry.bodyWeight} kg</p>` : ""}
        ${measurementsHtml}
        ${entry.note ? `<div class="note"><strong>Notes:</strong> ${entry.note}</div>` : ""}
        ${entry.progressPhotoUrl ? `<div class="photo"><strong>Progress Photo:</strong> <a href="${entry.progressPhotoUrl}" target="_blank">View Photo</a></div>` : ""}
      `;
      listEl.appendChild(card);
    });
  } catch (err) {
    listEl.innerHTML = 
      `<p class="message-container error">Error loading check-ins. Please try again later.</p>`;
  }
}

// Global logout function (assuming auth.js provides this)
function logout() {
  localStorage.removeItem("userId");
  window.location.href = "login.html";
}


