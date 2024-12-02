import { loadNav } from './utils.js';
import { API_BASE_URL } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadNav();

  const profileImage = document.getElementById('profileImage');
  const usernameElement = document.getElementById('username');
  const emailElement = document.getElementById('email');
  const bioElement = document.getElementById('bio');
  const creditsElement = document.getElementById('credits');
  const myListingsToggle = document.getElementById('myListingsToggle');
  const myListings = document.getElementById('myListings');
  const myWinsToggle = document.getElementById('myWinsToggle');
  const myWins = document.getElementById('myWins');

  const token = localStorage.getItem('accessToken');
  const username = localStorage.getItem('username');

  if (!token || !username) {
    window.location.href = './login.html';
    return;
  }

  async function fetchProfile() {
    try {
      const response = await fetch(`${API_BASE_URL}auction/profiles/${username}`, {
        method: 'GET',
        headers: {
          'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const responseJson = await response.json();
      const data = responseJson.data;

      // Log data to verify the structure
      console.log(data);

      // Update profile information
      if (data.avatar && data.avatar.url) {
        profileImage.src = data.avatar.url;
        profileImage.alt = data.avatar.alt || 'User Avatar';
      } else {
        console.warn('Using placeholder image, avatar URL is missing.');
        profileImage.src = 'https://via.placeholder.com/80';
        profileImage.alt = 'User Avatar';
      }

      usernameElement.textContent = data.name || 'N/A';
      emailElement.textContent = data.email || 'N/A';
      bioElement.textContent = data.bio !== null ? data.bio : 'No bio provided.';
      creditsElement.textContent = `Credits: ${data.credits || 0}`;
    } catch (error) {
      console.error('Error fetching profile:', error.message);
      window.location.href = './login.html';
    }
  }

  async function fetchListingsOrBids(type) {
    try {
      const response = await fetch(`${API_BASE_URL}auction/profiles/${username}/${type}`, {
        method: 'GET',
        headers: {
          'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const responseJson = await response.json();
      const data = responseJson.data;
      return data;
    } catch (error) {
      console.error(`Error fetching ${type}:`, error.message);
    }
  }

  function renderItems(container, items) {
    container.innerHTML = items
      .map(
        (item) => `
        <div class="p-4 border rounded-lg bg-white shadow-md w-1/2 mx-auto lg:w-1/3">
          <img src="${item.media[0]?.url || 'https://via.placeholder.com/150'}" alt="${item.media[0]?.alt || 'Item'}" class="w-20 h-36 object-cover rounded-md mb-2">
          <h3 class="text-lg font-semibold text-center">${item.title}</h3>
          <p class="text-sm text-gray-600 text-center">${item.description}</p>
        </div>`
      )
      .join('');
  }

  async function handleToggle(toggleButton, container, type) {
    toggleButton.addEventListener('click', async () => {
      container.classList.toggle('hidden');
      if (!container.classList.contains('hidden') && container.innerHTML === '') {
        const items = await fetchListingsOrBids(type);
        renderItems(container, items);
      }
    });
  }

  handleToggle(myListingsToggle, myListings, 'listings');
  handleToggle(myWinsToggle, myWins, 'bids');

  fetchProfile();
});
