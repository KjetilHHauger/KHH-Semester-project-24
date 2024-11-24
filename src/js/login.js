import { API_BASE_URL } from './api.js';
import { loadNav } from './utils.js';

loadNav();

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const loginData = {
    email,
    password,
  };

  try {
    const response = await fetch(`${API_BASE_URL}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem('accessToken', data.data.accessToken);

      messageDiv.textContent = 'Login successful! Redirecting...';
      messageDiv.className = 'text-green-500';

      setTimeout(() => {
        window.location.href = '/index.html';
      }, 2000);
    } else {
      messageDiv.textContent = `Error: ${data.message}`;
      messageDiv.className = 'text-red-500';
    }
  } catch (error) {
    messageDiv.textContent = 'An unexpected error occurred. Please try again later.';
    messageDiv.className = 'text-red-500';
  }
});
