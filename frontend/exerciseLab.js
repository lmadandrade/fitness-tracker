// Front‑end script for creating a new exercise.
//
// This module listens for form submission on the exercise creation page,
// gathers the user input, constructs a payload object and sends it to
// the backend API. It generates a simple unique ID based on the current
// timestamp and provides plain‑text feedback messages to the user.

// Attach a submit handler to the exercise form. When the user submits the
// form we collect the data, massage it into the format expected by the
// backend API and then post it. We namespace the listener on the
// specific form element so that event handling is explicit and easy to
// follow.
document.getElementById('exerciseForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  // Convert form data into a plain object. FormData makes it easy to
  // extract named fields from the form without manually querying each
  // input element.
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());

  // Assign a unique exerciseId. The backend expects a string ID but
  // doesn't generate one itself, so we prefix a timestamp. This ensures
  // that each exercise submitted has a unique identifier even when the
  // database is reset between runs.
  data.exerciseId = 'ex' + Date.now();

  // Parse tags from a comma separated string into an array. The API
  // expects tags to be an array of strings; splitting on commas and
  // trimming whitespace preserves user input while meeting that contract.
  if (data.tags) {
    // Split on commas, trim each tag and filter out any empty entries.
    data.tags = data.tags.split(',').map(t => t.trim()).filter(t => t);
  }

  try {
    const response = await fetch('http://localhost:3000/api/exercises', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    const messageEl = document.getElementById('message');

    if (response.ok) {
      // Clear the form and show a success message when the API call
      // succeeds.
      messageEl.textContent = 'Exercise created successfully!';
      this.reset();
    } else {
      // Display any validation or server error returned by the API.
      messageEl.textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    // Catch network errors or failures to connect to the server.
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
});