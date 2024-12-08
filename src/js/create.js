import { API_BASE_URL } from './api.js';
import { loadNav } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadNav();

  const createListingForm = document.getElementById('createListingForm');
  const mediaContainer = document.getElementById('mediaContainer');
  const addMediaButton = document.getElementById('addMedia');
  const token = localStorage.getItem('accessToken');

  if (!token) {
    window.location.href = './login.html';
    return;
  }

  addMediaButton.addEventListener('click', () => {
    const mediaGroup = document.createElement('div');
    mediaGroup.classList.add('media-group', 'space-y-2', 'mt-4');

    mediaGroup.innerHTML = `
      <input type="text" name="mediaUrl" placeholder="Media URL" class="p-2 border w-full rounded" />
      <input type="text" name="mediaAlt" placeholder="Alt text for image" class="p-2 border w-full rounded" />
    `;

    mediaContainer.appendChild(mediaGroup);
  });

  createListingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(createListingForm);
    const title = formData.get('title').trim();
    const description = formData.get('description').trim();
    const tags = formData.get('tags')?.trim() || '';

    if (title.length > 280 || description.length > 280) {
      alert('Title and Description must not exceed 280 characters.');
      return;
    }

    const mediaInputs = Array.from(document.querySelectorAll('.media-group'));
    const media = mediaInputs
      .map((group) => ({
        url: group.querySelector('input[name="mediaUrl"]').value.trim(),
        alt: group.querySelector('input[name="mediaAlt"]').value.trim(),
      }))
      .filter((item) => item.url !== '');

    const newListing = {
      title,
      description,
      tags: tags ? [tags] : [],
      media,
      endsAt: new Date(formData.get('endsAt')).toISOString(),
    };

    if (!newListing.title || !newListing.endsAt) {
      alert('Title and End Date are required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}auction/listings`, {
        method: 'POST',
        headers: {
          'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newListing),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Failed to create listing: ${errorData.message || 'Unknown error'}`);
        return;
      }

      alert('Listing created successfully!');
      window.location.href = './profile.html';
    } catch (error) {
      console.error('Error creating listing:', error.message);
      alert('An unexpected error occurred. Please try again.');
    }
  });
});
