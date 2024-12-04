import { loadNav } from './utils.js';
import { API_BASE_URL } from './api.js';

loadNav();

const auctionList = document.getElementById('auctionList');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('searchInput');

let allAuctions = [];

async function fetchAuctions() {
  const url = `${API_BASE_URL}auction/listings`;
  try {
    const response = await fetch(url, {
      headers: {
        'X-Noroff-API-Key': '04cc0fef-f540-4ae1-8c81-5706316265d4',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'Failed to load auctions. Please try again later.';
    throw error;
  }
}

function sortAuctions(auctions) {
  const now = new Date();

  const activeAuctions = auctions.filter((auction) => new Date(auction.endsAt) > now);
  const expiredAuctions = auctions.filter((auction) => new Date(auction.endsAt) <= now);

  activeAuctions.sort((a, b) => new Date(a.endsAt) - new Date(b.endsAt));

  return [...activeAuctions, ...expiredAuctions];
}

function renderAuctions(auctions) {
  auctionList.innerHTML = '';

  if (!Array.isArray(auctions) || auctions.length === 0) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'No auctions available.';
    return;
  }

  errorMessage.classList.add('hidden');

  auctions.forEach((auction) => {
    const { title, media, endsAt, _count } = auction;

    const imageUrl = media && media[0]?.url ? media[0].url : 'https://via.placeholder.com/800x400';
    const bidsCount = _count?.bids || 0;
    const timeLeft = calculateTimeLeft(endsAt);

    auctionList.innerHTML += `
      <div class="max-w-sm bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div class="relative">
          <img class="w-full h-60 object-contain" src="${imageUrl}" alt="${title}">
        </div>
        <div class="p-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${title}</h3>
          <div class="text-sm text-gray-600 mb-4 flex justify-between">
            <p>Bids: <span class="font-semibold">${bidsCount}</span></p>
            <p>Time Left: <span class="text-gray-500">${timeLeft}</span></p>
          </div>
        </div>
      </div>
    `;
  });
}

function calculateTimeLeft(endsAt) {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = Math.max(0, end - now);
  const hours = Math.floor(diff / 1000 / 60 / 60);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  return diff > 0 ? `${hours}h ${minutes}m` : 'Expired';
}

async function loadAuctions() {
  try {
    allAuctions = await fetchAuctions();
    const sortedAuctions = sortAuctions(allAuctions);
    renderAuctions(sortedAuctions);
  } catch (error) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'Failed to load auctions. Please try again later.';
  }
}

searchInput.addEventListener('input', () => {
  const query = searchInput.value.trim().toLowerCase();
  const filteredAuctions = allAuctions.filter((auction) =>
    auction.title.toLowerCase().includes(query) || auction.description?.toLowerCase().includes(query)
  );
  renderAuctions(filteredAuctions);

  if (filteredAuctions.length === 0) {
    errorMessage.classList.remove('hidden');
    errorMessage.textContent = 'No auctions match your search.';
  } else {
    errorMessage.classList.add('hidden');
  }
});

loadAuctions();
