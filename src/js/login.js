import { API_BASE_URL } from './api.js';
import { loadNav } from './utils.js';

loadNav();

const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const response = await fetch(`${API_BASE_URL}auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json(); 

    if (response.ok) {
      const { accessToken, name } = result.data; 
      if (!accessToken || !name) {
        throw new Error('Access token or username is missing in the response.');
      }

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('username', name);

      messageDiv.textContent = 'Login successful! Redirecting...';
      messageDiv.className = 'text-green-700 font-bold text-2xl';

      setTimeout(() => window.location.href = '/index.html', 2000);
    } else {
      messageDiv.textContent = `Error: ${result.data?.message || 'Login failed.'}`;
      messageDiv.className = 'text-red-500 font-bold text-3xl';
    }
  } catch (error) {
    messageDiv.textContent = 'An unexpected error occurred.';
    messageDiv.className = 'text-red-500 font-bold text-2xl';
  }
});
