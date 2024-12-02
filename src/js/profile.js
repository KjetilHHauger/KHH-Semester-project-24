import { API_BASE_URL } from './api.js';

const profileImage = document.getElementById('profileImage');
const token = localStorage.getItem('accessToken');

if (!token) {
  window.location.href = './login.html';
}

async function fetchProfile() {
  try {
    const response = await fetch(`${API_BASE_URL}users/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`, 
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch profile. Please log in again.');
    }

    const user = await response.json();

    profileImage.src = user.avatar || 'https://via.placeholder.com/80';
    document.querySelector('p.text-lg').textContent = user.name;
    document.querySelector('p.text-sm.text-gray-500').textContent = user.email;
  } catch (error) {
    console.error(error);
    alert(error.message);
    localStorage.removeItem('token'); 
    window.location.href = '../../index.html'; 
  }
}

fetchProfile();
