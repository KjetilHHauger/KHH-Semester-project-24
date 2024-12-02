import { API_BASE_URL } from './api.js';
import { loadNav } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  await loadNav();

  const createListingForm = document.getElementById('createListingForm');

  const token = localStorage.getItem('accessToken');

  if (!token) {
    window.location.href = './login.html';
    return;
  }

  createListingForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(createListingForm);
    const newListing = {
      title: formData.get('title'),
      description: formData.get('description'),
      tags: formData.get('tags') ? formData.get('tags').split(',') : [],
      media: [{
        url: formData.get('mediaUrl'),
        alt: formData.get('mediaAlt')
      }],
      endsAt: new Date(formData.get('endsAt')).toISOString(),
    };

    try {
      const response = await fetch(`${API_BASE_URL}auction/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newListing),
      });

      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

      alert('Listing created successfully!');
      window.location.href = './profile.html';
    } catch (error) {
      console.error('Error creating listing:', error.message);
    }
  });
});
