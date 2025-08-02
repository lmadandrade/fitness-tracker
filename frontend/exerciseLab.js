// exerciseLab.js - create or edit exercises

document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("userId");

  // if no login, redirect back
  if (!userId) {
    alert("You must be logged in to view this page.");
    window.location.href = "login.html";
    return;
  }

  // load what user already created
  loadExerciseList();

  const form = document.getElementById("exerciseForm");
  const editField = document.getElementById("editingExerciseId");
  const submitBtn = document.getElementById("submitBtn");
  const msg = document.getElementById("message");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // collect form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.userId = userId; // add user ID so we know who created

      try {
        let res;

        if (editField.value) {
          // update mode
          data.exerciseId = editField.value;

          res = await fetch(`http://localhost:3000/api/exercises/${data.exerciseId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });

        } else {
          // create new
          data.exerciseId = "ex" + Date.now();

          res = await fetch("http://localhost:3000/api/exercises", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
          });
        }

        const result = await res.json();

        if (res.ok) {
          msg.textContent = editField.value
            ? "Exercise updated successfully!"
            : "Exercise create successfully!";

          form.reset();
          editField.value = "";
          submitBtn.textContent = "Save Exercise";
          loadExerciseList();
        } else {
          msg.textContent = `Error: ${result.error || "Something went wrong!"}`;
        }

      } catch (err) {
        msg.textContent = "Server is not working now";
      }
    });

    form.addEventListener("reset", () => {
      editField.value = "";
      submitBtn.textContent = "Save Exercise";
      msg.textContent = "";
    });
  }
});


//  displays existing exercises
async function loadExerciseList() {
  const list = document.getElementById("exerciseList");
  const userId = localStorage.getItem("userId");
  if (!userId || !list) return;

  try {
    const response = await fetch(`http://localhost:3000/api/exercises?userId=${userId}`);
    const exercises = await response.json();

    list.innerHTML = "";

    if (!Array.isArray(exercises) || exercises.length === 0) {
      list.textContent = "No exercises found";
      return;
    }

    exercises.forEach((exercise) => {
      const card = document.createElement("div");
      card.className = "exercise-card";
      card.innerHTML = `
        <h3>${exercise.name}</h3>
        <p><strong>Muscle Group:</strong> ${exercise.muscleGroup}</p>
        <p><strong>Equipment:</strong> ${exercise.equipment}</p>
        <p><strong>Type:</strong> ${exercise.type}</p>
        <p>${exercise.description || ""}</p>
      `;

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.style.marginRight = "8px";
      editBtn.addEventListener("click", () => {
        const form = document.getElementById("exerciseForm");
        form.name.value = exercise.name;
        form.muscleGroup.value = exercise.muscleGroup;
        form.equipment.value = exercise.equipment;
        form.type.value = exercise.type;
        form.description.value = exercise.description || "";
        document.getElementById("editingExerciseId").value = exercise.exerciseId;
        document.getElementById("submitBtn").textContent = "Update Exercise";
        form.scrollIntoView({ behavior: "smooth" });
      });

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "secondary";
      deleteBtn.addEventListener("click", async () => {
        try {
          await fetch(`http://localhost:3000/api/exercises/${exercise.exerciseId}`, {
            method: "DELETE",
          });
          card.remove();
        } catch (err) {
          alert("Failed to delete exercise");
        }
      });

      card.appendChild(editBtn);
      card.appendChild(deleteBtn);
      list.appendChild(card);
    });
  } catch (err) {
    list.textContent = "Failed to load exercises.";
  }
}
