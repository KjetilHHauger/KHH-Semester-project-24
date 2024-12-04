import { loadNav } from './utils.js';
import { API_BASE_URL } from './api.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadNav();

  const profileImage = document.getElementById('profileImage');
  const usernameElement = document.getElementById('username');
  const emailElement = document.getElementById('email');
  const bioElement = document.getElementById('bio');
  const creditsElement = document.getElementById('credits');
  const updateModal = document.getElementById('updateModal');
  const updateForm = document.getElementById('updateForm');
  const avatarInput = document.getElementById('avatarInput');
  const bioInput = document.getElementById('bioInput');
  const cancelUpdate = document.getElementById('cancelUpdate');
  const myUpdateButton = document.getElementById('myUpdate');
  const myCreateButton = document.getElementById('myCreate');
  const myListingsToggle = document.getElementById('myListingsToggle');
  const myListingsContainer = document.getElementById('myListings');
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

      const data = (await response.json()).data;

      profileImage.src = data.avatar?.url || 'https://via.placeholder.com/80';
      profileImage.alt = data.avatar?.alt || 'User Avatar';
      usernameElement.textContent = data.name || 'N/A';
      emailElement.textContent = data.email || 'N/A';
      bioElement.textContent = data.bio || 'No bio provided.';
      creditsElement.textContent = `Credits: ${data.credits || 0}`;
    } catch {
      window.location.href = './login.html';
    }
  }

  async function fetchListings() {
    try {
      const response = await fetch(`${API_BASE_URL}auction/profiles/${username}/listings`, {
        method: 'GET',
        headers: {
          'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      const data = (await response.json()).data;
      return data;
    } catch (error) {
      console.error('Error fetching listings:', error.message);
      return [];
    }
  }

  function renderListings(listings) {
    if (!listings || listings.length === 0) {
      myListingsContainer.innerHTML = '<p class="text-gray-500">You have no listings.</p>';
      return;
    }

    myListingsContainer.innerHTML = listings
      .map((listing) => {
        const timeLeft = calculateTimeLeft(listing.endsAt);
        const imageUrl = listing.media[0]?.url || 'https://fakeimg.pl/600x400?text=No+image';

        return `
          <div class="p-4 border rounded-lg bg-white shadow-md w-full md:w-1/2 mx-auto mb-4">
            <img src="${imageUrl}" alt="${listing.media[0]?.alt || 'Item Image'}" class="h-36 object-contain rounded-md mb-2 mx-auto">
            <h3 class="text-lg font-semibold text-center">${listing.title}</h3>
            <p class="text-center text-sm text-gray-600">${timeLeft}</p>
          </div>
        `;
      })
      .join('');
  }

  function calculateTimeLeft(endsAt) {
    const now = new Date();
    const end = new Date(endsAt);
    const diff = Math.max(0, end - now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return diff > 0 ? `${days}d ${hours}h ${minutes}m` : 'Expired';
  }

  myListingsToggle.addEventListener('click', async () => {
    myListingsContainer.classList.toggle('hidden');
    if (!myListingsContainer.classList.contains('hidden') && myListingsContainer.innerHTML === '') {
      const listings = await fetchListings();
      renderListings(listings);
    }
  });

  myUpdateButton.addEventListener('click', () => {
    if (updateModal.classList.contains('hidden')) {
      avatarInput.value = profileImage.src;
      bioInput.value = bioElement.textContent !== 'No bio provided.' ? bioElement.textContent : '';
      updateModal.classList.remove('hidden');
    } else {
      updateModal.classList.add('hidden');
    }
  });

  cancelUpdate.addEventListener('click', () => {
    updateModal.classList.add('hidden');
  });

  updateForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    updateModal.classList.add('hidden');
    await updateProfile(avatarInput.value.trim(), bioInput.value.trim());
  });

  myCreateButton.addEventListener('click', () => {
    window.location.href = './create.html';
  });

  fetchProfile();
});
