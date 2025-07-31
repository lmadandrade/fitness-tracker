// Simplified user registration script.
// Handles duplicate email detection, confirm password match,
// server persistence and local credential storage.

document.getElementById('registrationForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const data = Object.fromEntries(formData.entries());
  if (!data.password || !data.confirmPassword) {
    document.getElementById('message').textContent = 'Please enter and confirm your password.';
    return;
  }
  if (data.password !== data.confirmPassword) {
    document.getElementById('message').textContent = 'Passwords do not match.';
    return;
  }
  data.userId = 'u' + Date.now();
  try {
    const usersRes = await fetch('http://localhost:3000/api/users');
    const usersList = await usersRes.json();
    const existsOnServer = usersList.find(u => u.email && u.email.toLowerCase() === data.email.toLowerCase());
    const authUsers = JSON.parse(localStorage.getItem('authUsers') || '[]');
    const existsLocal = authUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existsOnServer || existsLocal) {
      document.getElementById('message').textContent = 'An account with this email already exists.';
      return;
    }
  } catch (err) {
    // If the server check fails, continue with local duplicate check only
    const authUsers = JSON.parse(localStorage.getItem('authUsers') || '[]');
    const existsLocal = authUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
    if (existsLocal) {
      document.getElementById('message').textContent = 'An account with this email already exists.';
      return;
    }
  }
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    if (response.ok) {
      const authUsers = JSON.parse(localStorage.getItem('authUsers') || '[]');
      authUsers.push({
        userId: data.userId,
        email: data.email,
        password: data.password,
        name: data.name || '',
        age: data.age || '',
        height: data.height || '',
        weight: data.weight || '',
        experienceLevel: data.experienceLevel || '',
        fitnessGoal: data.fitnessGoal || '',
        activityLevel: data.activityLevel || ''
      });
      localStorage.setItem('authUsers', JSON.stringify(authUsers));
      localStorage.setItem('userId', data.userId);
      document.getElementById('message').textContent = 'Registration successful! Redirecting...';
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    } else {
      document.getElementById('message').textContent = `Error: ${result.error}`;
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Failed to connect to server.';
  }
});