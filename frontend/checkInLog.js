// checkInLog.js - this is for handling check-ins
// when user submit form, we save everything and show it on screen

document.addEventListener("DOMContentLoaded", () => {
  // grab the energy slider and the number next to it
  const energySlider = document.getElementById("energyLevel");
  const energyValue = document.getElementById("energyValue");

  // get userId from localStorage (should be there if user is logged)
  const userId = localStorage.getItem("userId");

  if (!userId) {
    alert("You must be logged in to use this feature.");
    window.location.href = "login.html";
    return;
  }

  // update number next to slider while sliding
  if (energySlider && energyValue) {
    energyValue.textContent = energySlider.value;

    energySlider.addEventListener("input", () => {
      energyValue.textContent = energySlider.value;
    });
  }

  // when page loads we fetch the previous check ins
  fetchCheckIns(userId);

  const form = document.getElementById("checkInForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // prepare the object to send to the server
    const checkInData = {
      checkInId: "ci" + Date.now(), // ID
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
  
      note: data.note
    };

    try {
      const res = await fetch("http://localhost:3000/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(checkInData)
      });

      const result = await res.json();
      const messageEl = document.getElementById("message");

      if (res.ok) {
        if (messageEl) {
          messageEl.textContent = "Check-in logged successfully!";
          messageEl.className = "message-container success";
        }

        form.reset();

        // put slider value back to normal
        if (energyValue) {
          energyValue.textContent = energySlider.value;
        }

        fetchCheckIns(userId);

        // remove message after 3 secs
        setTimeout(() => {
          if (messageEl) {
            messageEl.textContent = "";
            messageEl.className = "message-container";
          }
        }, 3000);
      } else {
        if (messageEl) {
          messageEl.textContent = `Error: ${result.error || "Something went wrong"}`;
          messageEl.className = "message-container error";
        }
      }
    } catch (err) {
      const messageEl = document.getElementById("message");
      if (messageEl) {
        messageEl.textContent = "Could not connect to server 😕";
        messageEl.className = "message-container error";
      }
    }
  });
});

// this function gets all the checkins and show them on screen
async function fetchCheckIns(userId) {
  const listEl = document.getElementById("checkInList");
  if (!listEl) return;

  // show loading while waiting
  listEl.innerHTML = `<p class="message-container">Loading your check-in history...</p>`;

  try {
    const res = await fetch(`http://localhost:3000/api/checkins?userId=${userId}`);
    const data = await res.json();

    listEl.innerHTML = ""; // clear loading message

    if (!Array.isArray(data) || data.length === 0) {
      listEl.innerHTML = `<p class="message-container no-data">No check-ins found. Start tracking your progress!</p>`;
      return;
    }

    // show by most recent date
    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    data.forEach(entry => {
      const card = document.createElement("div");
      card.className = "card checkin-card";

      const date = new Date(entry.date);
      const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric"
      });

      // show measurements only if there is any
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

      // build the card with all data
      card.innerHTML = `
        <h4>${formattedDate}</h4>
        <p><strong>Energy:</strong> ${entry.energyLevel ?? "-"}/10 | <strong>Mood:</strong> ${entry.mood || "No mood"}</p>
        ${entry.bodyWeight ? `<p><strong>Weight:</strong> ${entry.bodyWeight} kg</p>` : ""}
        ${measurementsHtml}
        ${entry.note ? `<div class="note"><strong>Notes:</strong> ${entry.note}</div>` : ""}
            `;

      listEl.appendChild(card);
    });

  } catch (err) {
    listEl.innerHTML = `<p class="message-container error">Error loading check-ins. Please try again later.</p>`;
  }
}

// logout and send user to login again
function logout() {
  localStorage.removeItem("userId");
  window.location.href = "login.html";
}
